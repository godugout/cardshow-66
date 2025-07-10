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
  // Enhanced material configurations with unique visual characteristics
  const getMaterialBase = () => {
    switch (material) {
      case 'holographic':
        return {
          basePattern: `
            conic-gradient(
              from ${mousePosition.x * 540 + Date.now() * 0.02}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 0, 150, 0.3) 0deg,
              rgba(0, 255, 255, 0.4) 72deg,
              rgba(255, 255, 0, 0.35) 144deg,
              rgba(150, 0, 255, 0.3) 216deg,
              rgba(0, 255, 150, 0.4) 288deg,
              rgba(255, 0, 150, 0.3) 360deg
            )
          `,
          refraction: `
            linear-gradient(
              ${mousePosition.x * 45 + 135}deg,
              transparent 0%,
              rgba(255, 255, 255, 0.15) 45%,
              rgba(255, 255, 255, 0.25) 50%,
              rgba(255, 255, 255, 0.15) 55%,
              transparent 100%
            )
          `,
          blend: 'color-dodge',
          opacity: 0.6 + (effects.holographic * 0.4)
        };

      case 'chrome':
        return {
          basePattern: `
            linear-gradient(
              ${mousePosition.y * 180}deg,
              rgba(180, 190, 220, 0.3) 0%,
              rgba(255, 255, 255, 0.9) 8%,
              rgba(200, 210, 240, 0.4) 16%,
              rgba(255, 255, 255, 0.95) 25%,
              rgba(240, 245, 255, 0.8) 50%,
              rgba(255, 255, 255, 0.95) 75%,
              rgba(200, 210, 240, 0.4) 84%,
              rgba(255, 255, 255, 0.9) 92%,
              rgba(180, 190, 220, 0.3) 100%
            )
          `,
          refraction: `
            linear-gradient(
              ${mousePosition.x * 90 + 90}deg,
              transparent 0%,
              rgba(255, 255, 255, 0.3) 47%,
              rgba(255, 255, 255, 0.7) 50%,
              rgba(255, 255, 255, 0.3) 53%,
              transparent 100%
            )
          `,
          blend: 'screen',
          opacity: 0.75 + (effects.chrome * 0.25)
        };

      case 'metallic':
        return {
          basePattern: `
            radial-gradient(
              ellipse ${isHovering ? '120%' : '80%'} ${isHovering ? '60%' : '40%'} at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 215, 0, 0.4) 0%,
              rgba(255, 245, 157, 0.6) 20%,
              rgba(255, 255, 255, 0.8) 40%,
              rgba(255, 223, 0, 0.5) 60%,
              rgba(255, 140, 0, 0.3) 80%,
              rgba(255, 215, 0, 0.2) 100%
            )
          `,
          refraction: `
            conic-gradient(
              from ${mousePosition.x * 180}deg at 50% 50%,
              rgba(255, 215, 0, 0.2) 0deg,
              rgba(255, 255, 255, 0.4) 60deg,
              rgba(255, 223, 0, 0.3) 120deg,
              rgba(255, 245, 157, 0.2) 180deg,
              rgba(255, 215, 0, 0.2) 240deg,
              rgba(255, 255, 255, 0.4) 300deg,
              rgba(255, 215, 0, 0.2) 360deg
            )
          `,
          blend: 'hard-light',
          opacity: 0.7 + (effects.metallic * 0.3)
        };

      case 'crystal':
        return {
          basePattern: `
            radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(173, 216, 230, 0.4) 0%,
              rgba(135, 206, 250, 0.3) 25%,
              rgba(176, 224, 230, 0.25) 50%,
              rgba(255, 255, 255, 0.15) 75%,
              transparent 100%
            )
          `,
          refraction: `
            conic-gradient(
              from ${mousePosition.x * 120}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 255, 255, 0.1) 0deg,
              rgba(173, 216, 230, 0.2) 120deg,
              rgba(255, 255, 255, 0.15) 240deg,
              rgba(173, 216, 230, 0.1) 360deg
            )
          `,
          blend: 'soft-light',
          opacity: 0.6 + (effects.crystal * 0.4)
        };

      case 'matte':
        return {
          basePattern: `
            linear-gradient(
              135deg,
              rgba(48, 48, 48, 0.15) 0%,
              rgba(32, 32, 32, 0.25) 50%,
              rgba(16, 16, 16, 0.3) 100%
            )
          `,
          refraction: 'none',
          blend: 'multiply',
          opacity: 0.4
        };

      default: // standard
        return {
          basePattern: `
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.05) 0%,
              rgba(248, 249, 250, 0.1) 100%
            )
          `,
          refraction: 'none',
          blend: 'normal',
          opacity: 0.2
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

      {/* Enhanced Prismatic Effect */}
      {effects.prismatic > 0.1 && (
        <div 
          className="absolute inset-0"
          style={{
            background: `
              conic-gradient(
                from ${mousePosition.x * 360 + Date.now() * 0.01}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 0, 0, ${effects.prismatic * 0.15}) 0deg,
                rgba(255, 127, 0, ${effects.prismatic * 0.18}) 51deg,
                rgba(255, 255, 0, ${effects.prismatic * 0.15}) 102deg,
                rgba(0, 255, 0, ${effects.prismatic * 0.2}) 153deg,
                rgba(0, 255, 255, ${effects.prismatic * 0.18}) 204deg,
                rgba(0, 0, 255, ${effects.prismatic * 0.15}) 255deg,
                rgba(127, 0, 255, ${effects.prismatic * 0.2}) 306deg,
                rgba(255, 0, 255, ${effects.prismatic * 0.18}) 357deg,
                rgba(255, 0, 0, ${effects.prismatic * 0.15}) 360deg
              )
            `,
            opacity: isHovering ? 0.9 : 0.6,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'screen',
            filter: `blur(${effects.prismatic * 0.8}px)`,
            transform: `scale(${1 + effects.prismatic * 0.02})`
          }}
        />
      )}

      {/* Interference Pattern */}
      {effects.interference > 0.1 && (
        <div 
          className="absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(
                ${mousePosition.x * 90 + 45}deg,
                transparent 0px,
                rgba(255, 255, 255, ${effects.interference * 0.02}) 0.5px,
                transparent 1px,
                transparent 2px
              )
            `,
            opacity: 0.7,
            mixBlendMode: 'overlay'
          }}
        />
      )}

      {/* Rainbow Gradient Effect */}
      {effects.rainbow > 0.1 && (
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                ${mousePosition.x * 180 + 90}deg,
                rgba(255, 0, 0, ${effects.rainbow * 0.08}) 0%,
                rgba(255, 127, 0, ${effects.rainbow * 0.08}) 14%,
                rgba(255, 255, 0, ${effects.rainbow * 0.08}) 28%,
                rgba(0, 255, 0, ${effects.rainbow * 0.08}) 42%,
                rgba(0, 255, 255, ${effects.rainbow * 0.08}) 57%,
                rgba(0, 0, 255, ${effects.rainbow * 0.08}) 71%,
                rgba(127, 0, 255, ${effects.rainbow * 0.08}) 85%,
                rgba(255, 0, 0, ${effects.rainbow * 0.08}) 100%
              )
            `,
            opacity: isHovering ? 0.8 : 0.5,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'screen'
          }}
        />
      )}

      {/* Vintage Aging Effect */}
      {effects.vintage > 0.1 && (
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse at center,
                transparent 30%,
                rgba(101, 67, 33, ${effects.vintage * 0.08}) 70%,
                rgba(101, 67, 33, ${effects.vintage * 0.15}) 100%
              )
            `,
            opacity: 0.8,
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* Particle System for Special Effects */}
      {effects.particles && isHovering && (
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(79, 255, 176, 0.06) 0%,
                rgba(255, 107, 74, 0.04) 30%,
                rgba(74, 144, 255, 0.05) 60%,
                transparent 80%
              )
            `,
            animation: 'pulse 2s ease-in-out infinite',
            opacity: 1
          }}
        />
      )}

      {/* Interactive Lighting Enhancement */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 255, 255, ${isHovering ? 0.08 : 0.03}) 0%,
              rgba(255, 255, 255, ${isHovering ? 0.04 : 0.015}) 40%,
              transparent 70%
            )
          `,
          opacity: lighting.intensity,
          transition: 'opacity 0.3s ease',
          mixBlendMode: 'screen'
        }}
      />

      {/* Surface Noise Texture */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
          `,
          opacity: material === 'matte' ? 0.06 : 0.02,
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
};