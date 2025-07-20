import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { 
  Sparkles, 
  Waves, 
  Zap, 
  Flame, 
  Snowflake, 
  Circle 
} from 'lucide-react';
import { toast } from 'sonner';

interface Effect {
  id: string;
  name: string;
  type: 'holographic' | 'chrome' | 'glow' | 'particle' | 'distortion' | 'energy';
  icon: React.ComponentType<{ className?: string }>;
  preview: string;
  description: string;
  intensity: number;
  opacity: number;
  category: 'lighting' | 'particle' | 'distortion' | 'surface';
}

const EFFECTS: Effect[] = [
  {
    id: 'rainbow-hologram',
    name: 'Rainbow Hologram',
    type: 'holographic',
    icon: Sparkles,
    preview: 'radial-gradient(circle, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
    description: 'Shifting rainbow colors',
    intensity: 80,
    opacity: 60,
    category: 'surface'
  },
  {
    id: 'chrome-reflection',
    name: 'Chrome Reflection',
    type: 'chrome',
    icon: Circle,
    preview: 'linear-gradient(135deg, #c0c0c0, #a8a8a8, #f0f0f0)',
    description: 'Mirror-like surface',
    intensity: 90,
    opacity: 100,
    category: 'surface'
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    type: 'glow',
    icon: Zap,
    preview: 'radial-gradient(circle, #00ff88, #ff6b4a, #4a90ff)',
    description: 'Outer glow effect',
    intensity: 70,
    opacity: 80,
    category: 'lighting'
  },
  {
    id: 'floating-particles',
    name: 'Floating Particles',
    type: 'particle',
    icon: Snowflake,
    preview: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
    description: 'Ambient particle system',
    intensity: 50,
    opacity: 70,
    category: 'particle'
  },
  {
    id: 'energy-waves',
    name: 'Energy Waves',
    type: 'energy',
    icon: Waves,
    preview: 'linear-gradient(90deg, #ff6b4a, transparent, #4a90ff, transparent)',
    description: 'Pulsing energy effect',
    intensity: 60,
    opacity: 50,
    category: 'distortion'
  },
  {
    id: 'fire-aura',
    name: 'Fire Aura',
    type: 'particle',
    icon: Flame,
    preview: 'radial-gradient(circle, #ff4500, #ff8c00, #ffd700)',
    description: 'Fiery particle emission',
    intensity: 85,
    opacity: 75,
    category: 'particle'
  }
];

export const EffectsLibrary: React.FC = () => {
  const { addEffectLayer } = useAdvancedStudio();

  const applyEffect = (effect: Effect) => {
    addEffectLayer({
      type: effect.type as any,
      enabled: true,
      intensity: effect.intensity,
      opacity: effect.opacity
    });
    toast.success(`Added ${effect.name} effect`);
  };

  const getCategoryColor = (category: Effect['category']) => {
    switch (category) {
      case 'lighting': return 'text-yellow-400 bg-yellow-400/10';
      case 'particle': return 'text-green-400 bg-green-400/10';
      case 'distortion': return 'text-purple-400 bg-purple-400/10';
      case 'surface': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Effects</h3>
        <Badge variant="outline" className="text-xs">{EFFECTS.length}</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {EFFECTS.map((effect) => {
          const Icon = effect.icon;
          
          return (
            <Card 
              key={effect.id}
              className="aspect-square bg-crd-darkest border-crd-border hover:border-crd-accent cursor-pointer transition-colors group"
              onClick={() => applyEffect(effect)}
            >
              <div className="w-full h-full p-2 flex flex-col">
                {/* Effect Preview */}
                <div 
                  className="flex-1 rounded-sm mb-2 relative overflow-hidden border border-crd-border"
                  style={{ background: effect.preview }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-1 left-1">
                    <Icon className="w-3 h-3 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute top-1 right-1">
                    <Badge 
                      variant="outline" 
                      className={`text-[9px] px-1 py-0 ${getCategoryColor(effect.category)} border-none`}
                    >
                      {effect.category}
                    </Badge>
                  </div>
                </div>
                
                {/* Effect Info */}
                <div className="space-y-0.5">
                  <div className="text-[10px] font-medium text-center truncate">
                    {effect.name}
                  </div>
                  <div className="text-[9px] text-crd-text-secondary text-center truncate">
                    {effect.description}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <Button className="w-full" size="sm" variant="outline">
        Browse Effect Packs
      </Button>
    </div>
  );
};