import React from 'react';

interface UnifiedMaterialEffectsProps {
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
  lighting: {
    intensity: number;
    direction: { x: number; y: number };
    color: string;
    environment: string;
  };
  mousePosition: { x: number; y: number };
  isHovering: boolean;
}

export const UnifiedMaterialEffects: React.FC<UnifiedMaterialEffectsProps> = ({
  material,
  effects,
  lighting,
  mousePosition,
  isHovering
}) => {
  // Physically-based material system with natural surface characteristics
  const getMaterialBase = () => {
    // Base reflectance values for realistic materials
    const reflectanceAngle = Math.atan2(mousePosition.y - 0.5, mousePosition.x - 0.5) * (180 / Math.PI);
    const viewingAngle = Math.sqrt(Math.pow(mousePosition.x - 0.5, 2) + Math.pow(mousePosition.y - 0.5, 2));
    const fresnel = Math.pow(1 - Math.max(0, Math.min(1, viewingAngle * 2)), 2);

    switch (material) {
      case 'holographic':
        return {
          basePattern: `
            radial-gradient(
              ellipse 200% 150% at ${50 + mousePosition.x * 30}% ${50 + mousePosition.y * 20}%,
              hsla(${(mousePosition.x * 60 + 280) % 360}, 85%, 65%, ${0.15 + fresnel * 0.25}) 0%,
              hsla(${(mousePosition.x * 60 + 320) % 360}, 90%, 70%, ${0.08 + fresnel * 0.15}) 40%,
              hsla(${(mousePosition.x * 60 + 360) % 360}, 80%, 75%, ${0.05 + fresnel * 0.1}) 70%,
              transparent 100%
            )
          `,
          refraction: `
            radial-gradient(
              ellipse 80% 60% at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 255, 255, ${fresnel * 0.3}) 0%,
              rgba(255, 255, 255, ${fresnel * 0.15}) 50%,
              transparent 80%
            )
          `,
          blend: 'screen',
          opacity: 0.4 + (effects.holographic * 0.3)
        };

      case 'chrome':
        return {
          basePattern: `
            radial-gradient(
              ellipse 300% 150% at ${mousePosition.x * 100}% 50%,
              rgba(240, 245, 255, ${0.6 + fresnel * 0.3}) 0%,
              rgba(220, 230, 245, ${0.4 + fresnel * 0.2}) 30%,
              rgba(200, 215, 235, ${0.3 + fresnel * 0.15}) 60%,
              rgba(180, 195, 220, ${0.2 + fresnel * 0.1}) 85%,
              transparent 100%
            )
          `,
          refraction: `
            ellipse 120% 80% at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
            rgba(255, 255, 255, ${fresnel * 0.4}) 0%,
            rgba(255, 255, 255, ${fresnel * 0.2}) 40%,
            transparent 70%
          `,
          blend: 'screen',
          opacity: 0.5 + (effects.chrome * 0.3)
        };

      case 'metallic':
        return {
          basePattern: `
            radial-gradient(
              ellipse 250% 120% at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              hsla(45, 100%, 80%, ${0.25 + fresnel * 0.2}) 0%,
              hsla(40, 95%, 75%, ${0.2 + fresnel * 0.15}) 25%,
              hsla(35, 90%, 65%, ${0.15 + fresnel * 0.1}) 50%,
              hsla(30, 85%, 55%, ${0.1 + fresnel * 0.05}) 75%,
              transparent 100%
            )
          `,
          refraction: `
            radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 235, 180, ${fresnel * 0.25}) 0%,
              rgba(255, 215, 120, ${fresnel * 0.15}) 40%,
              transparent 70%
            )
          `,
          blend: 'multiply',
          opacity: 0.6 + (effects.metallic * 0.25)
        };

      case 'crystal':
        return {
          basePattern: `
            radial-gradient(
              ellipse 180% 120% at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(220, 240, 255, ${0.2 + fresnel * 0.2}) 0%,
              rgba(200, 230, 250, ${0.15 + fresnel * 0.15}) 30%,
              rgba(180, 220, 245, ${0.1 + fresnel * 0.1}) 60%,
              transparent 85%
            )
          `,
          refraction: `
            radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 255, 255, ${fresnel * 0.3}) 0%,
              rgba(235, 245, 255, ${fresnel * 0.15}) 50%,
              transparent 75%
            )
          `,
          blend: 'soft-light',
          opacity: 0.4 + (effects.crystal * 0.3)
        };

      case 'matte':
        return {
          basePattern: `
            radial-gradient(
              ellipse 150% 100% at 50% 50%,
              rgba(0, 0, 0, 0.08) 0%,
              rgba(0, 0, 0, 0.12) 70%,
              rgba(0, 0, 0, 0.15) 100%
            )
          `,
          refraction: 'none',
          blend: 'multiply',
          opacity: 0.3
        };

      default: // standard
        return {
          basePattern: `
            radial-gradient(
              ellipse 120% 80% at 50% 50%,
              rgba(255, 255, 255, 0.03) 0%,
              rgba(240, 245, 250, 0.05) 100%
            )
          `,
          refraction: 'none',
          blend: 'normal',
          opacity: 0.15
        };
    }
  };

  const materialBase = getMaterialBase();

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Base Material Layer */}
      <div 
        className="absolute inset-0"
        style={{
          background: materialBase.basePattern,
          opacity: materialBase.opacity,
          mixBlendMode: materialBase.blend as any,
          transition: 'all 0.3s ease',
          filter: material === 'matte' ? 'none' : 'blur(0.3px)'
        }}
      />
      
      {/* Refraction/Reflection Layer */}
      {materialBase.refraction !== 'none' && (
        <div 
          className="absolute inset-0"
          style={{
            background: materialBase.refraction,
            opacity: isHovering ? 0.8 : 0.4,
            transition: 'opacity 0.2s ease',
            mixBlendMode: 'screen'
          }}
        />
      )}

      {/* Natural Atmosphere & Depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 140% 120% at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 255, 255, ${isHovering ? 0.04 : 0.02}) 0%,
              rgba(255, 255, 255, ${isHovering ? 0.02 : 0.01}) 60%,
              transparent 85%
            )
          `,
          opacity: lighting.intensity * 0.8,
          transition: 'all 0.4s ease',
          mixBlendMode: 'soft-light'
        }}
      />

      {/* Subtle Material Character */}
      {(effects.prismatic > 0.1 || effects.rainbow > 0.1) && (
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 200% 100% at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                hsla(${mousePosition.x * 20 + 200}, 40%, 70%, ${Math.max(effects.prismatic, effects.rainbow) * 0.08}) 0%,
                hsla(${mousePosition.x * 25 + 240}, 35%, 65%, ${Math.max(effects.prismatic, effects.rainbow) * 0.05}) 50%,
                transparent 80%
              )
            `,
            opacity: isHovering ? 0.7 : 0.4,
            transition: 'opacity 0.5s ease',
            mixBlendMode: 'color',
            filter: 'blur(2px)'
          }}
        />
      )}

      {/* Environmental Reflection */}
      {lighting.environment !== 'studio' && (
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 180% 90% at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 15}%,
                ${lighting.environment === 'sunset' ? 'rgba(255, 180, 120, 0.03)' : 
                  lighting.environment === 'nature' ? 'rgba(120, 180, 120, 0.03)' : 
                  'rgba(180, 200, 255, 0.03)'} 0%,
                transparent 70%
              )
            `,
            opacity: lighting.intensity * 0.6,
            transition: 'opacity 0.4s ease',
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* Paper/Card Texture */}
      <div 
        className="absolute inset-0"
        style={{
          background: material === 'matte' ? 
            `radial-gradient(ellipse 120% 80% at 50% 50%, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.04) 100%)` :
            `radial-gradient(ellipse 110% 90% at 50% 50%, rgba(255,255,255,0.01) 0%, transparent 100%)`,
          opacity: 0.8,
          mixBlendMode: material === 'matte' ? 'multiply' : 'screen'
        }}
      />
    </div>
  );
};