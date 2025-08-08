import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DocumentUpload, UploadedDocument } from '@/components/ui/document-upload';
import { ResumeSelector } from '@/components/resumes/ResumeSelector';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { JobApplication, JobApplicationInsert, JobApplicationService } from '@/services/jobApplications';
import { useAuth } from '@/contexts/AuthContext';
import { rateLimitService, securityEventService } from '@/services/rateLimitService';
import { backgroundJobService } from '@/services/backgroundJobs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface JobApplicationFormProps {
  application?: JobApplication;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  application,
  onSuccess,
  trigger,
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [submittedResumeInfo, setSubmittedResumeInfo] = useState<{name: string, id: string} | null>(null);
  const [formData, setFormData] = useState<{
    company_name: string;
    role: string;
    location: string;
    status: 'Applied' | 'Interview' | 'Offer' | 'Rejected';
    applied_date: string;
    notes: string;
    resume_id: string;
  }>({
    company_name: '',
    role: '',
    location: '',
    status: 'Applied',
    applied_date: new Date().toISOString().split('T')[0],
    notes: '',
    resume_id: '',
  });
  const [appliedDate, setAppliedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (application) {
      setFormData({
        company_name: application.company_name,
        role: application.role,
        location: application.location || '',
        status: (application.status as 'Applied' | 'Interview' | 'Offer' | 'Rejected') || 'Applied',
        applied_date: application.applied_date,
        notes: application.notes || '',
        resume_id: application.resume_id || '',
      });
      setAppliedDate(new Date(application.applied_date));
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Rate limit check for application submissions
      if (!application) { // Only rate limit new applications, not updates
        const rateLimitResult = rateLimitService.checkRateLimit(
          `application_submit:${user?.id}`,
          { windowMs: 5 * 60 * 1000, maxRequests: 20 } // 20 submissions per 5 minutes
        );

        if (!rateLimitResult.allowed) {
          const resetTimeMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / (1000 * 60));
          throw new Error(`Too many applications submitted. Try again in ${resetTimeMinutes} minutes.`);
        }
      }

      const applicationData = {
        ...formData,
        applied_date: appliedDate.toISOString().split('T')[0],
        location: formData.location || null,
        notes: formData.notes || null,
        resume_id: formData.resume_id || null,
        documents: documents.length > 0 ? JSON.stringify(documents) : null,
      };

      if (application) {
        await JobApplicationService.updateApplication(application.id, applicationData);
        toast.success('Application updated successfully!');
      } else {
        await JobApplicationService.createApplication(applicationData);
        
        // Fetch resume info for success message
        if (formData.resume_id) {
          try {
            const { data: resumeData, error: resumeError } = await supabase
              .from('resumes')
              .select('name')
              .eq('id', formData.resume_id)
              .maybeSingle();
            
            if (!resumeError && resumeData) {
              setSubmittedResumeInfo({ name: resumeData.name, id: formData.resume_id });
              toast.success(
                `Application added successfully with resume "${(resumeData as any).name}"!`,
                { duration: 5000 }
              );
            } else {
              // Fallback: try direct table query
              const { data: directData } = await (supabase as any)
                .from('resumes')
                .select('name')
                .eq('id', formData.resume_id)
                .single();
              
              if (directData?.name) {
                setSubmittedResumeInfo({ name: directData.name, id: formData.resume_id });
                toast.success(
                  `Application added successfully with resume "${directData.name}"!`,
                  { duration: 5000 }
                );
              } else {
                toast.success('Application added successfully!');
              }
            }
          } catch (resumeError) {
            toast.success('Application added successfully!');
          }
        } else {
          toast.success('Application added successfully!');
        }

        // Schedule interview reminder if status is Interview and has interview date
        if (formData.status === 'Interview' && formData.notes?.includes('interview')) {
          // Try to extract interview date from notes (basic implementation)
          const interviewMatch = formData.notes.match(/(\d{4}-\d{2}-\d{2})/);
          if (interviewMatch && user?.email) {
            const interviewDate = new Date(interviewMatch[1]);
            if (interviewDate > new Date()) {
              backgroundJobService.scheduleJob({
                type: 'email_reminder',
                data: {
                  userId: user.id,
                  email: user.email,
                  type: 'interview_reminder',
                  applicationData: {
                    company: formData.company_name,
                    role: formData.role,
                    interviewDate: interviewDate.toISOString()
                  }
                },
                scheduledFor: new Date(interviewDate.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
                active: true
              });
            }
          }
        }
      }

      setOpen(false);
      onSuccess();

      // Reset form if creating new application
      if (!application) {
        setFormData({
          company_name: '',
          role: '',
          location: '',
          status: 'Applied',
          applied_date: new Date().toISOString().split('T')[0],
          notes: '',
          resume_id: '',
        });
        setAppliedDate(new Date());
        setDocuments([]);
        setSubmittedResumeInfo(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Application
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {application ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Job title"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State or Remote"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Applied Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !appliedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {appliedDate ? format(appliedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={appliedDate}
                    onSelect={(date) => date && setAppliedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Resume *</Label>
              <ResumeSelector 
                value={formData.resume_id}
                onValueChange={(resumeId) => setFormData({ ...formData, resume_id: resumeId })}
                placeholder="Select a resume for this application"
              />
              {!formData.resume_id && (
                <p className="text-xs text-muted-foreground">
                  Selecting a resume helps you track which version was used for this application
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes, interview feedback, etc."
              rows={3}
            />
          </div>

          {/* Document Upload Section */}
          <DocumentUpload
            onDocumentsChange={setDocuments}
            initialDocuments={documents}
            userId={user?.id || ""}
            maxFiles={3}
          />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (!application && !formData.resume_id)}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </div>
              ) : (
                application ? 'Update Application' : 'Add Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
