
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

    // Dynamic canvas sizing for mobile responsiveness
    const getCanvasSize = () => {
      const containerWidth = window.innerWidth < 768 ? window.innerWidth - 40 : 900;
      const containerHeight = window.innerWidth < 768 ? 400 : 600;
      return { width: Math.min(containerWidth, 900), height: Math.min(containerHeight, 600) };
    };

    const { width, height } = getCanvasSize();
    
    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: 'rgba(20, 20, 25, 0.95)',
      selection: false,
      preserveObjectStacking: true,
      imageSmoothingEnabled: true,
      allowTouchScrolling: true, // Better mobile support
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

  // Immediate setup when both canvas and validated URL are ready
  useEffect(() => {
    if (!fabricCanvas || !validatedImageUrl) {
      console.log('Prerequisites not ready:', { fabricCanvas: !!fabricCanvas, validatedImageUrl: !!validatedImageUrl });
      return;
    }

    console.log('🚀 STARTING IMMEDIATE CROP SETUP');
    
    // Clear canvas and reset states
    fabricCanvas.clear();
    setFabricImage(null);
    setCropRect(null);
    setIsReady(false);
    setShowSkipOption(false);

    // Clear any existing timeout
    if (fabricLoadingTimeout) {
      clearTimeout(fabricLoadingTimeout);
      setFabricLoadingTimeout(null);
    }

    // Set up immediate fallback - if not ready in 3 seconds, show skip
    const immediateTimeout = setTimeout(() => {
      console.warn('⏰ IMMEDIATE FALLBACK: Setup taking too long');
      setShowSkipOption(true);
      toast.error('Crop setup is taking longer than expected', {
        description: "You can skip cropping or try again"
      });
    }, 3000);

    setFabricLoadingTimeout(immediateTimeout);

    // Use proven Fabric.js v6 pattern for reliable image loading
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('✅ HTML Image loaded, creating Fabric image...');
      
      // Use the reliable fromURL method instead of fromObject
      FabricImage.fromURL(validatedImageUrl, {
        crossOrigin: 'anonymous'
      }).then((fabricImg) => {
        console.log('✅ Fabric image created successfully');
        setupImageAndCrop(fabricImg);
      }).catch((error) => {
        console.error('❌ Fabric image creation failed:', error);
        // Fallback: try direct image element approach
        console.log('🔄 Trying fallback image creation...');
        try {
          const fabricImg = new FabricImage(img, {
            crossOrigin: 'anonymous'
          });
          setupImageAndCrop(fabricImg);
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
          handleLoadingFailure();
        }
      });
    };

    img.onerror = () => {
      console.error('❌ HTML Image loading failed');
      handleLoadingFailure();
    };

    // Start loading
    img.src = validatedImageUrl;

    const handleLoadingFailure = () => {
      console.error('💥 Complete loading failure, showing skip option');
      if (fabricLoadingTimeout) {
        clearTimeout(fabricLoadingTimeout);
        setFabricLoadingTimeout(null);
      }
      setShowSkipOption(true);
      toast.error('Unable to load image in crop editor');
    };

    const setupImageAndCrop = (img: FabricImage) => {
      console.log('🎯 Setting up image and crop...');
      
      // Clear timeout - we succeeded!
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
        mtr: true, // rotation control
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
      
      // Canvas is now ready!
      setIsReady(true);
      fabricCanvas.renderAll();
      
      console.log('🎉 Crop editor setup completed successfully!');
      toast.success('Crop editor ready!');
    };

    // Cleanup function
    return () => {
      if (immediateTimeout) {
        clearTimeout(immediateTimeout);
      }
    };
    
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

  // Enhanced loading state with better UX
  if (imageLoadingState === 'ready' && !isReady) {
    return (
      <div className={`${className} flex items-center justify-center py-16`}>
        <div className="text-center space-y-6 max-w-md">
          {/* Animated Crop Icon */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-crd-green to-crd-blue rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-crd-darkest rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-crd-green animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeLinecap="round"></circle>
              </svg>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-white font-bold text-xl">Setting up crop editor...</h3>
            <p className="text-crd-lightGray">Initializing canvas with your image</p>
            
            {/* Progress indicator */}
            <div className="w-full bg-crd-surface rounded-full h-2 mt-4">
              <div className="bg-gradient-to-r from-crd-green to-crd-blue h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
          
          {showSkipOption && (
            <div className="space-y-4 mt-8">
              <div className="bg-crd-orange/10 border border-crd-orange/20 rounded-lg p-4">
                <p className="text-crd-orange text-sm font-medium mb-3">Setup is taking longer than expected</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {
                      console.log('User chose to skip cropping, using original image');
                      onCropComplete(validatedImageUrl!);
                      toast.success('Using original image without cropping');
                    }}
                    variant="outline"
                    className="border-crd-green bg-crd-green/10 text-crd-green hover:bg-crd-green hover:text-black transition-all duration-300"
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
                    className="border-crd-lightGray text-crd-lightGray hover:bg-crd-lightGray hover:text-black transition-all duration-300"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Canvas Container with improved styling */}
      <div className="relative flex justify-center">
        <div className="relative bg-gradient-to-br from-crd-darkest to-crd-surface rounded-xl p-6 border border-crd-border shadow-2xl">
          <canvas 
            ref={canvasRef} 
            className="rounded-lg shadow-xl border-2 border-crd-border/50 max-w-full h-auto" 
            style={{ maxHeight: '70vh' }}
          />
          
          {/* Canvas Overlay Instructions */}
          <div className="absolute top-2 right-2 bg-crd-darkest/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-crd-border/50">
            <p className="text-crd-lightGray text-xs font-medium">
              Drag corners • Rotate handle above
            </p>
          </div>
        </div>
      </div>

      {isReady && (
        <>
          {compact ? (
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
          )}
          
          {/* Enhanced Apply Crop Section */}
          <div className="bg-gradient-to-r from-crd-green/10 to-crd-blue/10 border border-crd-green/20 rounded-xl p-6 text-center">
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold text-lg">Ready to Apply Your Crop</h3>
                <p className="text-crd-lightGray text-sm mt-1">
                  Your image is perfectly positioned. Click below to continue with your card creation.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button
                  onClick={handleApplyCrop}
                  size="lg"
                  className="bg-gradient-to-r from-crd-green to-crd-green/90 hover:from-crd-green/90 hover:to-crd-green text-black font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Apply Crop & Continue
                </Button>
                
                <Button
                  onClick={() => onCropComplete(validatedImageUrl!)}
                  variant="outline"
                  size="lg"
                  className="border-crd-border bg-crd-surface/50 text-white hover:bg-crd-surface px-6 py-3 rounded-xl transition-all duration-300"
                >
                  Skip Crop
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
