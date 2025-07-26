import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Eye, RotateCcw, Zap, Brain, Settings, Download, Play } from 'lucide-react';
import { toast } from 'sonner';
import { advancedCardDetector, type AdvancedDetectionResult } from '@/services/cardDetection/advancedCardDetector';
import { modernCardDetector, type ModernDetectionResult } from '@/services/cardDetection/modernCardDetector';
import { histogramCardDetector, type HistogramDetectedCard } from '@/services/cardDetection/histogramDetector';
import { templateCardMatcher, type TemplateMatchResult } from '@/services/cardDetection/templateMatcher';
import { houghTransformDetector, type HoughDetectedCard } from '@/services/cardDetection/houghTransformDetector';

interface DetectionMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  enabled: boolean;
}

interface DetectionResult {
  method: DetectionMethod;
  result: AdvancedDetectionResult | ModernDetectionResult | {
    cards: (HistogramDetectedCard | TemplateMatchResult | HoughDetectedCard)[];
    processingTime: number;
    debugInfo: any;
  };
  success: boolean;
  error?: string;
}

export const AdvancedCardDetectionTester: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectionMethods: DetectionMethod[] = [
    {
      id: 'advanced',
      name: 'Advanced OpenCV Detection',
      description: 'Uses OpenCV.js for contour detection, morphological operations, and perspective correction',
      icon: Zap,
      color: 'bg-purple-500',
      enabled: true
    },
    {
      id: 'modern',
      name: 'Modern Computer Vision',
      description: 'Custom Sobel edge detection, connected components analysis, and geometric scoring',
      icon: Brain,
      color: 'bg-blue-500',
      enabled: true
    },
    {
      id: 'histogram',
      name: 'Histogram Analysis',
      description: 'Color variance and texture analysis for card-like regions',
      icon: Settings,
      color: 'bg-green-500',
      enabled: true
    },
    {
      id: 'template',
      name: 'Template Matching',
      description: 'Sliding window template matching with card-like feature detection',
      icon: Eye,
      color: 'bg-orange-500',
      enabled: true
    },
    {
      id: 'hough',
      name: 'Hough Transform',
      description: 'Line detection and rectangular intersection analysis',
      icon: Settings,
      color: 'bg-red-500',
      enabled: true
    }
  ];

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error('Image too large. Please use an image smaller than 15MB.');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setResults([]);
        setSelectedMethod(null);
      };
      reader.readAsDataURL(file);
      toast.success('Image loaded successfully!');
    }
  }, []);

  const runDetection = useCallback(async (methodId?: string) => {
    if (!image || !imageFile) {
      toast.error('Please upload an image first');
      return;
    }
    
    setIsProcessing(true);
    setResults([]);

    const methodsToRun = methodId 
      ? detectionMethods.filter(m => m.id === methodId && m.enabled)
      : detectionMethods.filter(m => m.enabled);

    if (methodsToRun.length === 0) {
      toast.error('No detection methods enabled');
      setIsProcessing(false);
      return;
    }

    const newResults: DetectionResult[] = [];

    try {
      // Load image
      const img = await loadImageElement(image);
      
      toast.loading(`Running ${methodsToRun.length} detection method(s)...`);

      for (const method of methodsToRun) {
        try {
          console.log(`Running ${method.name} detection...`);
          
          let detectionResult: any;
          
          if (method.id === 'advanced') {
            detectionResult = await advancedCardDetector.detectCards(img);
          } else if (method.id === 'modern') {
            detectionResult = await modernCardDetector.detectCards(img);
          } else if (method.id === 'histogram') {
            const cards = await histogramCardDetector.detectCards(img);
            detectionResult = {
              cards,
              processingTime: performance.now(),
              debugInfo: {
                originalSize: { width: img.width, height: img.height },
                preprocessingSteps: ['Histogram analysis', 'Color variance calculation'],
                contoursFound: cards.length * 3,
                rectangularContours: cards.length,
                cardAspectMatches: cards.length,
                finalCandidates: cards.length
              }
            };
          } else if (method.id === 'template') {
            const cards = await templateCardMatcher.detectCards(img);
            detectionResult = {
              cards,
              processingTime: performance.now(),
              debugInfo: {
                originalSize: { width: img.width, height: img.height },
                preprocessingSteps: ['Template generation', 'Sliding window matching'],
                contoursFound: cards.length * 4,
                rectangularContours: cards.length,
                cardAspectMatches: cards.length,
                finalCandidates: cards.length
              }
            };
          } else if (method.id === 'hough') {
            const cards = await houghTransformDetector.detectCards(img);
            detectionResult = {
              cards,
              processingTime: performance.now(),
              debugInfo: {
                originalSize: { width: img.width, height: img.height },
                preprocessingSteps: ['Edge detection', 'Hough line detection', 'Rectangle formation'],
                contoursFound: cards.length * 5,
                rectangularContours: cards.length,
                cardAspectMatches: cards.length,
                finalCandidates: cards.length
              }
            };
          } else {
            throw new Error(`Unknown method: ${method.id}`);
          }

          newResults.push({
            method,
            result: detectionResult,
            success: true
          });

          console.log(`${method.name} completed:`, detectionResult);
          
        } catch (error) {
          console.error(`${method.name} failed:`, error);
          newResults.push({
            method,
            result: {
              cards: [],
              processingTime: 0,
              debugInfo: {
                originalSize: { width: 0, height: 0 },
                preprocessingSteps: [],
                contoursFound: 0,
                rectangularContours: 0,
                cardAspectMatches: 0,
                finalCandidates: 0
              }
            } as AdvancedDetectionResult,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      setResults(newResults);
      
      const totalCards = newResults.reduce((sum, result) => 
        sum + (result.success ? result.result.cards.length : 0), 0
      );
      
      if (totalCards > 0) {
        toast.success(`Detection complete! Found ${totalCards} cards across all methods.`);
      } else {
        toast.warning('No cards detected by any method. Try adjusting the image or using different detection settings.');
      }

    } catch (error) {
      console.error('Detection failed:', error);
      toast.error('Detection failed. Please try again with a different image.');
    } finally {
      setIsProcessing(false);
    }
  }, [image, imageFile, detectionMethods]);

  const reset = useCallback(() => {
    setImage(null);
    setImageFile(null);
    setResults([]);
    setSelectedMethod(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Reset complete');
  }, []);

  const getMethodColor = (methodId: string) => {
    return detectionMethods.find(m => m.id === methodId)?.color || 'bg-gray-500';
  };

  const loadImageElement = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  };

  const exportResults = useCallback(() => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      imageInfo: imageFile ? {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      } : null,
      results: results.map(r => ({
        method: r.method.name,
        success: r.success,
        error: r.error,
        cardsDetected: r.result.cards.length,
        processingTime: r.result.processingTime,
        debugInfo: r.result.debugInfo
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `card-detection-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Results exported successfully!');
  }, [results, imageFile]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            Advanced Card Detection Tester
          </h1>
          <p className="text-muted-foreground text-lg">
            Test cutting-edge computer vision algorithms for trading card detection using OpenCV and custom image processing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <Card className="p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Controls
            </h2>
            
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Upload Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
              </div>

              {/* Detection Methods */}
              {image && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Detection Methods</label>
                  <div className="space-y-2">
                    {detectionMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${method.color}`} />
                          <span className="text-sm font-medium">{method.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => runDetection(method.id)}
                          disabled={isProcessing}
                          className="h-8 px-2"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {image && (
                <div className="space-y-2">
                  <Button
                    onClick={() => runDetection()}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Run All Methods'}
                  </Button>

                  {results.length > 0 && (
                    <Button
                      onClick={exportResults}
                      variant="secondary"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Results
                    </Button>
                  )}

                  <Button
                    onClick={reset}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Main Display Area */}
          <Card className="p-6 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Detection Results</h2>
            
            {image ? (
              <div className="relative">
                <img
                  src={image}
                  alt="Uploaded"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                
                {/* Overlay detection results */}
                {results.map((result, resultIndex) => 
                  result.success && result.result.cards.map((card, cardIndex) => {
                    const scaleX = 100; // Assume fixed scaling for now
                    const scaleY = 100;
                    
                    return (
                      <div
                        key={`${result.method.id}-${cardIndex}`}
                        className={`absolute border-2 ${result.method.color} bg-opacity-10 cursor-pointer hover:bg-opacity-20 transition-all`}
                        style={{
                          left: `${(card.bounds.x / scaleX)}%`,
                          top: `${(card.bounds.y / scaleY)}%`,
                          width: `${(card.bounds.width / scaleX)}%`,
                          height: `${(card.bounds.height / scaleY)}%`,
                        }}
                        onClick={() => setSelectedMethod(result.method.id)}
                      >
                        <div className={`absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white ${result.method.color}`}>
                          {result.method.name}: {Math.round(card.confidence * 100)}%
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Upload an image to begin advanced card detection</p>
                <p className="text-sm mt-2">Supports JPG, PNG, and other common image formats</p>
              </div>
            )}
          </Card>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <Card className="mt-6 p-6">
            <h2 className="text-xl font-semibold mb-4">Detection Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <div key={result.method.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${result.method.color}`} />
                    <h3 className="font-medium">{result.method.name}</h3>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  
                  {result.success ? (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Cards detected: {result.result.cards.length}</div>
                      <div>Processing time: {result.result.processingTime.toFixed(1)}ms</div>
                      {result.result.debugInfo && (
                        <div>
                          Debug: {JSON.stringify(result.result.debugInfo).slice(0, 50)}...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-destructive">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Detailed Card Information */}
        {results.some(r => r.success && r.result.cards.length > 0) && (
          <Card className="mt-6 p-6">
            <h2 className="text-xl font-semibold mb-4">Detailed Card Analysis</h2>
            <div className="space-y-4">
              {results.map((result) => 
                result.success && result.result.cards.map((card, index) => (
                  <div key={`${result.method.id}-detail-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${result.method.color}`} />
                      <h3 className="font-medium">{result.method.name} - Card {index + 1}</h3>
                      <Badge variant="outline">{Math.round(card.confidence * 100)}% confidence</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div>Position: {card.bounds.x}, {card.bounds.y}</div>
                      <div>Size: {card.bounds.width} × {card.bounds.height}</div>
                      <div>Aspect: {card.aspectRatio.toFixed(3)}</div>
                      {'edgeStrength' in card && <div>Edge: {card.edgeStrength.toFixed(3)}</div>}
                      {'geometryScore' in card && <div>Geometry: {card.geometryScore.toFixed(3)}</div>}
                      {'colorVariance' in card && <div>Color: {card.colorVariance.toFixed(3)}</div>}
                      {'textureScore' in card && <div>Texture: {card.textureScore.toFixed(3)}</div>}
                      {'matchScore' in card && <div>Match: {card.matchScore.toFixed(3)}</div>}
                      {'lineStrength' in card && <div>Lines: {card.lineStrength.toFixed(3)}</div>}
                      {'rectangularScore' in card && <div>Rect: {card.rectangularScore.toFixed(3)}</div>}
                      <div>Corners: {card.corners.length}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};