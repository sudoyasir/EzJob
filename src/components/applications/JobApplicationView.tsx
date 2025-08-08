import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Eye, ExternalLink, Calendar, FileText, Download, Star, AlertCircle, MapPin } from 'lucide-react';
import { JobApplication } from '@/services/jobApplications';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Resume {
  id: string;
  name: string;
  description?: string;
  file_name: string;
  file_url: string;
  file_size: number;
  is_default: boolean;
}

interface JobApplicationViewProps {
  application: JobApplication;
  trigger?: React.ReactNode;
}

export const JobApplicationView: React.FC<JobApplicationViewProps> = ({
  application,
  trigger,
}) => {
  const [resumeInfo, setResumeInfo] = useState<Resume | null>(null);
  const [loadingResume, setLoadingResume] = useState(false);

  useEffect(() => {
    if (application.resume_id) {
      fetchResumeInfo();
    }
  }, [application.resume_id]);

  const fetchResumeInfo = async () => {
    if (!application.resume_id) return;
    
    setLoadingResume(true);
    try {
      // Use any type to bypass TypeScript issues until migration is applied
      const { data, error } = await (supabase as any)
        .from('resumes')
        .select('*')
        .eq('id', application.resume_id)
        .single();

      if (error) throw error;
      setResumeInfo(data as Resume);
    } catch (error) {
      console.error('Error fetching resume info:', error);
    } finally {
      setLoadingResume(false);
    }
  };

  const downloadResume = () => {
    if (resumeInfo?.file_url) {
      window.open(resumeInfo.file_url, '_blank');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
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

          {/* Resume Section */}
          {application.resume_id ? (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resume
              </h3>
              {loadingResume ? (
                <div className="p-4 border rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              ) : resumeInfo ? (
                <Card className="p-4 border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-green-800 dark:text-green-200">
                            {resumeInfo.name}
                          </h4>
                          {resumeInfo.is_default && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 text-xs">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Default
                            </Badge>
                          )}
                        </div>
                        {resumeInfo.description && (
                          <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                            {resumeInfo.description}
                          </p>
                        )}
                        <div className="flex gap-3 text-xs text-green-600 dark:text-green-400">
                          <span>{resumeInfo.file_name}</span>
                          <span>{formatFileSize(resumeInfo.file_size)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={downloadResume}
                      className="hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/30"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-4 border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Resume not found or has been deleted</span>
                  </div>
                </Card>
              )}
            </div>
          ) : application.resume_url ? (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resume (Legacy Link)
              </h3>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-start"
              >
                <a
                  href={application.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Resume</span>
                </a>
              </Button>
            </div>
          ) : null}

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
