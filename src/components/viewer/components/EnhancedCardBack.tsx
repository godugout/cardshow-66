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
            src="/crd-logo-gradient.png" 
            alt="CRD Logo" 
            className="w-48 h-auto opacity-80 transition-all duration-500"
            style={{
              filter: material === 'holographic' 
                ? 'hue-rotate(180deg) saturate(150%)' 
                : material === 'metallic'
                ? 'sepia(100%) hue-rotate(45deg) saturate(200%)'
                : 'none',
              transform: isHovering ? 'scale(1.05)' : 'scale(1)'
            }}
          />
          
          {/* Dynamic overlay effects */}
          {material === 'holographic' && (
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  conic-gradient(
                    from ${mousePosition.x * 360}deg at 50% 50%,
                    rgba(255, 0, 128, 0.3) 0deg,
                    rgba(0, 255, 255, 0.3) 90deg,
                    rgba(255, 255, 0, 0.3) 180deg,
                    rgba(255, 0, 128, 0.3) 270deg
                  )
                `,
                opacity: isHovering ? 0.6 : 0.3,
                transition: 'opacity 0.3s ease',
                mixBlendMode: 'screen'
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
      
      {/* Brand Text */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-30">
        <div className="text-white/80 font-bold text-lg tracking-wider">
          CARDSHOW
        </div>
        <div className="text-white/60 text-sm tracking-widest">
          DIGITAL COLLECTIBLES
        </div>
      </div>
    </div>
  );
};