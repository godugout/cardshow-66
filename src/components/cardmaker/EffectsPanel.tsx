import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Palette, Eye, EyeOff, Trash2, Plus } from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'effect' | 'frame';
  visible: boolean;
  locked: boolean;
  opacity: number;
  data: any;
}

interface EffectsPanelProps {
  layers: Layer[];
  onAddLayer: (type: Layer['type']) => void;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
  layers,
  onAddLayer,
  onUpdateLayer
}) => {
  const effectLayers = layers.filter(layer => layer.type === 'effect');

  const toggleLayerVisibility = (layerId: string, visible: boolean) => {
    onUpdateLayer(layerId, { visible });
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    onUpdateLayer(layerId, { opacity: opacity / 100 });
  };

  return (
    <div className="space-y-4">
      {/* Add Effects */}
      <div>
        <Label className="text-sm font-medium">Add Effects</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddLayer('effect')}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Sparkle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddLayer('effect')}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Glow
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddLayer('effect')}
            className="flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Color
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddLayer('effect')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Custom
          </Button>
        </div>
      </div>

      <Separator />

      {/* Layer List */}
      <div>
        <Label className="text-sm font-medium">Effects Layers</Label>
        <ScrollArea className="h-48 mt-2">
          {effectLayers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No effects added yet</p>
              <p className="text-xs">Add effects to enhance your card</p>
            </div>
          ) : (
            <div className="space-y-3">
              {effectLayers.map((layer) => (
                <div key={layer.id} className="bg-muted rounded-lg p-3 space-y-3">
                  {/* Layer Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Effect
                      </Badge>
                      <span className="text-sm font-medium">{layer.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleLayerVisibility(layer.id, !layer.visible)}
                        className="h-6 w-6 p-0"
                      >
                        {layer.visible ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Opacity Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Opacity</Label>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(layer.opacity * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[layer.opacity * 100]}
                      onValueChange={([value]) => updateLayerOpacity(layer.id, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Effect-specific controls would go here */}
                  <div className="space-y-2">
                    <Label className="text-xs">Effect Settings</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch id={`intensity-${layer.id}`} />
                        <Label htmlFor={`intensity-${layer.id}`} className="text-xs">
                          Intensity
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id={`animation-${layer.id}`} />
                        <Label htmlFor={`animation-${layer.id}`} className="text-xs">
                          Animate
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Quick Presets */}
      <div>
        <Label className="text-sm font-medium">Effect Presets</Label>
        <div className="grid grid-cols-1 gap-2 mt-2">
          <Button variant="outline" size="sm" className="justify-start">
            ✨ Magical Sparkles
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            🌟 Golden Glow
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            🔥 Fire Aura
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            ❄️ Ice Crystal
          </Button>
        </div>
      </div>
    </div>
  );
};