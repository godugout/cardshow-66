import React from 'react';
import { LayerMappingGrid } from '@/components/cardmaker/LayerMappingGrid';
import { CompositePreviewCanvas } from '@/components/cardmaker/CompositePreviewCanvas';

interface PSDBuildStepProps {
  psdData: any;
  layerMappings: any;
  onMappingsChange: (mappings: any) => void;
}

export const PSDBuildStep = ({ 
  psdData, 
  layerMappings, 
  onMappingsChange 
}: PSDBuildStepProps) => {
  if (!psdData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">No PSD data available</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      {/* Layer Mapping - Left Side */}
      <div className="w-1/2 border-r border-border overflow-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Map Layers to Elements</h3>
          <LayerMappingGrid
            layers={psdData.extractedImages}
            mappings={layerMappings}
            onMappingChange={onMappingsChange}
          />
        </div>
      </div>

      {/* Live Preview - Right Side */}
      <div className="w-1/2 overflow-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
          <CompositePreviewCanvas
            layers={Object.entries(layerMappings)
              .filter(([_, mapping]: [string, any]) => mapping.enabled)
              .map(([layerIndex, mapping]: [string, any]) => {
                const layer = psdData.extractedImages[parseInt(layerIndex)];
                return {
                  id: layerIndex,
                  imageUrl: layer?.dataUrl,
                  thumbnailUrl: layer?.dataUrl,
                  bounds: layer?.bounds,
                  elementType: mapping.elementType,
                  enabled: mapping.enabled,
                  name: `Layer ${parseInt(layerIndex) + 1}`
                };
              })}
            psdWidth={psdData.metadata.width}
            psdHeight={psdData.metadata.height}
          />
        </div>
      </div>
    </div>
  );
};