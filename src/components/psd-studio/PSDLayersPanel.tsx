import React from 'react';
import { Plus, Copy, X, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image, Square, Type, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { SidebarSection } from '@/components/editor/SidebarSection';
import { ProcessedPSDLayer } from '@/services/psdProcessor/psdProcessingService';

interface PSDLayersPanelProps {
  layers: ProcessedPSDLayer[];
  selectedLayerId: string;
  hiddenLayers: Set<string>;
  onLayerSelect: (layerId: string) => void;
  onLayerToggle: (layerId: string) => void;
}

export const PSDLayersPanel: React.FC<PSDLayersPanelProps> = ({
  layers,
  selectedLayerId,
  hiddenLayers,
  onLayerSelect,
  onLayerToggle
}) => {
  const getLayerIcon = (layer: ProcessedPSDLayer) => {
    switch (layer.type) {
      case 'image':
        return <Image size={10} className="mr-1" />;
      case 'text':
        return <Type size={10} className="mr-1" />;
      case 'shape':
        return <Square size={10} className="mr-1" />;
      case 'group':
        return <Layers size={10} className="mr-1" />;
      default:
        return <Square size={10} className="mr-1" />;
    }
  };

  const getLayerBadgeColor = (layer: ProcessedPSDLayer) => {
    switch (layer.type) {
      case 'image':
        return 'bg-cardshow-green hover:bg-cardshow-green';
      case 'text':
        return 'bg-cardshow-blue hover:bg-cardshow-blue';
      case 'shape':
        return 'bg-cardshow-orange hover:bg-cardshow-orange';
      case 'group':
        return 'bg-purple-500 hover:bg-purple-500';
      default:
        return 'bg-cardshow-lightGray hover:bg-cardshow-lightGray';
    }
  };

  const getLayerTypeLabel = (layer: ProcessedPSDLayer) => {
    switch (layer.type) {
      case 'image':
        return 'IMG';
      case 'text':
        return 'TXT';
      case 'shape':
        return 'SHP';
      case 'group':
        return 'GRP';
      default:
        return 'LYR';
    }
  };

  return (
    <SidebarSection title="Layers">
      <div className="space-y-2">
        {layers.map((layer) => {
          const isSelected = selectedLayerId === layer.id;
          const isVisible = !hiddenLayers.has(layer.id);
          const layerWidth = layer.bounds.right - layer.bounds.left;
          const layerHeight = layer.bounds.bottom - layer.bounds.top;

          return (
            <div 
              key={layer.id} 
              className={`p-2 rounded cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-editor-tool border border-cardshow-green/50' 
                  : 'bg-editor-darker hover:bg-editor-tool'
              } ${!isVisible ? 'opacity-50' : ''}`}
              onClick={() => onLayerSelect(layer.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Badge className={`${getLayerBadgeColor(layer)} text-white px-1 py-0 h-4 flex-shrink-0`}>
                    {getLayerIcon(layer)}
                    <span className="text-[10px]">{getLayerTypeLabel(layer)}</span>
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <span className="text-cardshow-white text-sm truncate block">
                      {layer.name}
                    </span>
                    <span className="text-cardshow-text-muted text-xs">
                      {layerWidth}×{layerHeight}px
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 p-0 text-cardshow-lightGray hover:text-cardshow-white" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerToggle(layer.id);
                    }}
                  >
                    {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 p-0 text-cardshow-lightGray hover:text-cardshow-white" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toast(`Duplicate ${layer.name}`);
                    }}
                  >
                    <Copy size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 p-0 text-cardshow-lightGray hover:text-cardshow-white" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toast(`Delete ${layer.name}`);
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
              
              {isSelected && (
                <div className="mt-2 pt-2 border-t border-cardshow-border">
                  <div className="text-xs text-cardshow-text-dim">
                    <div>Position: {layer.bounds.left}, {layer.bounds.top}</div>
                    {layer.opacity && (
                      <div>Opacity: {Math.round((layer.opacity || 100))}%</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2 text-xs font-medium border-dashed border-editor-border hover:bg-editor-darker"
          onClick={() => toast('Adding new layer')}
        >
          <Plus size={14} className="mr-1" />
          Add Layer
        </Button>
      </div>
    </SidebarSection>
  );
};