import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText, Star, Download, Upload, CheckCircle2, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatFileSize, truncateFilename } from "@/lib/fileUpload";

interface Resume {
  id: string;
  title: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  is_default: boolean | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ResumeSelectorProps {
  value?: string;
  onValueChange: (resumeId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean; // New prop for compact form mode
}

export function ResumeSelector({ 
  value, 
  onValueChange, 
  placeholder = "Select a resume",
  disabled = false,
  compact = false 
}: ResumeSelectorProps) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  useEffect(() => {
    if (value && resumes.length > 0) {
      const resume = resumes.find(r => r.id === value);
      setSelectedResume(resume || null);
    } else {
      setSelectedResume(null);
    }
  }, [value, resumes]);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const resumeData = (data || []) as Resume[];
      setResumes(resumeData);
      
      // Auto-select default resume if no value is set
      if (!value && resumeData.length > 0) {
        const defaultResume = resumeData.find(r => r.is_default) || resumeData[0];
        onValueChange(defaultResume.id);
      }
      
    } catch (error: any) {
      toast.error('Failed to fetch resumes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSelect = (resumeId: string) => {
    onValueChange(resumeId);
  };

  const downloadResume = async (resume: Resume) => {
    try {
      // Try downloading using the stored file path from resumes bucket
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(resume.file_path);

      if (error) {
        // If download fails, try documents bucket as fallback for old files
        const { data: fallbackData, error: fallbackError } = await supabase.storage
          .from('documents')
          .download(resume.file_path);
          
        if (fallbackError) {
          throw new Error(`Failed to download file: ${fallbackError.message}`);
        }
        
        // Create download link
        const blob = new Blob([fallbackData], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = resume.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success(`Downloaded "${resume.title}" successfully!`);
        return;
      }

      // Create blob URL and trigger download
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = resume.file_name;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Downloaded "${resume.title}" successfully!`);
    } catch (error: any) {
      console.error('Download failed:', error);
      toast.error('Failed to download resume: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
        <FileText className="h-4 w-4 animate-pulse" />
        Loading resumes...
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <Card className="border-2 border-dashed border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <div className="p-4 text-center">
          <div className="mx-auto w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1 text-sm">No resumes available</h3>
          <p className="text-xs text-amber-600 dark:text-amber-300 mb-3">
            Upload a resume first to create job applications
          </p>
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30 text-xs"
            onClick={() => window.open('/resumes', '_blank')}
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload Resume
          </Button>
        </div>
      </Card>
    );
  }

  // Compact version for forms
  if (compact) {
    return (
      <div className="space-y-3">
        <Select value={value} onValueChange={handleResumeSelect} disabled={disabled}>
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder={
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                {placeholder}
              </div>
            } />
          </SelectTrigger>
          <SelectContent className="w-full">
            {resumes.map((resume) => (
              <SelectItem 
                key={resume.id} 
                value={resume.id} 
                className="p-2 pl-2 mb-1 hover:bg-blue-100 dark:hover:bg-blue-950/20 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-950/20 focus:bg-blue-100 dark:focus:bg-blue-950/20 focus:text-current [&>span:first-child]:hidden"
              >
                <div className="flex items-center gap-2 w-full">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate text-sm">{resume.title}</span>
                      {resume.is_default && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0 shrink-0">
                          <Star className="h-2 w-2 mr-0.5 fill-current" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 max-w-full">
                        <span className="truncate" title={resume.file_name}>
                          {truncateFilename(resume.file_name, 25)}
                        </span>
                        <span className="shrink-0">•</span>
                        <span className="shrink-0">{formatFileSize(resume.file_size || 0)}</span>
                      </div>
                    </div>
                  </div>
                  {value === resume.id && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Selected Resume Info - Compact */}
        {selectedResume && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                {selectedResume.title}
              </p>
              <div className="text-xs text-green-600 dark:text-green-400">
                <div className="flex items-center gap-1 max-w-full">
                  <span className="truncate" title={selectedResume.file_name}>
                    {truncateFilename(selectedResume.file_name, 25)}
                  </span>
                  <span className="shrink-0">•</span>
                  <span className="shrink-0">{formatFileSize(selectedResume.file_size || 0)}</span>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => downloadResume(selectedResume)}
              title="Download resume"
              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-200 shrink-0"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Full version for dedicated resume management
  return (
    <div className="space-y-4">
      <div className="relative">
        <Select value={value} onValueChange={handleResumeSelect} disabled={disabled}>
          <SelectTrigger className="w-full h-12 px-4 border-2 transition-all hover:border-primary/50 focus:border-primary">
            <SelectValue placeholder={
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                {placeholder}
              </div>
            } />
          </SelectTrigger>
          <SelectContent className="w-full">
            {resumes.map((resume) => (
              <SelectItem 
                key={resume.id} 
                value={resume.id} 
                className="p-3 pl-3 mb-1 hover:bg-blue-100 dark:hover:bg-blue-950/20 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-950/20 focus:bg-blue-100 dark:focus:bg-blue-950/20 focus:text-current [&>span:first-child]:hidden"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-md bg-primary/10 shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{resume.title}</span>
                      {resume.is_default && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200 shrink-0">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="truncate" title={resume.file_name}>
                        {truncateFilename(resume.file_name, 30)}
                      </span>
                      <span className="shrink-0">•</span>
                      <span className="shrink-0">{formatFileSize(resume.file_size || 0)}</span>
                    </div>
                  </div>
                  {value === resume.id && (
                    <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedResume && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>

      {/* Selected Resume Preview - Full */}
      {selectedResume && (
        <Card className="border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 truncate">
                      {selectedResume.title}
                    </h4>
                    {selectedResume.is_default && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 text-xs">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Default
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 text-xs text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate" title={selectedResume.file_name}>
                        {truncateFilename(selectedResume.file_name, 35)}
                      </span>
                    </span>
                    <span className="shrink-0">{formatFileSize(selectedResume.file_size || 0)}</span>
                    <span className="shrink-0">Uploaded {new Date(selectedResume.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => downloadResume(selectedResume)}
                title="Download resume"
                className="shrink-0 hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-200"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
