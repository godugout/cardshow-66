
import React from 'react';
import type { CardData } from '@/hooks/useCardEditor';
import { CardImageRenderer } from './CardImageRenderer';
import { MaterialBlankCard } from './MaterialBlankCard';
import { MaterialWallpaper } from './MaterialWallpaper';
import { useEffectContext } from '../contexts/EffectContext';

interface CardFrontProps {
  card: CardData;
  isFlipped: boolean;
  frameStyles: React.CSSProperties;
  SurfaceTexture: React.ReactNode;
}

export const CardFront: React.FC<CardFrontProps> = ({
  card,
  isFlipped,
  frameStyles,
  SurfaceTexture
}) => {
  const {
    isHovering,
    showEffects,
    effectIntensity,
    mousePosition,
    effectValues,
    materialSettings
  } = useEffectContext();

  // Get current material - fallback to holographic
  const currentMaterial = 'holographic';
  
  // Convert effectValues to effects format
  const effects = {
    metallic: effectValues?.metallic?.intensity || 0,
    holographic: effectValues?.holographic?.intensity || 0,
    chrome: effectValues?.chrome?.intensity || 0,
    crystal: effectValues?.crystal?.intensity || 0,
    vintage: effectValues?.vintage?.intensity || 0,
    prismatic: effectValues?.prismatic?.intensity || 0,
    interference: effectValues?.interference?.intensity || 0,
    rainbow: effectValues?.rainbow?.intensity || 0,
    particles: false
  };

  console.log('CardFront: Rendering with card data:', {
    id: card.id,
    title: card.title,
    image_url: card.image_url,
    hasImage: !!card.image_url
  });

  return (
    <>
      {/* Material Wallpaper - Behind everything */}
      <MaterialWallpaper
        material={currentMaterial}
        effects={effects}
        mousePosition={mousePosition}
        isHovering={isHovering}
      />
      
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        {/* Card Content - z-index 30 */}
        <div className="relative h-full z-30">
          {card.image_url ? (
            <CardImageRenderer card={card} />
          ) : (
            <MaterialBlankCard
              card={card}
              material={currentMaterial}
              effects={effects}
              mousePosition={mousePosition}
              isHovering={isHovering}
            />
          )}
        </div>
      </div>
    </>
  );
};
