import React, { useState } from 'react';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Lightbulb, 
  Palette, 
  Play, 
  Eye,
  Layers,
  X,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

export const StudioPropertiesPanel: React.FC = () => {
  const { 
    state, 
    updateMaterial, 
    updateLighting, 
    updateAnimation, 
    updateEnvironment,
    addEffectLayer,
    updateEffectLayer,
    removeEffectLayer
  } = useAdvancedStudio();

  const [activeTab, setActiveTab] = useState('material');

  const materialPresets = [
    { id: 'standard', name: 'Standard', description: 'Basic material' },
    { id: 'holographic', name: 'Holographic', description: 'Rainbow shimmer effect' },
    { id: 'metallic', name: 'Metallic', description: 'Chrome-like finish' },
    { id: 'crystal', name: 'Crystal', description: 'Glass transparency' },
    { id: 'matte', name: 'Matte', description: 'Non-reflective surface' }
  ];

  const lightingPresets = [
    { id: 'studio', name: 'Studio', description: 'Even lighting' },
    { id: 'dramatic', name: 'Dramatic', description: 'High contrast' },
    { id: 'soft', name: 'Soft', description: 'Gentle shadows' },
    { id: 'neon', name: 'Neon', description: 'Colorful glow' }
  ];

  const animationPresets = [
    { id: 'none', name: 'Static', description: 'No animation' },
    { id: 'rotate', name: 'Rotate', description: 'Spinning motion' },
    { id: 'float', name: 'Float', description: 'Floating motion' },
    { id: 'pulse', name: 'Pulse', description: 'Breathing effect' }
  ];

  const effectTypes = [
    { id: 'holographic', name: 'Holographic', description: 'Rainbow shimmer' },
    { id: 'chrome', name: 'Chrome', description: 'Metallic reflection' },
    { id: 'glow', name: 'Glow', description: 'Outer glow effect' },
    { id: 'particle', name: 'Particle', description: 'Floating particles' },
    { id: 'distortion', name: 'Distortion', description: 'Wave distortion' }
  ];

  const handlePresetChange = (category: string, presetId: string) => {
    switch (category) {
      case 'material':
        updateMaterial({ preset: presetId });
        break;
      case 'lighting':
        updateLighting({ preset: presetId });
        break;
      case 'animation':
        updateAnimation({ preset: presetId });
        break;
    }
    toast.success(`Applied ${presetId} preset`);
  };

  const handleAddEffect = (effectType: string) => {
    addEffectLayer({
      type: effectType as any,
      enabled: true,
      intensity: 50,
      opacity: 100
    });
    toast.success(`Added ${effectType} effect`);
  };

  return (
    <div className="w-80 bg-crd-dark border-l border-crd-border h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-crd-border">
        <h2 className="text-crd-text text-lg font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Properties
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-crd-darker">
            <TabsTrigger value="material" className="text-xs">
              <Palette className="w-3 h-3 mr-1" />
              Material
            </TabsTrigger>
            <TabsTrigger value="lighting" className="text-xs">
              <Lightbulb className="w-3 h-3 mr-1" />
              Light
            </TabsTrigger>
            <TabsTrigger value="animation" className="text-xs">
              <Play className="w-3 h-3 mr-1" />
              Anim
            </TabsTrigger>
            <TabsTrigger value="effects" className="text-xs">
              <Layers className="w-3 h-3 mr-1" />
              FX
            </TabsTrigger>
          </TabsList>

          <TabsContent value="material" className="p-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-crd-text">Preset</Label>
              <Select 
                value={state.material.preset} 
                onValueChange={(value) => handlePresetChange('material', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {materialPresets.map(preset => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-crd-text-secondary">{preset.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm text-crd-text">Metalness: {state.material.metalness}%</Label>
                <Slider
                  value={[state.material.metalness]}
                  onValueChange={([value]) => updateMaterial({ metalness: value })}
                  max={100}
                  step={1}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm text-crd-text">Roughness: {state.material.roughness}%</Label>
                <Slider
                  value={[state.material.roughness]}
                  onValueChange={([value]) => updateMaterial({ roughness: value })}
                  max={100}
                  step={1}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm text-crd-text">Transparency: {state.material.transparency}%</Label>
                <Slider
                  value={[state.material.transparency]}
                  onValueChange={([value]) => updateMaterial({ transparency: value })}
                  max={100}
                  step={1}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm text-crd-text">Emission: {state.material.emission}%</Label>
                <Slider
                  value={[state.material.emission]}
                  onValueChange={([value]) => updateMaterial({ emission: value })}
                  max={100}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lighting" className="p-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-crd-text">Preset</Label>
              <Select 
                value={state.lighting.preset} 
                onValueChange={(value) => handlePresetChange('lighting', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lightingPresets.map(preset => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-crd-text-secondary">{preset.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm text-crd-text">Ambient Light: {state.lighting.ambientLight}%</Label>
                <Slider
                  value={[state.lighting.ambientLight]}
                  onValueChange={([value]) => updateLighting({ ambientLight: value })}
                  max={100}
                  step={1}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm text-crd-text">Intensity: {state.lighting.intensity}%</Label>
                <Slider
                  value={[state.lighting.intensity]}
                  onValueChange={([value]) => updateLighting({ intensity: value })}
                  max={100}
                  step={1}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm text-crd-text">Shadow: {state.lighting.shadowIntensity}%</Label>
                <Slider
                  value={[state.lighting.shadowIntensity]}
                  onValueChange={([value]) => updateLighting({ shadowIntensity: value })}
                  max={100}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="animation" className="p-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-crd-text">Preset</Label>
              <Select 
                value={state.animation.preset} 
                onValueChange={(value) => handlePresetChange('animation', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {animationPresets.map(preset => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-crd-text-secondary">{preset.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-crd-text">Playing</Label>
              <Switch
                checked={state.animation.isPlaying}
                onCheckedChange={(checked) => updateAnimation({ isPlaying: checked })}
              />
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm text-crd-text">Speed: {state.animation.speed}%</Label>
                <Slider
                  value={[state.animation.speed]}
                  onValueChange={([value]) => updateAnimation({ speed: value })}
                  max={200}
                  min={10}
                  step={10}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm text-crd-text">Amplitude: {state.animation.amplitude}%</Label>
                <Slider
                  value={[state.animation.amplitude]}
                  onValueChange={([value]) => updateAnimation({ amplitude: value })}
                  max={100}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effects" className="p-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-crd-text mb-2 block">Add Effect</Label>
              <div className="grid grid-cols-2 gap-2">
                {effectTypes.map(effect => (
                  <Button
                    key={effect.id}
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddEffect(effect.id)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {effect.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-crd-text">Active Effects</Label>
              {state.effectLayers.length === 0 ? (
                <p className="text-sm text-crd-text-secondary">No effects applied</p>
              ) : (
                state.effectLayers.map(layer => (
                  <Card key={layer.id} className="p-3 bg-crd-darker border-crd-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={layer.enabled}
                          onCheckedChange={(checked) => updateEffectLayer(layer.id, { enabled: checked })}
                        />
                        <span className="text-sm font-medium text-crd-text capitalize">{layer.type}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeEffectLayer(layer.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-crd-text-secondary">Intensity: {layer.intensity}%</Label>
                        <Slider
                          value={[layer.intensity]}
                          onValueChange={([value]) => updateEffectLayer(layer.id, { intensity: value })}
                          max={100}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-crd-text-secondary">Opacity: {layer.opacity}%</Label>
                        <Slider
                          value={[layer.opacity]}
                          onValueChange={([value]) => updateEffectLayer(layer.id, { opacity: value })}
                          max={100}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};