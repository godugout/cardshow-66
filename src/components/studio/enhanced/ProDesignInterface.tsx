import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Type, 
  Layers, 
  Palette, 
  Sparkles, 
  Move, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  Copy
} from 'lucide-react';
import { EffectPresetSelector } from './components/effects/EffectPresetSelector';

interface TextLayer {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
  opacity: number;
  visible: boolean;
}

interface ProDesignInterfaceProps {
  onTextLayerAdd: (layer: TextLayer) => void;
  onTextLayerUpdate: (id: string, updates: Partial<TextLayer>) => void;
  onTextLayerDelete: (id: string) => void;
  textLayers: TextLayer[];
}

export const ProDesignInterface: React.FC<ProDesignInterfaceProps> = ({
  onTextLayerAdd,
  onTextLayerUpdate,
  onTextLayerDelete,
  textLayers
}) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [newText, setNewText] = useState('');

  const selectedLayer = textLayers.find(layer => layer.id === selectedLayerId);

  const handleAddTextLayer = () => {
    if (!newText.trim()) return;
    
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      content: newText,
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      rotation: 0,
      opacity: 100,
      visible: true
    };
    
    onTextLayerAdd(newLayer);
    setNewText('');
    setSelectedLayerId(newLayer.id);
  };

  const handleLayerUpdate = (updates: Partial<TextLayer>) => {
    if (!selectedLayerId) return;
    onTextLayerUpdate(selectedLayerId, updates);
  };

  const duplicateLayer = (layer: TextLayer) => {
    const duplicate: TextLayer = {
      ...layer,
      id: Date.now().toString(),
      content: `${layer.content} Copy`,
      x: layer.x + 20,
      y: layer.y + 20
    };
    onTextLayerAdd(duplicate);
  };

  return (
    <div className="w-full h-full bg-crd-dark border border-crd-border rounded-lg">
      <Tabs defaultValue="text" className="w-full h-full">
        <TabsList className="grid w-full grid-cols-4 bg-crd-surface">
          <TabsTrigger value="text" className="flex items-center gap-1">
            <Type className="w-3 h-3" />
            Text
          </TabsTrigger>
          <TabsTrigger value="layers" className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Layers
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Effects
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-1">
            <Palette className="w-3 h-3" />
            Materials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="h-full p-4 space-y-4">
          <Card className="bg-crd-surface border-crd-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Type className="w-4 h-4" />
                Add Text Layer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Enter text content..."
                  className="bg-crd-dark border-crd-border text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTextLayer()}
                />
                <Button onClick={handleAddTextLayer} className="bg-crd-orange hover:bg-crd-orange/90 text-black">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {selectedLayer && (
            <Card className="bg-crd-surface border-crd-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Edit Selected Layer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white text-xs">Content</Label>
                  <Textarea
                    value={selectedLayer.content}
                    onChange={(e) => handleLayerUpdate({ content: e.target.value })}
                    className="bg-crd-dark border-crd-border text-white mt-1"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white text-xs">Font Size</Label>
                    <Slider
                      value={[selectedLayer.fontSize]}
                      onValueChange={([value]) => handleLayerUpdate({ fontSize: value })}
                      min={8}
                      max={72}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-crd-text-secondary text-xs">{selectedLayer.fontSize}px</span>
                  </div>

                  <div>
                    <Label className="text-white text-xs">Opacity</Label>
                    <Slider
                      value={[selectedLayer.opacity]}
                      onValueChange={([value]) => handleLayerUpdate({ opacity: value })}
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-crd-text-secondary text-xs">{selectedLayer.opacity}%</span>
                  </div>
                </div>

                <div>
                  <Label className="text-white text-xs">Color</Label>
                  <Input
                    type="color"
                    value={selectedLayer.color}
                    onChange={(e) => handleLayerUpdate({ color: e.target.value })}
                    className="w-full h-8 bg-crd-dark border-crd-border mt-1"
                  />
                </div>

                <div>
                  <Label className="text-white text-xs">Rotation</Label>
                  <Slider
                    value={[selectedLayer.rotation]}
                    onValueChange={([value]) => handleLayerUpdate({ rotation: value })}
                    min={-180}
                    max={180}
                    step={1}
                    className="mt-2"
                  />
                  <span className="text-crd-text-secondary text-xs">{selectedLayer.rotation}°</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="layers" className="h-full p-4">
          <Card className="bg-crd-surface border-crd-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Layer Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {textLayers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      selectedLayerId === layer.id 
                        ? 'border-crd-orange bg-crd-orange/10' 
                        : 'border-crd-border bg-crd-dark hover:bg-crd-surface'
                    }`}
                    onClick={() => setSelectedLayerId(layer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-crd-text-secondary text-xs">#{index + 1}</span>
                        <span className="text-white text-sm truncate">{layer.content}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLayerUpdate({ visible: !layer.visible });
                          }}
                          className="w-6 h-6 p-0"
                        >
                          {layer.visible ? 
                            <Eye className="w-3 h-3 text-white" /> : 
                            <EyeOff className="w-3 h-3 text-crd-text-secondary" />
                          }
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateLayer(layer);
                          }}
                          className="w-6 h-6 p-0"
                        >
                          <Copy className="w-3 h-3 text-crd-text-secondary" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTextLayerDelete(layer.id);
                          }}
                          className="w-6 h-6 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {textLayers.length === 0 && (
                  <div className="text-center py-8 text-crd-text-secondary">
                    <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No text layers yet</p>
                    <p className="text-xs">Add text layers using the Text tab</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effects" className="h-full p-4">
          <EffectPresetSelector
            onApplyPreset={(preset) => {
              console.log('Applying effect preset:', preset);
            }}
            onResetAll={() => {
              console.log('Resetting all effects');
            }}
          />
        </TabsContent>

        <TabsContent value="materials" className="h-full p-4">
          <Card className="bg-crd-surface border-crd-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Material Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white text-xs">Surface Finish</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Matte', 'Glossy', 'Metallic', 'Holographic'].map(finish => (
                    <Button
                      key={finish}
                      variant="outline"
                      size="sm"
                      className="border-crd-border text-white hover:bg-crd-orange hover:text-black"
                    >
                      {finish}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-white text-xs">Reflectivity</Label>
                <Slider
                  defaultValue={[50]}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="text-white text-xs">Roughness</Label>
                <Slider
                  defaultValue={[30]}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};