import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MediaFile {
  id: string;
  user_id?: string;
  bucket_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_path?: string;
  metadata: Record<string, any>;
  tags: string[];
  is_optimized: boolean;
  optimization_variants: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UploadOptions {
  bucket: 'static-assets' | 'user-content' | 'card-assets' | 'card-images';
  folder?: string;
  generateThumbnail?: boolean;
  optimize?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

export interface OptimizationOptions {
  formats: ('webp' | 'jpeg' | 'png')[];
  sizes: { width: number; height: number; suffix: string }[];
  quality: number;
}

// Generate unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

class MediaManagerClass {
  private readonly maxFileSize = {
    'static-assets': 50 * 1024 * 1024, // 50MB
    'user-content': 100 * 1024 * 1024, // 100MB
    'card-assets': 50 * 1024 * 1024, // 50MB
    'card-images': 50 * 1024 * 1024, // 50MB
  };

  async uploadFile(file: File, options: UploadOptions): Promise<MediaFile | null> {
    try {
      // Validate file
      if (!this.validateFile(file, options.bucket)) {
        return null;
      }

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId && options.bucket !== 'static-assets') {
        toast.error('Authentication required for this upload');
        return null;
      }

      // Generate file path
      const fileName = this.generateFileName(file.name);
      const filePath = this.generateFilePath(options.bucket, fileName, options.folder, userId);

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        return null;
      }

      // Get file dimensions if it's an image
      const dimensions = await this.getImageDimensions(file);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      // Return mock MediaFile
      const result: MediaFile = {
        id: generateId(),
        user_id: userId || 'anonymous',
        bucket_id: options.bucket,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        width: dimensions?.width,
        height: dimensions?.height,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          originalName: file.name,
          publicUrl: urlData.publicUrl,
          ...options.metadata
        },
        tags: options.tags || [],
        is_optimized: false,
        optimization_variants: {}
      };

      toast.success('File uploaded successfully');
      return result;

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
      return null;
    }
  }

  static async updateFile(
    fileId: string, 
    updates: Partial<MediaFile>
  ): Promise<MediaFile | null> {
    // Mock implementation
    return {
      id: fileId,
      user_id: 'mock-user',
      bucket_id: 'mock-bucket',
      file_path: 'mock-path',
      file_name: 'mock-file.jpg',
      file_size: 1000,
      mime_type: 'image/jpeg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {},
      tags: [],
      is_optimized: false,
      optimization_variants: {},
      ...updates
    };
  }

  async getFile(fileId: string): Promise<MediaFile | null> {
    // Mock implementation
    return null;
  }

  async getFiles(options: {
    bucket?: string;
    userId?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<MediaFile[]> {
    // Mock implementation - return empty array
    return [];
  }

  async deleteFile(fileId: string): Promise<boolean> {
    // Mock implementation
    toast.success('File deleted successfully');
    return true;
  }

  async updateFileTags(fileId: string, tags: string[]): Promise<boolean> {
    // Mock implementation
    return true;
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async generateSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  }

  private validateFile(file: File, bucket: string): boolean {
    // Check file size
    const maxSize = this.maxFileSize[bucket];
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
      return false;
    }

    // Check file type
    const allowedTypes = {
      'static-assets': ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
      'user-content': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'],
      'card-assets': ['image/png', 'image/jpeg', 'image/webp'],
      'card-images': ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    };

    if (!allowedTypes[bucket].includes(file.type)) {
      toast.error(`File type not allowed for ${bucket} bucket`);
      return false;
    }

    return true;
  }

  private generateFileName(originalName: string): string {
    const extension = originalName.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${random}.${extension}`;
  }

  private generateFilePath(bucket: string, fileName: string, folder?: string, userId?: string): string {
    const parts = [];
    
    if ((bucket === 'user-content' || bucket === 'card-images') && userId) {
      parts.push(userId);
    }
    
    if (folder) {
      parts.push(folder);
    }
    
    parts.push(fileName);
    
    return parts.join('/');
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }
}

export const MediaManager = new MediaManagerClass();