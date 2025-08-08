import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText, Star, Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatFileSize } from "@/lib/fileUpload";

interface Resume {
  id: string;
  name: string;
  description?: string;
  file_name: string;
  file_url: string;
  file_size: number;
  is_default: boolean;
  created_at: string;
}

interface ResumeSelectorProps {
  value?: string;
  onValueChange: (resumeId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ResumeSelector({ 
  value, 
  onValueChange, 
  placeholder = "Select a resume",
  disabled = false 
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
      // Use proper types now that migration is applied
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

  const downloadResume = (resume: Resume) => {
    window.open(resume.file_url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        Loading resumes...
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <Card className="border-2 border-dashed border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1">No resumes available</h3>
          <p className="text-sm text-amber-600 dark:text-amber-300 mb-4">
            You need to upload at least one resume before creating a job application
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
            onClick={() => window.open('/resumes', '_blank')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Resume
          </Button>
        </div>
      </Card>
    );
  }

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
          <SelectContent className="max-w-[400px]">
            {resumes.map((resume) => (
              <SelectItem key={resume.id} value={resume.id} className="p-3">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-md bg-primary/10 shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{resume.name}</span>
                      {resume.is_default && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="truncate max-w-[150px]">{resume.file_name}</span>
                      <span>•</span>
                      <span>{formatFileSize(resume.file_size)}</span>
                    </div>
                  </div>
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

      {/* Selected Resume Preview */}
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
                      {selectedResume.name}
                    </h4>
                    {selectedResume.is_default && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 text-xs">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Default
                      </Badge>
                    )}
                  </div>
                  
                  {selectedResume.description && (
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2 line-clamp-2">
                      {selectedResume.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-3 text-xs text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {selectedResume.file_name}
                    </span>
                    <span>{formatFileSize(selectedResume.file_size)}</span>
                    <span>Uploaded {new Date(selectedResume.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <Button
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
