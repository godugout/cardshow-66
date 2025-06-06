
import React from 'react';
import type { CardData } from '@/hooks/useCardEditor';
import { CardEffectsLayer } from './CardEffectsLayer';

interface CardBackProps {
  card: CardData;
  isFlipped: boolean;
  isHovering: boolean;
  showEffects: boolean;
  effectIntensity: number[];
  mousePosition: { x: number; y: number };
  physicalEffectStyles: React.CSSProperties;
  SurfaceTexture: React.ReactNode;
  effectValues?: Record<string, Record<string, number | boolean | string>>;
}

export const CardBack: React.FC<CardBackProps> = ({
  card,
  isFlipped,
  isHovering,
  showEffects,
  effectIntensity,
  mousePosition,
  physicalEffectStyles,
  SurfaceTexture,
  effectValues
}) => {
  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden">
      {/* Dark Pattern Background Base - z-index 10 */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: `
            linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)
          `,
          backgroundColor: '#0a0a0a'
        }}
      />
      
      {/* Surface Texture Layer - z-index 20 */}
      <div className="absolute inset-0 z-20">
        {SurfaceTexture}
      </div>
      
      {/* Centered CRD Logo - z-index 30 */}
      <div className="absolute inset-0 flex items-center justify-center z-30">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/7697ffa5-ac9b-428b-9bc0-35500bcb2286.png" 
            alt="CRD Logo" 
            className="w-48 h-auto opacity-90"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            }}
            onLoad={() => console.log('CardBack: CRD logo loaded successfully')}
            onError={() => console.error('CardBack: Error loading CRD logo')}
          />
        </div>
      </div>

      {/* Effects Layer - z-index 40 - Above everything else */}
      <CardEffectsLayer
        showEffects={showEffects}
        isHovering={isHovering}
        effectIntensity={effectIntensity}
        mousePosition={mousePosition}
        physicalEffectStyles={physicalEffectStyles}
        effectValues={effectValues}
      />
    </div>
  );
};
