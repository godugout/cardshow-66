import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LayerThumbnailModal } from './LayerThumbnailModal';
import { Maximize2 } from 'lucide-react';

interface LayerMappingGridProps {
  layers: any[];
  mappings: any;
  onMappingChange: (mappings: any) => void;
}

const ELEMENT_TYPES = [
  { value: 'background', label: 'Background', color: 'bg-blue-100 text-blue-800' },
  { value: 'foreground', label: 'Foreground', color: 'bg-green-100 text-green-800' },
  { value: 'text', label: 'Text', color: 'bg-purple-100 text-purple-800' },
  { value: 'effect', label: 'Effect', color: 'bg-orange-100 text-orange-800' }
];

export const LayerMappingGrid: React.FC<LayerMappingGridProps> = ({
  layers,
  mappings,
  onMappingChange
}) => {
  const [selectedLayer, setSelectedLayer] = React.useState<number | null>(null);

  const updateMapping = (layerIndex: number, updates: any) => {
    const newMappings = {
      ...mappings,
      [layerIndex]: {
        ...mappings[layerIndex],
        ...updates
      }
    };
    onMappingChange(newMappings);
  };

  const toggleLayer = (layerIndex: number) => {
    const currentMapping = mappings[layerIndex] || {};
    updateMapping(layerIndex, {
      enabled: !currentMapping.enabled,
      elementType: currentMapping.elementType || 'foreground'
    });
  };

  const setElementType = (layerIndex: number, elementType: string) => {
    updateMapping(layerIndex, { elementType });
  };

  return (
    <div className="space-y-4">
      {layers.map((layer, index) => {
        const mapping = mappings[index] || {};
        const elementType = ELEMENT_TYPES.find(type => type.value === mapping.elementType);

        return (
          <Card key={index} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Layer {index + 1}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLayer(index)}
                  >
                    <Maximize2 className="w-3 h-3" />
                  </Button>
                  <Switch
                    checked={mapping.enabled || false}
                    onCheckedChange={() => toggleLayer(index)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Layer Thumbnail */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 border rounded-lg overflow-hidden bg-checkered flex-shrink-0">
                  <img
                    src={layer.dataUrl}
                    alt={`Layer ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedLayer(index)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Element Type</Label>
                    <select
                      value={mapping.elementType || ''}
                      onChange={(e) => setElementType(index, e.target.value)}
                      disabled={!mapping.enabled}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="">Select element type</option>
                      {ELEMENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {elementType && (
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${elementType.color}`}>
                      {elementType.label}
                    </div>
                  )}
                </div>
              </div>

              {/* Layer Info */}
              {layer.width && layer.height && (
                <div className="text-xs text-muted-foreground">
                  Dimensions: {layer.width} × {layer.height}px
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Layer Thumbnail Modal */}
      {selectedLayer !== null && (
        <LayerThumbnailModal
          isOpen={true}
          onClose={() => setSelectedLayer(null)}
          layerName={`Layer ${selectedLayer + 1}`}
          fullImageUrl={layers[selectedLayer]?.dataUrl}
          thumbnailUrl={layers[selectedLayer]?.dataUrl}
          bounds={layers[selectedLayer]?.bounds}
          elementType={mappings[selectedLayer]?.elementType}
        />
      )}
    </div>
  );
};