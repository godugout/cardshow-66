import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Eye, Download, RotateCcw, Zap, Clock, Target, Brain } from 'lucide-react';
import { detectCardsInImage } from '@/services/cardDetection';
import { enhancedCardDetection } from '@/services/cardExtractor/enhancedDetection';
import { improvedCardDetector } from '@/services/cardDetection/improvedCardDetection';
import { histogramCardDetector } from '@/services/cardDetection/histogramDetector';
import { templateCardMatcher } from '@/services/cardDetection/templateMatcher';
import { houghTransformDetector } from '@/services/cardDetection/houghTransformDetector';
import { advancedCardDetector } from '@/services/cardDetection/advancedCardDetector';

interface DetectionResult {
  method: string;
  cards: Array<{
    id: string;
    bounds: { x: number; y: number; width: number; height: number };
    confidence: number;
    aspectRatio?: number;
    edgeStrength?: number;
    geometryScore?: number;
    corners?: Array<{ x: number; y: number }>;
  }>;
  processingTime: number;
  debugInfo?: any;
}

interface AIAnalysisResult {
  cardType?: string;
  manufacturer?: string;
  detectedText?: string[];
  rarity?: string;
  suggestedTitle?: string;
  suggestedDescription?: string;
  confidence?: number;
}

export const EnhancedCardDetectionTester: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState({
    simple: true,
    enhanced: true,
    improved: true,
    histogram: true,
    template: true,
    hough: true,
    advanced: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setResults([]);
        setAiAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const runDetection = useCallback(async () => {
    if (!image || !imageFile) return;
    
    setIsProcessing(true);
    const detectionResults: DetectionResult[] = [];

    // Count enabled methods
    const enabledMethods = Object.entries(selectedMethods).filter(([_, enabled]) => enabled);
    console.log(`Running ${enabledMethods.length} detection methods...`);

    try {
      const img = new Image();
      img.onload = async () => {
        try {
          // Run methods one by one with individual error handling
          for (const [methodKey, enabled] of enabledMethods) {
            if (!enabled) continue;

            console.log(`Starting ${methodKey} detection...`);
            const startTime = Date.now();

            try {
              let result: DetectionResult | null = null;

              switch (methodKey) {
                case 'simple':
                  try {
                    const simpleResult = await detectCardsInImage(imageFile);
                    result = {
                      method: 'Simple Detection',
                      cards: simpleResult.detectedCards.map((card, index) => ({
                        id: `simple-${index}`,
                        bounds: card.bounds,
                        confidence: card.confidence,
                        aspectRatio: card.bounds.width / card.bounds.height
                      })),
                      processingTime: Date.now() - startTime
                    };
                  } catch (err) {
                    console.error('Simple detection failed:', err);
                  }
                  break;

                case 'enhanced':
                  try {
                    const enhancedCards = await enhancedCardDetection(img, imageFile);
                    result = {
                      method: 'Enhanced Detection',
                      cards: enhancedCards.map((card, index) => ({
                        id: `enhanced-${index}`,
                        bounds: { x: card.x, y: card.y, width: card.width, height: card.height },
                        confidence: card.confidence,
                        aspectRatio: card.aspectRatio,
                        edgeStrength: card.edgeStrength,
                        geometryScore: card.geometryScore,
                        corners: card.corners
                      })),
                      processingTime: Date.now() - startTime
                    };
                  } catch (err) {
                    console.error('Enhanced detection failed:', err);
                  }
                  break;

                case 'improved':
                  try {
                    const improvedResult = await improvedCardDetector.detectCards(img);
                    result = {
                      method: 'Improved Detection',
                      cards: improvedResult.cards.map((card, index) => ({
                        id: `improved-${index}`,
                        bounds: { x: card.x, y: card.y, width: card.width, height: card.height },
                        confidence: card.confidence,
                        aspectRatio: card.aspectRatio,
                        edgeStrength: card.edgeStrength,
                        geometryScore: card.geometryScore,
                        corners: card.corners
                      })),
                      processingTime: Date.now() - startTime,
                      debugInfo: improvedResult.debugInfo
                    };
                  } catch (err) {
                    console.error('Improved detection failed:', err);
                  }
                  break;

                case 'histogram':
                  try {
                    const histogramCards = await histogramCardDetector.detectCards(img);
                    result = {
                      method: 'Histogram Detection',
                      cards: histogramCards.map((card, index) => ({
                        id: `histogram-${index}`,
                        bounds: card.bounds,
                        confidence: card.confidence,
                        aspectRatio: card.aspectRatio,
                        corners: card.corners
                      })),
                      processingTime: Date.now() - startTime
                    };
                  } catch (err) {
                    console.error('Histogram detection failed:', err);
                  }
                  break;

                case 'template':
                  try {
                    const templateCards = await templateCardMatcher.detectCards(img);
                    result = {
                      method: 'Template Matching',
                      cards: templateCards.map((card, index) => ({
                        id: `template-${index}`,
                        bounds: card.bounds,
                        confidence: card.confidence,
                        aspectRatio: card.aspectRatio,
                        corners: card.corners
                      })),
                      processingTime: Date.now() - startTime
                    };
                  } catch (err) {
                    console.error('Template matching failed:', err);
                  }
                  break;

                case 'hough':
                  try {
                    const houghCards = await houghTransformDetector.detectCards(img);
                    result = {
                      method: 'Hough Transform',
                      cards: houghCards.map((card, index) => ({
                        id: `hough-${index}`,
                        bounds: card.bounds,
                        confidence: card.confidence,
                        aspectRatio: card.aspectRatio,
                        corners: card.corners
                      })),
                      processingTime: Date.now() - startTime
                    };
                  } catch (err) {
                    console.error('Hough transform failed:', err);
                  }
                  break;

                case 'advanced':
                  try {
                    const advancedResult = await advancedCardDetector.detectCards(img);
                    result = {
                      method: 'Advanced OpenCV',
                      cards: advancedResult.cards.map((card, index) => ({
                        id: `advanced-${index}`,
                        bounds: card.bounds,
                        confidence: card.confidence,
                        aspectRatio: card.aspectRatio,
                        edgeStrength: card.edgeStrength,
                        geometryScore: card.geometryScore,
                        corners: card.corners
                      })),
                      processingTime: Date.now() - startTime,
                      debugInfo: advancedResult.debugInfo
                    };
                  } catch (err) {
                    console.error('Advanced detection failed:', err);
                  }
                  break;
              }

              if (result) {
                detectionResults.push(result);
                console.log(`✅ ${methodKey} completed: ${result.cards.length} cards in ${result.processingTime}ms`);
              }

              // Small delay between methods to prevent browser freeze
              await new Promise(resolve => setTimeout(resolve, 100));

            } catch (methodError) {
              console.error(`Method ${methodKey} failed:`, methodError);
              // Continue with next method even if this one fails
            }
          }

          setResults(detectionResults);
          console.log(`🎯 All detection completed! Total: ${detectionResults.reduce((sum, r) => sum + r.cards.length, 0)} cards found`);
          
        } catch (error) {
          console.error('Detection process failed:', error);
        } finally {
          setIsProcessing(false);
        }
      };
      
      img.onerror = () => {
        console.error('Failed to load image');
        setIsProcessing(false);
      };
      
      img.src = image;
    } catch (error) {
      console.error('Detection setup failed:', error);
      setIsProcessing(false);
    }
  }, [image, imageFile, selectedMethods]);

  const runAIAnalysis = useCallback(async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    try {
      // AI Analysis disabled for now
      console.log('AI Analysis feature temporarily disabled');
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageFile]);

  const reset = useCallback(() => {
    setImage(null);
    setImageFile(null);
    setResults([]);
    setAiAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'Simple Detection': return 'bg-blue-500';
      case 'Enhanced Detection': return 'bg-green-500';
      case 'Improved Detection': return 'bg-purple-500';
      case 'Histogram Detection': return 'bg-yellow-500';
      case 'Template Matching': return 'bg-orange-500';
      case 'Hough Transform': return 'bg-red-500';
      case 'Advanced OpenCV': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Enhanced Card Detection Tester</h1>
          <p className="text-muted-foreground">Test multiple detection algorithms and AI analysis on card images</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload and Controls */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload & Controls</h2>
            
            <div className="space-y-4">
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

              {image && (
                <>
                  {/* Method Selection */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Detection Methods:</h3>
                    {Object.entries(selectedMethods).map(([key, enabled]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => setSelectedMethods(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="rounded"
                        />
                        <span className="capitalize">{key} Detection</span>
                      </label>
                    ))}
                  </div>

                  <Button
                    onClick={runDetection}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Detecting...' : 'Run Detection'}
                  </Button>

                  <Button
                    onClick={runAIAnalysis}
                    disabled={isAnalyzing}
                    className="w-full"
                    variant="secondary"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
                  </Button>

                  <Button
                    onClick={reset}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Image Display */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Detection Results</h2>
            
            {image ? (
              <div className="relative">
                <img
                  src={image}
                  alt="Uploaded"
                  className="w-full h-auto rounded-lg"
                />
                
                {/* Overlay detection results */}
                {results.map((result, resultIndex) => 
                  result.cards.map((card, cardIndex) => (
                    <div
                      key={`${result.method}-${cardIndex}`}
                      className={`absolute border-2 ${getMethodColor(result.method)} bg-opacity-10`}
                      style={{
                        left: `${(card.bounds.x / 600) * 100}%`,
                        top: `${(card.bounds.y / 400) * 100}%`,
                        width: `${(card.bounds.width / 600) * 100}%`,
                        height: `${(card.bounds.height / 400) * 100}%`,
                      }}
                    >
                      <div className={`absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white ${getMethodColor(result.method)}`}>
                        {result.method}: {Math.round(card.confidence * 100)}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Upload an image to see detection results</p>
              </div>
            )}
          </Card>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <Card className="mt-6 p-6">
            <h2 className="text-xl font-semibold mb-4">Detection Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.map((result) => (
                <div key={result.method} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getMethodColor(result.method)}`} />
                    <h3 className="font-medium">{result.method}</h3>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {result.cards.length} cards detected
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {result.processingTime}ms
                    </div>
                    {result.debugInfo && (
                      <div className="mt-2">
                        <details className="text-xs">
                          <summary className="cursor-pointer">Debug Info</summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(result.debugInfo, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <Card className="mt-6 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Analysis Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiAnalysis.cardType && (
                <div>
                  <h3 className="font-medium">Card Type</h3>
                  <Badge variant="secondary">{aiAnalysis.cardType}</Badge>
                </div>
              )}
              {aiAnalysis.manufacturer && (
                <div>
                  <h3 className="font-medium">Manufacturer</h3>
                  <Badge variant="secondary">{aiAnalysis.manufacturer}</Badge>
                </div>
              )}
              {aiAnalysis.rarity && (
                <div>
                  <h3 className="font-medium">Rarity</h3>
                  <Badge variant="secondary">{aiAnalysis.rarity}</Badge>
                </div>
              )}
              {aiAnalysis.suggestedTitle && (
                <div className="md:col-span-2">
                  <h3 className="font-medium">Suggested Title</h3>
                  <p className="text-sm text-muted-foreground">{aiAnalysis.suggestedTitle}</p>
                </div>
              )}
              {aiAnalysis.suggestedDescription && (
                <div className="md:col-span-3">
                  <h3 className="font-medium">Suggested Description</h3>
                  <p className="text-sm text-muted-foreground">{aiAnalysis.suggestedDescription}</p>
                </div>
              )}
              {aiAnalysis.detectedText && aiAnalysis.detectedText.length > 0 && (
                <div className="md:col-span-3">
                  <h3 className="font-medium">Detected Text</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiAnalysis.detectedText.map((text, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {text}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Detailed Card Results */}
        {results.some(r => r.cards.length > 0) && (
          <Card className="mt-6 p-6">
            <h2 className="text-xl font-semibold mb-4">Detailed Card Information</h2>
            <div className="space-y-4">
              {results.map((result) => 
                result.cards.map((card, index) => (
                  <div key={`${result.method}-detail-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getMethodColor(result.method)}`} />
                      <h3 className="font-medium">{result.method} - Card {index + 1}</h3>
                      <Badge variant="outline">{Math.round(card.confidence * 100)}% confidence</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div>Position: {card.bounds.x}, {card.bounds.y}</div>
                      <div>Size: {card.bounds.width} × {card.bounds.height}</div>
                      {card.aspectRatio && <div>Aspect: {card.aspectRatio.toFixed(2)}</div>}
                      {card.edgeStrength && <div>Edge: {card.edgeStrength.toFixed(2)}</div>}
                      {card.geometryScore && <div>Geometry: {card.geometryScore.toFixed(2)}</div>}
                      {card.corners && <div>Corners: {card.corners.length} detected</div>}
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