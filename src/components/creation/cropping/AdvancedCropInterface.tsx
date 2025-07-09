import React, { useState, useRef, useEffect } from 'react';
import { CRDButton, CRDCard } from '@/components/ui/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Frame, 
  Square, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Crop,
  Grid3X3,
  Eye,
  Settings,
  Plus
} from 'lucide-react';

interface CropArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'frame' | 'element';
}

interface AdvancedCropInterfaceProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onBack: () => void;
}

export const AdvancedCropInterface: React.FC<AdvancedCropInterfaceProps> = ({
  imageUrl,
  onCropComplete,
  onBack
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('crop');
  const [cropAreas, setCropAreas] = useState<CropArea[]>([
    {
      id: 'main',
      name: 'Main Card Image',
      x: 50,
      y: 50,
      width: 300,
      height: 420,
      type: 'frame'
    }
  ]);
  const [selectedArea, setSelectedArea] = useState<string>('main');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 800;
        canvas.height = 600;
        
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw image
        const scale = zoom / 100;
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        ctx?.drawImage(
          img, 
          centerX - scaledWidth / 2, 
          centerY - scaledHeight / 2, 
          scaledWidth, 
          scaledHeight
        );
        
        // Draw crop areas
        cropAreas.forEach((area) => {
          if (area.id === selectedArea) {
            ctx!.strokeStyle = '#4ade80';
            ctx!.lineWidth = 3;
          } else {
            ctx!.strokeStyle = area.type === 'frame' ? '#3b82f6' : '#f97316';
            ctx!.lineWidth = 2;
          }
          
          ctx?.strokeRect(area.x, area.y, area.width, area.height);
          
          // Area label
          ctx!.fillStyle = area.id === selectedArea ? '#4ade80' : (area.type === 'frame' ? '#3b82f6' : '#f97316');
          ctx?.fillRect(area.x, area.y - 20, area.name.length * 8, 20);
          ctx!.fillStyle = 'white';
          ctx!.font = '12px sans-serif';
          ctx?.fillText(area.name, area.x + 4, area.y - 6);
        });
        
        // Draw grid if enabled
        if (showGrid) {
          ctx!.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx!.lineWidth = 1;
          for (let i = 0; i < canvas.width; i += 20) {
            ctx?.beginPath();
            ctx?.moveTo(i, 0);
            ctx?.lineTo(i, canvas.height);
            ctx?.stroke();
          }
          for (let i = 0; i < canvas.height; i += 20) {
            ctx?.beginPath();
            ctx?.moveTo(0, i);
            ctx?.lineTo(canvas.width, i);
            ctx?.stroke();
          }
        }
      };
      
      img.src = imageUrl;
    }
  }, [imageUrl, cropAreas, selectedArea, zoom, showGrid]);

  const addCropArea = (type: 'frame' | 'element') => {
    const newArea: CropArea = {
      id: `area-${Date.now()}`,
      name: type === 'frame' ? `Frame ${cropAreas.length}` : `Element ${cropAreas.length}`,
      x: 100 + cropAreas.length * 20,
      y: 100 + cropAreas.length * 20,
      width: type === 'frame' ? 250 : 150,
      height: type === 'frame' ? 350 : 150,
      type
    };
    
    setCropAreas([...cropAreas, newArea]);
    setSelectedArea(newArea.id);
  };

  const deleteCropArea = (id: string) => {
    if (id === 'main') return; // Don't delete main area
    setCropAreas(cropAreas.filter(area => area.id !== id));
    setSelectedArea('main');
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 25, 300));
  const handleZoomOut = () => setZoom(Math.max(zoom - 25, 25));

  const handleApplyCrop = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onCropComplete(dataUrl);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-card border-r border-border p-4 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Crop className="w-5 h-5" />
            <h2 className="font-semibold">Enhanced Cropping Tool</h2>
          </div>

          {/* Tools */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'crop', icon: Crop, label: 'Crop' },
              { id: 'select', icon: Move, label: 'Select' },
              { id: 'zoom', icon: ZoomIn, label: 'Zoom' },
              { id: 'grid', icon: Grid3X3, label: 'Grid' }
            ].map((tool) => (
              <CRDButton
                key={tool.id}
                variant={selectedTool === tool.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedTool(tool.id);
                  if (tool.id === 'grid') setShowGrid(!showGrid);
                }}
                className="flex-col h-16 p-2"
              >
                <tool.icon className="w-4 h-4 mb-1" />
                <span className="text-xs">{tool.label}</span>
              </CRDButton>
            ))}
          </div>

          {/* Crop Areas Panel */}
          <CRDCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Crop Areas</h3>
              <span className="text-xs text-muted-foreground">
                Add and manage your card crop areas
              </span>
            </div>

            {/* Add buttons */}
            <div className="flex gap-2 mb-4">
              <CRDButton
                variant="outline"
                size="sm"
                onClick={() => addCropArea('frame')}
                className="flex-1"
              >
                <Plus className="w-3 h-3 mr-1" />
                Frame
              </CRDButton>
              <CRDButton
                variant="outline"
                size="sm"
                onClick={() => addCropArea('element')}
                className="flex-1"
              >
                <Plus className="w-3 h-3 mr-1" />
                Element
              </CRDButton>
            </div>

            {/* Areas list */}
            <div className="space-y-2">
              {cropAreas.map((area) => (
                <div
                  key={area.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedArea === area.id
                      ? 'border-crd-green bg-crd-green/10'
                      : 'border-border hover:border-border/80'
                  }`}
                  onClick={() => setSelectedArea(area.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${
                        area.type === 'frame' ? 'bg-blue-500' : 'bg-orange-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {area.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {area.width}×{area.height}
                        </div>
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CRDCard>

          {/* Quick Tips */}
          <CRDCard className="p-4">
            <h4 className="font-medium text-white mb-2">Quick Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Drag corners to resize</li>
              <li>• Use rotation handle to rotate</li>
              <li>• Hold Ctrl to multi-select</li>
              <li>• Right-click for options</li>
            </ul>
          </CRDCard>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <CRDButton variant="outline" size="sm" onClick={onBack}>
                Back
              </CRDButton>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <CRDButton variant="ghost" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </CRDButton>
                <span className="text-sm text-white min-w-[60px] text-center">
                  {zoom}%
                </span>
                <CRDButton variant="ghost" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </CRDButton>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CRDButton variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
                <Grid3X3 className="w-4 h-4" />
                Grid
              </CRDButton>
              <CRDButton variant="outline" size="sm">
                <Eye className="w-4 h-4" />
                Preview
              </CRDButton>
              <CRDButton variant="primary" size="sm" onClick={handleApplyCrop}>
                Apply
              </CRDButton>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="flex-1 overflow-hidden relative bg-muted/20" ref={containerRef}>
            <div className="absolute inset-4 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="border border-border rounded-lg shadow-lg bg-background"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};