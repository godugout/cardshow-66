
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Lightbulb, 
  Play, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';

interface StudioControlPanelsProps {
  mode: 'basic' | 'pro' | 'theme-builder';
  preset?: 'animation-studio' | 'fx-studio' | 'scene-studio';
}

export const StudioControlPanels: React.FC<StudioControlPanelsProps> = ({
  mode,
  preset
}) => {
  const { state, updateMaterial, updateLighting, updateAnimation } = useAdvancedStudio();
  const [activeTab, setActiveTab] = useState('material');

  const materialPresets = [
    { id: 'standard', name: 'Standard', color: '#888888' },
    { id: 'metallic', name: 'Metallic', color: '#C0C0C0' },
    { id: 'holographic', name: 'Holographic', color: '#FF6B9D' },
    { id: 'crystal', name: 'Crystal', color: '#4FFFB0' },
    { id: 'matte', name: 'Matte', color: '#666666' }
  ];

  const lightingPresets = [
    { id: 'studio', name: 'Studio', icon: '💡' },
    { id: 'dramatic', name: 'Dramatic', icon: '🎭' },
    { id: 'sunset', name: 'Sunset', icon: '🌅' },
    { id: 'neon', name: 'Neon', icon: '🌈' },
    { id: 'soft', name: 'Soft', icon: '☁️' }
  ];

  const animationPresets = [
    { id: 'none', name: 'Static', icon: '⏸️' },
    { id: 'rotate', name: 'Rotate', icon: '🔄' },
    { id: 'float', name: 'Float', icon: '🎈' },
    { id: 'pulse', name: 'Pulse', icon: '💓' },
    { id: 'bounce', name: 'Bounce', icon: '⬆️' }
  ];

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-crd-darker">
          <TabsTrigger value="material" className="text-xs">
            <Palette className="w-3 h-3 mr-1" />
            Material
          </TabsTrigger>
          <TabsTrigger value="lighting" className="text-xs">
            <Lightbulb className="w-3 h-3 mr-1" />
            Lighting
          </TabsTrigger>
          <TabsTrigger value="animation" className="text-xs">
            <Play className="w-3 h-3 mr-1" />
            Animation
          </TabsTrigger>
          <TabsTrigger value="effects" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Effects
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <TabsContent value="material" className="mt-0 space-y-4">
            <Card className="bg-crd-darker border-crd-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Material Presets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {materialPresets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant={state.material.preset === preset.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateMaterial({ preset: preset.id })}
                      className="justify-start"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: preset.color }}
                      />
                      {preset.name}
                    </Button>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-white text-xs mb-2 block">Metalness</label>
                    <Slider
                      value={[state.material.metalness]}
                      onValueChange={([value]) => updateMaterial({ metalness: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white text-xs mb-2 block">Roughness</label>
                    <Slider
                      value={[state.material.roughness]}
                      onValueChange={([value]) => updateMaterial({ roughness: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lighting" className="mt-0 space-y-4">
            <Card className="bg-crd-darker border-crd-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Lighting Presets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {lightingPresets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant={state.lighting.preset === preset.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateLighting({ preset: preset.id })}
                      className="justify-start"
                    >
                      <span className="mr-2">{preset.icon}</span>
                      {preset.name}
                    </Button>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-white text-xs mb-2 block">Intensity</label>
                    <Slider
                      value={[state.lighting.intensity]}
                      onValueChange={([value]) => updateLighting({ intensity: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white text-xs mb-2 block">Ambient Light</label>
                    <Slider
                      value={[state.lighting.ambientLight]}
                      onValueChange={([value]) => updateLighting({ ambientLight: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="animation" className="mt-0 space-y-4">
            <Card className="bg-crd-darker border-crd-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Animation Presets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {animationPresets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant={state.animation.preset === preset.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateAnimation({ preset: preset.id })}
                      className="justify-start"
                    >
                      <span className="mr-2">{preset.icon}</span>
                      {preset.name}
                    </Button>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-white text-xs mb-2 block">Speed</label>
                    <Slider
                      value={[state.animation.speed]}
                      onValueChange={([value]) => updateAnimation({ speed: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white text-xs mb-2 block">Amplitude</label>
                    <Slider
                      value={[state.animation.amplitude]}
                      onValueChange={([value]) => updateAnimation({ amplitude: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="effects" className="mt-0 space-y-4">
            <Card className="bg-crd-darker border-crd-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Effect Layers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {state.effectLayers.length === 0 ? (
                    <div className="text-crd-text-secondary text-sm text-center py-4">
                      No effect layers added
                    </div>
                  ) : (
                    state.effectLayers.map((layer) => (
                      <div key={layer.id} className="flex items-center justify-between p-2 bg-crd-dark rounded">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-crd-text-secondary" />
                          <span className="text-white text-sm">{layer.type}</span>
                          <Badge variant="outline" className="text-xs">
                            {layer.enabled ? 'On' : 'Off'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
