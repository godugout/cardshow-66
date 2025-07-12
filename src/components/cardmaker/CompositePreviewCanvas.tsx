import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface LayerData {
  id: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  bounds?: { left: number; top: number; right: number; bottom: number };
  elementType: string;
  enabled: boolean;
  name: string;
}

interface CompositePreviewCanvasProps {
  layers: LayerData[];
  psdWidth: number;
  psdHeight: number;
  className?: string;
}

export const CompositePreviewCanvas: React.FC<CompositePreviewCanvasProps> = ({
  layers,
  psdWidth,
  psdHeight,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Sort layers by element type (background first, effects last)
  const sortedLayers = [...layers]
    .filter(layer => layer.enabled)
    .sort((a, b) => {
      const order = { background: 0, foreground: 1, text: 2, effect: 3 };
      return (order[a.elementType as keyof typeof order] || 1) - (order[b.elementType as keyof typeof order] || 1);
    });

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const renderComposite = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsLoading(true);

    try {
      // Set canvas size to match PSD dimensions
      canvas.width = psdWidth;
      canvas.height = psdHeight;

      // Clear canvas
      ctx.clearRect(0, 0, psdWidth, psdHeight);

      // Draw a subtle background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, psdWidth, psdHeight);

      // Load and draw each layer
      for (const layer of sortedLayers) {
        const imageUrl = layer.imageUrl || layer.thumbnailUrl;
        if (!imageUrl) continue;

        try {
          const img = await loadImage(imageUrl);
          
          if (layer.bounds) {
            // Draw image at its original position and size
            ctx.drawImage(
              img,
              layer.bounds.left,
              layer.bounds.top,
              layer.bounds.right - layer.bounds.left,
              layer.bounds.bottom - layer.bounds.top
            );
          } else {
            // If no bounds, center the image
            const x = (psdWidth - img.width) / 2;
            const y = (psdHeight - img.height) / 2;
            ctx.drawImage(img, x, y);
          }
        } catch (error) {
          console.warn(`Failed to load layer image: ${layer.name}`, error);
        }
      }
    } catch (error) {
      console.error('Failed to render composite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    renderComposite();
  }, [layers, psdWidth, psdHeight]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const handleResetZoom = () => setZoom(1);

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            Live Composite ({sortedLayers.length} layers)
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.3}
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Canvas container */}
        <div className="relative border rounded-lg overflow-hidden bg-checkered">
          <div 
            className="overflow-auto max-h-96"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease'
            }}
          >
            <canvas
              ref={canvasRef}
              className="block max-w-full h-auto"
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </div>
          
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {/* Layer stack info */}
        {sortedLayers.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">
            <p>Layer order: {sortedLayers.map(l => l.name).join(' → ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};