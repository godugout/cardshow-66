import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompositePreviewCanvas } from '@/components/cardmaker/CompositePreviewCanvas';
import { Download, Eye, Settings } from 'lucide-react';

interface PSDReviewStepProps {
  psdData: any;
  layerMappings: any;
  onPreviewGenerated: (preview: string) => void;
}

export const PSDReviewStep = ({ 
  psdData, 
  layerMappings, 
  onPreviewGenerated 
}: PSDReviewStepProps) => {
  const [finalPreview, setFinalPreview] = useState<string | null>(null);

  useEffect(() => {
    // Generate final preview when component mounts
    if (psdData && Object.keys(layerMappings).length > 0) {
      generateFinalPreview();
    }
  }, [psdData, layerMappings]);

  const generateFinalPreview = async () => {
    // Create a canvas to generate the final composite
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = psdData.metadata.width;
    canvas.height = psdData.metadata.height;

    // Sort layers by element type for proper stacking
    const sortedMappings = Object.entries(layerMappings)
      .filter(([_, mapping]: [string, any]) => mapping.enabled)
      .sort(([_, a]: [string, any], [__, b]: [string, any]) => {
        const order = { background: 0, foreground: 1, text: 2, effects: 3 };
        return (order[a.elementType as keyof typeof order] || 2) - 
               (order[b.elementType as keyof typeof order] || 2);
      });

    // Draw each enabled layer
    for (const [layerIndex, mapping] of sortedMappings) {
      const layer = psdData.extractedImages[parseInt(layerIndex)];
      if (layer && layer.dataUrl) {
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = layer.dataUrl;
          });

          // Apply opacity if specified
          const opacity = (mapping as any).opacity || 1;
          ctx.globalAlpha = opacity;
          
          // Draw the image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Reset opacity
          ctx.globalAlpha = 1;
        } catch (error) {
          console.warn(`Failed to draw layer ${layerIndex}:`, error);
        }
      }
    }

    const previewUrl = canvas.toDataURL('image/png');
    setFinalPreview(previewUrl);
    onPreviewGenerated(previewUrl);
  };

  const downloadPreview = () => {
    if (finalPreview) {
      const link = document.createElement('a');
      link.download = 'crd-frame-preview.png';
      link.href = finalPreview;
      link.click();
    }
  };

  const selectedLayers = Object.entries(layerMappings)
    .filter(([_, mapping]: [string, any]) => mapping.enabled);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Selected Layers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {selectedLayers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              out of {psdData?.extractedImages?.length || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Frame Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {psdData?.metadata?.width} × {psdData?.metadata?.height}
            </div>
            <p className="text-xs text-muted-foreground">pixels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ready to Create</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={downloadPreview}
              disabled={!finalPreview}
              className="w-full"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Preview
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Final Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Final Frame Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            {finalPreview ? (
              <div className="max-w-md border rounded-lg overflow-hidden bg-checkered">
                <img 
                  src={finalPreview} 
                  alt="Final frame preview"
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="w-64 h-64 border rounded-lg flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Generating preview...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Layer Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Layer Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedLayers.map(([layerIndex, mapping]: [string, any]) => {
              const layer = psdData.extractedImages[parseInt(layerIndex)];
              return (
                <div 
                  key={layerIndex}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border rounded overflow-hidden bg-checkered">
                      <img 
                        src={layer.dataUrl} 
                        alt={`Layer ${layerIndex}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        Layer {parseInt(layerIndex) + 1}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {mapping.elementType} element
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((mapping.opacity || 1) * 100)}% opacity
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};