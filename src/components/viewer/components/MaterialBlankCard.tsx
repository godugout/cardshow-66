import React from 'react';
import type { CardData } from '@/hooks/useCardEditor';
import { FrameRenderer } from '@/components/editor/frames/FrameRenderer';

interface MaterialBlankCardProps {
  card: CardData;
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
}

export const MaterialBlankCard: React.FC<MaterialBlankCardProps> = ({
  card,
  material,
  effects,
  mousePosition,
  isHovering
}) => {
  const getMaterialCardStyle = (): React.CSSProperties => {
    const intensity = isHovering ? 1.1 : 0.9;
    
    switch (material) {
      case 'holographic':
        return {
          background: `
            linear-gradient(
              ${mousePosition.x * 180}deg,
              rgba(138, 43, 226, ${0.15 * intensity}) 0%,
              rgba(255, 0, 128, ${0.1 * intensity}) 50%,
              rgba(0, 255, 255, ${0.15 * intensity}) 100%
            )
          `,
          backdropFilter: 'blur(1px)',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          transition: 'all 0.3s ease'
        };
        
      case 'metallic':
        return {
          background: `
            linear-gradient(
              ${mousePosition.x * 45}deg,
              rgba(220, 220, 220, ${0.2 * intensity}) 0%,
              rgba(192, 192, 192, ${0.15 * intensity}) 50%,
              rgba(169, 169, 169, ${0.2 * intensity}) 100%
            )
          `,
          backdropFilter: 'blur(0.5px)',
          border: '1px solid rgba(192, 192, 192, 0.4)',
          transition: 'all 0.3s ease'
        };
        
      case 'chrome':
        return {
          background: `
            linear-gradient(
              ${mousePosition.x * 60}deg,
              rgba(248, 248, 248, ${0.25 * intensity}) 0%,
              rgba(192, 192, 192, ${0.15 * intensity}) 50%,
              rgba(128, 128, 128, ${0.25 * intensity}) 100%
            )
          `,
          backdropFilter: 'blur(0.3px)',
          border: '1px solid rgba(248, 248, 248, 0.5)',
          transition: 'all 0.3s ease'
        };
        
      case 'crystal':
        return {
          background: `
            linear-gradient(
              ${mousePosition.x * 90}deg,
              rgba(173, 216, 230, ${0.2 * intensity}) 0%,
              rgba(135, 206, 235, ${0.15 * intensity}) 50%,
              rgba(70, 130, 180, ${0.2 * intensity}) 100%
            )
          `,
          backdropFilter: 'blur(1px)',
          border: '1px solid rgba(173, 216, 230, 0.4)',
          transition: 'all 0.3s ease'
        };
        
      case 'vintage':
        return {
          background: `
            linear-gradient(
              ${mousePosition.x * 30}deg,
              rgba(222, 184, 135, ${0.2 * intensity}) 0%,
              rgba(210, 180, 140, ${0.15 * intensity}) 50%,
              rgba(139, 69, 19, ${0.2 * intensity}) 100%
            )
          `,
          backdropFilter: 'blur(0.5px)',
          border: '1px solid rgba(222, 184, 135, 0.4)',
          transition: 'all 0.3s ease'
        };
        
      case 'prismatic':
        return {
          background: `
            conic-gradient(
              from ${mousePosition.x * 360}deg,
              rgba(255, 0, 0, ${0.1 * intensity}) 0deg,
              rgba(255, 165, 0, ${0.1 * intensity}) 60deg,
              rgba(255, 255, 0, ${0.1 * intensity}) 120deg,
              rgba(0, 255, 0, ${0.1 * intensity}) 180deg,
              rgba(0, 0, 255, ${0.1 * intensity}) 240deg,
              rgba(128, 0, 128, ${0.1 * intensity}) 300deg,
              rgba(255, 0, 0, ${0.1 * intensity}) 360deg
            )
          `,
          backdropFilter: 'blur(1px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease'
        };
        
      default:
        return {
          background: `
            linear-gradient(
              135deg,
              rgba(64, 64, 64, ${0.2 * intensity}) 0%,
              rgba(32, 32, 32, ${0.15 * intensity}) 50%,
              rgba(16, 16, 16, ${0.2 * intensity}) 100%
            )
          `,
          backdropFilter: 'blur(0.5px)',
          border: '1px solid rgba(64, 64, 64, 0.3)',
          transition: 'all 0.3s ease'
        };
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Material Background */}
      <div 
        className="absolute inset-0 rounded-xl"
        style={getMaterialCardStyle()}
      />
      
      {/* Frame with Card Details */}
      <div className="relative w-full h-full">
        <FrameRenderer
          frameId={'classic-sports'}
          imageUrl={undefined} // No image - shows material instead
          title={card.title}
          subtitle={card.description || 'No Image'}
          width={400}
          height={560}
          cardData={card}
        />
      </div>
      
      {/* Material-specific overlay effects */}
      {material === 'holographic' && (
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            background: `
              conic-gradient(
                from ${mousePosition.x * 360}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(138, 43, 226, 0.05) 0deg,
                rgba(255, 0, 128, 0.05) 90deg,
                rgba(0, 255, 255, 0.05) 180deg,
                rgba(138, 43, 226, 0.05) 270deg,
                rgba(138, 43, 226, 0.05) 360deg
              )
            `,
            opacity: isHovering ? 0.8 : 0.4,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'screen'
          }}
        />
      )}
      
      {material === 'prismatic' && (
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            background: `
              linear-gradient(
                ${mousePosition.x * 180}deg,
                rgba(255, 0, 255, 0.03) 0%,
                rgba(0, 255, 255, 0.03) 50%,
                rgba(255, 255, 0, 0.03) 100%
              )
            `,
            opacity: isHovering ? 0.7 : 0.3,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'overlay'
          }}
        />
      )}
    </div>
  );
};