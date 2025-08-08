import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ResumeSelector } from '@/components/resumes/ResumeSelector';
import { CalendarIcon, Plus, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { JobApplication, JobApplicationInsert, JobApplicationService } from '@/services/jobApplications';
import { useAuth } from '@/contexts/AuthContext';
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
  const [submittedResumeInfo, setSubmittedResumeInfo] = useState<{name: string, id: string} | null>(null);
  const [formData, setFormData] = useState<{
    company_name: string;
    role: string;
    location: string;
    status: 'Applied' | 'Interview' | 'Offer' | 'Rejected';
    applied_date: string;
    response_date: string;
    notes: string;
    resume_id: string;
  }>({
    company_name: '',
    role: '',
    location: '',
    status: 'Applied',
    applied_date: new Date().toISOString().split('T')[0],
    response_date: '',
    notes: '',
    resume_id: '',
  });
  const [appliedDate, setAppliedDate] = useState<Date>(new Date());
  const [responseDate, setResponseDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (application) {
      setFormData({
        company_name: application.company_name,
        role: application.role,
        location: application.location || '',
        status: (application.status as 'Applied' | 'Interview' | 'Offer' | 'Rejected') || 'Applied',
        applied_date: application.applied_date,
        response_date: application.response_date || '',
        notes: application.notes || '',
        resume_id: application.resume_id || '',
      });
      setAppliedDate(new Date(application.applied_date));
      if (application.response_date) {
        setResponseDate(new Date(application.response_date));
      }
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const applicationData = {
        ...formData,
        applied_date: appliedDate.toISOString().split('T')[0],
        response_date: responseDate ? responseDate.toISOString().split('T')[0] : null,
        location: formData.location || null,
        notes: formData.notes || null,
        resume_id: formData.resume_id || null,
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
        // Simple notification for interview status (removed complex background job scheduling)
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
        setResponseDate(undefined);
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
      <DialogContent className="mx-4 max-w-sm sm:mx-auto sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {application ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-sm font-medium">Company *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Company name"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">Role *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Job title"
                required
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State or Remote"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="h-10">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Applied Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full h-10 justify-start text-left font-normal",
                      !appliedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {appliedDate ? format(appliedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
              <Label className="text-sm font-medium">Response Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full h-10 justify-start text-left font-normal",
                      !responseDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {responseDate ? format(responseDate, "PPP") : <span>No response yet</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={responseDate}
                    onSelect={setResponseDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Set when you receive a response (interview, rejection, etc.)
              </p>
            </div>
          </div>

          {/* Resume Section - On its own line */}
          <div className="sm:col-span-2">
            <Label htmlFor="resume" className="text-sm font-medium mb-2 block">
              Resume <span className="text-red-500">*</span>
            </Label>
            <ResumeSelector
              value={formData.resume_id}
              onValueChange={(value) => setFormData({...formData, resume_id: value})}
              placeholder="Choose a resume for this application"
              compact={true}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Select the resume you want to submit with this application
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes, interview feedback, etc."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (!application && !formData.resume_id)}
              className="w-full sm:w-auto min-w-[120px]"
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
