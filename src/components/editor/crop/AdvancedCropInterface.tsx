import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  RotateCw, 
  Move, 
  Maximize2, 
  Undo, 
  Redo, 
  RotateCcwSquare,
  Trash2,
  Download,
  Eye,
  Scissors,
  Wand2,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { removeBackground, loadImage } from '@/services/backgroundRemoval';
import { useCropState } from './useCropState';

interface CropResult {
  id: string;
  imageUrl: string;
  cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  timestamp: number;
}

interface AdvancedCropInterfaceProps {
  imageUrl: string;
  onCropComplete?: (croppedImageUrl: string) => void;
  onMultipleCropsComplete?: (crops: CropResult[]) => void;
  aspectRatio?: number;
  className?: string;
}

export const AdvancedCropInterface: React.FC<AdvancedCropInterfaceProps> = ({
  imageUrl,
  onCropComplete,
  onMultipleCropsComplete,
  aspectRatio = 2.5 / 3.5,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [backgroundRemoving, setBackgroundRemoving] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState(imageUrl);
  const [cropResults, setCropResults] = useState<CropResult[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [cropSize, setCropSize] = useState(200);
  const [fineRotation, setFineRotation] = useState(0);
  
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

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0 });

  // Load image
  useEffect(() => {
    if (!processedImageUrl || !imageRef.current) return;

    const img = imageRef.current;
    
    img.onload = () => {
      setImageLoaded(true);
      toast.success('Image loaded! Ready to crop');
      
      // Auto-fit after load
      setTimeout(() => {
        handleAutoFit();
      }, 100);
    };
    
    img.onerror = () => {
      toast.error('Failed to load image');
    };
    
    img.crossOrigin = 'anonymous';
    img.src = processedImageUrl;
  }, [processedImageUrl]);

  // Handle crop size changes while maintaining aspect ratio
  useEffect(() => {
    const height = Math.round(cropSize / aspectRatio);
    updateCropSize(cropSize, height);
  }, [cropSize, aspectRatio, updateCropSize]);

  // Handle fine rotation
  useEffect(() => {
    updateCropRotation(fineRotation);
  }, [fineRotation, updateCropRotation]);

  const handleRemoveBackground = async () => {
    if (!processedImageUrl) return;
    
    try {
      setBackgroundRemoving(true);
      toast.info('Removing background...');
      
      // Load the image and remove background
      const imageElement = await loadImage(await fetch(processedImageUrl).then(r => r.blob()));
      const resultBlob = await removeBackground(imageElement);
      const resultUrl = URL.createObjectURL(resultBlob);
      
      setProcessedImageUrl(resultUrl);
      toast.success('Background removed successfully!');
    } catch (error) {
      console.error('Background removal failed:', error);
      toast.error('Failed to remove background');
    } finally {
      setBackgroundRemoving(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropBoxRef.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ 
      x: startX, 
      y: startY, 
      cropX: cropState.x, 
      cropY: cropState.y 
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    const newX = Math.max(0, Math.min(rect.width - cropState.width, dragStart.cropX + deltaX));
    const newY = Math.max(0, Math.min(rect.height - cropState.height, dragStart.cropY + deltaY));
    
    updateCropPosition(newX, newY);
  }, [isDragging, dragStart, cropState.width, cropState.height, updateCropPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleAutoCenter = () => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (rect.width - cropState.width) / 2;
    const y = (rect.height - cropState.height) / 2;
    updateCropPosition(x, y);
  };

  const handleAutoFit = () => {
    if (!containerRef.current || !imageRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const maxWidth = containerRect.width * 0.8;
    const maxHeight = containerRect.height * 0.8;
    
    let newWidth, newHeight;
    if (maxWidth / aspectRatio <= maxHeight) {
      newWidth = maxWidth;
      newHeight = Math.round(maxWidth / aspectRatio);
    } else {
      newHeight = maxHeight;
      newWidth = Math.round(newHeight * aspectRatio);
    }
    
    setCropSize(newWidth);
    updateCropPosition(
      (containerRect.width - newWidth) / 2,
      (containerRect.height - newHeight) / 2
    );
  };

  const applyCrop = async () => {
    if (!imageRef.current || !containerRef.current) {
      toast.error('Crop not ready');
      return;
    }

    try {
      const img = imageRef.current;
      const container = containerRef.current;
      
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      const imageAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerWidth / containerHeight;
      
      let displayedImageWidth, displayedImageHeight;
      let imageOffsetX, imageOffsetY;
      
      if (imageAspect > containerAspect) {
        displayedImageWidth = containerWidth;
        displayedImageHeight = containerWidth / imageAspect;
        imageOffsetX = 0;
        imageOffsetY = (containerHeight - displayedImageHeight) / 2;
      } else {
        displayedImageHeight = containerHeight;
        displayedImageWidth = containerHeight * imageAspect;
        imageOffsetX = (containerWidth - displayedImageWidth) / 2;
        imageOffsetY = 0;
      }
      
      const cropRelativeX = cropState.x - imageOffsetX;
      const cropRelativeY = cropState.y - imageOffsetY;
      
      const clampedCropX = Math.max(0, Math.min(cropRelativeX, displayedImageWidth - cropState.width));
      const clampedCropY = Math.max(0, Math.min(cropRelativeY, displayedImageHeight - cropState.height));
      const clampedCropWidth = Math.min(cropState.width, displayedImageWidth - clampedCropX);
      const clampedCropHeight = Math.min(cropState.height, displayedImageHeight - clampedCropY);
      
      const scaleX = img.naturalWidth / displayedImageWidth;
      const scaleY = img.naturalHeight / displayedImageHeight;
      
      const sourceX = clampedCropX * scaleX;
      const sourceY = clampedCropY * scaleY;
      const sourceWidth = clampedCropWidth * scaleX;
      const sourceHeight = clampedCropHeight * scaleY;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const cardWidth = 500;
      const cardHeight = Math.round(cardWidth / aspectRatio);
      
      canvas.width = cardWidth;
      canvas.height = cardHeight;

      if (cropState.rotation !== 0) {
        ctx.translate(cardWidth / 2, cardHeight / 2);
        ctx.rotate((cropState.rotation * Math.PI) / 180);
        ctx.translate(-cardWidth / 2, -cardHeight / 2);
      }

      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, cardWidth, cardHeight
      );

      return new Promise<string>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          }
        }, 'image/png', 1.0);
      });

    } catch (error) {
      console.error('Crop failed:', error);
      toast.error('Failed to apply crop');
      return null;
    }
  };

  const handleSaveCrop = async () => {
    const croppedUrl = await applyCrop();
    if (!croppedUrl) return;

    const newCrop: CropResult = {
      id: `crop-${Date.now()}`,
      imageUrl: croppedUrl,
      cropData: { ...cropState },
      timestamp: Date.now()
    };

    setCropResults(prev => [...prev, newCrop]);
    toast.success('Crop saved! You can create more or finalize.');
  };

  const handleCompleteSingle = async () => {
    const croppedUrl = await applyCrop();
    if (croppedUrl && onCropComplete) {
      onCropComplete(croppedUrl);
      toast.success('Crop applied successfully!');
    }
  };

  const handleCompleteMultiple = () => {
    if (cropResults.length === 0) {
      toast.error('No crops to finalize');
      return;
    }
    
    if (onMultipleCropsComplete) {
      onMultipleCropsComplete(cropResults);
      toast.success(`Finalized ${cropResults.length} crops!`);
    }
  };

  const handleClearHistory = () => {
    setCropResults([]);
    setSelectedCropId(null);
    resetCrop();
    toast.success('History cleared');
  };

  const handleDeleteCrop = (cropId: string) => {
    setCropResults(prev => prev.filter(c => c.id !== cropId));
    if (selectedCropId === cropId) {
      setSelectedCropId(null);
    }
    toast.success('Crop deleted');
  };

  const handlePreviewCrop = (crop: CropResult) => {
    setSelectedCropId(crop.id);
    // TODO: Show preview modal
  };

  const handleDownloadCrop = (crop: CropResult) => {
    const link = document.createElement('a');
    link.href = crop.imageUrl;
    link.download = `crop-${crop.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handleDuplicateCrop = async (crop: CropResult) => {
    const newCrop: CropResult = {
      ...crop,
      id: `crop-${Date.now()}`,
      timestamp: Date.now()
    };
    setCropResults(prev => [...prev, newCrop]);
    toast.success('Crop duplicated');
  };

  return (
    <div className={`${className}`}>
      {/* Loading overlay */}
      {(!imageLoaded || backgroundRemoving) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-crd-green border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-white font-semibold text-lg">
                {backgroundRemoving ? 'Removing Background...' : 'Loading Image...'}
              </h3>
              <p className="text-crd-lightGray">
                {backgroundRemoving ? 'Processing with AI' : 'Preparing your image for cropping'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Interface */}
      <div className="relative">
        {/* Image Container */}
        <Card className="p-6 bg-crd-surface border-crd-border">
          <div 
            ref={containerRef}
            className="relative w-full h-[600px] mx-auto bg-gray-900 rounded-lg overflow-hidden"
          >
            <img
              ref={imageRef}
              src={processedImageUrl}
              alt="Crop preview"
              className="w-full h-full object-contain"
              draggable={false}
            />
            
            {/* Crop Box with Attached Controls */}
            <div
              ref={cropBoxRef}
              className="absolute border-2 border-crd-green bg-transparent cursor-move group"
              style={{
                left: `${cropState.x}px`,
                top: `${cropState.y}px`,
                width: `${cropState.width}px`,
                height: `${cropState.height}px`,
                transform: `rotate(${cropState.rotation}deg)`,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-crd-green border border-white"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-crd-green border border-white"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-crd-green border border-white"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-crd-green border border-white"></div>
              
              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-crd-green text-black px-2 py-1 rounded text-xs font-semibold">
                  CROP AREA
                </div>
              </div>

              {/* Top Controls Panel */}
              <div className="absolute -top-12 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
                <div className="bg-black/90 backdrop-blur-sm rounded-lg border border-crd-border p-3 min-w-max">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white font-medium">Size:</span>
                    <div className="w-24">
                      <Slider
                        value={[cropSize]}
                        onValueChange={(value) => setCropSize(value[0])}
                        min={50}
                        max={400}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <span className="text-crd-mediumGray">{cropSize}px</span>
                  </div>
                </div>
              </div>

              {/* Right Controls Panel */}
              <div className="absolute -right-16 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
                <div className="bg-black/90 backdrop-blur-sm rounded-lg border border-crd-border p-2 space-y-1">
                  <Button onClick={handleAutoCenter} size="sm" variant="ghost" className="w-12 h-8 p-0 text-white hover:bg-crd-green hover:text-black">
                    <Move className="w-3 h-3" />
                  </Button>
                  <Button onClick={handleAutoFit} size="sm" variant="ghost" className="w-12 h-8 p-0 text-white hover:bg-crd-green hover:text-black">
                    <Maximize2 className="w-3 h-3" />
                  </Button>
                  <Button onClick={() => setFineRotation(prev => prev - 90)} size="sm" variant="ghost" className="w-12 h-8 p-0 text-white hover:bg-crd-green hover:text-black">
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button onClick={() => setFineRotation(prev => prev + 90)} size="sm" variant="ghost" className="w-12 h-8 p-0 text-white hover:bg-crd-green hover:text-black">
                    <RotateCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Bottom Controls Panel */}
              <div className="absolute -bottom-12 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
                <div className="bg-black/90 backdrop-blur-sm rounded-lg border border-crd-border p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white font-medium">Rotation:</span>
                    <div className="w-32">
                      <Slider
                        value={[fineRotation]}
                        onValueChange={(value) => setFineRotation(value[0])}
                        min={-180}
                        max={180}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    <span className="text-crd-mediumGray">{fineRotation.toFixed(1)}°</span>
                  </div>
                </div>
              </div>

              {/* Left Controls Panel */}
              <div className="absolute -left-16 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
                <div className="bg-black/90 backdrop-blur-sm rounded-lg border border-crd-border p-2 space-y-1">
                  <Button onClick={undo} disabled={!canUndo} size="sm" variant="ghost" className="w-12 h-8 p-0 text-white hover:bg-crd-blue hover:text-black disabled:opacity-50">
                    <Undo className="w-3 h-3" />
                  </Button>
                  <Button onClick={redo} disabled={!canRedo} size="sm" variant="ghost" className="w-12 h-8 p-0 text-white hover:bg-crd-blue hover:text-black disabled:opacity-50">
                    <Redo className="w-3 h-3" />
                  </Button>
                  <Button onClick={resetCrop} size="sm" variant="ghost" className="w-12 h-8 p-0 text-white hover:bg-crd-orange hover:text-black">
                    <RotateCcwSquare className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Fixed Controls at Bottom */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <Button 
            onClick={handleRemoveBackground} 
            disabled={backgroundRemoving}
            size="sm" 
            variant="outline" 
            className="border-crd-border text-white hover:bg-purple-500 hover:text-white"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Remove Background
          </Button>
          
          <Button onClick={handleSaveCrop} className="bg-crd-green text-black hover:bg-crd-green/80">
            <Scissors className="w-4 h-4 mr-2" />
            Save Crop
          </Button>
          
          {onCropComplete && (
            <Button onClick={handleCompleteSingle} className="bg-crd-blue text-white hover:bg-crd-blue/80">
              Apply & Continue
            </Button>
          )}

          {cropResults.length > 0 && (
            <>
              <Button onClick={handleClearHistory} variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History ({cropResults.length})
              </Button>
              
              {onMultipleCropsComplete && (
                <Button onClick={handleCompleteMultiple} className="bg-crd-orange text-black hover:bg-crd-orange/80">
                  Finalize All Crops ({cropResults.length})
                </Button>
              )}
            </>
          )}
        </div>

        {/* Saved Crops Preview */}
        {cropResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-white font-semibold mb-2">Saved Crops ({cropResults.length})</h3>
            <div className="flex gap-2 flex-wrap">
              {cropResults.map((crop) => (
                <div key={crop.id} className="relative group">
                  <img src={crop.imageUrl} alt="Crop preview" className="w-16 h-20 object-cover rounded border border-crd-border" />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center">
                    <div className="flex gap-1">
                      <Button onClick={() => handleDownloadCrop(crop)} size="sm" variant="ghost" className="w-6 h-6 p-0 text-white hover:bg-white/20">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button onClick={() => handleDeleteCrop(crop.id)} size="sm" variant="ghost" className="w-6 h-6 p-0 text-red-400 hover:bg-red-500/20">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};