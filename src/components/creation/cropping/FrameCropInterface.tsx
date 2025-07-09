import React, { useState, useRef, useEffect } from 'react';
import { CRDButton } from '@/components/ui/design-system';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut } from 'lucide-react';

interface FrameCropInterfaceProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

export const FrameCropInterface: React.FC<FrameCropInterfaceProps> = ({
  imageUrl,
  onCropComplete
}) => {
  const [imageTransform, setImageTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    flipH: false,
    flipV: false
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const frameWidth = 400;
  const frameHeight = 560; // 2.5:3.5 aspect ratio

  useEffect(() => {
    if (imageUrl && imageRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        redrawCanvas();
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  useEffect(() => {
    redrawCanvas();
  }, [imageTransform]);

  const redrawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = frameWidth;
    canvas.height = frameHeight;

    ctx.clearRect(0, 0, frameWidth, frameHeight);
    
    // Save context for transformations
    ctx.save();
    
    // Move to center of frame
    ctx.translate(frameWidth / 2, frameHeight / 2);
    
    // Apply transformations
    ctx.translate(imageTransform.x, imageTransform.y);
    ctx.scale(
      imageTransform.scale * (imageTransform.flipH ? -1 : 1),
      imageTransform.scale * (imageTransform.flipV ? -1 : 1)
    );
    ctx.rotate((imageTransform.rotation * Math.PI) / 180);
    
    // Draw image centered
    const imgWidth = imageRef.current.width;
    const imgHeight = imageRef.current.height;
    ctx.drawImage(imageRef.current, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imageTransform.x,
      y: e.clientY - imageTransform.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setImageTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setImageTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale + (direction === 'in' ? 0.1 : -0.1)))
    }));
  };

  const handleRotate = (direction: 'cw' | 'ccw') => {
    setImageTransform(prev => ({
      ...prev,
      rotation: prev.rotation + (direction === 'cw' ? 15 : -15)
    }));
  };

  const handleFlip = (axis: 'h' | 'v') => {
    setImageTransform(prev => ({
      ...prev,
      [axis === 'h' ? 'flipH' : 'flipV']: !prev[axis === 'h' ? 'flipH' : 'flipV']
    }));
  };

  const handleReset = () => {
    setImageTransform({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      flipH: false,
      flipV: false
    });
  };

  const handleApplyCrop = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onCropComplete(dataUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Frame Area */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Frame Overlay */}
          <div 
            ref={frameRef}
            className="relative border-4 border-crd-green rounded-lg overflow-hidden"
            style={{ width: frameWidth, height: frameHeight }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-move"
              style={{ width: frameWidth, height: frameHeight }}
            />
            
            {/* Frame Corners */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white"></div>
            </div>
          </div>
          
          {/* Frame Label */}
          <div className="absolute -top-8 left-0 right-0 text-center">
            <span className="text-xs text-crd-green font-medium">CRD Frame Preview</span>
          </div>
        </div>
      </div>

      {/* Transform Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Zoom Controls */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white">Zoom</label>
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
          <div className="text-xs text-muted-foreground text-center">
            {Math.round(imageTransform.scale * 100)}%
          </div>
        </div>

        {/* Rotation Controls */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white">Rotate</label>
          <div className="flex gap-2">
            <CRDButton
              variant="outline"
              size="sm"
              onClick={() => handleRotate('ccw')}
              icon={<RotateCcw className="w-3 h-3" />}
            />
            <CRDButton
              variant="outline"
              size="sm"
              onClick={() => handleRotate('cw')}
              icon={<RotateCw className="w-3 h-3" />}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {imageTransform.rotation}°
          </div>
        </div>

        {/* Flip Controls */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white">Flip</label>
          <div className="flex gap-2">
            <CRDButton
              variant={imageTransform.flipH ? "primary" : "outline"}
              size="sm"
              onClick={() => handleFlip('h')}
              icon={<FlipHorizontal className="w-3 h-3" />}
            />
            <CRDButton
              variant={imageTransform.flipV ? "primary" : "outline"}
              size="sm"
              onClick={() => handleFlip('v')}
              icon={<FlipVertical className="w-3 h-3" />}
            />
          </div>
        </div>

        {/* Reset */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white">Reset</label>
          <CRDButton
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full"
          >
            Reset All
          </CRDButton>
        </div>
      </div>

      {/* Fine Tune Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Horizontal Position</label>
            <Slider
              value={[imageTransform.x + 200]}
              onValueChange={([value]) => setImageTransform(prev => ({ ...prev, x: value - 200 }))}
              max={400}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Vertical Position</label>
            <Slider
              value={[imageTransform.y + 280]}
              onValueChange={([value]) => setImageTransform(prev => ({ ...prev, y: value - 280 }))}
              max={560}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Scale</label>
            <Slider
              value={[imageTransform.scale * 100]}
              onValueChange={([value]) => setImageTransform(prev => ({ ...prev, scale: value / 100 }))}
              max={300}
              min={10}
              step={1}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Rotation</label>
            <Slider
              value={[imageTransform.rotation + 180]}
              onValueChange={([value]) => setImageTransform(prev => ({ ...prev, rotation: value - 180 }))}
              max={360}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-center">
        <CRDButton
          variant="primary"
          size="lg"
          onClick={handleApplyCrop}
        >
          Apply Frame Crop
        </CRDButton>
      </div>
    </div>
  );
};