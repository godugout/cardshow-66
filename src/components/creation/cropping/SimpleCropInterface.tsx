import React, { useState, useRef, useEffect } from 'react';
import { CRDButton, CRDCard } from '@/components/ui/design-system';
import { CRDInput } from '@/components/ui/design-system';
import { Slider } from '@/components/ui/slider';
import { FlexiblePanel, FlexiblePanelTab } from '@/components/ui/flexible-panel';
import { RotateCcw, Frame, Square, Sliders } from 'lucide-react';
import { FrameCropInterface } from './FrameCropInterface';
import { FreeformCropInterface } from './FreeformCropInterface';

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
  const [xPosition, setXPosition] = useState([50]);
  const [yPosition, setYPosition] = useState([50]);
  const [zoom, setZoom] = useState([100]);
  const [rotation, setRotation] = useState([0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    console.log('SimpleCropInterface received imageUrl:', imageUrl);
    if (imageUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 400;
        canvas.height = 560; // 2.5:3.5 aspect ratio
        
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate scaling and positioning
        const scale = zoom[0] / 100;
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const offsetX = (xPosition[0] - 50) * 4; // Scale the position
        const offsetY = (yPosition[0] - 50) * 4;
        
        ctx?.save();
        ctx?.translate(centerX + offsetX, centerY + offsetY);
        ctx?.rotate((rotation[0] * Math.PI) / 180);
        ctx?.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        ctx?.restore();
        
        // Draw crop border
        ctx!.strokeStyle = '#4ade80';
        ctx!.lineWidth = 2;
        ctx?.strokeRect(0, 0, canvas.width, canvas.height);
      };
      
      img.onerror = (error) => {
        console.error('Failed to load image:', error, 'URL:', imageUrl);
      };
      
      img.crossOrigin = 'anonymous'; // Handle CORS
      img.src = imageUrl;
      imageRef.current = img;
    }
  }, [imageUrl, xPosition, yPosition, zoom, rotation]);

  const handleApplyCrop = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onCropComplete(dataUrl);
    }
  };

  const resetCrop = () => {
    setXPosition([50]);
    setYPosition([50]);
    setZoom([100]);
    setRotation([0]);
  };

  // Slider Mode Component
  const SliderMode = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Canvas Preview */}
      <div className="flex flex-col items-center">
        <CRDCard className="p-6 bg-card/50">
          <canvas
            ref={canvasRef}
            className="border-2 border-crd-green rounded-lg shadow-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </CRDCard>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        <CRDCard className="p-6">
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
        </CRDCard>
      </div>
    </div>
  );

  // Prepare tabs for FlexiblePanel
  const cropTabs: FlexiblePanelTab[] = [
    {
      id: 'sliders',
      label: 'Sliders',
      icon: <Sliders className="w-4 h-4" />,
      content: <SliderMode />
    },
    {
      id: 'frame',
      label: 'Frame',
      icon: <Frame className="w-4 h-4" />,
      content: <FrameCropInterface imageUrl={imageUrl} onCropComplete={onCropComplete} />
    },
    {
      id: 'freeform',
      label: 'Freeform',
      icon: <Square className="w-4 h-4" />,
      content: <FreeformCropInterface imageUrl={imageUrl} onCropComplete={onCropComplete} />
    }
  ];

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

        {/* Tabbed Crop Interface */}
        <FlexiblePanel
          tabs={cropTabs}
          defaultTab="sliders"
          className="min-h-[600px]"
        />
      </div>
    </div>
  );
};