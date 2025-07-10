
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
          {card.image_url ? (
            <CardImageRenderer card={card} />
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
