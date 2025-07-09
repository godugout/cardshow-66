import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { CRDButton, CRDCard } from '@/components/ui/design-system';
import { Slider } from '@/components/ui/slider';
import { FlexiblePanel, FlexiblePanelTab } from '@/components/ui/flexible-panel';
import { RotateCcw, Frame, Square, Sliders, ZoomIn, ZoomOut, RotateCw, FlipHorizontal, FlipVertical, Move, Maximize2 } from 'lucide-react';

interface SimpleCropInterfaceProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onBack: () => void;
}

export const SimpleCropInterface: React.FC<SimpleCropInterfaceProps> = ({
  imageUrl,
  onCropComplete,
  onBack
}) => {
  // Unified state management
  const [activeTab, setActiveTab] = useState('sliders');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // Slider mode state
  const [xPosition, setXPosition] = useState([50]);
  const [yPosition, setYPosition] = useState([50]);
  const [zoom, setZoom] = useState([100]);
  const [rotation, setRotation] = useState([0]);
  
  // Frame mode state
  const [frameTransform, setFrameTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    flipH: false,
    flipV: false
  });
  
  // Unified canvas and image refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Track if canvas is being redrawn to prevent conflicts
  const isRedrawingRef = useRef(false);

  // Centralized image loading with error handling
  const loadImage = useCallback(() => {
    if (!imageUrl) {
      setImageError('No image URL provided');
      return;
    }

    setImageError(null);
    setImageLoaded(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      console.log('Image loaded successfully:', imageUrl);
    };
    
    img.onerror = (error) => {
      console.error('Failed to load image:', error, 'URL:', imageUrl);
      setImageError('Failed to load image');
      setImageLoaded(false);
    };
    
    img.src = imageUrl;
  }, [imageUrl]);

  // Initialize image loading
  useEffect(() => {
    loadImage();
  }, [loadImage]);

  // Unified canvas drawing function for slider mode
  const drawSliderCanvas = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !imageLoaded || isRedrawingRef.current || activeTab !== 'sliders') {
      return;
    }

    isRedrawingRef.current = true;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions
      canvas.width = 400;
      canvas.height = 560; // 2.5:3.5 aspect ratio
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scaling and positioning
      const scale = zoom[0] / 100;
      const scaledWidth = imageRef.current.width * scale;
      const scaledHeight = imageRef.current.height * scale;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      const offsetX = (xPosition[0] - 50) * 4;
      const offsetY = (yPosition[0] - 50) * 4;
      
      // Draw image with transformations
      ctx.save();
      ctx.translate(centerX + offsetX, centerY + offsetY);
      ctx.rotate((rotation[0] * Math.PI) / 180);
      ctx.drawImage(imageRef.current, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
      ctx.restore();
      
      // Draw crop border
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error('Error drawing canvas:', error);
    } finally {
      isRedrawingRef.current = false;
    }
  }, [imageLoaded, activeTab, xPosition, yPosition, zoom, rotation]);

  // Redraw canvas when state changes
  useEffect(() => {
    if (activeTab === 'sliders') {
      drawSliderCanvas();
    }
  }, [drawSliderCanvas, activeTab]);

  // Frame canvas drawing function
  const drawFrameCanvas = useCallback(() => {
    if (!frameCanvasRef.current || !imageRef.current || !imageLoaded || isRedrawingRef.current || activeTab !== 'frame') {
      return;
    }

    isRedrawingRef.current = true;

    try {
      const canvas = frameCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const frameWidth = 400;
      const frameHeight = 560;

      canvas.width = frameWidth;
      canvas.height = frameHeight;

      // Clear canvas
      ctx.clearRect(0, 0, frameWidth, frameHeight);
      
      // Save context for transformations
      ctx.save();
      
      // Move to center of frame
      ctx.translate(frameWidth / 2, frameHeight / 2);
      
      // Apply transformations
      ctx.translate(frameTransform.x, frameTransform.y);
      ctx.scale(
        frameTransform.scale * (frameTransform.flipH ? -1 : 1),
        frameTransform.scale * (frameTransform.flipV ? -1 : 1)
      );
      ctx.rotate((frameTransform.rotation * Math.PI) / 180);
      
      // Draw image centered
      const imgWidth = imageRef.current.width;
      const imgHeight = imageRef.current.height;
      ctx.drawImage(imageRef.current, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      
      ctx.restore();
      
      // Draw frame border
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, frameWidth, frameHeight);
      
      // Draw frame corners
      ctx.strokeStyle = '#ff6b4a';
      ctx.lineWidth = 2;
      const cornerSize = 20;
      
      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(cornerSize, 10);
      ctx.lineTo(10, 10);
      ctx.lineTo(10, cornerSize);
      ctx.stroke();
      
      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(frameWidth - cornerSize, 10);
      ctx.lineTo(frameWidth - 10, 10);
      ctx.lineTo(frameWidth - 10, cornerSize);
      ctx.stroke();
      
      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(10, frameHeight - cornerSize);
      ctx.lineTo(10, frameHeight - 10);
      ctx.lineTo(cornerSize, frameHeight - 10);
      ctx.stroke();
      
      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(frameWidth - cornerSize, frameHeight - 10);
      ctx.lineTo(frameWidth - 10, frameHeight - 10);
      ctx.lineTo(frameWidth - 10, frameHeight - cornerSize);
      ctx.stroke();
      
    } catch (error) {
      console.error('Error drawing frame canvas:', error);
    } finally {
      isRedrawingRef.current = false;
    }
  }, [imageLoaded, activeTab, frameTransform]);

  // Redraw frame canvas when state changes
  useEffect(() => {
    if (activeTab === 'frame') {
      drawFrameCanvas();
    }
  }, [drawFrameCanvas, activeTab]);

  const handleApplyCrop = useCallback(() => {
    if (activeTab === 'sliders' && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onCropComplete(dataUrl);
    } else if (activeTab === 'frame' && frameCanvasRef.current) {
      const dataUrl = frameCanvasRef.current.toDataURL('image/png');
      onCropComplete(dataUrl);
    }
  }, [onCropComplete, activeTab]);

  const resetCrop = useCallback(() => {
    if (activeTab === 'sliders') {
      setXPosition([50]);
      setYPosition([50]);
      setZoom([100]);
      setRotation([0]);
    } else if (activeTab === 'frame') {
      setFrameTransform({
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        flipH: false,
        flipV: false
      });
    }
  }, [activeTab]);

  // Optimized mouse event handlers with proper cleanup
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'sliders' || !canvasRef.current) return;
    
    e.preventDefault();
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - (xPosition[0] - 50) * 4,
      y: e.clientY - rect.top - (yPosition[0] - 50) * 4
    });
  }, [activeTab, xPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || activeTab !== 'sliders') return;
    
    if (activeTab === 'sliders' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Convert mouse position to percentage with smooth updates
      const newXPercent = 50 + (mouseX - dragStart.x) / 4;
      const newYPercent = 50 + (mouseY - dragStart.y) / 4;
      
      // Clamp values between 0 and 100
      const clampedX = Math.max(0, Math.min(100, newXPercent));
      const clampedY = Math.max(0, Math.min(100, newYPercent));
      
      setXPosition([clampedX]);
      setYPosition([clampedY]);
    }
  }, [isDragging, activeTab, dragStart]);

  // Frame mode mouse handlers
  const handleFrameMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'frame' || !frameCanvasRef.current) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - frameTransform.x,
      y: e.clientY - frameTransform.y
    });
  }, [activeTab, frameTransform]);

  const handleFrameMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || activeTab !== 'frame') return;
    
    setFrameTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  }, [isDragging, activeTab, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Cleanup on tab switch
  useEffect(() => {
    setIsDragging(false);
  }, [activeTab]);

  // Error recovery function
  const retryImageLoad = useCallback(() => {
    loadImage();
  }, [loadImage]);

  // Memoized components for better performance
  const SliderMode = useMemo(() => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Slider Controls</h3>
      
      <div className="space-y-6">
        {/* X Position */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            X Position
          </label>
          <Slider
            value={xPosition}
            onValueChange={setXPosition}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {xPosition[0]}%
          </div>
        </div>

        {/* Y Position */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Y Position
          </label>
          <Slider
            value={yPosition}
            onValueChange={setYPosition}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {yPosition[0]}%
          </div>
        </div>

        {/* Zoom */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Zoom
          </label>
          <Slider
            value={zoom}
            onValueChange={setZoom}
            max={200}
            min={50}
            step={1}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {zoom[0]}%
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Rotation
          </label>
          <Slider
            value={rotation}
            onValueChange={setRotation}
            max={45}
            min={-45}
            step={1}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {rotation[0]}°
          </div>
        </div>

        {/* Reset Button */}
        <CRDButton
          variant="outline"
          onClick={resetCrop}
          className="w-full"
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Reset Adjustments
        </CRDButton>
        
        <CRDButton
          variant="primary"
          onClick={handleApplyCrop}
          className="w-full"
        >
          Apply Crop
        </CRDButton>
      </div>
    </div>
  ), [xPosition, yPosition, zoom, rotation, handleApplyCrop, resetCrop]);

  // Enhanced Frame and Freeform components with shared image
  const FrameMode = useMemo(() => {
    if (!imageLoaded || !imageRef.current) {
      return <div className="text-center py-8 text-muted-foreground">Loading image...</div>;
    }
    
    const handleZoom = (direction: 'in' | 'out') => {
      setFrameTransform(prev => ({
        ...prev,
        scale: Math.max(0.1, Math.min(3, prev.scale + (direction === 'in' ? 0.1 : -0.1)))
      }));
    };

    const handleRotate = (direction: 'cw' | 'ccw') => {
      setFrameTransform(prev => ({
        ...prev,
        rotation: prev.rotation + (direction === 'cw' ? 15 : -15)
      }));
    };

    const handleFlip = (axis: 'h' | 'v') => {
      setFrameTransform(prev => ({
        ...prev,
        [axis === 'h' ? 'flipH' : 'flipV']: !prev[axis === 'h' ? 'flipH' : 'flipV']
      }));
    };

    const handleFitToFrame = () => {
      if (!imageRef.current) return;
      const frameWidth = 400;
      const frameHeight = 560;
      const imgAspect = imageRef.current.width / imageRef.current.height;
      const frameAspect = frameWidth / frameHeight;
      
      let scale;
      if (imgAspect > frameAspect) {
        // Image is wider - fit to height
        scale = frameHeight / imageRef.current.height;
      } else {
        // Image is taller - fit to width
        scale = frameWidth / imageRef.current.width;
      }
      
      setFrameTransform(prev => ({
        ...prev,
        scale: scale * 0.9, // 90% to ensure it fits nicely
        x: 0,
        y: 0,
        rotation: 0
      }));
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Professional Frame</h3>
          <div className="text-xs text-muted-foreground bg-crd-orange/20 px-2 py-1 rounded">
            CRD 2.5:3.5 Ratio
          </div>
        </div>
        
        {/* Transform Controls */}
        <div className="grid grid-cols-2 gap-4">
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
              {Math.round(frameTransform.scale * 100)}%
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
              {frameTransform.rotation}°
            </div>
          </div>
        </div>

        {/* Flip Controls */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white">Flip & Transform</label>
          <div className="grid grid-cols-2 gap-2">
            <CRDButton
              variant={frameTransform.flipH ? "primary" : "outline"}
              size="sm"
              onClick={() => handleFlip('h')}
              icon={<FlipHorizontal className="w-3 h-3" />}
              className="text-xs"
            >
              Flip H
            </CRDButton>
            <CRDButton
              variant={frameTransform.flipV ? "primary" : "outline"}
              size="sm"
              onClick={() => handleFlip('v')}
              icon={<FlipVertical className="w-3 h-3" />}
              className="text-xs"
            >
              Flip V
            </CRDButton>
          </div>
        </div>

        {/* Fine Tune Sliders */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">Fine Tuning</h4>
          
          <div>
            <label className="text-xs font-medium text-white mb-2 block">Horizontal Position</label>
            <Slider
              value={[frameTransform.x + 200]}
              onValueChange={([value]) => setFrameTransform(prev => ({ ...prev, x: value - 200 }))}
              max={400}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-white mb-2 block">Vertical Position</label>
            <Slider
              value={[frameTransform.y + 280]}
              onValueChange={([value]) => setFrameTransform(prev => ({ ...prev, y: value - 280 }))}
              max={560}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white mb-2 block">Scale</label>
            <Slider
              value={[frameTransform.scale * 100]}
              onValueChange={([value]) => setFrameTransform(prev => ({ ...prev, scale: value / 100 }))}
              max={300}
              min={10}
              step={1}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-white mb-2 block">Rotation</label>
            <Slider
              value={[frameTransform.rotation + 180]}
              onValueChange={([value]) => setFrameTransform(prev => ({ ...prev, rotation: value - 180 }))}
              max={360}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <CRDButton
            variant="outline"
            onClick={handleFitToFrame}
            className="w-full"
            icon={<Maximize2 className="w-4 h-4" />}
          >
            Fit to Frame
          </CRDButton>
          
          <CRDButton
            variant="outline"
            onClick={resetCrop}
            className="w-full"
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Reset All
          </CRDButton>
          
          <CRDButton
            variant="primary"
            onClick={handleApplyCrop}
            className="w-full"
          >
            Apply Frame Crop
          </CRDButton>
        </div>
      </div>
    );
  }, [imageLoaded, frameTransform, handleApplyCrop, resetCrop]);

  const FreeformMode = useMemo(() => {
    if (!imageLoaded || !imageRef.current) {
      return <div className="text-center py-8 text-muted-foreground">Loading image...</div>;
    }
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white mb-4">Freeform Mode</h3>
        <p className="text-muted-foreground">Freeform cropping coming soon...</p>
        <CRDButton variant="primary" onClick={handleApplyCrop} className="w-full">
          Apply Freeform Crop
        </CRDButton>
      </div>
    );
  }, [imageLoaded, handleApplyCrop]);

  // Memoized tabs for FlexiblePanel with enhanced error handling
  const cropTabs: FlexiblePanelTab[] = useMemo(() => [
    {
      id: 'sliders',
      label: 'Sliders',
      icon: <Sliders className="w-4 h-4" />,
      content: SliderMode
    },
    {
      id: 'frame',
      label: 'Frame',
      icon: <Frame className="w-4 h-4" />,
      content: FrameMode
    },
    {
      id: 'freeform',
      label: 'Freeform',
      icon: <Square className="w-4 h-4" />,
      content: FreeformMode
    }
  ], [SliderMode, FrameMode, FreeformMode]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Crop Your Image</h1>
          <p className="text-muted-foreground">Choose your preferred cropping method</p>
        </div>

        {/* Back Button */}
        <div className="flex justify-start mb-6">
          <CRDButton
            variant="outline"
            onClick={onBack}
            size="sm"
          >
            ← Back
          </CRDButton>
        </div>

        {/* Main Layout: Canvas + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Canvas Preview - Takes up 2/3 of space */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <CRDCard className="p-6 bg-card/50">
              {imageError ? (
                <div className="w-[400px] h-[560px] border-2 border-dashed border-red-500 rounded-lg flex flex-col items-center justify-center">
                  <p className="text-red-400 mb-4">Failed to load image</p>
                  <CRDButton variant="outline" onClick={retryImageLoad}>
                    Retry
                  </CRDButton>
                </div>
              ) : !imageLoaded ? (
                <div className="w-[400px] h-[560px] border-2 border-dashed border-crd-green rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Loading image...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'sliders' ? (
                    <canvas
                      ref={canvasRef}
                      className="border-2 border-crd-green rounded-lg shadow-lg cursor-move transition-opacity duration-200"
                      style={{ maxWidth: '100%', height: 'auto' }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                  ) : activeTab === 'frame' ? (
                    <canvas
                      ref={frameCanvasRef}
                      className="border-2 border-crd-orange rounded-lg shadow-lg cursor-move transition-opacity duration-200"
                      style={{ maxWidth: '100%', height: 'auto' }}
                      onMouseDown={handleFrameMouseDown}
                      onMouseMove={handleFrameMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                  ) : (
                    <div className="w-[400px] h-[560px] border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Preview not available for this mode</p>
                    </div>
                  )}
                  <div className="text-center mt-4 text-sm text-muted-foreground">
                    {activeTab === 'sliders' 
                      ? 'Click and drag to reposition the image' 
                      : activeTab === 'frame'
                      ? 'Click and drag to position image in frame'
                      : 'Switch tabs to see preview'
                    }
                  </div>
                </>
              )}
            </CRDCard>
          </div>

          {/* Right Sidebar - Takes up 1/3 of space */}
          <div className="lg:col-span-1">
            <CRDCard className="p-6 h-full">
              <FlexiblePanel
                tabs={cropTabs}
                defaultTab="sliders"
                onTabChange={setActiveTab}
                className="h-full"
              />
            </CRDCard>
          </div>
        </div>
      </div>
    </div>
  );
};