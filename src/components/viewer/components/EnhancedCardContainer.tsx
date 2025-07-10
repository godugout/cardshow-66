
import React from 'react';
import type { CardData } from '@/hooks/useCardEditor';
import { CardImageRenderer } from './CardImageRenderer';
import { MaterialBlankCard } from './MaterialBlankCard';
import { MaterialWallpaper } from './MaterialWallpaper';

interface EnhancedCardContainerProps {
  card: CardData;
  isFlipped: boolean;
  rotation: { x: number; y: number };
  zoom: number;
  isDragging: boolean;
  frameStyles: React.CSSProperties;
  enhancedEffectStyles: React.CSSProperties;
  SurfaceTexture: React.ComponentType;
  material: string;
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
  mousePosition: { x: number; y: number };
  isHovering: boolean;
  onMouseDown: () => void;
  onMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export const EnhancedCardContainer: React.FC<EnhancedCardContainerProps> = ({
  card,
  isFlipped,
  rotation,
  zoom,
  isDragging,
  frameStyles,
  enhancedEffectStyles,
  SurfaceTexture,
  material,
  effects,
  mousePosition,
  isHovering,
  onMouseDown,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  // Debug: Check what image property exists
  console.log('EnhancedCardContainer - Card data check:', {
    image_url: card.image_url,
    imageUrl: (card as any).imageUrl,
    cardImageUrl: (card as any).cardImageUrl,
    hasImage: !!(card.image_url || (card as any).imageUrl || (card as any).cardImageUrl),
    fullCard: card
  });
  
  // Try to get the image URL from any possible property
  const imageUrl = card.image_url || (card as any).imageUrl || (card as any).cardImageUrl;
  const hasImage = !!imageUrl;
  return (
    <>
      {/* Material Wallpaper - Behind everything */}
      <MaterialWallpaper
        material={material}
        effects={effects}
        mousePosition={mousePosition}
        isHovering={isHovering}
      />
      
      <div 
        className="w-full h-full rounded-xl overflow-hidden relative"
        style={{
          ...frameStyles,
          transform: `scale(${zoom})`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        {/* Hide surface texture since we have material wallpaper */}
        
        {/* Card Content - Show image if available, otherwise show material blank card */}
        <div className="relative w-full h-full z-20">
          {hasImage ? (
            <CardImageRenderer card={{...card, image_url: imageUrl}} />
          ) : (
            <MaterialBlankCard
              card={card}
              material={material}
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
