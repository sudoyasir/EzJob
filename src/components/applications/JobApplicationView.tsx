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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-card-foreground mb-1">{application.role}</h2>
              <div className="flex items-center gap-2 text-lg text-muted-foreground">
                <span>{application.company_name}</span>
                {application.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {application.location}
                    </span>
                  </>
                )}
              </div>
            </div>
            <Badge className={`${getStatusColor(application.status)} px-3 py-1 text-sm font-medium shrink-0`}>
              {application.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Application Overview */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-card-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              Application Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Applied Date</span>
                  <p className="text-card-foreground font-medium">{formatDate(application.applied_date)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <p className="text-card-foreground font-medium">{application.status}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Company</span>
                  <p className="text-card-foreground font-medium">{application.company_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Position</span>
                  <p className="text-card-foreground font-medium">{application.role}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Resume Section */}
          {application.resume_id ? (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-card-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Resume Used
              </h3>
              {loadingResume ? (
                <Card className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </Card>
              ) : resumeInfo ? (
                <Card className="p-6 border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 shrink-0">
                        <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-green-800 dark:text-green-200 text-lg">
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
                          <p className="text-sm text-green-700 dark:text-green-300 mb-3 leading-relaxed">
                            {resumeInfo.description}
                          </p>
                        )}
                        <div className="flex gap-4 text-sm text-green-600 dark:text-green-400">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {resumeInfo.file_name}
                          </span>
                          <span>{formatFileSize(resumeInfo.file_size)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={downloadResume}
                      className="hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/30 shrink-0"
                      title="Download resume"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                  <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Resume not found</p>
                      <p className="text-sm">The resume associated with this application has been deleted or moved.</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : application.resume_url ? (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-card-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Resume (Legacy Link)
              </h3>
              <Card className="p-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <ExternalLink className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-amber-800 dark:text-amber-200">External Resume Link</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">This application uses a legacy resume link</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
                  >
                    <a
                      href={application.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Resume
                    </a>
                  </Button>
                </div>
              </Card>
            </div>
          ) : null}

          {/* Notes */}
          {application.notes && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-card-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Notes & Comments
              </h3>
              <Card className="p-6 bg-muted/50">
                <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {application.notes}
                </div>
              </Card>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-card-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              Timeline
            </h3>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium">Application Submitted</span>
                  <span className="text-muted-foreground">{formatDate(application.applied_date)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <span className="font-medium">Created in EzJob</span>
                  <span className="text-muted-foreground">{formatDate(application.created_at)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <span className="font-medium">Last Updated</span>
                  <span className="text-muted-foreground">{formatDate(application.updated_at)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
