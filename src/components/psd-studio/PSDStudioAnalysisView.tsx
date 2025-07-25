import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PSDStudioFile } from '@/pages/PSDStudioPage';
import { EnhancedPSDCanvasPreview } from '@/components/debug/components/EnhancedPSDCanvasPreview';
import { PSDLayersPanel } from './PSDLayersPanel';
import { calculateCardPreviewZoom } from '@/utils/canvasZoom';
import { convertPSDToCardData, isPSDReadyForCardCreation } from '@/utils/psdToCardConverter';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, Layers, BarChart3, Info, ZoomIn, ZoomOut, RotateCw, Sparkles } from 'lucide-react';

interface PSDStudioAnalysisViewProps {
  file: PSDStudioFile;
  mode: 'beginner' | 'advanced' | 'bulk';
  onFileUpdate: (file: PSDStudioFile) => void;
}

export const PSDStudioAnalysisView: React.FC<PSDStudioAnalysisViewProps> = ({
  file,
  mode,
  onFileUpdate
}) => {
  const navigate = useNavigate();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());
  const [showBackground, setShowBackground] = useState<boolean>(true);
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  // Calculate optimal zoom when component mounts or viewport changes
  useEffect(() => {
    const calculateOptimalZoom = () => {
      if (canvasContainerRef.current && file.processedPSD) {
        const containerRect = canvasContainerRef.current.getBoundingClientRect();
        const optimalZoom = calculateCardPreviewZoom(
          { width: containerRect.width, height: containerRect.height },
          { width: file.processedPSD.width, height: file.processedPSD.height }
        );
        setCanvasZoom(optimalZoom);
      }
    };

    // Initial calculation
    const timer = setTimeout(calculateOptimalZoom, 100);
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateOptimalZoom);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateOptimalZoom);
    };
  }, [file.processedPSD]);

  const psd = file.processedPSD;
  const hasLayers = psd.layers.length > 0;
  const layersWithImages = psd.layers.filter(layer => 
    'hasRealImage' in layer && layer.hasRealImage
  ).length;

  const analysisData = {
    totalLayers: psd.layers.length,
    layersWithImages,
    characterLayers: psd.layers.filter(l => 
      l.name.toLowerCase().includes('character') || 
      l.name.toLowerCase().includes('player') ||
      l.name.toLowerCase().includes('person')
    ).length,
    backgroundLayers: psd.layers.filter(l => 
      l.name.toLowerCase().includes('background') || 
      l.name.toLowerCase().includes('bg')
    ).length,
    textLayers: psd.layers.filter(l => 
      l.name.toLowerCase().includes('text') || 
      l.name.toLowerCase().includes('title') ||
      l.name.toLowerCase().includes('name')
    ).length,
    effectLayers: psd.layers.filter(l => 
      l.name.toLowerCase().includes('effect') || 
      l.name.toLowerCase().includes('shadow') ||
      l.name.toLowerCase().includes('glow')
    ).length
  };

  const qualityScore = Math.round(
    (layersWithImages / Math.max(1, psd.layers.length)) * 100
  );

  const handleZoomIn = () => setCanvasZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setCanvasZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleZoomReset = () => setCanvasZoom(1);

  const handleLayerToggle = (layerId: string) => {
    setHiddenLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }
      return newSet;
    });
  };

  const handleCreateCard = async () => {
    if (!isPSDReadyForCardCreation(psd)) {
      return;
    }

    setIsCreatingCard(true);
    try {
      const cardData = await convertPSDToCardData(psd, file.fileName);
      
      // Navigate to card creator with PSD data
      navigate('/crdmkr', { 
        state: { 
          fromPSD: true,
          psdCardData: cardData 
        } 
      });
    } catch (error) {
      console.error('Failed to convert PSD to card data:', error);
      toast.error('Failed to analyze image. Using basic metadata.');
      
      // Continue without AI analysis - the function will use fallback metadata
      setIsCreatingCard(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Analysis Header */}
      <div className="bg-gradient-to-r from-card/80 to-muted/20 border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">{file.fileName}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{psd.width} × {psd.height}px</span>
              <span>•</span>
              <span>{analysisData.totalLayers} layers</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span>Quality Score:</span>
                <Badge 
                  variant={qualityScore >= 80 ? "default" : qualityScore >= 60 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {qualityScore}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Canvas Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={canvasZoom <= 0.25}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <Badge variant="outline" className="px-3">
              {Math.round(canvasZoom * 100)}%
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={canvasZoom >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomReset}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Analysis Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <TabsList className="bg-transparent border-b border-border/50 rounded-none p-0 h-auto">
            <div className="container mx-auto px-6">
              <div className="flex space-x-1">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="layers" className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Layer Analysis
                </TabsTrigger>
                {mode !== 'beginner' && (
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                )}
              </div>
            </div>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview" className="h-full m-0">
              <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                {/* Canvas Preview */}
                <div className="lg:col-span-2">
                  <Card className="h-full p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Canvas Preview</h3>
                      <Badge variant="outline">Live Preview</Badge>
                    </div>
                    <div ref={canvasContainerRef} className="h-full min-h-[400px]">
                      <EnhancedPSDCanvasPreview
                        processedPSD={psd}
                        selectedLayerId={selectedLayerId || ''}
                        hiddenLayers={hiddenLayers}
                        onLayerSelect={setSelectedLayerId}
                        showBackground={showBackground}
                        onToggleBackground={() => setShowBackground(!showBackground)}
                        initialZoom={canvasZoom}
                      />
                    </div>
                  </Card>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                  {/* File Info */}
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      File Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions</span>
                        <span className="font-medium">{psd.width} × {psd.height}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aspect Ratio</span>
                        <span className="font-medium">
                          {(psd.width / psd.height).toFixed(2)}:1
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Megapixels</span>
                        <span className="font-medium">
                          {((psd.width * psd.height) / 1000000).toFixed(1)}MP
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Color Mode</span>
                        <span className="font-medium">RGB</span>
                      </div>
                    </div>
                  </Card>

                  {/* Layer Breakdown */}
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Layer Breakdown
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-crd-green rounded-full"></div>
                          <span className="text-sm">Character</span>
                        </div>
                        <Badge variant="secondary">{analysisData.characterLayers}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-crd-blue rounded-full"></div>
                          <span className="text-sm">Background</span>
                        </div>
                        <Badge variant="secondary">{analysisData.backgroundLayers}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-crd-orange rounded-full"></div>
                          <span className="text-sm">Text</span>
                        </div>
                        <Badge variant="secondary">{analysisData.textLayers}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm">Effects</span>
                        </div>
                        <Badge variant="secondary">{analysisData.effectLayers}</Badge>
                      </div>
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      {/* Primary CTA: Create Card */}
                      <Button 
                        size="sm" 
                        className="w-full justify-start bg-gradient-to-r from-crd-orange to-crd-green hover:from-crd-orange/90 hover:to-crd-green/90"
                        onClick={handleCreateCard}
                        disabled={!isPSDReadyForCardCreation(psd)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Card from PSD
                      </Button>
                      
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview All Layers
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Layers className="w-4 h-4 mr-2" />
                        Export Layers
                      </Button>
                      {mode !== 'beginner' && (
                        <Button size="sm" variant="outline" className="w-full justify-start">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Generate Report
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layers" className="h-full m-0">
              <div className="h-full flex">
                <div className="w-80 bg-editor-darker border-r border-editor-border overflow-y-auto">
                  <PSDLayersPanel
                    layers={psd.layers}
                    selectedLayerId={selectedLayerId || ''}
                    hiddenLayers={hiddenLayers}
                    onLayerSelect={setSelectedLayerId}
                    onLayerToggle={handleLayerToggle}
                  />
                </div>
                <div className="flex-1 p-6">
                  <Card className="h-full">
                    <div className="flex items-center justify-between mb-4 p-4 border-b">
                      <h3 className="font-semibold">Layer Preview</h3>
                      <Badge variant="outline">Interactive</Badge>
                    </div>
                    <div className="h-full">
                      <EnhancedPSDCanvasPreview
                        processedPSD={psd}
                        selectedLayerId={selectedLayerId || ''}
                        hiddenLayers={hiddenLayers}
                        onLayerSelect={setSelectedLayerId}
                        showBackground={showBackground}
                        onToggleBackground={() => setShowBackground(!showBackground)}
                        initialZoom={canvasZoom}
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {mode !== 'beginner' && (
              <TabsContent value="analytics" className="h-full m-0">
                <div className="p-6 h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Usage Statistics */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">Layer Efficiency</span>
                            <span className="text-sm font-medium">{qualityScore}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-crd-green to-crd-blue h-2 rounded-full transition-all duration-500"
                              style={{ width: `${qualityScore}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">Image Coverage</span>
                            <span className="text-sm font-medium">
                              {Math.round((layersWithImages / Math.max(1, analysisData.totalLayers)) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-crd-blue to-crd-orange h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(layersWithImages / Math.max(1, analysisData.totalLayers)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Recommendations */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                      <div className="space-y-3">
                        {qualityScore < 60 && (
                          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive font-medium">Low Quality Score</p>
                            <p className="text-xs text-destructive/80 mt-1">
                              Consider organizing layers or removing empty ones
                            </p>
                          </div>
                        )}
                        {analysisData.characterLayers === 0 && (
                          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                            <p className="text-sm text-orange-600 font-medium">No Character Layers</p>
                            <p className="text-xs text-orange-600/80 mt-1">
                              Add character layers for better card design
                            </p>
                          </div>
                        )}
                        {qualityScore >= 80 && (
                          <div className="p-3 bg-crd-green/10 border border-crd-green/20 rounded-lg">
                            <p className="text-sm text-crd-green font-medium">Excellent Quality</p>
                            <p className="text-xs text-crd-green/80 mt-1">
                              This PSD is well-organized and ready for frame generation
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};