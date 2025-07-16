import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileImage, Layers, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PSDAnalyzeStepProps {
  file?: File;
  onAnalysisComplete: (data: any) => void;
}

export const PSDAnalyzeStep = ({ file, onAnalysisComplete }: PSDAnalyzeStepProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzePSD = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use the unified PSD service for processing
      const { unifiedPSDService } = await import('@/services/psdProcessor/unifiedPsdService');
      const data = await unifiedPSDService.processPSDFile(file, {
        extractImages: true,
        generateThumbnails: true,
        maxLayerSize: 2048
      });

      setAnalysisResults(data);
      onAnalysisComplete(data);
    } catch (err) {
      console.error('PSD analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze PSD');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (file && !analysisResults && !isAnalyzing) {
      analyzePSD();
    }
  }, [file]);

  if (isAnalyzing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Analyzing PSD File</h3>
            <p className="text-muted-foreground">
              Processing layers and extracting image data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
            <FileImage className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-destructive">Analysis Failed</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={analyzePSD} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResults) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileImage className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">No File Selected</h3>
            <p className="text-muted-foreground">
              Please upload a PSD file to begin analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { metadata, layers, extractedImages } = analysisResults;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* File Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            File Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Filename</p>
            <p className="font-medium">{file?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dimensions</p>
            <p className="font-medium">{metadata.width} × {metadata.height}px</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Layers</p>
            <p className="font-medium">{metadata.layerCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Extracted Images</p>
            <p className="font-medium">{extractedImages.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Layer Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Layer Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-auto">
            {layers.map((layer: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-background rounded border flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{layer.name || `Layer ${index + 1}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {layer.width} × {layer.height}px
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {layer.visible !== false ? 'Visible' : 'Hidden'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Images */}
      <Card>
        <CardHeader>
          <CardTitle>Layer Previews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {extractedImages.slice(0, 8).map((image: any, index: number) => (
              <div key={index} className="aspect-square border rounded-lg overflow-hidden bg-checkered">
                <img
                  src={image.dataUrl}
                  alt={`Layer ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {extractedImages.length > 8 && (
              <div className="aspect-square border rounded-lg bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  +{extractedImages.length - 8} more
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          Analysis complete! Ready to proceed to the next step.
        </p>
      </div>
    </div>
  );
};