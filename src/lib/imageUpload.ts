
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateImageFile, verifyFileHeader, generateSecureFilePath } from './security/fileValidation';

export interface ImageUploadResult {
  url: string;
  path: string;
  publicUrl: string;
}

export const uploadCardImage = async (
  file: File, 
  userId: string, 
  cardId?: string
): Promise<ImageUploadResult | null> => {
  try {
    // Comprehensive file validation
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return null;
    }

    // Verify file header (magic number check)
    const isValidHeader = await verifyFileHeader(file);
    if (!isValidHeader) {
      toast.error('File type does not match content');
      return null;
    }

    // Server-side validation using database function
    const { data: isValidUpload } = await supabase.rpc('validate_file_upload', {
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type
    });

    if (!isValidUpload) {
      toast.error('File validation failed');
      return null;
    }

    // Generate secure filename and path
    const fileName = generateSecureFilePath(userId, validation.sanitizedName!, 'cards');

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('card-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('card-images')
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
      publicUrl
    };
  } catch (error) {
    console.error('Image upload error:', error);
    toast.error('Failed to upload image');
    return null;
  }
};

export const deleteCardImage = async (path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('card-images')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Image delete error:', error);
    return false;
  }
};
