import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, Move, Maximize2, Undo, Redo } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
  className?: string;
}

export const SimpleCropper: React.FC<SimpleCropperProps> = ({
  imageUrl,
  onCropComplete,
  aspectRatio = 2.5 / 3.5,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  // Ensure exact 2.5:3.5 aspect ratio (0.714285714...)
  const cardAspectRatio = 2.5 / 3.5;
  const [crop, setCrop] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: Math.round(200 / cardAspectRatio), // Exact 2.5:3.5 ratio
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0 });
  const [history, setHistory] = useState([crop]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Test image loading independently
  useEffect(() => {
    console.log('🔍 SimpleCropper: Component mounted with imageUrl:', imageUrl);
    
    if (imageUrl) {
      // Test if the URL is accessible directly
      console.log('🧪 SimpleCropper: Testing direct image access...');
      
      const testImg = new Image();
      testImg.crossOrigin = 'anonymous';
      
      testImg.onload = () => {
        console.log('✅ SimpleCropper: Direct image test SUCCESSFUL');
        console.log('📏 SimpleCropper: Test image dimensions:', testImg.width, 'x', testImg.height);
      };
      
      testImg.onerror = (error) => {
        console.error('❌ SimpleCropper: Direct image test FAILED');
        console.error('❌ SimpleCropper: Error details:', error);
        console.error('❌ SimpleCropper: URL being tested:', imageUrl);
      };
      
      testImg.src = imageUrl;
    }
  }, [imageUrl]);

  // Load image
  useEffect(() => {
    console.log('🔍 SimpleCropper: Image load useEffect triggered', { 
      imageUrl, 
      hasImageRef: !!imageRef.current,
      imageRefCurrent: imageRef.current
    });
    
    if (!imageUrl) {
      console.warn('⚠️ SimpleCropper: No imageUrl provided');
      return;
    }

    // Delay to ensure ref is available
    const timer = setTimeout(() => {
      if (imageRef.current) {
        const img = imageRef.current;
        
        console.log('🏁 SimpleCropper: Starting image load process');
        console.log('📱 SimpleCropper: Image URL:', imageUrl);
        
        img.onload = () => {
          console.log('✅ SimpleCropper: Image loaded successfully');
          console.log('📏 SimpleCropper: Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
          setImageLoaded(true);
          toast.success('Image loaded! Ready to crop');
          
          // Auto-center and fit the crop box
          setTimeout(() => {
            handleAutoFit();
          }, 100);
        };
        
        img.onerror = (error) => {
          console.error('❌ SimpleCropper: Image failed to load');
          console.error('❌ SimpleCropper: Error details:', error);
          console.error('❌ SimpleCropper: Failed URL:', imageUrl);
          toast.error('Failed to load image');
        };
        
        // Add load start debugging
        img.onloadstart = () => {
          console.log('🚀 SimpleCropper: Image load started');
        };
        
        console.log('🔄 SimpleCropper: Setting image src to:', imageUrl);
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        
        // Additional debugging - check if src was actually set
        setTimeout(() => {
          console.log('🔍 SimpleCropper: Image src after setting:', img.src);
          console.log('🔍 SimpleCropper: Image complete:', img.complete);
          console.log('🔍 SimpleCropper: Image naturalWidth:', img.naturalWidth);
        }, 100);
      } else {
        console.error('❌ SimpleCropper: imageRef.current is still null after delay');
        console.log('🔄 SimpleCropper: Retrying in 500ms...');
        
        // Retry after a longer delay
        setTimeout(() => {
          if (imageRef.current && imageUrl) {
            console.log('🔄 SimpleCropper: Retry successful, imageRef found');
            const img = imageRef.current;
            img.crossOrigin = 'anonymous';
            img.src = imageUrl;
            
            img.onload = () => {
              console.log('✅ SimpleCropper: Image loaded on retry');
              setImageLoaded(true);
              toast.success('Image loaded! Ready to crop');
              setTimeout(() => handleAutoFit(), 100);
            };
            
            img.onerror = (error) => {
              console.error('❌ SimpleCropper: Image failed on retry:', error);
              toast.error('Failed to load image');
            };
          } else {
            console.error('❌ SimpleCropper: Retry failed - still no imageRef');
          }
        }, 500);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [imageUrl]);

  const addToHistory = useCallback((newCrop: typeof crop) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCrop);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCrop(newCrop);
  }, [history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCrop(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCrop(history[historyIndex + 1]);
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
      cropX: crop.x, 
      cropY: crop.y 
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    const newX = Math.max(0, Math.min(rect.width - crop.width, dragStart.cropX + deltaX));
    const newY = Math.max(0, Math.min(rect.height - crop.height, dragStart.cropY + deltaY));
    
    setCrop(prev => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart, crop.width, crop.height]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      addToHistory(crop);
    }
  }, [isDragging, crop, addToHistory]);

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
    const newCrop = {
      ...crop,
      x: (rect.width - crop.width) / 2,
      y: (rect.height - crop.height) / 2,
      rotation: 0
    };
    addToHistory(newCrop);
  };

  const handleAutoFit = () => {
    if (!containerRef.current || !imageRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const maxWidth = containerRect.width * 0.8;
    const maxHeight = containerRect.height * 0.8;
    
    // Always use exact card aspect ratio (2.5:3.5)
    let newWidth, newHeight;
    if (maxWidth / cardAspectRatio <= maxHeight) {
      newWidth = maxWidth;
      newHeight = Math.round(maxWidth / cardAspectRatio);
    } else {
      newHeight = maxHeight;
      newWidth = Math.round(newHeight * cardAspectRatio);
    }
    
    const newCrop = {
      x: (containerRect.width - newWidth) / 2,
      y: (containerRect.height - newHeight) / 2,
      width: newWidth,
      height: newHeight,
      rotation: 0
    };
    addToHistory(newCrop);
  };

  const handleRotate = (degrees: number) => {
    const newCrop = {
      ...crop,
      rotation: (crop.rotation + degrees) % 360
    };
    addToHistory(newCrop);
  };

  const handleReset = () => {
    const resetCrop = {
      x: 50,
      y: 50,
      width: 200,
      height: Math.round(200 / cardAspectRatio), // Exact 2.5:3.5 ratio
      rotation: 0
    };
    addToHistory(resetCrop);
  };

  const handleApplyCrop = async () => {
    if (!imageRef.current || !containerRef.current) {
      toast.error('Crop not ready');
      return;
    }

    try {
      const img = imageRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      
      // Calculate how the image is positioned within the container
      const scaleX = img.naturalWidth / imgRect.width;
      const scaleY = img.naturalHeight / imgRect.height;
      
      // Calculate the actual crop coordinates relative to the original image
      const imgLeft = imgRect.left - containerRect.left;
      const imgTop = imgRect.top - containerRect.top;
      
      // Crop coordinates relative to image
      const cropRelativeX = Math.max(0, crop.x - imgLeft);
      const cropRelativeY = Math.max(0, crop.y - imgTop);
      
      // Scale to original image coordinates
      const sourceX = cropRelativeX * scaleX;
      const sourceY = cropRelativeY * scaleY;
      const sourceWidth = crop.width * scaleX;
      const sourceHeight = crop.height * scaleY;

      // Create canvas with exact card dimensions (maintaining 2.5:3.5 ratio)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set standard card dimensions (scale up for quality)
      const cardWidth = 500; // Standard card width
      const cardHeight = Math.round(cardWidth / cardAspectRatio); // Exact 2.5:3.5 ratio
      
      canvas.width = cardWidth;
      canvas.height = cardHeight;

      console.log('🎯 Crop Details:', {
        cropBox: { x: crop.x, y: crop.y, width: crop.width, height: crop.height },
        aspectRatio: crop.width / crop.height,
        expectedRatio: cardAspectRatio,
        sourceCoords: { x: sourceX, y: sourceY, width: sourceWidth, height: sourceHeight },
        canvasSize: { width: cardWidth, height: cardHeight }
      });

      // Handle rotation if needed
      if (crop.rotation !== 0) {
        ctx.translate(cardWidth / 2, cardHeight / 2);
        ctx.rotate((crop.rotation * Math.PI) / 180);
        ctx.translate(-cardWidth / 2, -cardHeight / 2);
      }

      // Draw the cropped portion to exact card dimensions
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, cardWidth, cardHeight
      );

      // Convert to high-quality blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          console.log('✅ Crop complete! Final dimensions:', cardWidth, 'x', cardHeight, 'Aspect:', cardWidth/cardHeight);
          onCropComplete(url);
          toast.success(`Perfect! Cropped to exact 2.5×3.5 card ratio (${cardWidth}×${cardHeight})`);
        } else {
          toast.error('Failed to create cropped image');
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Crop failed:', error);
      toast.error('Failed to apply crop');
    }
  };

  // Render the cropper interface immediately, hide image until loaded
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Loading overlay */}
      {!imageLoaded && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-crd-green border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-white font-semibold text-lg">Loading Image...</h3>
              <p className="text-crd-lightGray">Preparing your image for cropping</p>
            </div>
          </div>
        </div>
      )}

      {/* Image Container */}
      <div className="relative bg-gradient-to-br from-crd-darkest to-crd-surface rounded-xl p-6 border border-crd-border shadow-2xl">
        <div 
          ref={containerRef}
          className="relative w-full h-[500px] mx-auto bg-gray-900 rounded-lg overflow-hidden"
          style={{ maxWidth: '800px' }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="w-full h-full object-contain"
            draggable={false}
          />
          
          {/* Crop Box */}
          <div
            ref={cropBoxRef}
            className="absolute border-2 border-crd-green bg-transparent cursor-move"
            style={{
              left: `${crop.x}px`,
              top: `${crop.y}px`,
              width: `${crop.width}px`,
              height: `${crop.height}px`,
              transform: `rotate(${crop.rotation}deg)`,
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
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-crd-surface/90 backdrop-blur-sm border border-crd-border rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={handleAutoCenter} size="sm" variant="outline" className="border-crd-border text-white hover:bg-crd-green hover:text-black">
            <Move className="w-4 h-4 mr-1" />
            Center
          </Button>
          <Button onClick={handleAutoFit} size="sm" variant="outline" className="border-crd-border text-white hover:bg-crd-green hover:text-black">
            <Maximize2 className="w-4 h-4 mr-1" />
            Auto Fit
          </Button>
          <Button onClick={() => handleRotate(-15)} size="sm" variant="outline" className="border-crd-border text-white hover:bg-crd-green hover:text-black">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button onClick={() => handleRotate(15)} size="sm" variant="outline" className="border-crd-border text-white hover:bg-crd-green hover:text-black">
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button onClick={handleReset} size="sm" variant="outline" className="border-crd-border text-white hover:bg-crd-orange hover:text-black">
            Reset
          </Button>
          <Button onClick={handleUndo} disabled={historyIndex <= 0} size="sm" variant="outline" className="border-crd-border text-white hover:bg-crd-blue hover:text-black disabled:opacity-50">
            <Undo className="w-4 h-4" />
          </Button>
          <Button onClick={handleRedo} disabled={historyIndex >= history.length - 1} size="sm" variant="outline" className="border-crd-border text-white hover:bg-crd-blue hover:text-black disabled:opacity-50">
            <Redo className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-center">
          <span className="text-crd-lightGray text-sm">
            Rotation: {crop.rotation}° | Position: {Math.round(crop.x)}, {Math.round(crop.y)} | Ratio: {(crop.width / crop.height).toFixed(3)} (Target: {cardAspectRatio.toFixed(3)})
          </span>
        </div>
      </div>

      {/* Apply Button */}
      <div className="bg-gradient-to-r from-crd-green/10 to-crd-blue/10 border border-crd-green/20 rounded-xl p-6 text-center">
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-semibold text-lg">Ready to Apply Your Crop</h3>
            <p className="text-crd-lightGray text-sm mt-1">
              Perfect! Your image is cropped and ready to continue.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleApplyCrop}
              size="lg"
              className="bg-gradient-to-r from-crd-green to-crd-green/90 hover:from-crd-green/90 hover:to-crd-green text-black font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Apply Crop & Continue
            </Button>
            
            <Button
              onClick={() => onCropComplete(imageUrl)}
              variant="outline"
              size="lg"
              className="border-crd-border bg-crd-surface/50 text-white hover:bg-crd-surface px-6 py-3 rounded-xl transition-all duration-300"
            >
              Skip Crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};