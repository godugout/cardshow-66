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
            className="w-64 h-auto opacity-90 transition-all duration-500"
            style={{
              filter: material === 'holographic' 
                ? 'hue-rotate(180deg) saturate(200%) brightness(1.2)' 
                : material === 'metallic'
                ? 'sepia(100%) hue-rotate(45deg) saturate(250%) brightness(1.1)'
                : material === 'chrome'
                ? 'grayscale(20%) contrast(150%) brightness(1.3)'
                : material === 'crystal'
                ? 'saturate(180%) brightness(1.2) contrast(120%)'
                : 'saturate(120%) brightness(1.1)',
              transform: isHovering ? 'scale(1.1)' : 'scale(1)'
            }}
          />
          
          {/* Material-specific overlay effects */}
          {material === 'holographic' && (
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  conic-gradient(
                    from ${mousePosition.x * 360}deg at 50% 50%,
                    rgba(255, 107, 74, 0.4) 0deg,
                    rgba(79, 255, 176, 0.4) 90deg,
                    rgba(74, 144, 255, 0.4) 180deg,
                    rgba(255, 107, 74, 0.4) 270deg
                  )
                `,
                opacity: isHovering ? 0.8 : 0.5,
                transition: 'opacity 0.3s ease',
                mixBlendMode: 'screen'
              }}
            />
          )}
          
          {material === 'metallic' && (
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(${mousePosition.x * 180}deg, 
                  rgba(255, 215, 0, 0.4), 
                  rgba(255, 165, 0, 0.3), 
                  rgba(255, 215, 0, 0.4))`,
                opacity: isHovering ? 0.7 : 0.4,
                transition: 'opacity 0.3s ease',
                mixBlendMode: 'multiply'
              }}
            />
          )}
          
          {material === 'chrome' && (
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(${mousePosition.y * 180}deg, 
                  rgba(192, 192, 192, 0.5), 
                  rgba(220, 220, 220, 0.3), 
                  rgba(192, 192, 192, 0.5))`,
                opacity: isHovering ? 0.8 : 0.5,
                transition: 'opacity 0.3s ease',
                mixBlendMode: 'overlay'
              }}
            />
          )}
          
          {material === 'crystal' && (
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
                  rgba(79, 255, 176, 0.4) 0%, 
                  rgba(74, 144, 255, 0.3) 50%, 
                  transparent 70%)`,
                opacity: isHovering ? 0.9 : 0.6,
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