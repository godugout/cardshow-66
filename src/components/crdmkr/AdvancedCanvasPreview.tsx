import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AdvancedLayerData } from '@/services/psdProcessor/advancedLayerProcessor';
import { cn } from '@/lib/utils';

interface AdvancedCanvasPreviewProps {
  width: number;
  height: number;
  layers: AdvancedLayerData[];
  selectedLayerId?: string;
  onLayerSelect?: (layerId: string) => void;
  zoom: number;
  offset: { x: number; y: number };
  className?: string;
}

export const AdvancedCanvasPreview: React.FC<AdvancedCanvasPreviewProps> = ({
  width,
  height,
  layers,
  selectedLayerId,
  onLayerSelect,
  zoom,
  offset,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());

  // Preload all layer images
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = layers
        .filter(layer => layer.isVisible && layer.imageUrl)
        .map(async (layer) => {
          try {
            const img = await loadImage(layer.imageUrl);
            return { layerId: layer.id, image: img };
          } catch (error) {
            console.warn(`Failed to load image for layer ${layer.name}:`, error);
            return null;
          }
        });

      const results = await Promise.all(imagePromises);
      const newImageMap = new Map<string, HTMLImageElement>();
      
      results.forEach(result => {
        if (result) {
          newImageMap.set(result.layerId, result.image);
        }
      });

      setLoadedImages(newImageMap);
    };

    loadImages();
  }, [layers]);

  // Render canvas when layers or images change
  useEffect(() => {
    renderCanvas();
  }, [layers, loadedImages, width, height]);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRendering(true);

    // Set canvas size to match PSD dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, width, height);

    // Draw checkerboard pattern to show transparency
    drawTransparencyPattern(ctx, width, height);

    // Sort layers by z-index (if available) or maintain original order
    const sortedLayers = [...layers].sort((a, b) => {
      // Reverse order to match PSD layer stack (top layers drawn last)
      return layers.indexOf(a) - layers.indexOf(b);
    });

    // Draw each visible layer
    for (const layer of sortedLayers) {
      if (!layer.isVisible || !layer.imageUrl) continue;

      const img = loadedImages.get(layer.id);
      if (!img) continue;

      try {
        // Save context state
        ctx.save();

        // Set layer opacity
        ctx.globalAlpha = layer.opacity;

        // Set blend mode
        ctx.globalCompositeOperation = getCanvasBlendMode(layer.blendMode);

        // Draw layer at exact position with exact size (no resizing)
        const layerWidth = layer.bounds.right - layer.bounds.left;
        const layerHeight = layer.bounds.bottom - layer.bounds.top;

        ctx.drawImage(
          img,
          layer.bounds.left,
          layer.bounds.top,
          layerWidth,
          layerHeight
        );

        // Draw selection outline if this layer is selected
        if (selectedLayerId === layer.id) {
          drawSelectionOutline(ctx, layer.bounds);
        }

        // Restore context state
        ctx.restore();
      } catch (error) {
        console.warn(`Failed to draw layer ${layer.name}:`, error);
      }
    }

    setIsRendering(false);
  }, [width, height, layers, loadedImages, selectedLayerId]);

  const drawTransparencyPattern = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const patternSize = 20;
    
    // Draw checkerboard pattern
    for (let x = 0; x < w; x += patternSize) {
      for (let y = 0; y < h; y += patternSize) {
        const isEven = ((x / patternSize) + (y / patternSize)) % 2 === 0;
        ctx.fillStyle = isEven ? '#f0f0f0' : '#e0e0e0';
        ctx.fillRect(x, y, patternSize, patternSize);
      }
    }
  };

  const drawSelectionOutline = (ctx: CanvasRenderingContext2D, bounds: AdvancedLayerData['bounds']) => {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    
    // Draw selection border
    ctx.strokeStyle = '#ff6b35'; // CRD orange
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.strokeRect(
      bounds.left - 1,
      bounds.top - 1,
      (bounds.right - bounds.left) + 2,
      (bounds.bottom - bounds.top) + 2
    );
    
    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = '#ff6b35';
    ctx.setLineDash([]);
    
    const corners = [
      { x: bounds.left - handleSize/2, y: bounds.top - handleSize/2 },
      { x: bounds.right - handleSize/2, y: bounds.top - handleSize/2 },
      { x: bounds.right - handleSize/2, y: bounds.bottom - handleSize/2 },
      { x: bounds.left - handleSize/2, y: bounds.bottom - handleSize/2 }
    ];
    
    corners.forEach(corner => {
      ctx.fillRect(corner.x, corner.y, handleSize, handleSize);
    });
    
    ctx.restore();
  };

  const getCanvasBlendMode = (psdBlendMode: string): GlobalCompositeOperation => {
    const blendModeMap: Record<string, GlobalCompositeOperation> = {
      'normal': 'source-over',
      'multiply': 'multiply',
      'screen': 'screen',
      'overlay': 'overlay',
      'soft-light': 'soft-light',
      'hard-light': 'hard-light',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'darken': 'darken',
      'lighten': 'lighten'
    };
    
    return blendModeMap[psdBlendMode] || 'source-over';
  };

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onLayerSelect) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Find the topmost visible layer at this position
    // Check layers in reverse order (top to bottom)
    const reversedLayers = [...layers].reverse();
    
    for (const layer of reversedLayers) {
      if (!layer.isVisible) continue;
      
      const { bounds } = layer;
      if (x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom) {
        onLayerSelect(layer.id);
        break;
      }
    }
  }, [layers, onLayerSelect]);

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <div className="text-sm text-white bg-black/50 px-3 py-1 rounded">
            Rendering layers...
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="border border-crd-border shadow-2xl rounded-lg cursor-crosshair"
        style={{
          transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
          maxWidth: '100%',
          maxHeight: '100%',
          imageRendering: 'pixelated'
        }}
        onClick={handleCanvasClick}
      />
      
      {/* Layer count indicator */}
      <div className="absolute top-4 left-4 bg-black/80 text-white text-xs px-3 py-1 rounded">
        {layers.filter(l => l.isVisible).length} / {layers.length} layers visible
      </div>
    </div>
  );
};