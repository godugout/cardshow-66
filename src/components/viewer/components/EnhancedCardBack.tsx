import React from 'react';
import type { CardData } from '@/types/card';
import { CRDFrameRenderer } from '@/components/frames/crd/CRDFrameRenderer';
import { getCRDFrameById } from '@/data/crdFrames';
import { CardEdgeEffects } from './CardEdgeEffects';
import { AdvancedMaterialSystem } from './AdvancedMaterialSystem';
import { InteractiveLightingEngine } from './InteractiveLightingEngine';

interface EnhancedCardBackProps {
  card: CardData;
  frameId: string;
  effects: {
    metallic: number;
    holographic: number;
    chrome: number;
    crystal: number;
    vintage: number;
    prismatic: number;
    interference: number;
    rainbow: number;
    particles: boolean;
  };
  material: string;
  lighting: {
    intensity: number;
    direction: { x: number; y: number };
    color: string;
    environment: string;
  };
  mousePosition: { x: number; y: number };
  isHovering: boolean;
  width: number;
  height: number;
}

export const EnhancedCardBack: React.FC<EnhancedCardBackProps> = ({
  card,
  frameId,
  effects,
  material,
  lighting,
  mousePosition,
  isHovering,
  width,
  height
}) => {
  const frame = getCRDFrameById(frameId);

  return (
    <div className="relative w-full h-full">
      {/* Advanced Material System */}
      <AdvancedMaterialSystem 
        material={material}
        effects={effects}
        mousePosition={mousePosition}
        isHovering={isHovering}
      />
      
      {/* Interactive Lighting */}
      <InteractiveLightingEngine
        settings={lighting}
        mousePosition={mousePosition}
        isHovering={isHovering}
      />
      
      {/* CRD Logo Background */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative">
          <img 
            src="/lovable-uploads/a2e42b8d-b599-4b62-b4ba-a722db42c429.png" 
            alt="CRD Logo" 
            className="w-56 h-auto opacity-90 transition-all duration-500"
            style={{
              filter: `
                ${material === 'holographic' 
                  ? 'hue-rotate(180deg) saturate(150%) brightness(1.2)' 
                  : material === 'metallic'
                  ? 'sepia(100%) hue-rotate(45deg) saturate(200%) brightness(1.1)'
                  : material === 'crystal'
                  ? 'brightness(1.3) contrast(1.1)'
                  : 'brightness(1.1)'
                }
                ${effects.holographic > 0.3 
                  ? 'blur(0.5px) drop-shadow(0 0 20px rgba(79, 255, 176, 0.5))'
                  : effects.metallic > 0.3
                  ? 'blur(0.3px) drop-shadow(0 0 15px rgba(255, 215, 0, 0.4))'
                  : effects.prismatic > 0.3
                  ? 'blur(0.8px)'
                  : ''
                }
              `,
              transform: isHovering ? 'scale(1.08)' : 'scale(1)',
              mixBlendMode: 'normal'
            }}
          />
        </div>
      </div>
      
      {/* Frame Elements (if any) */}
      {frame && (
        <div className="absolute inset-0 z-20">
          <CRDFrameRenderer
            frame={frame}
            userImage={undefined} // No user image on back
            width={width}
            height={height}
            className="opacity-60"
          />
        </div>
      )}
      
      {/* Card Edge Effects */}
      <CardEdgeEffects
        effects={effects}
        material={material}
        lighting={lighting}
        mousePosition={mousePosition}
        isHovering={isHovering}
      />
      
    </div>
  );
};