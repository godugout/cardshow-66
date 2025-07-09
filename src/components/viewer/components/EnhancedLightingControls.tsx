import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sun, Moon, Zap, Snowflake, Crown } from 'lucide-react';
import { CardSide } from '../EnhancedCardContainer';

interface EnhancedLightingControlsProps {
  currentSide: CardSide;
  isFlipped: boolean;
  onUpdateSide: (side: 'front' | 'back', updates: Partial<CardSide>) => void;
}

const environments = [
  { id: 'studio', name: 'Studio', icon: Lightbulb, description: 'Professional lighting' },
  { id: 'cosmic', name: 'Cosmic', icon: Moon, description: 'Space-like environment' },
  { id: 'golden', name: 'Golden', icon: Crown, description: 'Warm golden tones' },
  { id: 'ice', name: 'Ice', icon: Snowflake, description: 'Cool blue lighting' }
];

const lightingPresets = [
  { name: 'Soft', intensity: 0.4, color: '#ffffff' },
  { name: 'Bright', intensity: 0.8, color: '#ffffff' },
  { name: 'Warm', intensity: 0.6, color: '#ffaa44' },
  { name: 'Cool', intensity: 0.6, color: '#44aaff' },
  { name: 'Neon', intensity: 0.9, color: '#ff4499' },
  { name: 'Electric', intensity: 0.7, color: '#44ff88' }
];

export const EnhancedLightingControls: React.FC<EnhancedLightingControlsProps> = ({
  currentSide,
  isFlipped,
  onUpdateSide
}) => {
  const sideType = isFlipped ? 'back' : 'front';

  const updateLighting = (updates: Partial<CardSide['lighting']>) => {
    onUpdateSide(sideType, {
      lighting: {
        ...currentSide.lighting,
        ...updates
      }
    });
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  return (
    <div className="space-y-4">
      {/* Environment Selection */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Sun className="w-4 h-4" />
          Environment
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          {environments.map((env) => {
            const Icon = env.icon;
            return (
              <Button
                key={env.id}
                variant={currentSide.lighting.environment === env.id ? "default" : "outline"}
                size="sm"
                onClick={() => updateLighting({ environment: env.id })}
                className="flex flex-col h-auto p-3"
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-xs">{env.name}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Intensity Control */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Light Intensity
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Intensity</span>
            <Badge variant="outline" className="text-xs">
              {Math.round(currentSide.lighting.intensity * 100)}%
            </Badge>
          </div>
          
          <Slider
            value={[currentSide.lighting.intensity]}
            onValueChange={([value]) => updateLighting({ intensity: value })}
            max={1}
            min={0}
            step={0.01}
            className="w-full"
          />
        </div>
      </Card>

      {/* Color Control */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Light Color
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={currentSide.lighting.color}
              onChange={(e) => updateLighting({ color: e.target.value })}
              className="w-12 h-8 rounded border cursor-pointer"
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{currentSide.lighting.color}</div>
              <div className="text-xs text-muted-foreground">
                {hexToHsl(currentSide.lighting.color)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Direction Control */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Light Direction</h4>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Horizontal</span>
              <Badge variant="outline" className="text-xs">
                {Math.round(currentSide.lighting.direction.x * 100)}%
              </Badge>
            </div>
            <Slider
              value={[currentSide.lighting.direction.x]}
              onValueChange={([value]) => updateLighting({ 
                direction: { ...currentSide.lighting.direction, x: value }
              })}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Vertical</span>
              <Badge variant="outline" className="text-xs">
                {Math.round(currentSide.lighting.direction.y * 100)}%
              </Badge>
            </div>
            <Slider
              value={[currentSide.lighting.direction.y]}
              onValueChange={([value]) => updateLighting({ 
                direction: { ...currentSide.lighting.direction, y: value }
              })}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Lighting Presets */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Quick Presets</h4>
        
        <div className="grid grid-cols-2 gap-2">
          {lightingPresets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => updateLighting({
                intensity: preset.intensity,
                color: preset.color
              })}
              className="text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};