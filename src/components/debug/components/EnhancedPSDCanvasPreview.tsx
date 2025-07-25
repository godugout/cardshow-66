
import React, { useState, useRef, useEffect } from 'react';
import { EnhancedProcessedPSD } from '@/services/psdProcessor/enhancedPsdProcessingService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Focus,
  Grid3x3,
  Image
} from 'lucide-react';

interface EnhancedPSDCanvasPreviewProps {
  processedPSD: EnhancedProcessedPSD;
  selectedLayerId: string;
  hiddenLayers: Set<string>;
  onLayerSelect: (layerId: string) => void;
  focusMode?: boolean;
  onFocusModeToggle?: () => void;
  showBackground?: boolean;
  onToggleBackground?: () => void;
  viewMode?: string;
  initialZoom?: number;
}

export const EnhancedPSDCanvasPreview: React.FC<EnhancedPSDCanvasPreviewProps> = ({
  processedPSD,
  selectedLayerId,
  hiddenLayers,
  onLayerSelect,
  focusMode = false,
  onFocusModeToggle,
  showBackground = true,
  onToggleBackground,
  viewMode = 'inspect',
  initialZoom = 1
}) => {
  const [zoom, setZoom] = useState(initialZoom);

  // Update zoom when initialZoom changes
  useEffect(() => {
    setZoom(initialZoom);
  }, [initialZoom]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const visibleLayers = processedPSD.layers.filter(layer => !hiddenLayers.has(layer.id));
  const selectedLayer = processedPSD.layers.find(layer => layer.id === selectedLayerId);

  return (
    <div className="h-full bg-[#0a0a0b] flex flex-col">
      {/* Canvas Controls */}
      <div className="bg-[#1a1f2e] border-b border-slate-700 p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <div className="h-4 w-px bg-slate-600 mx-2" />
            
            <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-600">
              {Math.round(zoom * 100)}%
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {onToggleBackground && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleBackground}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Image className="w-4 h-4 mr-2" />
                {showBackground ? 'Hide' : 'Show'} BG
              </Button>
            )}
            
            {onFocusModeToggle && (
              <Button
                variant="outline"
                size="sm"
                onClick={onFocusModeToggle}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Focus className="w-4 h-4 mr-2" />
                {focusMode ? 'Exit' : 'Focus'}
              </Button>
            )}

            <Badge className="bg-crd-green text-black">
              {visibleLayers.length} visible
            </Badge>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 p-6">
        <div className="flex items-center justify-center min-h-full">
          <div
            ref={canvasRef}
            className="relative bg-white rounded-lg shadow-2xl"
            style={{
              width: `${processedPSD.width * zoom}px`,
              height: `${processedPSD.height * zoom}px`,
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              transition: 'transform 0.2s ease'
            }}
          >
            {/* Background/Flattened Image */}
            {showBackground && processedPSD.extractedImages?.flattenedImageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center rounded-lg"
                style={{
                  backgroundImage: `url(${processedPSD.extractedImages.flattenedImageUrl})`
                }}
              />
            )}
            
            {/* Fallback background when no flattened image */}
            {!processedPSD.extractedImages?.flattenedImageUrl && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg" />
            )}

            {/* Layer Overlays */}
            {visibleLayers.map((layer, index) => {
              const isSelected = layer.id === selectedLayerId;
              const isFocused = focusMode && isSelected;
              
              // Calculate layer dimensions from bounds
              const layerLeft = layer.bounds.left;
              const layerTop = layer.bounds.top;
              const layerWidth = layer.bounds.right - layer.bounds.left;
              const layerHeight = layer.bounds.bottom - layer.bounds.top;
              
              const layerStyle = {
                position: 'absolute' as const,
                left: `${layerLeft * zoom}px`,
                top: `${layerTop * zoom}px`,
                width: `${layerWidth * zoom}px`,
                height: `${layerHeight * zoom}px`,
                opacity: isFocused ? 1 : (focusMode ? 0.3 : (layer.opacity || 100) / 100),
                border: isSelected ? '2px solid #10b981' : 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                zIndex: isSelected ? 1000 : (100 + index), // Ensure proper layer stacking
                pointerEvents: 'auto' as const // Ensure layers are clickable
              };

              // Get layer image URL - handle both old and new formats
              const layerImageUrl = (layer as any).imageUrl?.value || (layer as any).imageUrl;

              return (
                <div
                  key={layer.id}
                  style={layerStyle}
                  onClick={() => onLayerSelect(layer.id)}
                  className="hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50"
                  title={`${layer.name} (${layerWidth}×${layerHeight})`}
                >
                  {/* Layer Image */}
                  {layerImageUrl && (
                    <img
                      src={layerImageUrl}
                      alt={layer.name}
                      className="w-full h-full object-cover rounded"
                      draggable={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                    />
                  )}
                  
                  {/* Visual indicator for layers without images */}
                  {!layerImageUrl && (
                    <div className="w-full h-full border-2 border-dashed border-slate-400 bg-slate-100/20 flex items-center justify-center text-xs text-slate-600">
                      {layer.type?.toUpperCase() || 'LAYER'}
                    </div>
                  )}
                  
                  {/* Layer Label */}
                  {isSelected && (
                    <div className="absolute -top-6 left-0 bg-crd-green text-black text-xs px-2 py-1 rounded whitespace-nowrap">
                      {layer.name}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Selection Info */}
            {selectedLayer && (
              <div className="absolute bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-sm">
                <div className="font-medium">{selectedLayer.name}</div>
                <div className="text-gray-300">
                  {selectedLayer.bounds.right - selectedLayer.bounds.left} × {selectedLayer.bounds.bottom - selectedLayer.bounds.top}px
                </div>
                <div className="text-gray-400">
                  Position: {selectedLayer.bounds.left}, {selectedLayer.bounds.top}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[#1a1f2e] border-t border-slate-700 p-2 flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Canvas: {processedPSD.width} × {processedPSD.height}px
          </span>
          <span>
            Mode: {viewMode} • Layers: {visibleLayers.length}/{processedPSD.layers.length}
          </span>
        </div>
      </div>
    </div>
  );
};
