
import React from 'react';
import type { CardData } from '@/hooks/useCardEditor';
import { CardImageRenderer } from './CardImageRenderer';
import { CardContentDisplay } from './CardContentDisplay';

interface EnhancedCardContainerProps {
  card: CardData;
  isFlipped: boolean;
  rotation: { x: number; y: number };
  zoom: number;
  isDragging: boolean;
  frameStyles: React.CSSProperties;
  enhancedEffectStyles: React.CSSProperties;
  SurfaceTexture: React.ComponentType;
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
  onMouseDown,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  return (
    <div 
      className="w-full h-full rounded-xl overflow-hidden"
      style={{
        ...frameStyles,
        ...enhancedEffectStyles,
        transform: `scale(${zoom})`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <SurfaceTexture />
      
      {/* Card Content - Show image if available, otherwise show content display */}
      <div className="relative w-full h-full z-30">
        {card.image_url ? (
          <CardImageRenderer card={card} />
        ) : (
          <CardContentDisplay card={card} />
        )}
      </div>
    </div>
  );
};
