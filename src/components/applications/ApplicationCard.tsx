import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { JobApplicationForm } from './JobApplicationForm';
import { JobApplicationView } from './JobApplicationView';
import { JobApplication } from '@/services/jobApplications';
import { Edit, Eye, Trash2, MapPin, Calendar, Clock, FileText, Star, Building2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { truncateFilename } from '@/lib/fileUpload';

interface Resume {
  id: string;
  name: string;
  description?: string;
  file_name: string;
  file_url: string;
  file_size: number;
  is_default: boolean;
}

interface ResumeInfo {
  name: string;
  is_default: boolean;
  file_name?: string;
}

interface ApplicationCardProps {
  application: JobApplication;
  resumeInfo?: Resume | ResumeInfo;
  onEdit: () => void;
  onDelete: (id: string) => void;
  viewMode?: 'list' | 'grid';
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  resumeInfo,
  onEdit,
  onDelete,
  viewMode = 'list',
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800 md:hover:bg-blue-50 md:hover:text-blue-700 md:hover:border-blue-200 dark:md:hover:bg-blue-950/20 dark:md:hover:text-blue-300 dark:md:hover:border-blue-800';
      case 'interview':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800 md:hover:bg-emerald-50 md:hover:text-emerald-700 md:hover:border-emerald-200 dark:md:hover:bg-emerald-950/20 dark:md:hover:text-emerald-300 dark:md:hover:border-emerald-800';
      case 'offer':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800 md:hover:bg-green-50 md:hover:text-green-700 md:hover:border-green-200 dark:md:hover:bg-green-950/20 dark:md:hover:text-green-300 dark:md:hover:border-green-800';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800 md:hover:bg-red-50 md:hover:text-red-700 md:hover:border-red-200 dark:md:hover:bg-red-950/20 dark:md:hover:text-red-300 dark:md:hover:border-red-800';
      case 'withdrawn':
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-300 dark:border-gray-800 md:hover:bg-gray-50 md:hover:text-gray-700 md:hover:border-gray-200 dark:md:hover:bg-gray-950/20 dark:md:hover:text-gray-300 dark:md:hover:border-gray-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-300 dark:border-gray-800 md:hover:bg-gray-50 md:hover:text-gray-700 md:hover:border-gray-200 dark:md:hover:bg-gray-950/20 dark:md:hover:text-gray-300 dark:md:hover:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return '📝';
      case 'interview':
        return '🎯';
      case 'offer':
        return '🎉';
      case 'rejected':
        return '❌';
      case 'withdrawn':
        return '⏸️';
      default:
        return '📋';
    }
  };

  const calculateResponseTime = () => {
    if (!application.response_date || !application.applied_date) return null;
    
    const appliedDate = new Date(application.applied_date);
    const responseDate = new Date(application.response_date);
    const daysDiff = Math.ceil((responseDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'Same day';
    if (daysDiff === 1) return '1 day';
    return `${daysDiff} days`;
  };

  const responseTime = calculateResponseTime();

  return (
    <Card className={`p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-border/50 hover:border-border bg-card/50 backdrop-blur-sm ${
      viewMode === 'grid' ? 'h-fit' : ''
    }`}>
      <div className="space-y-4 sm:space-y-5">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`font-bold text-foreground truncate ${
                  viewMode === 'grid' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
                }`}>
                  {application.role}
                </h3>
                <p className="text-muted-foreground font-medium text-sm sm:text-base mt-1">
                  {application.company_name}
                </p>
              </div>
            </div>
            
            {application.location && (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-3">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">{application.location}</span>
              </div>
            )}
          </div>
          
          <Badge className={`${getStatusColor(application.status)} px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border shrink-0 ml-3`}>
            <span className="mr-1.5 sm:mr-2">{getStatusIcon(application.status)}</span>
            {application.status}
          </Badge>
        </div>

        {/* Content Section */}
        <div className="space-y-3 sm:space-y-4">
          {/* Date Information */}
          <div className={viewMode === 'grid' ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'}>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <div className="p-1.5 sm:p-2 rounded bg-blue-100 dark:bg-blue-900/30 shrink-0">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-muted-foreground">Applied:</span>
                <span className="ml-1.5 font-medium text-foreground">
                  {format(new Date(application.applied_date), viewMode === 'grid' ? "MMM dd" : "MMM dd, yyyy")}
                </span>
              </div>
            </div>
            
            {application.response_date && (
              <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                <div className="p-1.5 sm:p-2 rounded bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-muted-foreground">Response:</span>
                  <span className="ml-1.5 font-medium text-foreground">
                    {format(new Date(application.response_date), viewMode === 'grid' ? "MMM dd" : "MMM dd, yyyy")}
                  </span>
                  {responseTime && viewMode === 'list' && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                      {responseTime}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Resume Information */}
          {resumeInfo && (
            <div className="flex items-center gap-2.5 p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="p-1.5 sm:p-2 rounded bg-green-100 dark:bg-green-900/30 shrink-0">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                    {resumeInfo.name}
                  </span>
                  {resumeInfo.is_default && (
                    <Star className="h-3 w-3 fill-current text-yellow-500 shrink-0" />
                  )}
                </div>
                {viewMode === 'list' && (
                  <span className="text-xs text-green-600 dark:text-green-400 mt-0.5 block truncate" title={resumeInfo.file_name}>
                    {resumeInfo.file_name ? truncateFilename(resumeInfo.file_name, 35) : 'Resume'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notes Preview - Always show if notes exist */}
          {application.notes && (
            <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/50">
              <p className={`text-sm text-muted-foreground leading-relaxed ${
                viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-3'
              }`}>
                {application.notes}
              </p>
              {application.notes.length > 150 && (
                <span className="text-xs text-muted-foreground/70 mt-1 block">
                  {viewMode === 'grid' ? 'Click to view full note...' : 'View full note in details...'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-5 border-t border-border/50 gap-3">
          <div className="text-xs text-muted-foreground text-center sm:text-left">
            Updated {formatDistanceToNow(new Date(application.updated_at), { addSuffix: true })}
          </div>
          
          <div className={`flex items-center gap-2 sm:gap-3 justify-center ${viewMode === 'grid' ? '' : 'sm:justify-end'}`}>
            <JobApplicationView
              application={application}
              trigger={
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hover:bg-primary/10 md:hover:text-primary px-3 sm:px-4 py-2 h-9"
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  {viewMode === 'grid' ? '' : 'View'}
                </Button>
              }
            />
            
            <JobApplicationForm
              application={application}
              onSuccess={onEdit}
              trigger={
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hover:bg-blue-100 md:hover:text-blue-700 dark:md:hover:bg-blue-900/30 dark:md:hover:text-blue-300 px-3 sm:px-4 py-2 h-9"
                >
                  <Edit className="h-4 w-4 mr-1.5" />
                  {viewMode === 'grid' ? '' : 'Edit'}
                </Button>
              }
            />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hover:bg-red-100 md:hover:text-red-700 dark:md:hover:bg-red-900/30 dark:md:hover:text-red-300 px-3 sm:px-4 py-2 h-9"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the application for{' '}
                    <span className="font-semibold">{application.role}</span> at{' '}
                    <span className="font-semibold">{application.company_name}</span>?
                    <br />
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(application.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Application
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Card>
  );
};
