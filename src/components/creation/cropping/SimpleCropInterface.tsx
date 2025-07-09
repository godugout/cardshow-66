import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { CRDButton, CRDCard } from '@/components/ui/design-system';
import { Slider } from '@/components/ui/slider';
import { FlexiblePanel, FlexiblePanelTab } from '@/components/ui/flexible-panel';
import { RotateCcw, Frame, Square, Sliders } from 'lucide-react';

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
  
  // Unified canvas and image refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const handleApplyCrop = useCallback(() => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onCropComplete(dataUrl);
    }
  }, [onCropComplete]);

  const resetCrop = useCallback(() => {
    setXPosition([50]);
    setYPosition([50]);
    setZoom([100]);
    setRotation([0]);
  }, []);

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
    if (!isDragging || !canvasRef.current || activeTab !== 'sliders') return;
    
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
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white mb-4">Frame Mode</h3>
        <p className="text-muted-foreground">Advanced frame cropping coming soon...</p>
        <CRDButton variant="primary" onClick={handleApplyCrop} className="w-full">
          Apply Frame Crop
        </CRDButton>
      </div>
    );
  }, [imageLoaded, handleApplyCrop]);

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
                  <canvas
                    ref={canvasRef}
                    className={`border-2 border-crd-green rounded-lg shadow-lg transition-opacity duration-200 ${
                      activeTab === 'sliders' ? 'cursor-move' : 'cursor-default opacity-50 pointer-events-none'
                    }`}
                    style={{ maxWidth: '100%', height: 'auto' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                  <div className="text-center mt-4 text-sm text-muted-foreground">
                    {activeTab === 'sliders' 
                      ? 'Click and drag to reposition the image' 
                      : 'Switch to Sliders tab to use this preview'
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