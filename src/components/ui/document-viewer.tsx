import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { File, Download, ExternalLink } from "lucide-react";
import { UploadedDocument } from "@/components/ui/document-upload";
import { formatFileSize } from "@/lib/fileUpload";

interface DocumentViewerProps {
  documents: UploadedDocument[];
  title?: string;
  showDownload?: boolean;
  compact?: boolean;
}

export function DocumentViewer({ 
  documents, 
  title = "Documents", 
  showDownload = true,
  compact = false 
}: DocumentViewerProps) {
  if (documents.length === 0) {
    return null;
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('text')) return '📃';
    return '📎';
  };

  const getFileTypeLabel = (type: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('document')) return 'DOC';
    if (type.includes('text')) return 'TXT';
    return 'FILE';
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {documents.map((doc) => (
            <Badge key={doc.id} variant="outline" className="flex items-center gap-1 px-2 py-1">
              <span className="text-xs">{getFileIcon(doc.type)}</span>
              <span className="truncate max-w-[120px]" title={doc.name}>
                {doc.name}
              </span>
              {showDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(doc.url, '_blank')}
                  className="h-4 w-4 p-0 ml-1"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {documents.length} file(s) attached
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-lg">{getFileIcon(doc.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" title={doc.name}>
                  {doc.name}
                </p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {getFileTypeLabel(doc.type)}
                  </Badge>
                  <span>{formatFileSize(doc.size)}</span>
                  <span>{doc.uploadedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {showDownload && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(doc.url, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  View
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
