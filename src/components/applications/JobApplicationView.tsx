import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Eye, ExternalLink, Calendar, User, Mail, MapPin, DollarSign } from 'lucide-react';
import { JobApplication } from '@/services/jobApplications';
import { format } from 'date-fns';

interface JobApplicationViewProps {
  application: JobApplication;
  trigger?: React.ReactNode;
}

export const JobApplicationView: React.FC<JobApplicationViewProps> = ({
  application,
  trigger,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Interview':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Offer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{application.role}</h2>
              <p className="text-lg text-muted-foreground">{application.company_name}</p>
            </div>
            <Badge className={getStatusColor(application.status)}>
              {application.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{application.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Applied: {formatDate(application.applied_date)}</span>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          {application.resume_url && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Resume</h3>
              <a 
                href={application.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Resume</span>
              </a>
            </Card>
          )}

          {/* Notes */}
          {application.notes && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Notes</h3>
              <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                {application.notes}
              </div>
            </Card>
          )}

          {/* Timestamps */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Timeline</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Created: {formatDate(application.created_at)}</div>
              <div>Last updated: {formatDate(application.updated_at)}</div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
