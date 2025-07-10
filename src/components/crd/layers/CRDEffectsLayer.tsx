import React from 'react';
import { CRDRenderContext } from '@/types/crd';

interface CRDEffectsLayerProps {
  context: CRDRenderContext;
  imageLoaded: boolean;
  imageError: boolean;
}

export const CRDEffectsLayer: React.FC<CRDEffectsLayerProps> = ({
  context,
  imageLoaded,
  imageError
}) => {
  const { card, mousePosition, isHovering } = context;
  const { material, effects } = card;
  
  // Don't show effects if image failed to load
  if (imageError) return null;
  
  // Reduce effects intensity if image hasn't loaded yet
  const effectsIntensity = imageLoaded ? 1 : 0.5;
  
  const renderHolographicEffect = () => {
    if (material.type !== 'holographic' && effects.holographic <= 0) return null;
    
    const intensity = Math.max(material.intensity / 100, effects.holographic / 100) * effectsIntensity;
    const mouseX = mousePosition?.x || 0.5;
    const mouseY = mousePosition?.y || 0.5;
    
    return (
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `
            conic-gradient(
              from ${mouseX * 360}deg at ${mouseX * 100}% ${mouseY * 100}%,
              rgba(255, 0, 128, ${intensity * 0.15}) 0deg,
              rgba(0, 255, 255, ${intensity * 0.1}) 90deg,
              rgba(128, 0, 255, ${intensity * 0.15}) 180deg,
              rgba(255, 128, 0, ${intensity * 0.1}) 270deg,
              rgba(255, 0, 128, ${intensity * 0.15}) 360deg
            )
          `,
          opacity: isHovering ? 0.8 : 0.4,
          transition: 'opacity 0.3s ease',
          mixBlendMode: 'screen',
          zIndex: 20
        }}
      />
    );
  };
  
  const renderMetallicEffect = () => {
    if (material.type !== 'metallic' && effects.metallic <= 0) return null;
    
    const intensity = Math.max(material.intensity / 100, effects.metallic / 100) * effectsIntensity;
    const mouseX = mousePosition?.x || 0.5;
    
    return (
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `
            linear-gradient(
              ${mouseX * 180}deg,
              rgba(220, 220, 220, ${intensity * 0.2}) 0%,
              rgba(192, 192, 192, ${intensity * 0.1}) 50%,
              rgba(169, 169, 169, ${intensity * 0.15}) 100%
            )
          `,
          opacity: isHovering ? 0.7 : 0.4,
          transition: 'opacity 0.3s ease',
          mixBlendMode: 'overlay',
          zIndex: 18
        }}
      />
    );
  };
  
  const renderChromeEffect = () => {
    if (material.type !== 'chrome' && effects.chrome <= 0) return null;
    
    const intensity = Math.max(material.intensity / 100, effects.chrome / 100) * effectsIntensity;
    const mouseX = mousePosition?.x || 0.5;
    
    return (
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `
            linear-gradient(
              ${mouseX * 120}deg,
              rgba(248, 248, 248, ${intensity * 0.25}) 0%,
              rgba(192, 192, 192, ${intensity * 0.15}) 50%,
              rgba(128, 128, 128, ${intensity * 0.2}) 100%
            )
          `,
          opacity: isHovering ? 0.8 : 0.5,
          transition: 'opacity 0.3s ease',
          mixBlendMode: 'hard-light',
          zIndex: 19
        }}
      />
    );
  };
  
  const renderCrystalEffect = () => {
    if (material.type !== 'crystal' && effects.crystal <= 0) return null;
    
    const intensity = Math.max(material.intensity / 100, effects.crystal / 100) * effectsIntensity;
    const mouseX = mousePosition?.x || 0.5;
    const mouseY = mousePosition?.y || 0.5;
    
    return (
      <>
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `
              radial-gradient(
                ellipse at ${mouseX * 100}% ${mouseY * 100}%,
                rgba(173, 216, 230, ${intensity * 0.2}) 0%,
                rgba(135, 206, 235, ${intensity * 0.1}) 50%,
                transparent 70%
              )
            `,
            opacity: isHovering ? 0.9 : 0.6,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'screen',
            zIndex: 17
          }}
        />
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `
              linear-gradient(
                ${mouseX * 90}deg,
                rgba(70, 130, 180, ${intensity * 0.15}) 0%,
                transparent 50%,
                rgba(70, 130, 180, ${intensity * 0.1}) 100%
              )
            `,
            opacity: 0.5,
            mixBlendMode: 'multiply',
            zIndex: 16
          }}
        />
      </>
    );
  };
  
  const renderPrismaticEffect = () => {
    if (material.type !== 'prismatic' && effects.prismatic <= 0) return null;
    
    const intensity = Math.max(material.intensity / 100, effects.prismatic / 100) * effectsIntensity;
    const mouseX = mousePosition?.x || 0.5;
    const mouseY = mousePosition?.y || 0.5;
    
    return (
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `
            conic-gradient(
              from ${(mouseX + mouseY) * 360}deg,
              rgba(255, 0, 0, ${intensity * 0.1}) 0deg,
              rgba(255, 165, 0, ${intensity * 0.08}) 60deg,
              rgba(255, 255, 0, ${intensity * 0.06}) 120deg,
              rgba(0, 255, 0, ${intensity * 0.08}) 180deg,
              rgba(0, 0, 255, ${intensity * 0.1}) 240deg,
              rgba(128, 0, 128, ${intensity * 0.08}) 300deg,
              rgba(255, 0, 0, ${intensity * 0.1}) 360deg
            )
          `,
          opacity: isHovering ? 1 : 0.6,
          transition: 'opacity 0.3s ease',
          mixBlendMode: 'color-dodge',
          zIndex: 21
        }}
      />
    );
  };
  
  const renderGlowEffect = () => {
    if (!effects.glow.enabled) return null;
    
    return (
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: `
            0 0 ${effects.glow.radius}px ${effects.glow.color},
            inset 0 0 ${effects.glow.radius / 2}px ${effects.glow.color}
          `,
          opacity: (effects.glow.intensity / 100) * effectsIntensity,
          zIndex: 22
        }}
      />
    );
  };
  
  const renderParticleEffect = () => {
    if (!effects.particles) return null;
    
    return (
      <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden" style={{ zIndex: 23 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `crd-float ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="crd-effects-layer">
      {renderHolographicEffect()}
      {renderMetallicEffect()}
      {renderChromeEffect()}
      {renderCrystalEffect()}
      {renderPrismaticEffect()}
      {renderGlowEffect()}
      {renderParticleEffect()}
    </div>
  );
};