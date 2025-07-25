/**
 * Secure file upload validation and processing
 * Protects against malicious file uploads and validates file integrity
 */

// Allowed file types with their MIME types and extensions
const ALLOWED_IMAGE_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif']
};

const ALLOWED_DOCUMENT_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.adobe.photoshop': ['.psd']
};

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_PSD_SIZE = 100 * 1024 * 1024; // 100MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedName?: string;
  fileType?: string;
}

// Validate file type against allowed types
export const validateFileType = (file: File, allowedTypes: Record<string, string[]>): boolean => {
  if (!allowedTypes[file.type]) {
    return false;
  }
  
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  return allowedTypes[file.type].includes(fileExtension);
};

// Validate image files
export const validateImageFile = (file: File): FileValidationResult => {
  // Check file type
  if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'
    };
  }
  
  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `Image size must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
    };
  }
  
  // Check for suspicious file names
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      isValid: false,
      error: 'Invalid file name'
    };
  }
  
  // Sanitize file name
  const sanitizedName = sanitizeFileName(file.name);
  
  return {
    isValid: true,
    sanitizedName,
    fileType: 'image'
  };
};

// Validate PSD files
export const validatePSDFile = (file: File): FileValidationResult => {
  // Check file type
  if (file.type !== 'application/vnd.adobe.photoshop' && file.type !== 'application/octet-stream') {
    return {
      isValid: false,
      error: 'Invalid file type. Only PSD files are allowed.'
    };
  }
  
  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (fileExtension !== '.psd') {
    return {
      isValid: false,
      error: 'File must have .psd extension'
    };
  }
  
  // Check file size
  if (file.size > MAX_PSD_SIZE) {
    return {
      isValid: false,
      error: `PSD file size must be less than ${MAX_PSD_SIZE / (1024 * 1024)}MB`
    };
  }
  
  // Check for suspicious file names
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      isValid: false,
      error: 'Invalid file name'
    };
  }
  
  // Sanitize file name
  const sanitizedName = sanitizeFileName(file.name);
  
  return {
    isValid: true,
    sanitizedName,
    fileType: 'psd'
  };
};

// Sanitize file name
export const sanitizeFileName = (fileName: string): string => {
  // Remove path traversal attempts
  let sanitized = fileName.replace(/[\/\\]/g, '');
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, '_');
  
  // Limit length
  const maxLength = 100;
  if (sanitized.length > maxLength) {
    const extension = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, maxLength - extension!.length - 1) + '.' + extension;
  }
  
  return sanitized;
};

// Check file header for magic numbers (basic file type verification)
export const verifyFileHeader = async (file: File): Promise<boolean> => {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  
  // JPEG: FF D8 FF
  if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF) {
    return file.type === 'image/jpeg';
  }
  
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
    return file.type === 'image/png';
  }
  
  // WebP: RIFF [4 bytes] WEBP
  if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46 &&
      uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50) {
    return file.type === 'image/webp';
  }
  
  // GIF: GIF87a or GIF89a
  if (uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46) {
    return file.type === 'image/gif';
  }
  
  // PSD: 8BPS
  if (uint8Array[0] === 0x38 && uint8Array[1] === 0x42 && uint8Array[2] === 0x50 && uint8Array[3] === 0x53) {
    return file.type === 'application/vnd.adobe.photoshop' || file.type === 'application/octet-stream';
  }
  
  return false;
};

// Generate secure file path
export const generateSecureFilePath = (userId: string, fileName: string, fileType: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const sanitizedName = sanitizeFileName(fileName);
  const extension = sanitizedName.split('.').pop();
  const nameWithoutExt = sanitizedName.substring(0, sanitizedName.lastIndexOf('.'));
  
  return `${userId}/${fileType}/${timestamp}_${random}_${nameWithoutExt}.${extension}`;
};