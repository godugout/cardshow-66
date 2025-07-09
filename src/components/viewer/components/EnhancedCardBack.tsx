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
                  ? 'drop-shadow(0 0 20px rgba(79, 255, 176, 0.5))'
                  : effects.metallic > 0.3
                  ? 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.4))'
                  : ''
                }
              `,
              transform: isHovering ? 'scale(1.08)' : 'scale(1)'
            }}
          />
          
          {/* Dynamic overlay effects based on material and effects */}
          {(material === 'holographic' || effects.holographic > 0.5) && (
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  conic-gradient(
                    from ${mousePosition.x * 360}deg at 50% 50%,
                    rgba(255, 107, 74, 0.3) 0deg,
                    rgba(79, 255, 176, 0.4) 90deg,
                    rgba(74, 144, 255, 0.3) 180deg,
                    rgba(255, 107, 74, 0.3) 270deg
                  )
                `,
                opacity: isHovering ? 0.7 : 0.4,
                transition: 'opacity 0.3s ease',
                mixBlendMode: 'screen'
              }}
            />
          )}

          {/* Prismatic rainbow effect */}
          {effects.prismatic > 0.3 && (
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(
                    ${mousePosition.x * 180}deg,
                    rgba(255, 0, 128, ${effects.prismatic * 0.3}) 0%,
                    rgba(0, 255, 255, ${effects.prismatic * 0.3}) 25%,
                    rgba(255, 255, 0, ${effects.prismatic * 0.3}) 50%,
                    rgba(255, 0, 255, ${effects.prismatic * 0.3}) 75%,
                    rgba(0, 255, 128, ${effects.prismatic * 0.3}) 100%
                  )
                `,
                mixBlendMode: 'overlay',
                transform: `scale(${1 + effects.prismatic * 0.1})`
              }}
            />
          )}
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