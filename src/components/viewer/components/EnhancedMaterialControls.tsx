import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Chrome, Gem, Clock, Palette, Rainbow, Snowflake } from 'lucide-react';
import { CardSide } from '../EnhancedCardContainer';

interface EnhancedMaterialControlsProps {
  currentSide: CardSide;
  isFlipped: boolean;
  onUpdateSide: (side: 'front' | 'back', updates: Partial<CardSide>) => void;
}

const materialTypes = [
  { id: 'standard', name: 'Standard', icon: Palette },
  { id: 'holographic', name: 'Holographic', icon: Sparkles },
  { id: 'metallic', name: 'Metallic', icon: Zap },
  { id: 'chrome', name: 'Chrome', icon: Chrome },
  { id: 'crystal', name: 'Crystal', icon: Gem }
];

const effectControls = [
  { key: 'metallic', name: 'Metallic', icon: Zap, color: 'text-yellow-500' },
  { key: 'holographic', name: 'Holographic', icon: Sparkles, color: 'text-cyan-500' },
  { key: 'chrome', name: 'Chrome', icon: Chrome, color: 'text-gray-400' },
  { key: 'crystal', name: 'Crystal', icon: Gem, color: 'text-blue-500' },
  { key: 'vintage', name: 'Vintage', icon: Clock, color: 'text-amber-600' },
  { key: 'prismatic', name: 'Prismatic', icon: Rainbow, color: 'text-pink-500' },
  { key: 'interference', name: 'Interference', icon: Snowflake, color: 'text-purple-500' },
  { key: 'rainbow', name: 'Rainbow', icon: Rainbow, color: 'text-rose-500' }
];

export const EnhancedMaterialControls: React.FC<EnhancedMaterialControlsProps> = ({
  currentSide,
  isFlipped,
  onUpdateSide
}) => {
  const sideType = isFlipped ? 'back' : 'front';

  const updateEffect = (effectKey: string, value: number) => {
    onUpdateSide(sideType, {
      effects: {
        ...currentSide.effects,
        [effectKey]: value
      }
    });
  };

  const updateParticles = (enabled: boolean) => {
    onUpdateSide(sideType, {
      effects: {
        ...currentSide.effects,
        particles: enabled
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Material Type Selection */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Material Type
        </h4>
        
        <div className="grid grid-cols-1 gap-2">
          {materialTypes.map((material) => {
            const Icon = material.icon;
            return (
              <Button
                key={material.id}
                variant={currentSide.material === material.id ? "default" : "outline"}
                size="sm"
                onClick={() => onUpdateSide(sideType, { material: material.id })}
                className="justify-start"
              >
                <Icon className="w-4 h-4 mr-2" />
                {material.name}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Effect Sliders */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Effect Intensity
        </h4>
        
        <div className="space-y-4">
          {effectControls.map((effect) => {
            const Icon = effect.icon;
            const value = currentSide.effects[effect.key as keyof typeof currentSide.effects];
            const numValue = typeof value === 'number' ? value : 0;
            
            return (
              <div key={effect.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${effect.color}`} />
                    <span className="text-sm font-medium">{effect.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(numValue * 100)}%
                  </Badge>
                </div>
                
                <Slider
                  value={[numValue]}
                  onValueChange={([newValue]) => updateEffect(effect.key, newValue)}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>
            );
          })}
          
          {/* Particles Toggle */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium">Particle Effects</span>
            </div>
            <Switch
              checked={currentSide.effects.particles}
              onCheckedChange={updateParticles}
            />
          </div>
        </div>
      </Card>

      {/* Preset Combinations */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Effect Presets</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateSide(sideType, {
              effects: { ...currentSide.effects, holographic: 0.8, prismatic: 0.6, particles: true }
            })}
          >
            🌈 Rainbow
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateSide(sideType, {
              effects: { ...currentSide.effects, metallic: 0.9, chrome: 0.7, particles: false }
            })}
          >
            ⚡ Metallic
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateSide(sideType, {
              effects: { ...currentSide.effects, crystal: 0.8, interference: 0.5, particles: true }
            })}
          >
            💎 Crystal
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateSide(sideType, {
              effects: { ...currentSide.effects, vintage: 0.7, metallic: 0.3, particles: false }
            })}
          >
            🕰️ Vintage
          </Button>
        </div>
      </Card>
    </div>
  );
};