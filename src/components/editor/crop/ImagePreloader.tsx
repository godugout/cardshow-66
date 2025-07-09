import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImagePreloaderProps {
  imageUrl: string;
  onImageReady: (imageUrl: string) => void;
  onError: (error: string) => void;
  maxRetries?: number;
  retryDelay?: number;
}

export const ImagePreloader: React.FC<ImagePreloaderProps> = ({
  imageUrl,
  onImageReady,
  onError,
  maxRetries = 3,
  retryDelay = 1000
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const preloadImage = (url: string, attempt: number = 1): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Add cache-busting parameter for retries
      const urlWithCacheBuster = attempt > 1 ? `${url}?t=${Date.now()}&retry=${attempt}` : url;
      
      img.onload = () => {
        console.log(`Image loaded successfully on attempt ${attempt}`);
        resolve();
      };
      
      img.onerror = () => {
        console.error(`Image failed to load on attempt ${attempt}:`, urlWithCacheBuster);
        reject(new Error(`Failed to load image (attempt ${attempt})`));
      };
      
      // Set a timeout for loading
      const timeout = setTimeout(() => {
        reject(new Error(`Image loading timeout (attempt ${attempt})`));
      }, 10000); // 10 second timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image (attempt ${attempt})`));
      };
      
      img.src = urlWithCacheBuster;
    });
  };

  const attemptLoad = async (attempt: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await preloadImage(imageUrl, attempt);
      
      // If successful, pass the original URL (without cache busters)
      onImageReady(imageUrl);
      setIsLoading(false);
      
    } catch (error) {
      console.error(`Image preload attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retrying with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        setTimeout(() => {
          setRetryCount(attempt);
          attemptLoad(attempt + 1);
        }, delay);
      } else {
        // All retries exhausted
        const errorMessage = `Failed to load image after ${maxRetries} attempts. Please try uploading a different image or check your internet connection.`;
        setError(errorMessage);
        setIsLoading(false);
        onError(errorMessage);
        toast.error('Image loading failed');
      }
    }
  };

  useEffect(() => {
    if (imageUrl) {
      attemptLoad(1);
    }
  }, [imageUrl]);

  const handleManualRetry = () => {
    setRetryCount(0);
    attemptLoad(1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <RefreshCw className="w-8 h-8 text-crd-green animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-white font-medium">Loading your image...</p>
          {retryCount > 0 && (
            <p className="text-muted-foreground text-sm mt-1">
              Retry attempt {retryCount} of {maxRetries}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-white font-semibold">Image Loading Failed</h3>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleManualRetry}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Upload Different Image
          </Button>
        </div>
      </div>
    );
  }

  return null;
};