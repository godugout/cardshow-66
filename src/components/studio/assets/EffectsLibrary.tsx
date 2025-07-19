import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { Sparkles, Zap, Flame, Droplets, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Effect {
  id: string;
  name: string;
  type: 'glow' | 'particle' | 'holographic' | 'chrome' | 'distortion';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  intensity: number;
  opacity: number;
  parameters: Record<string, any>;
}

const EFFECTS: Effect[] = [
  {
    id: 'glow',
    name: 'Glow',
    type: 'glow',
    description: 'Soft outer glow effect',
    icon: Sparkles,
    intensity: 60,
    opacity: 80,
    parameters: { 
      color: '#4ade80',
      radius: 10,
      strength: 2
    }
  },
  {
    id: 'electric',
    name: 'Electric',
    type: 'particle',
    description: 'Electric particle system',
    icon: Zap,
    intensity: 70,
    opacity: 90,
    parameters: { 
      particleCount: 50,
      speed: 2,
      color: '#3b82f6'
    }
  },
  {
    id: 'fire',
    name: 'Fire',
    type: 'particle',
    description: 'Fire particle effect',
    icon: Flame,
    intensity: 80,
    opacity: 85,
    parameters: { 
      particleCount: 100,
      heat: 0.8,
      color1: '#ff4500',
      color2: '#ffd700'
    }
  },
  {
    id: 'hologram',
    name: 'Hologram',
    type: 'holographic',
    description: 'Holographic shimmer',
    icon: Star,
    intensity: 50,
    opacity: 70,
    parameters: { 
      shimmerSpeed: 1.5,
      colorShift: true,
      scanlines: true
    }
  },
  {
    id: 'liquid',
    name: 'Liquid',
    type: 'distortion',
    description: 'Liquid distortion effect',
    icon: Droplets,
    intensity: 40,
    opacity: 60,
    parameters: { 
      viscosity: 0.8,
      flow: 1.0,
      color: '#06b6d4'
    }
  }
];

export const EffectsLibrary: React.FC = () => {
  const { addEffectLayer } = useAdvancedStudio();

  const applyEffect = (effect: Effect) => {
    addEffectLayer({
      type: effect.type,
      enabled: true,
      intensity: effect.intensity,
      opacity: effect.opacity,
      blendMode: 'normal',
      parameters: effect.parameters
    });
    
    toast.success(`Applied ${effect.name} effect`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Effects</h3>
        <Badge variant="outline" className="text-xs">{EFFECTS.length}</Badge>
      </div>
      
      <div className="space-y-2">
        {EFFECTS.map((effect) => {
          const Icon = effect.icon;
          
          return (
            <Card 
              key={effect.id}
              className="p-3 bg-crd-darkest border-crd-border hover:border-crd-accent cursor-pointer transition-colors group"
              onClick={() => applyEffect(effect)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-crd-accent/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-crd-accent" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{effect.name}</div>
                  <div className="text-xs text-crd-text-secondary truncate">
                    {effect.description}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    {effect.intensity}%
                  </Badge>
                  <div className="text-xs text-crd-text-secondary">
                    {effect.type}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <Button className="w-full" size="sm" variant="outline">
        Create Custom Effect
      </Button>
    </div>
  );
};