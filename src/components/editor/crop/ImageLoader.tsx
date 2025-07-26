import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface ImageLoaderProps {
  src: string;
  alt: string;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (error: string) => void;
  className?: string;
  style?: React.CSSProperties;
  crossOrigin?: 'anonymous' | 'use-credentials';
  maxRetries?: number;
  children?: (imageProps: {
    src: string;
    alt: string;
    onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    className?: string;
    style?: React.CSSProperties;
    crossOrigin?: 'anonymous' | 'use-credentials';
  }) => React.ReactNode;
}

export const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  onLoad,
  onError,
  className,
  style,
  crossOrigin = 'anonymous',
  maxRetries = 3,
  children
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log('ImageLoader: URL validation result:', {
        url,
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      });
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch (error) {
      console.error('ImageLoader: URL validation failed:', error);
      return false;
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('ImageLoader: Image loaded successfully:', currentSrc);
    setLoading(false);
    setError(null);
    setRetryCount(0);
    onLoad?.(e);
  };

  const handleImageError = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('ImageLoader: Image failed to load:', {
      src: currentSrc,
      retryCount,
      maxRetries
    });

    if (retryCount < maxRetries) {
      // Try validating the URL first
      const isValidUrl = await validateImageUrl(currentSrc);
      
      if (isValidUrl) {
        // URL is valid, retry loading
        console.log('ImageLoader: URL is valid, retrying...');
        setRetryCount(prev => prev + 1);
        // Add cache-busting parameter
        const separator = currentSrc.includes('?') ? '&' : '?';
        setCurrentSrc(`${currentSrc}${separator}retry=${retryCount + 1}&t=${Date.now()}`);
      } else {
        // URL is not valid or accessible
        const errorMsg = `Image URL is not accessible after ${retryCount + 1} attempts`;
        setError(errorMsg);
        setLoading(false);
        onError?.(errorMsg);
      }
    } else {
      const errorMsg = `Failed to load image after ${maxRetries} attempts`;
      setError(errorMsg);
      setLoading(false);
      onError?.(errorMsg);
    }
  };

  const handleManualRetry = () => {
    setError(null);
    setLoading(true);
    setRetryCount(0);
    const separator = currentSrc.includes('?') ? '&' : '?';
    setCurrentSrc(`${src}${separator}manual_retry=${Date.now()}`);
  };

  // Reset when src changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    setCurrentSrc(src);
  }, [src]);

  const imageProps = {
    src: currentSrc,
    alt,
    onLoad: handleImageLoad,
    onError: handleImageError,
    className,
    style,
    crossOrigin
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-500/10 border border-red-500/20 rounded-lg">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-400 mb-2">Image Load Failed</h3>
        <p className="text-red-300 text-sm text-center mb-4">{error}</p>
        <div className="text-xs text-red-200 mb-4 font-mono break-all max-w-full">
          URL: {src}
        </div>
        <Button 
          onClick={handleManualRetry}
          variant="outline"
          className="border-red-500 text-red-400 hover:bg-red-500/20"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Loading
        </Button>
      </div>
    );
  }

  if (loading && retryCount > 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-yellow-300 text-sm">Retrying... (Attempt {retryCount + 1}/{maxRetries + 1})</p>
      </div>
    );
  }

  if (children) {
    return <>{children(imageProps)}</>;
  }

  return <img ref={imgRef} {...imageProps} />;
};