import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, File, Trash2, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { uploadFile, deleteFile, validateDocumentFile, formatFileSize } from "@/lib/fileUpload";

interface DocumentUploadProps {
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  initialDocuments?: UploadedDocument[];
  userId: string;
  maxFiles?: number;
}

export interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export function DocumentUpload({ 
  onDocumentsChange, 
  initialDocuments = [], 
  userId,
  maxFiles = 5 
}: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (documents.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    const newDocuments: UploadedDocument[] = [];

    try {
      for (const file of files) {
        // Validate file
        const validationError = validateDocumentFile(file);
        if (validationError) {
          toast.error(`${file.name}: ${validationError}`);
          continue;
        }

        // Upload file
        const result = await uploadFile(file, {
          bucket: 'documents',
          folder: userId,
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
          ]
        });

        if (result.error) {
          toast.error(`${file.name}: ${result.error}`);
          continue;
        }

        const newDoc: UploadedDocument = {
          id: crypto.randomUUID(),
          name: file.name,
          url: result.url,
          path: result.path,
          size: file.size,
          type: file.type,
          uploadedAt: new Date()
        };

        newDocuments.push(newDoc);
      }

      if (newDocuments.length > 0) {
        const updatedDocuments = [...documents, ...newDocuments];
        setDocuments(updatedDocuments);
        onDocumentsChange(updatedDocuments);
        toast.success(`${newDocuments.length} file(s) uploaded successfully!`);
      }

    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDocument = async (doc: UploadedDocument) => {
    setDeletingId(doc.id);
    
    try {
      const success = await deleteFile('documents', doc.path);
      if (success) {
        const updatedDocuments = documents.filter(d => d.id !== doc.id);
        setDocuments(updatedDocuments);
        onDocumentsChange(updatedDocuments);
        toast.success("Document deleted successfully!");
      } else {
        toast.error("Failed to delete document");
      }
    } catch (error: any) {
      toast.error("Delete failed: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('text')) return '📃';
    return '📎';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Documents
        </CardTitle>
        <CardDescription>
          Upload resumes, cover letters, and other documents (PDF, DOC, DOCX, TXT - Max 10MB each)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Button */}
        <div className="flex items-center justify-between">
          <Button 
            type="button"
            onClick={handleUploadClick}
            disabled={uploading || documents.length >= maxFiles}
            variant="outline"
            className="flex items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Documents
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {documents.length}/{maxFiles} files
          </div>
        </div>

        {/* File List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 border rounded-lg bg-card"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-lg">{getFileIcon(doc.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>{doc.uploadedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc)}
                    disabled={deletingId === doc.id}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {documents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">Click "Upload Documents" to add files</p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
