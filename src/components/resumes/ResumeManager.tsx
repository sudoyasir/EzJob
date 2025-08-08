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
import { uploadFile, deleteFile, formatFileSize, validateDocumentFile } from "@/lib/fileUpload";

interface Resume {
  id: string;
  name: string;
  description?: string;
  file_name: string;
  file_url: string;
  file_path: string;
  file_size: number;
  is_default: boolean;
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
      setResumes((data || []) as Resume[]);
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

      const { url: publicUrl, path: filePath } = uploadResult;

      // Save resume metadata to database
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          name: resumeName.trim(),
          description: resumeDescription?.trim() || null,
          file_name: selectedFile.name,
          file_url: publicUrl,
          file_path: filePath,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          is_default: resumes.length === 0, // First resume is default
        })
        .select()
        .single();

      if (error) throw error;

      const newResume = data as Resume;
      
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
    if (!editingResume || !editingResume.name.trim()) {
      toast.error('Please provide a resume name');
      return;
    }

    try {
      await supabase
        .from('resumes')
        .update({
          name: editingResume.name.trim(),
          description: editingResume.description?.trim() || null,
        })
        .eq('id', editingResume.id);

      setResumes(prev => prev.map(resume => 
        resume.id === editingResume.id 
          ? { ...resume, name: editingResume.name.trim(), description: editingResume.description?.trim() || null }
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
      // Delete file from storage
      const deleteSuccess = await deleteFile('resumes', resume.file_path);
      
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

  const downloadResume = (resume: Resume) => {
    window.open(resume.file_url, '_blank');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resume Management</h1>
          <p className="text-muted-foreground">Upload and manage your resume versions</p>
        </div>
        <div className="flex items-center gap-2">
          {!embedded && (
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          )}
          <Dialog open={showUploadDialog} onOpenChange={(open) => {
            if (!open) resetUploadForm();
            setShowUploadDialog(open);
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Upload Resume
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload New Resume</DialogTitle>
                <DialogDescription>
                  Upload a PDF document of your resume
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* File Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver 
                      ? 'border-primary bg-primary/10' 
                      : selectedFile 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                      <p className="font-medium text-green-700">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Choose Different File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600">
                        Drag and drop your resume here, or{" "}
                        <label className="text-primary hover:text-primary/80 cursor-pointer font-medium">
                          browse files
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
                      <Label htmlFor="resume-name">Resume Name *</Label>
                      <Input
                        id="resume-name"
                        value={resumeName}
                        onChange={(e) => setResumeName(e.target.value)}
                        placeholder="e.g., Software Engineer Resume 2024"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="resume-description">Description (Optional)</Label>
                      <Textarea
                        id="resume-description"
                        value={resumeDescription}
                        onChange={(e) => setResumeDescription(e.target.value)}
                        placeholder="Brief description of this resume version..."
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={resetUploadForm}
                    disabled={uploadLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={uploadResume}
                    disabled={!selectedFile || !resumeName.trim() || uploadLoading}
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
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No resumes uploaded</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Get started by uploading your first resume. You can upload multiple versions for different job applications.
            </p>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Your First Resume
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className={`relative ${resume.is_default ? 'ring-2 ring-yellow-400' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-6 truncate">
                      {resume.name}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {resume.description || 'No description'}
                    </CardDescription>
                  </div>
                  {resume.is_default && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 ml-2 shrink-0">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Default
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="truncate">{resume.file_name}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span>{formatFileSize(resume.file_size)}</span>
                    <span>•</span>
                    <span>Uploaded {new Date(resume.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadResume(resume)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingResume({ ...resume });
                      setShowEditDialog(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>

                  {!resume.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAsDefault(resume.id)}
                      className="flex items-center gap-1"
                    >
                      <Star className="h-3 w-3" />
                      Set Default
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="ml-auto">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{resume.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteResume(resume)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resume</DialogTitle>
            <DialogDescription>
              Update the name and description of your resume
            </DialogDescription>
          </DialogHeader>
          
          {editingResume && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Resume Name *</Label>
                <Input
                  id="edit-name"
                  value={editingResume.name}
                  onChange={(e) => setEditingResume(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingResume.description || ''}
                  onChange={(e) => setEditingResume(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingResume(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={updateResume}>
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
