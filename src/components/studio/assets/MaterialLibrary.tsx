import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { toast } from 'sonner';

interface Material {
  id: string;
  name: string;
  preset: string;
  metalness: number;
  roughness: number;
  emission: number;
  transparency: number;
  preview: string;
}

const MATERIALS: Material[] = [
  {
    id: 'metallic',
    name: 'Metallic',
    preset: 'metallic',
    metalness: 90,
    roughness: 10,
    emission: 0,
    transparency: 0,
    preview: 'linear-gradient(135deg, #C0C0C0, #808080)'
  },
  {
    id: 'chrome',
    name: 'Chrome',
    preset: 'chrome',
    metalness: 100,
    roughness: 5,
    emission: 0,
    transparency: 0,
    preview: 'linear-gradient(135deg, #E8E8E8, #A0A0A0)'
  },
  {
    id: 'holographic',
    name: 'Holographic',
    preset: 'holographic',
    metalness: 30,
    roughness: 10,
    emission: 20,
    transparency: 0,
    preview: 'linear-gradient(135deg, #FF6B4A, #4FFFB0, #4A90FF)'
  },
  {
    id: 'crystal',
    name: 'Crystal',
    preset: 'crystal',
    metalness: 0,
    roughness: 0,
    emission: 0,
    transparency: 60,
    preview: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(200,255,255,0.6))'
  },
  {
    id: 'matte',
    name: 'Matte',
    preset: 'standard',
    metalness: 0,
    roughness: 90,
    emission: 0,
    transparency: 0,
    preview: 'linear-gradient(135deg, #3A3A3A, #2A2A2A)'
  },
  {
    id: 'gold',
    name: 'Gold',
    preset: 'metallic',
    metalness: 85,
    roughness: 15,
    emission: 5,
    transparency: 0,
    preview: 'linear-gradient(135deg, #FFD700, #B8860B)'
  }
];

export const MaterialLibrary: React.FC = () => {
  const { updateMaterial } = useAdvancedStudio();

  const applyMaterial = (material: Material) => {
    updateMaterial({
      preset: material.preset,
      metalness: material.metalness,
      roughness: material.roughness,
      emission: material.emission,
      transparency: material.transparency
    });
    
    toast.success(`Applied ${material.name} material`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Materials</h3>
        <Badge variant="outline" className="text-xs">{MATERIALS.length}</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {MATERIALS.map((material) => (
          <Card 
            key={material.id}
            className="aspect-square bg-crd-darkest border-crd-border hover:border-crd-accent cursor-pointer transition-colors group"
            onClick={() => applyMaterial(material)}
          >
            <div className="w-full h-full p-2 flex flex-col">
              {/* Material Preview */}
              <div 
                className="flex-1 rounded-sm mb-2"
                style={{ 
                  background: material.preview,
                  boxShadow: material.name === 'Chrome' ? 'inset 0 2px 8px rgba(255,255,255,0.3)' : 'none'
                }}
              />
              
              {/* Material Info */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-center">{material.name}</div>
                <div className="flex justify-center gap-1">
                  {material.metalness > 50 && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">Metal</Badge>
                  )}
                  {material.transparency > 30 && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">Glass</Badge>
                  )}
                  {material.emission > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">Glow</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <Button className="w-full" size="sm" variant="outline">
        Import Custom Material
      </Button>
    </div>
  );
};