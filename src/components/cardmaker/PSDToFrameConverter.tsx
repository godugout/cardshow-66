import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Layers, Image, Palette, Download, Eye, Settings } from 'lucide-react';
import type { EnhancedProcessedPSD } from '@/services/psdProcessor/enhancedPsdProcessingService';
import { toast } from 'sonner';

interface PSDToFrameConverterProps {
  processedPSD: EnhancedProcessedPSD;
  onConvertToCard: (frameData: any) => void;
  onBack: () => void;
}

interface LayerMapping {
  layerId: string;
  elementType: 'background' | 'foreground' | 'text' | 'effect' | 'disabled';
  name: string;
  enabled: boolean;
}

export const PSDToFrameConverter: React.FC<PSDToFrameConverterProps> = ({
  processedPSD,
  onConvertToCard,
  onBack
}) => {
  const [layerMappings, setLayerMappings] = useState<LayerMapping[]>(() =>
    processedPSD.layers.map((layer, index) => {
      const enhancedLayer = layer as any; // Type assertion for enhanced layer properties
      return {
        layerId: layer.id,
        elementType: index === 0 ? 'background' : 'foreground',
        name: layer.name || `Layer ${index + 1}`,
        enabled: enhancedLayer.hasRealImage || false
      };
    })
  );

  const [frameName, setFrameName] = useState(
    processedPSD.metadata?.title || 'My PSD Frame'
  );

  const [previewMode, setPreviewMode] = useState<'layers' | 'composite'>('composite');

  const updateLayerMapping = useCallback((layerId: string, updates: Partial<LayerMapping>) => {
    setLayerMappings(prev =>
      prev.map(mapping =>
        mapping.layerId === layerId ? { ...mapping, ...updates } : mapping
      )
    );
  }, []);

  const getElementTypeColor = (type: string) => {
    switch (type) {
      case 'background': return 'bg-blue-500';
      case 'foreground': return 'bg-green-500';
      case 'text': return 'bg-purple-500';
      case 'effect': return 'bg-orange-500';
      case 'disabled': return 'bg-gray-400';
      default: return 'bg-gray-500';
    }
  };

  const enabledLayers = layerMappings.filter(m => m.enabled);

  const handleConvertToFrame = useCallback(() => {
    try {
      const frameData = {
        name: frameName,
        originalPSD: processedPSD.metadata?.title,
        layers: enabledLayers.map(mapping => {
          const originalLayer = processedPSD.layers.find(l => l.id === mapping.layerId);
          const enhancedLayer = originalLayer as any; // Type assertion for enhanced layer properties
          return {
            id: mapping.layerId,
            type: mapping.elementType,
            name: mapping.name,
            imageUrl: enhancedLayer?.imageUrl || '',
            thumbnailUrl: enhancedLayer?.thumbnailUrl || '',
            bounds: originalLayer?.bounds,
            hasRealImage: enhancedLayer?.hasRealImage || false
          };
        }),
        dimensions: {
          width: processedPSD.width,
          height: processedPSD.height
        },
        extractedImages: processedPSD.extractedImages
      };

      onConvertToCard(frameData);
      toast.success('Frame converted successfully! Ready to create your card.');
    } catch (error) {
      console.error('Conversion failed:', error);
      toast.error('Failed to convert frame');
    }
  }, [frameName, enabledLayers, processedPSD, onConvertToCard]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                PSD to Frame Converter
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Configure how your PSD layers will become card elements
              </p>
            </div>
            <Badge variant="outline" className="bg-gradient-to-r from-crd-blue/10 to-crd-green/10">
              {enabledLayers.length} Active Layers
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Original: {processedPSD.width}×{processedPSD.height}px</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Layers: {processedPSD.layers.length} total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Images: {processedPSD.extractedImages.layerImages.length} extracted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layer Configuration */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Frame Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="frameName">Frame Name</Label>
                <Input
                  id="frameName"
                  value={frameName}
                  onChange={(e) => setFrameName(e.target.value)}
                  placeholder="Enter frame name..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Layer Mapping</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure how each layer will be used in your card frame
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {layerMappings.map((mapping, index) => {
                  const layer = processedPSD.layers.find(l => l.id === mapping.layerId);
                  const previewUrl = processedPSD.layerPreviews.get(mapping.layerId);

                  return (
                    <div key={mapping.layerId} className="border rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={mapping.name}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded border flex items-center justify-center">
                              <Image className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{mapping.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {layer?.bounds ? 
                                `${layer.bounds.right - layer.bounds.left}×${layer.bounds.bottom - layer.bounds.top}px` :
                                'No dimensions'
                              }
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={mapping.enabled}
                          onCheckedChange={(enabled) =>
                            updateLayerMapping(mapping.layerId, { enabled })
                          }
                        />
                      </div>

                      {mapping.enabled && (
                        <>
                          <Separator />
                          <div className="grid grid-cols-2 gap-2">
                            {['background', 'foreground', 'text', 'effect'].map((type) => (
                              <Button
                                key={type}
                                variant={mapping.elementType === type ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                  updateLayerMapping(mapping.layerId, { elementType: type as any })
                                }
                                className="capitalize text-xs"
                              >
                                <div className={`w-2 h-2 rounded-full ${getElementTypeColor(type)} mr-1`} />
                                {type}
                              </Button>
                            ))}
                          </div>
                          <Input
                            value={mapping.name}
                            onChange={(e) =>
                              updateLayerMapping(mapping.layerId, { name: e.target.value })
                            }
                            placeholder="Layer name..."
                            className="text-sm"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Frame Preview
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={previewMode === 'composite' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('composite')}
                >
                  Composite
                </Button>
                <Button
                  variant={previewMode === 'layers' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('layers')}
                >
                  Layers
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {previewMode === 'composite' ? (
              <div className="aspect-[5/7] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                {processedPSD.extractedImages.flattenedImageUrl ? (
                  <img
                    src={processedPSD.extractedImages.flattenedImageUrl}
                    alt="Frame preview"
                    className="max-w-full max-h-full object-contain rounded"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <Palette className="w-12 h-12 mx-auto mb-2" />
                    <p>Frame Preview</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {enabledLayers.map((mapping) => {
                  const previewUrl = processedPSD.layerPreviews.get(mapping.layerId);
                  return (
                    <div key={mapping.layerId} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={mapping.name}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{mapping.name}</p>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getElementTypeColor(mapping.elementType)}`} />
                          <span className="text-xs text-muted-foreground capitalize">
                            {mapping.elementType}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Upload
        </Button>
        <Button 
          onClick={handleConvertToFrame}
          disabled={!frameName.trim() || enabledLayers.length === 0}
          className="bg-gradient-to-r from-crd-blue to-crd-green hover:opacity-90"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Convert to Frame
        </Button>
      </div>
    </div>
  );
};