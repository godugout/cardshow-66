
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { EnhancedImageUploader } from './components/EnhancedImageUploader';
import { LayerVisualizationPanel } from './components/LayerVisualizationPanel';
import { FrameConstructor } from './components/FrameConstructor';
import { EnhancedCardRenderer } from './components/EnhancedCardRenderer';
import { Enhanced3DCardViewer } from '@/components/3d/enhanced/Enhanced3DCardViewer';
import { EffectsPhase } from '@/components/studio/enhanced/components/EffectsPhase';
import { 
  Upload, Download, RotateCcw, Eye, EyeOff, Move, Square, 
  Type, Image as ImageIcon, Layers, Palette, Sparkles, Zap, Box 
} from 'lucide-react';
import { toast } from 'sonner';

interface CardLayer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'effect';
  visible: boolean;
  opacity: number;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data?: any;
}

interface CardData {
  title: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  image: File | null;
  imageUrl: string;
  frameConfig: {
    style: string;
    border: { width: number; color: string; style: string };
    background: string;
    effects: string[];
  };
  layers: CardLayer[];
}

export const EnhancedCardCreator: React.FC = () => {
  const [cardData, setCardData] = useState<CardData>({
    title: 'My Enhanced Card',
    description: 'A card created with the enhanced creator',
    rarity: 'common',
    image: null,
    imageUrl: '',
    frameConfig: {
      style: 'modern',
      border: { width: 4, color: '#4f46e5', style: 'solid' },
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      effects: []
    },
    layers: [
      {
        id: 'background',
        name: 'Background',
        type: 'shape',
        visible: true,
        opacity: 1,
        zIndex: 0,
        position: { x: 0, y: 0 },
        size: { width: 400, height: 560 },
        data: { color: '#1f2937' }
      },
      {
        id: 'frame',
        name: 'Frame',
        type: 'shape',
        visible: true,
        opacity: 1,
        zIndex: 10,
        position: { x: 0, y: 0 },
        size: { width: 400, height: 560 },
        data: { border: true }
      }
    ]
  });

  const [activeTab, setActiveTab] = useState<'upload' | 'layers' | 'frame' | 'effects'>('upload');
  const [selectedLayer, setSelectedLayer] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [effectValues, setEffectValues] = useState<Record<string, Record<string, any>>>({
    holographic: { intensity: 0, enabled: false },
    metallic: { intensity: 0, enabled: false },
    chrome: { intensity: 0, enabled: false },
    foil: { intensity: 0, enabled: false },
    particles: { enabled: false }
  });
  const cardRendererRef = useRef<{ exportCard: () => Promise<Blob> }>(null);

  const handleImageUpload = (file: File, url: string) => {
    setCardData(prev => ({
      ...prev,
      image: file,
      imageUrl: url,
      layers: [
        ...prev.layers.filter(l => l.id !== 'main-image'),
        {
          id: 'main-image',
          name: 'Main Image',
          type: 'image',
          visible: true,
          opacity: 1,
          zIndex: 5,
          position: { x: 20, y: 20 },
          size: { width: 360, height: 240 },
          data: { url }
        }
      ]
    }));
    toast.success('Image uploaded and added as layer!');
  };

  const handleLayerUpdate = (layerId: string, updates: Partial<CardLayer>) => {
    setCardData(prev => ({
      ...prev,
      layers: prev.layers.map(layer => 
        layer.id === layerId ? { ...layer, ...updates } : layer
      )
    }));
  };

  const handleFrameConfigUpdate = (config: Partial<CardData['frameConfig']>) => {
    setCardData(prev => ({
      ...prev,
      frameConfig: { ...prev.frameConfig, ...config }
    }));
  };

  const handleEffectChange = (effectId: string, parameterId: string, value: number | boolean | string) => {
    setEffectValues(prev => ({
      ...prev,
      [effectId]: {
        ...prev[effectId],
        [parameterId]: value
      }
    }));
    
    // Auto-enable 3D mode when effects are used
    if ((typeof value === 'number' && value > 0) || value === true) {
      setIs3DMode(true);
    }
  };

  const has3DEffects = Object.values(effectValues).some(effect => 
    effect.enabled || (typeof effect.intensity === 'number' && effect.intensity > 0)
  );

  const addLayer = (type: CardLayer['type']) => {
    const newLayer: CardLayer = {
      id: `layer-${Date.now()}`,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      visible: true,
      opacity: 1,
      zIndex: cardData.layers.length,
      position: { x: 50, y: 50 },
      size: { width: 100, height: 100 },
      data: {}
    };

    setCardData(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer]
    }));
    toast.success(`New ${type} layer added!`);
  };

  const removeLayer = (layerId: string) => {
    setCardData(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== layerId)
    }));
    toast.success('Layer removed!');
  };

  const handleExport = async () => {
    if (!cardRendererRef.current) {
      toast.error('Card renderer not ready');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await cardRendererRef.current.exportCard();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cardData.title.replace(/\s+/g, '_').toLowerCase()}_enhanced_card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Enhanced card exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export card');
    } finally {
      setIsExporting(false);
    }
  };

  const LayerIcon = ({ type }: { type: CardLayer['type'] }) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'shape': return <Square className="w-4 h-4" />;
      case 'effect': return <Sparkles className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Enhanced Card Creator</h1>
          <p className="text-gray-300">Advanced card creation with layer visualization and frame construction</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Panel - Tools */}
          <div className="xl:col-span-1 space-y-6">
            {/* Tab Navigation */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'upload', label: 'Upload', icon: Upload },
                    { id: 'layers', label: 'Layers', icon: Layers },
                    { id: 'frame', label: 'Frame', icon: Square },
                    { id: 'effects', label: 'Effects', icon: Palette }
                  ].map(tab => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 ${
                        activeTab === tab.id 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tab Content */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                {activeTab === 'upload' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white">Upload & Details</h3>
                    <EnhancedImageUploader onImageUpload={handleImageUpload} />
                    
                    <Separator className="bg-gray-600" />
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-gray-300">Title</Label>
                        <Input
                          id="title"
                          value={cardData.title}
                          onChange={(e) => setCardData(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description" className="text-gray-300">Description</Label>
                        <Textarea
                          id="description"
                          value={cardData.description}
                          onChange={(e) => setCardData(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-300">Rarity</Label>
                        <Select 
                          value={cardData.rarity} 
                          onValueChange={(value) => setCardData(prev => ({ ...prev, rarity: value as any }))}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="common">Common</SelectItem>
                            <SelectItem value="uncommon">Uncommon</SelectItem>
                            <SelectItem value="rare">Rare</SelectItem>
                            <SelectItem value="epic">Epic</SelectItem>
                            <SelectItem value="legendary">Legendary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'layers' && (
                  <LayerVisualizationPanel
                    layers={cardData.layers}
                    selectedLayer={selectedLayer}
                    onLayerSelect={setSelectedLayer}
                    onLayerUpdate={handleLayerUpdate}
                    onAddLayer={addLayer}
                    onRemoveLayer={removeLayer}
                  />
                )}

                {activeTab === 'frame' && (
                  <FrameConstructor
                    frameConfig={cardData.frameConfig}
                    onConfigUpdate={handleFrameConfigUpdate}
                  />
                )}

                {activeTab === 'effects' && (
                  <EffectsPhase
                    selectedFrame={cardData.frameConfig.style}
                    onEffectChange={handleEffectChange}
                    effectValues={effectValues}
                  />
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleExport}
                disabled={isExporting || !cardData.imageUrl}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Card'}
              </Button>
              <Button
                onClick={() => {
                  setCardData(prev => ({ 
                    ...prev, 
                    title: 'My Enhanced Card',
                    description: 'A card created with the enhanced creator',
                    rarity: 'common',
                    image: null,
                    imageUrl: '',
                    layers: prev.layers.filter(l => ['background', 'frame'].includes(l.id))
                  }));
                  toast.success('Card reset!');
                }}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="xl:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 h-fit">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Live Preview</h3>
                  <div className="flex items-center gap-3">
                    {/* 3D Mode Toggle */}
                    <Button
                      variant={is3DMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIs3DMode(!is3DMode)}
                      className={`flex items-center gap-2 ${
                        is3DMode 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                      disabled={!cardData.imageUrl}
                    >
                      <Box className="w-4 h-4" />
                      {is3DMode ? '3D View' : '2D View'}
                    </Button>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-purple-600 text-white">
                        {cardData.layers.length} layers
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {cardData.rarity}
                      </Badge>
                      {has3DEffects && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-purple-500 text-white">
                          <Sparkles className="w-3 h-3 mr-1" />
                          3D Effects
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  {is3DMode && cardData.imageUrl ? (
                    <div className="w-[400px] h-[560px]">
                      <Enhanced3DCardViewer
                        card={{
                          id: 'preview-card',
                          title: cardData.title,
                          description: cardData.description,
                          image_url: cardData.imageUrl,
                          rarity: cardData.rarity,
                          tags: ['preview'],
                          creator_id: 'preview-user',
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          user_id: 'preview-user',
                          template_id: cardData.frameConfig.style,
                          design_metadata: {
                            effects: effectValues
                          },
                          visibility: 'private',
                          creator_attribution: {
                            collaboration_type: 'solo'
                          },
                          publishing_options: {
                            marketplace_listing: false,
                            crd_catalog_inclusion: false,
                            print_available: false,
                            pricing: { currency: 'USD' },
                            distribution: { limited_edition: false }
                          }
                        }}
                        className="w-full h-full"
                        autoEnable={true}
                        effects={effectValues}
                        selectedFrame={cardData.frameConfig.style}
                        onModeChange={() => {}}
                        fallbackComponent={
                          <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg border border-gray-600">
                            <div className="text-center text-gray-300">
                              <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
                              <p>Loading 3D Preview...</p>
                            </div>
                          </div>
                        }
                      />
                    </div>
                  ) : (
                    <EnhancedCardRenderer
                      ref={cardRendererRef}
                      cardData={cardData}
                      width={400}
                      height={560}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
