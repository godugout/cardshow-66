import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImagePreloaderProps {
  imageUrl: string;
  onImageReady: (imageUrl: string) => void;
  onError: (error: string) => void;
  maxRetries?: number;
  retryDelay?: number;
  showDebugInfo?: boolean;
}

export const ImagePreloader: React.FC<ImagePreloaderProps> = ({
  imageUrl,
  onImageReady,
  onError,
  maxRetries = 5,
  retryDelay = 2000,
  showDebugInfo = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  // Validate image URL accessibility
  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const preloadImage = (url: string, attempt: number = 1): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Progressive fallback URLs for Supabase storage
      let testUrl = url;
      if (attempt === 2) {
        // Try with cache busting
        testUrl = `${url}?t=${Date.now()}`;
      } else if (attempt === 3) {
        // Try with different cache headers
        testUrl = `${url}?cache=no-cache&t=${Date.now()}`;
      } else if (attempt > 3) {
        // Add retry parameter
        testUrl = `${url}?retry=${attempt}&t=${Date.now()}`;
      }
      
      setCurrentUrl(testUrl);
      console.log(`Loading image attempt ${attempt}:`, testUrl);
      
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        reject(new Error(`Image loading timeout (attempt ${attempt})`));
      }, 15000); // Increased timeout to 15 seconds
      
      img.onload = () => {
        clearTimeout(timeout);
        console.log(`Image loaded successfully on attempt ${attempt}`);
        resolve();
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        console.error(`Image failed to load on attempt ${attempt}:`, testUrl);
        reject(new Error(`Failed to load image (attempt ${attempt})`));
      };
      
      // Set crossOrigin for better compatibility
      img.crossOrigin = 'anonymous';
      img.src = testUrl;
    });
  };

  const attemptLoad = async (attempt: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For CDN propagation, add initial delay on first attempt for new uploads
      if (attempt === 1 && imageUrl.includes('supabase')) {
        console.log('Waiting for CDN propagation...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Pre-validate URL accessibility for faster failure detection
      if (attempt === 1) {
        const isAccessible = await validateImageUrl(imageUrl);
        if (!isAccessible) {
          console.log('Image not yet accessible, will retry...');
          throw new Error('Image not yet accessible');
        }
      }
      
      await preloadImage(imageUrl, attempt);
      
      // If successful, pass the original URL (without cache busters)
      onImageReady(imageUrl);
      setIsLoading(false);
      
    } catch (error) {
      console.error(`Image preload attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Progressive backoff: longer delays for CDN propagation
        let delay = retryDelay;
        if (attempt <= 2) {
          delay = 5000; // 5 seconds for CDN propagation
        } else {
          delay = retryDelay * Math.pow(1.5, attempt - 1); // Slower exponential backoff
        }
        
        console.log(`Retrying in ${delay}ms...`);
        setTimeout(() => {
          setRetryCount(attempt);
          attemptLoad(attempt + 1);
        }, delay);
      } else {
        // All retries exhausted
        const errorMessage = `Failed to load image after ${maxRetries} attempts. This might be due to CDN propagation delays. Please try again in a moment or upload a different image.`;
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
          {showDebugInfo && currentUrl && (
            <div className="mt-3 p-2 bg-gray-800 rounded text-xs">
              <p className="text-gray-400 mb-1">Debug Info:</p>
              <p className="text-white break-all">{currentUrl}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => window.open(currentUrl, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Test URL
              </Button>
            </div>
          )}
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