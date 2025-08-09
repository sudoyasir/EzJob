import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Upload, Camera, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadFile, deleteFile, validateImageFile } from "@/lib/fileUpload";
import { supabase } from "@/integrations/supabase/client";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange: (url: string) => void;
  userId: string;
  userName?: string;
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarChange, 
  userId, 
  userName 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      // Delete old avatar if exists
      if (currentAvatarUrl) {
        await handleDeleteAvatar(false); // Don't show loading state
      }

      const result = await uploadFile(file, {
        bucket: 'avatars',
        folder: userId,
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          avatar_url: result.url
        });

      if (updateError) {
        throw updateError;
      }

      onAvatarChange(result.url);
      setPreviewUrl(null);
      toast.success("Profile picture updated successfully!");

    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async (showLoading = true) => {
    if (!currentAvatarUrl) return;

    if (showLoading) setDeleting(true);
    
    try {
      // Extract path from URL
      const url = new URL(currentAvatarUrl);
      const pathParts = url.pathname.split('/');
      const path = pathParts.slice(pathParts.indexOf('avatars') + 1).join('/');

      // Delete from storage
      await deleteFile('avatars', path);

      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          avatar_url: null
        });

      if (updateError) {
        throw updateError;
      }

      onAvatarChange('');
      if (showLoading) {
        toast.success("Profile picture removed successfully!");
      }

    } catch (error: any) {
      if (showLoading) {
        toast.error(error.message || "Failed to remove image");
      }
    } finally {
      if (showLoading) setDeleting(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentAvatarUrl;
  const fallbackInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* Avatar Display */}
      <div className="relative shrink-0">
        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-border">
          <AvatarImage src={displayUrl} alt={userName || "User"} />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg sm:text-2xl">
            {fallbackInitial}
          </AvatarFallback>
        </Avatar>
        
        {(uploading || deleting) && (
          <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex-1 w-full sm:w-auto space-y-3 sm:space-y-4 text-center sm:text-left">
        <div>
          <Label className="text-base font-medium">Profile Picture</Label>
          <p className="text-sm text-muted-foreground mt-1">
            JPG, PNG, GIF or WebP. Max size 2MB.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={handleUploadClick}
            disabled={uploading || deleting}
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {currentAvatarUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>

          {currentAvatarUrl && (
            <Button 
              onClick={() => handleDeleteAvatar(true)}
              disabled={uploading || deleting}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-destructive hover:text-destructive w-full sm:w-auto"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remove
            </Button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
