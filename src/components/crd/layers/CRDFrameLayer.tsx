import React from 'react';
import { CRDRenderContext } from '@/types/crd';

interface CRDFrameLayerProps {
  context: CRDRenderContext;
}

export const CRDFrameLayer: React.FC<CRDFrameLayerProps> = ({ context }) => {
  const { frame } = context;
  
  const frameStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    borderRadius: frame.style.border.radius,
    border: `${frame.style.border.width}px ${frame.style.border.style} ${
      typeof frame.style.border.color === 'string' 
        ? frame.style.border.color 
        : 'transparent'
    }`,
    overflow: 'hidden'
  };
  
  // Apply background
  const backgroundStyle: React.CSSProperties = {};
  if (frame.style.background.type === 'solid' && frame.style.background.color) {
    backgroundStyle.backgroundColor = frame.style.background.color;
  } else if (frame.style.background.type === 'gradient' && frame.style.background.gradient) {
    const gradient = frame.style.background.gradient;
    const stops = gradient.stops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    
    if (gradient.type === 'linear') {
      backgroundStyle.background = `linear-gradient(${gradient.direction || 0}deg, ${stops})`;
    } else if (gradient.type === 'radial') {
      backgroundStyle.background = `radial-gradient(circle, ${stops})`;
    } else if (gradient.type === 'conic') {
      backgroundStyle.background = `conic-gradient(from ${gradient.direction || 0}deg, ${stops})`;
    }
  }
  backgroundStyle.opacity = frame.style.background.opacity;

  return (
    <div style={frameStyle} className="crd-frame-layer">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={backgroundStyle}
      />
      
      {/* Frame elements */}
      {frame.elements.map((element) => {
        const elementStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${(element.position.x / frame.dimensions.width) * 100}%`,
          top: `${(element.position.y / frame.dimensions.height) * 100}%`,
          width: `${(element.position.width / frame.dimensions.width) * 100}%`,
          height: `${(element.position.height / frame.dimensions.height) * 100}%`,
          zIndex: element.position.zIndex,
          opacity: element.style.opacity,
          filter: element.style.filter,
          transform: element.style.transform,
          mixBlendMode: element.style.mixBlendMode as any
        };
        
        // Apply element styling
        if (element.style.color) {
          elementStyle.backgroundColor = element.style.color;
        } else if (element.style.gradient) {
          const gradient = element.style.gradient;
          const stops = gradient.stops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
          
          if (gradient.type === 'linear') {
            elementStyle.background = `linear-gradient(${gradient.direction || 0}deg, ${stops})`;
          } else if (gradient.type === 'radial') {
            elementStyle.background = `radial-gradient(circle, ${stops})`;
          } else if (gradient.type === 'conic') {
            elementStyle.background = `conic-gradient(from ${gradient.direction || 0}deg, ${stops})`;
          }
        }
        
        // Apply animation if present
        const animationClass = element.animation ? `crd-animate-${element.animation.type}` : '';
        
        return (
          <div
            key={element.id}
            style={elementStyle}
            className={`crd-frame-element ${animationClass}`}
          >
            {element.content && (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {element.content}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Glow effect for border if enabled */}
      {frame.style.border.glow?.enabled && (
        <div 
          className="absolute inset-0"
          style={{
            borderRadius: frame.style.border.radius,
            boxShadow: `0 0 ${frame.style.border.glow.blur}px ${frame.style.border.glow.color}`,
            zIndex: -1
          }}
        />
      )}
    </div>
  );
};