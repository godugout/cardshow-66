import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PSDStudioFile } from '@/pages/PSDStudioPage';
import { Frame, Wand2, Download, Eye, Settings } from 'lucide-react';

interface PSDStudioFrameBuilderProps {
  file: PSDStudioFile;
  mode: 'beginner' | 'advanced' | 'bulk';
  onFileUpdate: (file: PSDStudioFile) => void;
}

export const PSDStudioFrameBuilder: React.FC<PSDStudioFrameBuilderProps> = ({
  file,
  mode,
  onFileUpdate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFrames, setGeneratedFrames] = useState<any[]>([]);

  const psd = file.processedPSD;

  const frameTemplates = [
    {
      id: 'sports-classic',
      name: 'Sports Classic',
      description: 'Traditional sports card layout',
      category: 'Sports',
      preview: '/placeholder.svg',
      compatibility: 95
    },
    {
      id: 'modern-gaming',
      name: 'Modern Gaming',
      description: 'Sleek gaming card design',
      category: 'Gaming',
      preview: '/placeholder.svg',
      compatibility: 88
    },
    {
      id: 'vintage-collection',
      name: 'Vintage Collection',
      description: 'Retro-inspired card frame',
      category: 'Vintage',
      preview: '/placeholder.svg',
      compatibility: 72
    },
    {
      id: 'premium-holographic',
      name: 'Premium Holographic',
      description: 'High-end holographic effects',
      category: 'Premium',
      preview: '/placeholder.svg',
      compatibility: 91
    }
  ];

  const handleGenerateFrame = async (templateId: string) => {
    setIsGenerating(true);
    
    // Simulate frame generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newFrame = {
      id: `frame_${Date.now()}`,
      templateId,
      template: frameTemplates.find(t => t.id === templateId),
      preview: '/placeholder.svg',
      layers: psd.layers.slice(0, 3), // Use first 3 layers
      createdAt: new Date()
    };
    
    setGeneratedFrames(prev => [...prev, newFrame]);
    setIsGenerating(false);
  };

  const compatibilityColor = (score: number) => {
    if (score >= 90) return 'text-crd-green';
    if (score >= 70) return 'text-crd-blue';
    return 'text-crd-orange';
  };

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Frame Builder</h2>
          <p className="text-muted-foreground">
            Transform your PSD into professional CRD frames using AI-powered templates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Frame className="w-5 h-5" />
                Available Templates
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {frameTemplates.map((template) => (
                  <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                    {/* Template Preview */}
                    <div className="aspect-[4/5.6] bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-4 flex items-center justify-center">
                      <Frame className="w-12 h-12 text-muted-foreground" />
                    </div>

                    {/* Template Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Compatibility:</span>
                          <span className={`text-xs font-medium ${compatibilityColor(template.compatibility)}`}>
                            {template.compatibility}%
                          </span>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleGenerateFrame(template.id)}
                          disabled={isGenerating}
                          className="bg-gradient-to-r from-crd-green to-crd-blue"
                        >
                          {isGenerating ? (
                            <>
                              <Wand2 className="w-3 h-3 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3 h-3 mr-1" />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Generated Frames */}
            {generatedFrames.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Generated Frames</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedFrames.map((frame) => (
                    <Card key={frame.id} className="p-4">
                      {/* Frame Preview */}
                      <div className="aspect-[4/5.6] bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-4 flex items-center justify-center relative">
                        <Frame className="w-12 h-12 text-muted-foreground" />
                        
                        {/* Quick Actions */}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">{frame.template?.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Generated {frame.createdAt.toLocaleTimeString()}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Settings className="w-3 h-3 mr-1" />
                            Customize
                          </Button>
                          <Button size="sm" className="flex-1 bg-gradient-to-r from-crd-green to-crd-blue">
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Generation Settings */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Generation Settings
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-muted-foreground mb-1">Frame Style</label>
                  <select className="w-full p-2 border rounded-lg bg-background">
                    <option>Auto-detect</option>
                    <option>Sports</option>
                    <option>Gaming</option>
                    <option>Fantasy</option>
                    <option>Vintage</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-muted-foreground mb-1">Quality</label>
                  <select className="w-full p-2 border rounded-lg bg-background">
                    <option>High (4K)</option>
                    <option>Medium (2K)</option>
                    <option>Standard (1K)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1">Effects</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Holographic</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Foil</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Embossed</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            {/* PSD Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Source PSD</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File</span>
                  <span className="font-medium truncate ml-2">{file.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions</span>
                  <span className="font-medium">{psd.width} × {psd.height}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Layers</span>
                  <span className="font-medium">{psd.layers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">With Images</span>
                  <span className="font-medium">
                    {psd.layers.filter(l => 'hasRealImage' in l && l.hasRealImage).length}
                  </span>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-4 bg-gradient-to-br from-crd-green/5 to-crd-blue/5 border-crd-green/20">
              <h3 className="font-semibold mb-2 text-crd-green">Pro Tips</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use high-resolution images for best results</li>
                <li>• Organize layers by character, background, text</li>
                <li>• Keep character layers at the top</li>
                <li>• Use descriptive layer names</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};