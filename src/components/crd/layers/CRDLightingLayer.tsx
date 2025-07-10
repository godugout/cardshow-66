import React from 'react';
import { CRDRenderContext } from '@/types/crd';

interface CRDLightingLayerProps {
  context: CRDRenderContext;
}

export const CRDLightingLayer: React.FC<CRDLightingLayerProps> = ({ context }) => {
  const { card, mousePosition, isHovering } = context;
  const { lighting } = card;
  
  const mouseX = mousePosition?.x || 0.5;
  const mouseY = mousePosition?.y || 0.5;
  
  const renderEnvironmentLighting = () => {
    const intensity = lighting.intensity / 100;
    
    switch (lighting.environment) {
      case 'studio':
        return (
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `
                radial-gradient(
                  ellipse at 50% 20%,
                  ${lighting.color.primary}${Math.round(intensity * 0.1 * 255).toString(16).padStart(2, '0')} 0%,
                  ${lighting.color.secondary}${Math.round(intensity * 0.05 * 255).toString(16).padStart(2, '0')} 60%,
                  transparent 100%
                )
              `,
              zIndex: 2
            }}
          />
        );
      
      case 'dramatic':
        return (
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `
                linear-gradient(
                  ${mouseX * 180}deg,
                  ${lighting.color.primary}${Math.round(intensity * 0.15 * 255).toString(16).padStart(2, '0')} 0%,
                  transparent 30%,
                  ${lighting.color.ambient}${Math.round(intensity * 0.3 * 255).toString(16).padStart(2, '0')} 100%
                )
              `,
              zIndex: 2
            }}
          />
        );
      
      case 'neon':
        return (
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `
                radial-gradient(
                  ellipse at ${mouseX * 100}% ${mouseY * 100}%,
                  ${lighting.color.primary}${Math.round(intensity * 0.08 * 255).toString(16).padStart(2, '0')} 0%,
                  ${lighting.color.secondary}${Math.round(intensity * 0.06 * 255).toString(16).padStart(2, '0')} 40%,
                  ${lighting.color.ambient}${Math.round(intensity * 0.2 * 255).toString(16).padStart(2, '0')} 100%
                )
              `,
              zIndex: 2
            }}
          />
        );
      
      case 'candlelight':
        return (
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `
                radial-gradient(
                  ellipse at 50% 80%,
                  rgba(255, 140, 0, ${intensity * 0.15}) 0%,
                  rgba(255, 69, 0, ${intensity * 0.1}) 40%,
                  rgba(139, 69, 19, ${intensity * 0.2}) 100%
                )
              `,
              zIndex: 2
            }}
          />
        );
      
      case 'outdoor':
        return (
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `
                linear-gradient(
                  180deg,
                  rgba(135, 206, 235, ${intensity * 0.1}) 0%,
                  rgba(255, 255, 255, ${intensity * 0.05}) 50%,
                  rgba(34, 139, 34, ${intensity * 0.08}) 100%
                )
              `,
              zIndex: 2
            }}
          />
        );
      
      default:
        return null;
    }
  };
  
  const renderShadows = () => {
    if (!lighting.shadows.enabled) return null;
    
    const shadowIntensity = (lighting.shadows.intensity / 100) * (lighting.intensity / 100);
    const shadowSoftness = lighting.shadows.softness / 100;
    
    return (
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `
            radial-gradient(
              ellipse at ${(1 - mouseX) * 100}% ${(1 - mouseY) * 100}%,
              transparent 0%,
              transparent 40%,
              rgba(0, 0, 0, ${shadowIntensity * 0.3}) ${60 + shadowSoftness * 40}%,
              rgba(0, 0, 0, ${shadowIntensity * 0.5}) 100%
            )
          `,
          zIndex: 3
        }}
      />
    );
  };
  
  const renderHighlights = () => {
    if (!lighting.highlights.enabled) return null;
    
    const highlightIntensity = (lighting.highlights.intensity / 100) * (lighting.intensity / 100);
    const highlightSharpness = lighting.highlights.sharpness / 100;
    
    return (
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `
            radial-gradient(
              ellipse at ${mouseX * 100}% ${mouseY * 100}%,
              rgba(255, 255, 255, ${highlightIntensity * 0.2}) 0%,
              rgba(255, 255, 255, ${highlightIntensity * 0.1}) ${20 - highlightSharpness * 15}%,
              transparent ${40 - highlightSharpness * 20}%
            )
          `,
          opacity: isHovering ? 1 : 0.7,
          transition: 'opacity 0.3s ease',
          mixBlendMode: 'overlay',
          zIndex: 24
        }}
      />
    );
  };
  
  return (
    <div className="crd-lighting-layer">
      {renderEnvironmentLighting()}
      {renderShadows()}
      {renderHighlights()}
    </div>
  );
};