import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas as FabricCanvas, Rect, FabricImage, Line, Group } from 'fabric';
import { CRDButton, CRDCard } from '@/components/ui/design-system';
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
  Plus,
  Trash2,
  RotateCw,
  Move3D
} from 'lucide-react';
import { toast } from 'sonner';

interface CropArea {
  id: string;
  name: string;
  rect: Rect;
  type: 'frame' | 'element';
  visible: boolean;
}

interface InteractiveCropInterfaceProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onBack: () => void;
}

export const InteractiveCropInterface: React.FC<InteractiveCropInterfaceProps> = ({
  imageUrl,
  onCropComplete,
  onBack
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [fabricImage, setFabricImage] = useState<FabricImage | null>(null);
  const [cropAreas, setCropAreas] = useState<CropArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 900,
      height: 650,
      backgroundColor: '#1a1a1c',
      selection: true,
      preserveObjectStacking: true,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
      setFabricCanvas(null);
    };
  }, []);

  // Enhanced image loading with error handling and CORS support
  useEffect(() => {
    if (!fabricCanvas || !imageUrl) return;

    const loadImageWithFallback = async () => {
      try {
        // Try primary loading method with CORS
        const img = await FabricImage.fromURL(imageUrl, {
          crossOrigin: 'anonymous'
        });

        if (!img) {
          throw new Error('Image failed to load');
        }

        const canvasWidth = fabricCanvas.width!;
        const canvasHeight = fabricCanvas.height!;
        const padding = 24; // Same as sidebar margins
        
        // Calculate scale to fit image with proper padding
        const availableWidth = canvasWidth - (padding * 2);
        const availableHeight = canvasHeight - (padding * 2);
        const imgAspect = img.width! / img.height!;
        
        let scale;
        if (imgAspect > availableWidth / availableHeight) {
          scale = availableWidth / img.width!;
        } else {
          scale = availableHeight / img.height!;
        }

        img.scale(scale);
        img.set({
          left: padding,
          top: padding, // Top-aligned with padding
          selectable: false,
          evented: false,
        });

        fabricCanvas.add(img);
        setFabricImage(img);

        // Create the main crop area
        const mainCropArea = createCropArea('main', 'Main Card Image', 'frame');
        if (mainCropArea) {
          setCropAreas([mainCropArea]);
          setSelectedAreaId('main');
        }

        fabricCanvas.renderAll();
        setIsReady(true);
        toast.success('Image loaded successfully');

      } catch (primaryError) {
        console.warn('Primary image loading failed:', primaryError);
        
        try {
          // Fallback: Try without crossOrigin
          const img = await FabricImage.fromURL(imageUrl);
          
          if (!img) {
            throw new Error('Fallback image loading failed');
          }

          const canvasWidth = fabricCanvas.width!;
          const canvasHeight = fabricCanvas.height!;
          const padding = 24;
          
          const availableWidth = canvasWidth - (padding * 2);
          const availableHeight = canvasHeight - (padding * 2);
          const imgAspect = img.width! / img.height!;
          
          let scale;
          if (imgAspect > availableWidth / availableHeight) {
            scale = availableWidth / img.width!;
          } else {
            scale = availableHeight / img.height!;
          }

          img.scale(scale);
          img.set({
            left: padding,
            top: padding,
            selectable: false,
            evented: false,
          });

          fabricCanvas.add(img);
          setFabricImage(img);

          const mainCropArea = createCropArea('main', 'Main Card Image', 'frame');
          if (mainCropArea) {
            setCropAreas([mainCropArea]);
            setSelectedAreaId('main');
          }

          fabricCanvas.renderAll();
          setIsReady(true);
          toast.success('Image loaded (fallback mode)');

        } catch (fallbackError) {
          console.error('All image loading methods failed:', fallbackError);
          toast.error('Failed to load image. Please try uploading a different image or check your connection.');
          setIsReady(false);
        }
      }
    };

    loadImageWithFallback();
  }, [fabricCanvas, imageUrl]);

  // Update grid overlay to fill entire canvas background
  useEffect(() => {
    if (!fabricCanvas || !isReady) return;

    // Remove existing grid lines
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if (obj.get('isGridLine')) {
        fabricCanvas.remove(obj);
      }
    });

    if (showGrid) {
      const gridSize = 20;
      const gridOptions = {
        stroke: 'rgba(255,255,255,0.08)',
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        isGridLine: true,
      };

      // Fill entire canvas with grid - extend beyond visible area
      const canvasWidth = fabricCanvas.width!;
      const canvasHeight = fabricCanvas.height!;

      // Add vertical lines across full canvas width
      for (let i = 0; i <= canvasWidth; i += gridSize) {
        const line = new Line([i, 0, i, canvasHeight], gridOptions);
        fabricCanvas.add(line);
        fabricCanvas.sendObjectToBack(line);
      }

      // Add horizontal lines across full canvas height  
      for (let i = 0; i <= canvasHeight; i += gridSize) {
        const line = new Line([0, i, canvasWidth, i], gridOptions);
        fabricCanvas.add(line);
        fabricCanvas.sendObjectToBack(line);
      }

      // Add subtle dots at intersections for better visual reference
      for (let x = 0; x <= canvasWidth; x += gridSize * 4) {
        for (let y = 0; y <= canvasHeight; y += gridSize * 4) {
          const dot = new Rect({
            left: x - 0.5,
            top: y - 0.5,
            width: 1,
            height: 1,
            fill: 'rgba(255,255,255,0.15)',
            selectable: false,
            evented: false,
            isGridLine: true,
          });
          fabricCanvas.add(dot);
          fabricCanvas.sendObjectToBack(dot);
        }
      }
    }

    fabricCanvas.renderAll();
  }, [showGrid, fabricCanvas, isReady]);

  const createCropArea = useCallback((id: string, name: string, type: 'frame' | 'element') => {
    if (!fabricCanvas || !fabricImage) return null;

    const imgBounds = fabricImage.getBoundingRect();
    const aspectRatio = 2.5 / 3.5; // CRD standard aspect ratio
    
    // Calculate initial size and position
    let width, height;
    if (type === 'frame') {
      width = Math.min(imgBounds.width * 0.6, 300);
      height = width / aspectRatio;
    } else {
      width = 150;
      height = 150;
    }

    const rect = new Rect({
      left: imgBounds.left + (imgBounds.width - width) / 2,
      top: imgBounds.top + (imgBounds.height - height) / 2,
      width,
      height,
      fill: 'transparent',
      stroke: type === 'frame' ? '#4FFFB0' : '#FF6B4A', // CRD colors
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      cornerColor: type === 'frame' ? '#4FFFB0' : '#FF6B4A',
      cornerSize: 10,
      transparentCorners: false,
      hasRotatingPoint: true,
      lockUniScaling: type === 'frame', // Lock aspect ratio for frames
      cropAreaId: id,
      cropAreaType: type,
    });

    // For frames, maintain aspect ratio
    if (type === 'frame') {
      rect.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
      });
    }

    // Event handlers
    rect.on('moving', () => {
      constrainToImage(rect);
    });

    rect.on('scaling', () => {
      if (type === 'frame') {
        // Maintain aspect ratio for frames
        const newWidth = rect.getScaledWidth();
        const newHeight = newWidth / aspectRatio;
        rect.set({
          height: rect.height! * (newHeight / rect.getScaledHeight()),
          scaleY: rect.scaleX
        });
      }
      constrainToImage(rect);
      fabricCanvas.renderAll();
    });

    rect.on('rotating', () => {
      constrainToImage(rect);
    });

    rect.on('selected', () => {
      setSelectedAreaId(id);
    });

    fabricCanvas.add(rect);
    fabricCanvas.bringObjectToFront(rect);

    return {
      id,
      name,
      rect,
      type,
      visible: true
    };
  }, [fabricCanvas, fabricImage]);

  const constrainToImage = (rect: Rect) => {
    if (!fabricImage) return;

    const imgBounds = fabricImage.getBoundingRect();
    const rectBounds = rect.getBoundingRect();

    // Keep crop area within image bounds
    let newLeft = rect.left!;
    let newTop = rect.top!;

    if (rectBounds.left < imgBounds.left) {
      newLeft = imgBounds.left;
    }
    if (rectBounds.top < imgBounds.top) {
      newTop = imgBounds.top;
    }
    if (rectBounds.left + rectBounds.width > imgBounds.left + imgBounds.width) {
      newLeft = imgBounds.left + imgBounds.width - rectBounds.width;
    }
    if (rectBounds.top + rectBounds.height > imgBounds.top + imgBounds.height) {
      newTop = imgBounds.top + imgBounds.height - rectBounds.height;
    }

    rect.set({ left: newLeft, top: newTop });
  };

  const addCropArea = (type: 'frame' | 'element') => {
    if (cropAreas.length >= 8) {
      toast.error('Maximum 8 crop areas allowed');
      return;
    }

    const id = `area-${Date.now()}`;
    const name = type === 'frame' ? `Frame ${cropAreas.length + 1}` : `Element ${cropAreas.length + 1}`;
    
    const newArea = createCropArea(id, name, type);
    if (newArea) {
      setCropAreas([...cropAreas, newArea]);
      setSelectedAreaId(id);
      fabricCanvas?.setActiveObject(newArea.rect);
      fabricCanvas?.renderAll();
    }
  };

  const deleteCropArea = (id: string) => {
    if (id === 'main') {
      toast.error('Cannot delete main crop area');
      return;
    }

    const area = cropAreas.find(a => a.id === id);
    if (area) {
      fabricCanvas?.remove(area.rect);
      setCropAreas(cropAreas.filter(a => a.id !== id));
      setSelectedAreaId(cropAreas.length > 1 ? 'main' : '');
      fabricCanvas?.renderAll();
    }
  };

  const toggleAreaVisibility = (id: string) => {
    const area = cropAreas.find(a => a.id === id);
    if (area) {
      area.visible = !area.visible;
      area.rect.set({ visible: area.visible });
      setCropAreas([...cropAreas]);
      fabricCanvas?.renderAll();
    }
  };

  const handleZoom = (newZoom: number) => {
    setZoom(newZoom);
    const scale = newZoom / 100;
    fabricCanvas?.setZoom(scale);
    fabricCanvas?.renderAll();
  };

  const resetRotation = () => {
    const selectedArea = cropAreas.find(a => a.id === selectedAreaId);
    if (selectedArea) {
      selectedArea.rect.set({ angle: 0 });
      fabricCanvas?.renderAll();
    }
  };

  const centerSelected = () => {
    const selectedArea = cropAreas.find(a => a.id === selectedAreaId);
    if (selectedArea && fabricImage) {
      const imgBounds = fabricImage.getBoundingRect();
      const rectWidth = selectedArea.rect.getScaledWidth();
      const rectHeight = selectedArea.rect.getScaledHeight();
      
      selectedArea.rect.set({
        left: imgBounds.left + (imgBounds.width - rectWidth) / 2,
        top: imgBounds.top + (imgBounds.height - rectHeight) / 2
      });
      fabricCanvas?.renderAll();
    }
  };

  const extractCroppedAreas = async () => {
    if (!fabricCanvas || !fabricImage || cropAreas.length === 0) {
      toast.error('No crop areas to extract');
      return;
    }

    try {
      // For now, return the first crop area as main image
      // In a full implementation, you'd extract all areas
      const mainArea = cropAreas[0];
      if (!mainArea) return;

      const rect = mainArea.rect;
      const rectBounds = rect.getBoundingRect();
      
      // Create a new canvas for cropping
      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) return;

      cropCanvas.width = rectBounds.width;
      cropCanvas.height = rectBounds.height;

      // Get the original image element
      const imgElement = fabricImage.getElement() as HTMLImageElement;
      const imgBounds = fabricImage.getBoundingRect();
      
      // Calculate source coordinates relative to the original image
      const scaleX = imgElement.naturalWidth / imgBounds.width;
      const scaleY = imgElement.naturalHeight / imgBounds.height;
      
      const sourceX = (rectBounds.left - imgBounds.left) * scaleX;
      const sourceY = (rectBounds.top - imgBounds.top) * scaleY;
      const sourceWidth = rectBounds.width * scaleX;
      const sourceHeight = rectBounds.height * scaleY;

      cropCtx.drawImage(
        imgElement,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, rectBounds.width, rectBounds.height
      );

      const croppedDataUrl = cropCanvas.toDataURL('image/png');
      onCropComplete(croppedDataUrl);
      toast.success('Crop applied successfully!');
    } catch (error) {
      console.error('Failed to extract crop:', error);
      toast.error('Failed to apply crop');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-card border-r border-border p-4 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Crop className="w-5 h-5" />
            <h2 className="font-semibold">Interactive Cropping Tool</h2>
          </div>

          {/* Crop Areas Panel */}
          <CRDCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Crop Areas</h3>
              <Badge variant="outline">{cropAreas.length}/8</Badge>
            </div>

            {/* Add buttons */}
            <div className="flex gap-2 mb-4">
              <CRDButton
                variant="outline"
                size="sm"
                onClick={() => addCropArea('frame')}
                className="flex-1"
                disabled={cropAreas.length >= 8}
              >
                <Plus className="w-3 h-3 mr-1" />
                Frame
              </CRDButton>
              <CRDButton
                variant="outline"
                size="sm"
                onClick={() => addCropArea('element')}
                className="flex-1"
                disabled={cropAreas.length >= 8}
              >
                <Plus className="w-3 h-3 mr-1" />
                Element
              </CRDButton>
            </div>

            {/* Areas list */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cropAreas.map((area) => (
                <div
                  key={area.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAreaId === area.id
                      ? 'border-crd-green bg-crd-green/10'
                      : 'border-border hover:border-border/80'
                  }`}
                  onClick={() => {
                    setSelectedAreaId(area.id);
                    fabricCanvas?.setActiveObject(area.rect);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${
                        area.type === 'frame' ? 'bg-crd-green' : 'bg-crd-orange'
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {area.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(area.rect.getScaledWidth())}×{Math.round(area.rect.getScaledHeight())}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <CRDButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAreaVisibility(area.id);
                        }}
                        className="p-1 h-6 w-6"
                      >
                        <Eye className={`w-3 h-3 ${area.visible ? 'text-white' : 'text-muted-foreground'}`} />
                      </CRDButton>
                      {area.id !== 'main' && (
                        <CRDButton
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCropArea(area.id);
                          }}
                          className="p-1 h-6 w-6 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </CRDButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CRDCard>

          {/* Selected Area Controls */}
          {selectedAreaId && (
            <CRDCard className="p-4">
              <h4 className="font-medium text-white mb-3">Area Controls</h4>
              <div className="grid grid-cols-2 gap-2">
                <CRDButton
                  variant="outline"
                  size="sm"
                  onClick={centerSelected}
                >
                  <Move3D className="w-3 h-3 mr-1" />
                  Center
                </CRDButton>
                <CRDButton
                  variant="outline"
                  size="sm"
                  onClick={resetRotation}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </CRDButton>
              </div>
            </CRDCard>
          )}

          {/* Quick Tips */}
          <CRDCard className="p-4">
            <h4 className="font-medium text-white mb-2">Controls</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Drag to move crop area</li>
              <li>• Drag corners to resize</li>
              <li>• Use rotation handle to rotate</li>
              <li>• Frames lock to 2.5:3.5 ratio</li>
              <li>• Max 8 crop areas</li>
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
                <CRDButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleZoom(Math.max(zoom - 25, 25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </CRDButton>
                <span className="text-sm text-white min-w-[60px] text-center">
                  {zoom}%
                </span>
                <CRDButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleZoom(Math.min(zoom + 25, 300))}
                >
                  <ZoomIn className="w-4 h-4" />
                </CRDButton>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CRDButton 
                variant={showGrid ? "primary" : "outline"} 
                size="sm" 
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3X3 className="w-4 h-4" />
                Grid
              </CRDButton>
              <CRDButton variant="primary" size="sm" onClick={extractCroppedAreas}>
                Apply Crop
              </CRDButton>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="flex-1 overflow-hidden relative bg-muted/20">
            <div className="absolute inset-4 flex items-start justify-start"> {/* Changed to top alignment */}
              <canvas
                ref={canvasRef}
                className="border border-border rounded-lg shadow-lg"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
