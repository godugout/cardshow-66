import React, { useState, useRef, useEffect } from 'react';
import { CRDButton } from '@/components/ui/design-system';
import { Slider } from '@/components/ui/slider';
import { Move, RotateCcw, ZoomIn, ZoomOut, Square, Circle } from 'lucide-react';

interface FreeformCropInterfaceProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

export const FreeformCropInterface: React.FC<FreeformCropInterfaceProps> = ({
  imageUrl,
  onCropComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [tool, setTool] = useState<'move' | 'crop'>('crop');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [imageState, setImageState] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });

  const [cropBox, setCropBox] = useState({
    x: 150,
    y: 120,
    width: 400,
    height: 560
  });

  const canvasWidth = 900;
  const canvasHeight = 700;

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        // Center the image initially
        setImageState({
          x: canvasWidth / 2 - img.width / 2,
          y: canvasHeight / 2 - img.height / 2,
          scale: Math.min(canvasWidth / img.width, canvasHeight / img.height) * 0.8,
          rotation: 0
        });
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  useEffect(() => {
    redrawCanvas();
  }, [imageState, cropBox]);

  const redrawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.fillStyle = '#1a1a1c';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw image
    ctx.save();
    ctx.translate(imageState.x + (imageRef.current.width * imageState.scale) / 2, 
                  imageState.y + (imageRef.current.height * imageState.scale) / 2);
    ctx.rotate((imageState.rotation * Math.PI) / 180);
    ctx.scale(imageState.scale, imageState.scale);
    ctx.drawImage(imageRef.current, -imageRef.current.width / 2, -imageRef.current.height / 2);
    ctx.restore();

    // Draw crop box
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
    
    // Draw crop box corners
    ctx.setLineDash([]);
    ctx.fillStyle = '#4ade80';
    const cornerSize = 8;
    const corners = [
      { x: cropBox.x, y: cropBox.y },
      { x: cropBox.x + cropBox.width, y: cropBox.y },
      { x: cropBox.x, y: cropBox.y + cropBox.height },
      { x: cropBox.x + cropBox.width, y: cropBox.y + cropBox.height }
    ];
    
    corners.forEach(corner => {
      ctx.fillRect(corner.x - cornerSize / 2, corner.y - cornerSize / 2, cornerSize, cornerSize);
    });

    // Draw crop box center
    ctx.fillStyle = 'rgba(74, 222, 128, 0.1)';
    ctx.fillRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);

    // Draw CRD card outline in crop area
    ctx.strokeStyle = '#ff6b4a';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    const cardPadding = 20;
    ctx.strokeRect(
      cropBox.x + cardPadding, 
      cropBox.y + cardPadding, 
      cropBox.width - cardPadding * 2, 
      cropBox.height - cardPadding * 2
    );
    ctx.setLineDash([]);
  };

  const getMousePos = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left) * (canvasWidth / rect.width),
      y: (e.clientY - rect.top) * (canvasHeight / rect.height)
    };
  };

  const isInCropBox = (x: number, y: number) => {
    return x >= cropBox.x && x <= cropBox.x + cropBox.width &&
           y >= cropBox.y && y <= cropBox.y + cropBox.height;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    setIsDragging(true);
    
    if (tool === 'move') {
      setDragStart({ x: pos.x - imageState.x, y: pos.y - imageState.y });
    } else if (tool === 'crop' && isInCropBox(pos.x, pos.y)) {
      setDragStart({ x: pos.x - cropBox.x, y: pos.y - cropBox.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const pos = getMousePos(e);
    
    if (tool === 'move') {
      setImageState(prev => ({
        ...prev,
        x: pos.x - dragStart.x,
        y: pos.y - dragStart.y
      }));
    } else if (tool === 'crop') {
      setCropBox(prev => ({
        ...prev,
        x: Math.max(0, Math.min(canvasWidth - prev.width, pos.x - dragStart.x)),
        y: Math.max(0, Math.min(canvasHeight - prev.height, pos.y - dragStart.y))
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setImageState(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(5, prev.scale + (direction === 'in' ? 0.1 : -0.1)))
    }));
  };

  const handleApplyCrop = () => {
    if (!canvasRef.current || !imageRef.current) return;

    // Create a new canvas for the cropped result
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    cropCanvas.width = cropBox.width;
    cropCanvas.height = cropBox.height;

    // Calculate the portion of the main canvas to copy
    const mainCanvas = canvasRef.current;
    cropCtx.drawImage(
      mainCanvas,
      cropBox.x, cropBox.y, cropBox.width, cropBox.height,
      0, 0, cropBox.width, cropBox.height
    );

    const dataUrl = cropCanvas.toDataURL('image/png');
    onCropComplete(dataUrl);
  };

  return (
    <div className="space-y-6">
      {/* Tool Selection */}
      <div className="flex justify-center gap-4">
        <CRDButton
          variant={tool === 'move' ? 'primary' : 'outline'}
          onClick={() => setTool('move')}
          icon={<Move className="w-4 h-4" />}
        >
          Move Image
        </CRDButton>
        <CRDButton
          variant={tool === 'crop' ? 'primary' : 'outline'}
          onClick={() => setTool('crop')}
          icon={<Square className="w-4 h-4" />}
        >
          Adjust Crop
        </CRDButton>
      </div>

      {/* Main Canvas */}
      <div className="flex justify-center">
        <div className="relative border-2 border-border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="cursor-crosshair"
            style={{ maxWidth: '100%', height: 'auto' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          
          {/* Tool Indicator */}
          <div className="absolute top-2 left-2 px-3 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white">
            {tool === 'move' ? 'Move Image' : 'Adjust Crop Area'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Image Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">Image Controls</h4>
          
          <div className="flex gap-2">
            <CRDButton
              variant="outline"
              size="sm"
              onClick={() => handleZoom('out')}
              icon={<ZoomOut className="w-3 h-3" />}
            />
            <CRDButton
              variant="outline"
              size="sm"
              onClick={() => handleZoom('in')}
              icon={<ZoomIn className="w-3 h-3" />}
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground">Scale: {Math.round(imageState.scale * 100)}%</label>
            <Slider
              value={[imageState.scale * 100]}
              onValueChange={([value]) => setImageState(prev => ({ ...prev, scale: value / 100 }))}
              max={500}
              min={10}
              step={1}
              className="w-full mt-1"
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground">Rotation: {imageState.rotation}°</label>
            <Slider
              value={[imageState.rotation + 180]}
              onValueChange={([value]) => setImageState(prev => ({ ...prev, rotation: value - 180 }))}
              max={360}
              min={0}
              step={1}
              className="w-full mt-1"
            />
          </div>
        </div>

        {/* Crop Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">Crop Area</h4>
          
          <div>
            <label className="text-xs text-muted-foreground">Width: {cropBox.width}px</label>
            <Slider
              value={[cropBox.width]}
              onValueChange={([value]) => setCropBox(prev => ({ ...prev, width: Math.min(value, canvasWidth - prev.x) }))}
              max={canvasWidth}
              min={100}
              step={1}
              className="w-full mt-1"
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground">Height: {cropBox.height}px</label>
            <Slider
              value={[cropBox.height]}
              onValueChange={([value]) => setCropBox(prev => ({ ...prev, height: Math.min(value, canvasHeight - prev.y) }))}
              max={canvasHeight}
              min={100}
              step={1}
              className="w-full mt-1"
            />
          </div>

          <CRDButton
            variant="outline"
            size="sm"
            onClick={() => setCropBox({ x: 150, y: 120, width: 400, height: 560 })}
            className="w-full"
          >
            Reset to CRD Ratio
          </CRDButton>
        </div>

        {/* Position Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">Position</h4>
          
          <div>
            <label className="text-xs text-muted-foreground">Crop X: {cropBox.x}px</label>
            <Slider
              value={[cropBox.x]}
              onValueChange={([value]) => setCropBox(prev => ({ ...prev, x: Math.max(0, Math.min(canvasWidth - prev.width, value)) }))}
              max={canvasWidth}
              min={0}
              step={1}
              className="w-full mt-1"
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground">Crop Y: {cropBox.y}px</label>
            <Slider
              value={[cropBox.y]}
              onValueChange={([value]) => setCropBox(prev => ({ ...prev, y: Math.max(0, Math.min(canvasHeight - prev.height, value)) }))}
              max={canvasHeight}
              min={0}
              step={1}
              className="w-full mt-1"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">Quick Actions</h4>
          
          <CRDButton
            variant="outline"
            size="sm"
            onClick={() => setImageState({ x: canvasWidth/2 - (imageRef.current?.width || 0)/2, y: canvasHeight/2 - (imageRef.current?.height || 0)/2, scale: 1, rotation: 0 })}
            className="w-full"
          >
            Center & Reset Image
          </CRDButton>
          
          <CRDButton
            variant="outline"
            size="sm"
            onClick={() => setImageState(prev => ({ ...prev, rotation: prev.rotation + 90 }))}
            icon={<RotateCcw className="w-3 h-3" />}
            className="w-full"
          >
            Rotate 90°
          </CRDButton>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-center">
        <CRDButton
          variant="primary"
          size="lg"
          onClick={handleApplyCrop}
        >
          Apply Freeform Crop
        </CRDButton>
      </div>
    </div>
  );
};