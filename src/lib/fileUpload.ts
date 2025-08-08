import { supabase } from "@/integrations/supabase/client";

export interface FileUploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  options: FileUploadOptions
): Promise<UploadResult> {
  try {
    // Validate file size
    if (options.maxSize && file.size > options.maxSize) {
      return {
        url: "",
        path: "",
        error: `File size must be less than ${formatFileSize(options.maxSize)}`
      };
    }

    // Validate file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return {
        url: "",
        path: "",
        error: `File type ${file.type} is not allowed`
      };
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return {
        url: "",
        path: "",
        error: "User not authenticated"
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Create full path
    const folder = options.folder || user.id;
    const filePath = `${folder}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return {
        url: "",
        path: "",
        error: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(options.bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      error: undefined
    };

  } catch (error: any) {
    return {
      url: "",
      path: "",
      error: error.message || "Upload failed"
    };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    return !error;
  } catch (error) {
    console.error("Delete file error:", error);
    return false;
  }
}

/**
 * Get public URL for a file
 */
export function getFileUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): string | null {
  const maxSize = 2 * 1024 * 1024; // 2MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > maxSize) {
    return `File size must be less than ${formatFileSize(maxSize)}`;
  }

  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, GIF, and WebP images are allowed';
  }

  return null;
}

/**
 * Validate document file
 */
export function validateDocumentFile(file: File): string | null {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (file.size > maxSize) {
    return `File size must be less than ${formatFileSize(maxSize)}`;
  }

  if (!allowedTypes.includes(file.type)) {
    return 'Only PDF, DOC, DOCX, and TXT files are allowed';
  }

  return null;
}
