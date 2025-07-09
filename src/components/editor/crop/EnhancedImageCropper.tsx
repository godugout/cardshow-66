
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, Rect, FabricImage, Line } from 'fabric';
import { Button } from '@/components/ui/button';
import { CropControls } from './CropControls';
import { CompactCropControls } from './CompactCropControls';
import { useCropState } from './useCropState';
import { exportCroppedImage } from '@/utils/cropUtils';
import { ImagePreloader } from './ImagePreloader';
import { toast } from 'sonner';

interface EnhancedImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
  className?: string;
  compact?: boolean;
}

export const EnhancedImageCropper: React.FC<EnhancedImageCropperProps> = ({
  imageUrl,
  onCropComplete,
  aspectRatio = 2.5 / 3.5,
  className = "",
  compact = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [fabricImage, setFabricImage] = useState<FabricImage | null>(null);
  const [cropRect, setCropRect] = useState<Rect | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [imageLoadingState, setImageLoadingState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [validatedImageUrl, setValidatedImageUrl] = useState<string | null>(null);
  const [fabricLoadingTimeout, setFabricLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showSkipOption, setShowSkipOption] = useState(false);

  const {
    cropState,
    updateCropPosition,
    updateCropSize,
    updateCropRotation,
    resetCrop,
    canUndo,
    canRedo,
    undo,
    redo
  } = useCropState();

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f0f0f0',
      selection: false,
      preserveObjectStacking: true,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
      setFabricCanvas(null);
      // Clean up timeout
      if (fabricLoadingTimeout) {
        clearTimeout(fabricLoadingTimeout);
      }
    };
  }, []);

  // Handle validated image URL and setup
  const handleImageReady = useCallback((validUrl: string) => {
    setValidatedImageUrl(validUrl);
    setImageLoadingState('ready');
  }, []);

  const handleImageError = useCallback((error: string) => {
    setImageLoadingState('error');
    console.error('Image validation failed:', error);
  }, []);

  // Load and setup image (only when image is validated)
  useEffect(() => {
    if (!fabricCanvas || !validatedImageUrl) {
      console.log('Fabric loading prerequisites check:', { 
        fabricCanvas: !!fabricCanvas, 
        validatedImageUrl: !!validatedImageUrl 
      });
      return;
    }

    console.log('🔥 STARTING FABRIC.JS IMAGE LOADING');
    console.log('Canvas ready:', !!fabricCanvas);
    console.log('Validated URL:', validatedImageUrl);

    // Clear any existing objects
    fabricCanvas.clear();
    setFabricImage(null);
    setCropRect(null);
    setIsReady(false);
    setShowSkipOption(false);

    // Clear any existing timeout
    if (fabricLoadingTimeout) {
      console.log('Clearing existing timeout');
      clearTimeout(fabricLoadingTimeout);
    }

    // Set timeout for Fabric.js loading (8 seconds - reduced for faster feedback)
    console.log('Setting 8-second timeout for Fabric.js loading');
    const timeout = setTimeout(() => {
      console.warn('🚨 FABRIC.JS LOADING TIMED OUT after 8 seconds');
      setShowSkipOption(true);
      toast.error('Crop editor is taking too long. You can skip cropping or try again.');
    }, 8000);
    
    setFabricLoadingTimeout(timeout);

    // Configure image loading options for CORS and Supabase compatibility
    const imageOptions = {
      crossOrigin: 'anonymous' as const
    };

    const loadFabricImage = async (url: string, retryCount = 0): Promise<void> => {
      console.log(`🎯 Starting Fabric.js attempt #${retryCount + 1}`);
      console.log('URL:', url);
      console.log('Image options:', imageOptions);
      
      // Create a manual timeout promise that rejects
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.error(`❌ Manual timeout: Fabric.js fromURL took too long (attempt ${retryCount + 1})`);
          reject(new Error(`Fabric.js fromURL timeout after 5 seconds`));
        }, 5000);
      });

      try {
        console.log(`📸 Calling FabricImage.fromURL...`);
        
        // Race between the actual loading and our timeout
        const img = await Promise.race([
          FabricImage.fromURL(url, imageOptions),
          timeoutPromise
        ]);
        
        console.log('✅ Fabric.js image loaded successfully!');
        console.log('Image dimensions:', img.width, 'x', img.height);
        
        setupImageAndCrop(img);
      } catch (error) {
        console.error(`❌ Fabric.js loading attempt ${retryCount + 1} failed:`, error);
        
        if (retryCount < 1) { // Reduced retries to 1 for faster fallback
          // Try simplified approach on retry
          let retryUrl = url;
          if (retryCount === 0) {
            // Try without any options on first retry
            console.log('🔄 Retrying without crossOrigin...');
            setTimeout(() => {
              loadFabricImageSimple(retryUrl, retryCount + 1);
            }, 1000);
            return;
          }
        } else {
          console.error('💥 All Fabric.js loading attempts failed');
          if (fabricLoadingTimeout) {
            clearTimeout(fabricLoadingTimeout);
          }
          setShowSkipOption(true);
          toast.error('Crop editor failed to load. Please skip cropping or try again.');
        }
      }
    };

    // Simplified loading without crossOrigin options
    const loadFabricImageSimple = async (url: string, retryCount = 0): Promise<void> => {
      console.log(`🔄 Simplified Fabric.js attempt #${retryCount + 1} (no CORS)`);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.error(`❌ Simplified timeout: Fabric.js fromURL took too long`);
          reject(new Error(`Simplified Fabric.js fromURL timeout`));
        }, 3000);
      });

      try {
        // Try without any options - sometimes CORS causes issues
        const img = await Promise.race([
          FabricImage.fromURL(url),
          timeoutPromise
        ]);
        
        console.log('✅ Simplified Fabric.js load succeeded!');
        setupImageAndCrop(img);
      } catch (error) {
        console.error('❌ Simplified loading also failed:', error);
        if (fabricLoadingTimeout) {
          clearTimeout(fabricLoadingTimeout);
        }
        setShowSkipOption(true);
        toast.error('Unable to initialize crop editor. Please skip cropping.');
      }
    };

    const setupImageAndCrop = (img: FabricImage) => {
      console.log('Setting up image and crop rectangle');
      
      // Clear timeout since we successfully loaded
      if (fabricLoadingTimeout) {
        clearTimeout(fabricLoadingTimeout);
        setFabricLoadingTimeout(null);
      }
      
      // Scale image to fit canvas while maintaining aspect ratio
      const canvasWidth = fabricCanvas.width!;
      const canvasHeight = fabricCanvas.height!;
      const imgAspect = img.width! / img.height!;
      const canvasAspect = canvasWidth / canvasHeight;

      let scale;
      if (imgAspect > canvasAspect) {
        scale = canvasWidth / img.width!;
      } else {
        scale = canvasHeight / img.height!;
      }

      img.scale(scale);
      img.set({
        left: (canvasWidth - img.getScaledWidth()) / 2,
        top: (canvasHeight - img.getScaledHeight()) / 2,
        selectable: false,
        evented: false,
      });

      fabricCanvas.add(img);
      setFabricImage(img);

      // Create initial crop rectangle
      const cropWidth = Math.min(img.getScaledWidth() * 0.8, 300);
      const cropHeight = cropWidth / aspectRatio;

      const rect = new Rect({
        left: img.left! + (img.getScaledWidth() - cropWidth) / 2,
        top: img.top! + (img.getScaledHeight() - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
        fill: 'transparent',
        stroke: '#00ff00',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        cornerColor: '#00ff00',
        cornerSize: 12,
        transparentCorners: false,
        lockUniScaling: true,
      });

      // Custom controls for aspect ratio locked resizing
      rect.setControlsVisibility({
        mt: false, // middle top
        mb: false, // middle bottom
        ml: false, // middle left
        mr: false, // middle right
        mtr: true, // rotation control - this is the correct property in v6
      });

      // Event handlers for crop rectangle
      rect.on('moving', () => {
        updateCropPosition(rect.left!, rect.top!);
      });

      rect.on('scaling', () => {
        // Maintain aspect ratio during scaling
        const newWidth = rect.getScaledWidth();
        const newHeight = newWidth / aspectRatio;
        
        rect.set({
          height: rect.height! * (newHeight / rect.getScaledHeight()),
          scaleY: rect.scaleX
        });
        
        updateCropSize(newWidth, newHeight);
        fabricCanvas.renderAll();
      });

      rect.on('rotating', () => {
        updateCropRotation(rect.angle!);
      });

      fabricCanvas.add(rect);
      setCropRect(rect);
      fabricCanvas.setActiveObject(rect);
      
      // Add grid overlay
      addGridOverlay(rect);
      
      setIsReady(true);
      fabricCanvas.renderAll();
      
      console.log('Image and crop setup completed successfully');
    };

    // Start the loading process
    loadFabricImage(validatedImageUrl);
  }, [fabricCanvas, validatedImageUrl, aspectRatio]);

  // Reset image loading state when imageUrl changes
  useEffect(() => {
    setImageLoadingState('loading');
    setValidatedImageUrl(null);
    setIsReady(false);
  }, [imageUrl]);

  const addGridOverlay = (rect: Rect) => {
    if (!fabricCanvas) return;

    // Remove existing grid lines
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if (obj.get('isGridLine')) {
        fabricCanvas.remove(obj);
      }
    });

    // Add rule of thirds grid
    const rectBounds = rect.getBoundingRect();
    const gridColor = '#ffffff';
    const gridOpacity = 0.3;

    // Vertical lines
    for (let i = 1; i < 3; i++) {
      const x = rectBounds.left + (rectBounds.width * i / 3);
      const line = new Line([x, rectBounds.top, x, rectBounds.top + rectBounds.height], {
        stroke: gridColor,
        strokeWidth: 1,
        opacity: gridOpacity,
        selectable: false,
        evented: false,
        isGridLine: true,
      });
      fabricCanvas.add(line);
    }

    // Horizontal lines
    for (let i = 1; i < 3; i++) {
      const y = rectBounds.top + (rectBounds.height * i / 3);
      const line = new Line([rectBounds.left, y, rectBounds.left + rectBounds.width, y], {
        stroke: gridColor,
        strokeWidth: 1,
        opacity: gridOpacity,
        selectable: false,
        evented: false,
        isGridLine: true,
      });
      fabricCanvas.add(line);
    }

    fabricCanvas.renderAll();
  };

  const handleCenterCrop = useCallback(() => {
    if (!cropRect || !fabricImage) return;

    const imgBounds = fabricImage.getBoundingRect();
    const cropWidth = cropRect.getScaledWidth();
    const cropHeight = cropRect.getScaledHeight();

    cropRect.set({
      left: imgBounds.left + (imgBounds.width - cropWidth) / 2,
      top: imgBounds.top + (imgBounds.height - cropHeight) / 2,
      angle: 0,
    });

    addGridOverlay(cropRect);
    fabricCanvas?.renderAll();
    updateCropPosition(cropRect.left!, cropRect.top!);
    updateCropRotation(0);
  }, [cropRect, fabricImage, fabricCanvas]);

  const handleFitCrop = useCallback(() => {
    if (!cropRect || !fabricImage) return;

    const imgBounds = fabricImage.getBoundingRect();
    const maxWidth = imgBounds.width * 0.9;
    const maxHeight = imgBounds.height * 0.9;
    
    let newWidth, newHeight;
    if (maxWidth / aspectRatio <= maxHeight) {
      newWidth = maxWidth;
      newHeight = maxWidth / aspectRatio;
    } else {
      newHeight = maxHeight;
      newWidth = maxHeight * aspectRatio;
    }

    const scale = newWidth / cropRect.width!;
    cropRect.set({
      scaleX: scale,
      scaleY: scale,
      left: imgBounds.left + (imgBounds.width - newWidth) / 2,
      top: imgBounds.top + (imgBounds.height - newHeight) / 2,
      angle: 0,
    });

    addGridOverlay(cropRect);
    fabricCanvas?.renderAll();
    updateCropSize(newWidth, newHeight);
    updateCropPosition(cropRect.left!, cropRect.top!);
    updateCropRotation(0);
  }, [cropRect, fabricImage, fabricCanvas, aspectRatio]);

  const handleApplyCrop = useCallback(async () => {
    if (!fabricCanvas || !cropRect || !fabricImage) {
      toast.error('Crop area not ready');
      return;
    }

    try {
      const croppedDataUrl = await exportCroppedImage(fabricCanvas, cropRect, fabricImage);
      onCropComplete(croppedDataUrl);
      toast.success('Crop applied successfully!');
    } catch (error) {
      console.error('Failed to apply crop:', error);
      toast.error('Failed to apply crop');
    }
  }, [fabricCanvas, cropRect, fabricImage, onCropComplete]);

  // Update crop rectangle when state changes externally
  useEffect(() => {
    if (!cropRect) return;

    cropRect.set({
      left: cropState.x,
      top: cropState.y,
      angle: cropState.rotation,
    });

    const scale = cropState.width / cropRect.width!;
    cropRect.set({
      scaleX: scale,
      scaleY: scale,
    });

    addGridOverlay(cropRect);
    fabricCanvas?.renderAll();
  }, [cropState, cropRect, fabricCanvas]);

  // Show image preloader while loading or on error
  if (imageLoadingState === 'loading' || imageLoadingState === 'error') {
    return (
      <div className={`${className}`}>
        <ImagePreloader
          imageUrl={imageUrl}
          onImageReady={handleImageReady}
          onError={handleImageError}
          maxRetries={3}
          retryDelay={1000}
          showDebugInfo={true}
        />
      </div>
    );
  }

  // Show loading state while Fabric.js sets up the image
  if (imageLoadingState === 'ready' && !isReady) {
    return (
      <div className={`${className} flex items-center justify-center py-12`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crd-green mx-auto"></div>
          <div>
            <p className="text-white font-medium">Setting up crop editor...</p>
            <p className="text-muted-foreground text-sm">Initializing canvas with your image</p>
          </div>
          
          {showSkipOption && (
            <div className="space-y-3">
              <p className="text-yellow-400 text-sm">Taking longer than expected</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    console.log('User chose to skip cropping, using original image');
                    onCropComplete(validatedImageUrl!);
                    toast.success('Using original image without cropping');
                  }}
                  variant="outline"
                  className="border-crd-green text-crd-green hover:bg-crd-green hover:text-black"
                >
                  Skip Crop & Use Original
                </Button>
                <Button
                  onClick={() => {
                    console.log('User chose to retry crop editor setup');
                    setShowSkipOption(false);
                    setImageLoadingState('loading');
                    setValidatedImageUrl(null);
                    toast.info('Retrying crop editor...');
                  }}
                  variant="outline"
                  className="border-crd-lightGray text-crd-lightGray hover:bg-crd-lightGray hover:text-black"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="border border-gray-300 rounded-lg shadow-lg" />
      </div>

      {isReady && (
        compact ? (
          <CompactCropControls
            cropState={cropState}
            onReset={resetCrop}
            onCenter={handleCenterCrop}
            onFit={handleFitCrop}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onRotationChange={updateCropRotation}
          />
        ) : (
          <CropControls
            cropState={cropState}
            onPositionChange={updateCropPosition}
            onSizeChange={updateCropSize}
            onRotationChange={updateCropRotation}
            onReset={resetCrop}
            onCenter={handleCenterCrop}
            onFit={handleFitCrop}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            aspectRatio={aspectRatio}
          />
        )
      )}

      <div className="flex justify-center gap-4">
        <Button
          onClick={handleApplyCrop}
          disabled={!isReady}
          className="bg-crd-green hover:bg-crd-green/90 text-black"
        >
          Apply Crop
        </Button>
      </div>
    </div>
  );
};
