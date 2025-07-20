import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { Sparkles, Chrome, Gem, Palette, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Material {
  id: string;
  name: string;
  type: 'standard' | 'holographic' | 'metallic' | 'crystal' | 'matte';
  icon: React.ComponentType<{ className?: string }>;
  preview: string;
  settings: {
    metalness: number;
    roughness: number;
    transparency: number;
    emission: number;
    preset: string;
  };
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const MATERIALS: Material[] = [
  {
    id: 'standard-matte',
    name: 'Standard Matte',
    type: 'standard',
    icon: Palette,
    preview: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
    settings: {
      metalness: 0,
      roughness: 80,
      transparency: 0,
      emission: 0,
      preset: 'standard'
    },
    description: 'Clean, non-reflective finish',
    rarity: 'common'
  },
  {
    id: 'holographic-rainbow',
    name: 'Holographic',
    type: 'holographic',
    icon: Sparkles,
    preview: 'linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)',
    settings: {
      metalness: 20,
      roughness: 10,
      transparency: 0,
      emission: 30,
      preset: 'holographic'
    },
    description: 'Rainbow shimmer effect',
    rarity: 'rare'
  },
  {
    id: 'chrome-mirror',
    name: 'Chrome Mirror',
    type: 'metallic',
    icon: Chrome,
    preview: 'linear-gradient(135deg, #c0c0c0, #a8a8a8, #808080)',
    settings: {
      metalness: 100,
      roughness: 0,
      transparency: 0,
      emission: 0,
      preset: 'metallic'
    },
    description: 'Perfect mirror reflection',
    rarity: 'epic'
  },
  {
    id: 'crystal-clear',
    name: 'Crystal Glass',
    type: 'crystal',
    icon: Gem,
    preview: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3))',
    settings: {
      metalness: 0,
      roughness: 0,
      transparency: 80,
      emission: 10,
      preset: 'crystal'
    },
    description: 'Transparent glass effect',
    rarity: 'epic'
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    type: 'standard',
    icon: Zap,
    preview: 'linear-gradient(135deg, #ff0080, #ff8c00, #00ff80)',
    settings: {
      metalness: 0,
      roughness: 30,
      transparency: 0,
      emission: 80,
      preset: 'standard'
    },
    description: 'Bright emissive glow',
    rarity: 'legendary'
  },
  {
    id: 'brushed-gold',
    name: 'Brushed Gold',
    type: 'metallic',
    icon: Chrome,
    preview: 'linear-gradient(135deg, #ffd700, #ffed4e, #f1c40f)',
    settings: {
      metalness: 90,
      roughness: 40,
      transparency: 0,
      emission: 5,
      preset: 'metallic'
    },
    description: 'Luxury gold finish',
    rarity: 'rare'
  }
];

export const MaterialLibrary: React.FC = () => {
  const { updateMaterial } = useAdvancedStudio();

  const applyMaterial = (material: Material) => {
    updateMaterial(material.settings);
    toast.success(`Applied ${material.name} material`);
  };

  const getRarityColor = (rarity: Material['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 bg-gray-400/10';
      case 'rare': return 'text-blue-400 bg-blue-400/10';
      case 'epic': return 'text-purple-400 bg-purple-400/10';
      case 'legendary': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Materials</h3>
        <Badge variant="outline" className="text-xs">{MATERIALS.length}</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {MATERIALS.map((material) => {
          const Icon = material.icon;
          
          return (
            <Card 
              key={material.id}
              className="aspect-[3/4] bg-crd-darkest border-crd-border hover:border-crd-accent cursor-pointer transition-colors group"
              onClick={() => applyMaterial(material)}
            >
              <div className="w-full h-full p-2 flex flex-col">
                {/* Material Preview */}
                <div 
                  className="flex-1 rounded-sm mb-2 relative overflow-hidden border border-crd-border"
                  style={{ background: material.preview }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <Icon className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1 py-0 ${getRarityColor(material.rarity)} border-none`}
                    >
                      {material.rarity}
                    </Badge>
                  </div>
                </div>
                
                {/* Material Info */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-center truncate">
                    {material.name}
                  </div>
                  <div className="text-[10px] text-crd-text-secondary text-center truncate">
                    {material.description}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <Button className="w-full" size="sm" variant="outline">
        Browse Material Store
      </Button>
    </div>
  );
};