import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Upload, FileText, Trash2, Star, StarOff, Download, Edit, Plus, ArrowLeft, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile, deleteFile, formatFileSize, validateDocumentFile, truncateFilename } from "@/lib/fileUpload";

interface Resume {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_url: string;
  file_path: string;
  file_size: number | null;
  file_type: string;
  is_default: boolean | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ResumeManagerProps {
  embedded?: boolean;
  onResumeUploaded?: (resume: Resume) => void;
  onClose?: () => void;
}

export default function ResumeManager({ embedded = false, onResumeUploaded, onClose }: ResumeManagerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState("");
  const [resumeDescription, setResumeDescription] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch resumes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file: File) => {
    const validationError = validateDocumentFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSelectedFile(file);
    setResumeName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    setShowUploadDialog(true);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const uploadResume = async () => {
    if (!selectedFile || !user || !resumeName.trim()) {
      toast.error('Please provide a resume name');
      return;
    }

    setUploadLoading(true);
    try {
      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${selectedFile.name}`;
      const uploadResult = await uploadFile(selectedFile, {
        bucket: 'resumes',
        folder: user.id,
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      });

      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }

      const { url: fileUrl, path: filePath } = uploadResult;

      // Determine file type from extension if file.type is empty
      const getFileType = (file: File): string => {
        if (file.type) return file.type;
        
        const extension = file.name.toLowerCase().split('.').pop();
        switch (extension) {
          case 'pdf':
            return 'application/pdf';
          case 'doc':
            return 'application/msword';
          case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          case 'txt':
            return 'text/plain';
          default:
            return 'application/octet-stream';
        }
      };

      const fileType = getFileType(selectedFile);
      console.log('File upload details:', {
        fileName: selectedFile.name,
        originalType: selectedFile.type,
        determinedType: fileType,
        size: selectedFile.size
      });

      // Save resume metadata to database
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title: resumeName.trim(),
          description: resumeDescription?.trim() || null,
          file_name: selectedFile.name,
          file_url: fileUrl,
          file_path: filePath,
          file_size: selectedFile.size,
          file_type: fileType,
          is_default: resumes.length === 0, // First resume is default
        })
        .select()
        .single();

      if (error) throw error;

      const newResume = data;
      
      // If this is the first resume or manually set as default, update other resumes
      if (resumes.length === 0) {
        setResumes([newResume]);
      } else {
        setResumes(prev => [newResume, ...prev]);
      }

      toast.success(`Resume "${resumeName}" uploaded successfully!`);
      
      // Reset form
      setSelectedFile(null);
      setResumeName("");
      setResumeDescription("");
      setShowUploadDialog(false);

      // Notify parent component if embedded
      if (onResumeUploaded) {
        onResumeUploaded(newResume);
      }

    } catch (error: any) {
      toast.error('Failed to upload resume: ' + error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const setAsDefault = async (resumeId: string) => {
    try {
      // Remove default from all resumes
      await supabase
        .from('resumes')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Set the selected resume as default
      await supabase
        .from('resumes')
        .update({ is_default: true })
        .eq('id', resumeId);

      // Update local state
      setResumes(prev => prev.map(resume => ({
        ...resume,
        is_default: resume.id === resumeId
      })));

      toast.success('Default resume updated!');
    } catch (error: any) {
      toast.error('Failed to update default resume: ' + error.message);
    }
  };

  const updateResume = async () => {
    if (!editingResume || !editingResume.title.trim()) {
      toast.error('Please provide a resume name');
      return;
    }

    try {
      await supabase
        .from('resumes')
        .update({
          title: editingResume.title.trim(),
          description: editingResume.description?.trim() || null,
        })
        .eq('id', editingResume.id);

      setResumes(prev => prev.map(resume => 
        resume.id === editingResume.id 
          ? { ...resume, title: editingResume.title.trim(), description: editingResume.description?.trim() || null }
          : resume
      ));

      toast.success('Resume updated successfully!');
      setShowEditDialog(false);
      setEditingResume(null);
    } catch (error: any) {
      toast.error('Failed to update resume: ' + error.message);
    }
  };

  const deleteResume = async (resume: Resume) => {
    try {
      // Try to delete from resumes bucket first, then documents as fallback
      let deleteSuccess = await deleteFile('resumes', resume.file_path);
      
      if (!deleteSuccess) {
        console.warn('Failed to delete from resumes bucket, trying documents bucket');
        deleteSuccess = await deleteFile('documents', resume.file_path);
      }
      
      if (!deleteSuccess) {
        console.warn('Failed to delete file from storage');
        // Continue with database deletion even if file deletion fails
      }

      // Delete from database
      await supabase
        .from('resumes')
        .delete()
        .eq('id', resume.id);

      setResumes(prev => prev.filter(r => r.id !== resume.id));
      toast.success('Resume deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete resume: ' + error.message);
    }
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
          throw new Error(`Failed to download file from both buckets: ${fallbackError.message}`);
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

  const resetUploadForm = () => {
    setSelectedFile(null);
    setResumeName("");
    setResumeDescription("");
    setShowUploadDialog(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Loading resumes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Resume Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Upload and manage your resume versions</p>
        </div>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
          <Dialog open={showUploadDialog} onOpenChange={(open) => {
            if (!open) resetUploadForm();
            setShowUploadDialog(open);
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center justify-center gap-2 order-1 xs:order-2" size="sm">
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">Upload Resume</span>
                <span className="xs:hidden">Upload</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-auto max-w-sm sm:max-w-md custom-scrollbar rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Upload New Resume</DialogTitle>
                <DialogDescription className="text-sm">
                  Upload a PDF document of your resume
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* File Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
                    dragOver 
                      ? 'border-primary bg-primary/10' 
                      : selectedFile 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 md:hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-green-500 mx-auto" />
                      <p className="font-medium text-green-700 text-sm sm:text-base px-2 break-words text-center" title={selectedFile.name}>
                        {truncateFilename(selectedFile.name, 45)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="text-xs"
                      >
                        Choose Different File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600 text-sm sm:text-base px-2">
                        <span className="hidden sm:inline">Drag and drop your resume here, or </span>
                        <label className="text-primary md:hover:text-primary/80 cursor-pointer font-medium">
                          <span className="sm:hidden">Tap to </span>browse files
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            className="sr-only"
                          />
                        </label>
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports PDF, DOC, DOCX (max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Resume Details */}
                {selectedFile && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="resume-name" className="text-sm">Resume Name *</Label>
                      <Input
                        id="resume-name"
                        value={resumeName}
                        onChange={(e) => setResumeName(e.target.value)}
                        placeholder="e.g., Software Engineer Resume 2024"
                        className="mt-1 text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="resume-description" className="text-sm">Description (Optional)</Label>
                      <Textarea
                        id="resume-description"
                        value={resumeDescription}
                        onChange={(e) => setResumeDescription(e.target.value)}
                        placeholder="Brief description of this resume version..."
                        rows={2}
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-4">
                  <Button 
                    variant="outline" 
                    onClick={resetUploadForm}
                    disabled={uploadLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={uploadResume}
                    disabled={!selectedFile || !resumeName.trim() || uploadLoading}
                    className="w-full sm:w-auto"
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumes Grid */}
      {resumes.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
            <div className="rounded-full bg-gray-100 p-4 sm:p-6 mb-4">
              <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">No resumes uploaded</h3>
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 max-w-sm">
              Get started by uploading your first resume. You can upload multiple versions for different job applications.
            </p>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full xs:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Your First Resume
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          {resumes.map((resume) => (
            <Card key={resume.id} className={`relative transition-all duration-200 md:hover:shadow-lg ${resume.is_default ? 'ring-2 ring-yellow-400 shadow-md' : 'md:hover:shadow-md'}`}>
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg leading-6 truncate pr-2">
                      {resume.title}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1 overflow-hidden text-ellipsis" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as any
                    }}>
                      {resume.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  {resume.is_default && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 ml-2 shrink-0 shadow-sm text-xs">
                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 fill-current" />
                      <span className="hidden xs:inline">Default</span>
                      <span className="xs:hidden">★</span>
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/30 rounded-md p-2">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                  <span className="font-medium min-w-0 max-w-full break-words" title={resume.file_name}>
                    {truncateFilename(resume.file_name, 40)}
                  </span>
                </div>
                
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between text-xs text-muted-foreground gap-1 xs:gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatFileSize(resume.file_size)}</span>
                    <span>•</span>
                    <span className="truncate">
                      <span className="hidden sm:inline">Uploaded </span>
                      {new Date(resume.created_at).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric',
                        year: window.innerWidth < 640 ? '2-digit' : 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-border">
                  {/* Single Row Actions - Icons Only */}
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadResume(resume)}
                      className="flex items-center justify-center p-2 md:hover:bg-primary md:hover:text-primary-foreground transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingResume({ ...resume });
                        setShowEditDialog(true);
                      }}
                      className="flex items-center justify-center p-2 md:hover:bg-secondary md:hover:text-secondary-foreground transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    {!resume.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAsDefault(resume.id)}
                        className="flex items-center justify-center p-2 text-yellow-600 md:hover:text-yellow-700 md:hover:bg-yellow-50 transition-colors"
                        title="Set as Default"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center justify-center p-2 text-destructive md:hover:text-destructive md:hover:bg-destructive/10 transition-colors"
                          title="Delete Resume"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-auto max-w-sm sm:max-w-lg custom-scrollbar rounded-xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base sm:text-lg">Delete Resume</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            Are you sure you want to delete "{resume.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                          <AlertDialogCancel className="mt-0 w-full sm:w-auto">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteResume(resume)}
                            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="mx-auto max-w-sm sm:max-w-lg custom-scrollbar rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Resume</DialogTitle>
            <DialogDescription className="text-sm">
              Update the name and description of your resume
            </DialogDescription>
          </DialogHeader>
          
          {editingResume && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-sm">Resume Name *</Label>
                <Input
                  id="edit-name"
                  value={editingResume.title}
                  onChange={(e) => setEditingResume(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="mt-1 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description" className="text-sm">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingResume.description || ''}
                  onChange={(e) => setEditingResume(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingResume(null);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button onClick={updateResume} className="w-full sm:w-auto">
                  Update Resume
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {embedded && onClose && (
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
}

export { ResumeManager };
