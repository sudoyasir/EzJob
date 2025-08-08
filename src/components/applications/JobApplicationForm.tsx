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
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { JobApplication, JobApplicationInsert, JobApplicationService } from '@/services/jobApplications';
import { useAuth } from '@/contexts/AuthContext';
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
  const [formData, setFormData] = useState<{
    company_name: string;
    role: string;
    location: string;
    status: 'Applied' | 'Interview' | 'Offer' | 'Rejected';
    applied_date: string;
    notes: string;
    resume_url: string;
  }>({
    company_name: '',
    role: '',
    location: '',
    status: 'Applied',
    applied_date: new Date().toISOString().split('T')[0],
    notes: '',
    resume_url: '',
  });
  const [appliedDate, setAppliedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (application) {
      setFormData({
        company_name: application.company_name,
        role: application.role,
        location: application.location || '',
        status: application.status,
        applied_date: application.applied_date,
        notes: application.notes || '',
        resume_url: application.resume_url || '',
      });
      setAppliedDate(new Date(application.applied_date));
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const applicationData = {
        ...formData,
        applied_date: appliedDate.toISOString().split('T')[0],
        location: formData.location || null,
        notes: formData.notes || null,
        resume_url: formData.resume_url || null,
      };

      if (application) {
        await JobApplicationService.updateApplication(application.id, applicationData);
        toast.success('Application updated successfully!');
      } else {
        await JobApplicationService.createApplication(applicationData);
        toast.success('Application added successfully!');
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
          resume_url: '',
        });
        setAppliedDate(new Date());
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
              <Label htmlFor="resume_url">Resume URL</Label>
              <Input
                id="resume_url"
                type="url"
                value={formData.resume_url}
                onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
                placeholder="Link to your resume"
              />
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : application ? 'Update Application' : 'Add Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
