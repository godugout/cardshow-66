import React from 'react';

interface AdvancedMaterialSystemProps {
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

export const AdvancedMaterialSystem: React.FC<AdvancedMaterialSystemProps> = ({
  material,
  effects,
  mousePosition,
  isHovering
}) => {
  // Base material configurations
  const materialConfigs = {
    standard: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      opacity: 1,
      blend: 'normal'
    },
    holographic: {
      background: `
        linear-gradient(
          ${mousePosition.x * 180}deg,
          rgba(138, 43, 226, 0.1) 0%,
          rgba(255, 0, 128, 0.2) 25%,
          rgba(0, 255, 255, 0.2) 50%,
          rgba(255, 255, 0, 0.2) 75%,
          rgba(138, 43, 226, 0.1) 100%
        )
      `,
      opacity: 0.8 + (effects.holographic * 0.2),
      blend: 'screen'
    },
    metallic: {
      background: `
        linear-gradient(
          ${mousePosition.x * 45 + 45}deg,
          rgba(255, 215, 0, 0.1) 0%,
          rgba(255, 223, 0, 0.3) 30%,
          rgba(255, 245, 157, 0.2) 50%,
          rgba(255, 223, 0, 0.3) 70%,
          rgba(255, 215, 0, 0.1) 100%
        )
      `,
      opacity: 0.7 + (effects.metallic * 0.3),
      blend: 'multiply'
    },
    chrome: {
      background: `
        linear-gradient(
          ${mousePosition.x * 90}deg,
          rgba(200, 200, 255, 0.1) 0%,
          rgba(255, 255, 255, 0.3) 40%,
          rgba(200, 200, 255, 0.2) 60%,
          rgba(150, 150, 200, 0.1) 100%
        )
      `,
      opacity: 0.6 + (effects.chrome * 0.4),
      blend: 'overlay'
    },
    crystal: {
      background: `
        radial-gradient(
          ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          rgba(123, 179, 189, 0.2) 0%,
          rgba(173, 216, 230, 0.1) 40%,
          transparent 80%
        )
      `,
      opacity: 0.5 + (effects.crystal * 0.5),
      blend: 'overlay'
    }
  };

  const currentConfig = materialConfigs[material as keyof typeof materialConfigs] || materialConfigs.standard;

  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden">
      {/* Base Material Layer */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: currentConfig.background,
          opacity: currentConfig.opacity,
          mixBlendMode: currentConfig.blend as any,
          transition: 'all 0.3s ease'
        }}
      />
      
      {/* Surface Texture */}
      <div 
        className="absolute inset-0 z-1"
        style={{
          background: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
          `,
          opacity: 0.03,
          mixBlendMode: 'overlay'
        }}
      />
      
      {/* Interactive Reflection Layer */}
      {isHovering && (
        <div 
          className="absolute inset-0 z-2"
          style={{
            background: `
              radial-gradient(
                circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 255, 255, 0.1) 0%,
                rgba(255, 255, 255, 0.05) 40%,
                transparent 80%
              )
            `,
            opacity: isHovering ? 1 : 0,
            transition: 'opacity 0.2s ease',
            mixBlendMode: 'screen'
          }}
        />
      )}
      
      {/* Prismatic Dispersion */}
      {effects.prismatic > 0 && (
        <div 
          className="absolute inset-0 z-3"
          style={{
            background: `
              conic-gradient(
                from ${mousePosition.x * 360}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 0, 0, ${effects.prismatic * 0.05}) 0deg,
                rgba(255, 127, 0, ${effects.prismatic * 0.05}) 30deg,
                rgba(255, 255, 0, ${effects.prismatic * 0.05}) 60deg,
                rgba(0, 255, 0, ${effects.prismatic * 0.05}) 90deg,
                rgba(0, 255, 255, ${effects.prismatic * 0.05}) 150deg,
                rgba(0, 0, 255, ${effects.prismatic * 0.05}) 210deg,
                rgba(127, 0, 255, ${effects.prismatic * 0.05}) 270deg,
                rgba(255, 0, 255, ${effects.prismatic * 0.05}) 330deg,
                rgba(255, 0, 0, ${effects.prismatic * 0.05}) 360deg
              )
            `,
            opacity: isHovering ? 1 : 0.7,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'screen'
          }}
        />
      )}
      
      {/* Interference Pattern */}
      {effects.interference > 0 && (
        <div 
          className="absolute inset-0 z-4"
          style={{
            background: `
              repeating-linear-gradient(
                ${mousePosition.x * 180}deg,
                transparent 0px,
                rgba(255, 255, 255, ${effects.interference * 0.02}) 1px,
                transparent 2px,
                transparent 4px
              )
            `,
            opacity: 0.8,
            mixBlendMode: 'overlay'
          }}
        />
      )}
      
      {/* Rainbow Effect */}
      {effects.rainbow > 0 && (
        <div 
          className="absolute inset-0 z-5"
          style={{
            background: `
              linear-gradient(
                ${mousePosition.x * 360}deg,
                rgba(255, 0, 0, ${effects.rainbow * 0.1}) 0%,
                rgba(255, 127, 0, ${effects.rainbow * 0.1}) 14%,
                rgba(255, 255, 0, ${effects.rainbow * 0.1}) 28%,
                rgba(0, 255, 0, ${effects.rainbow * 0.1}) 42%,
                rgba(0, 255, 255, ${effects.rainbow * 0.1}) 57%,
                rgba(0, 0, 255, ${effects.rainbow * 0.1}) 71%,
                rgba(127, 0, 255, ${effects.rainbow * 0.1}) 85%,
                rgba(255, 0, 0, ${effects.rainbow * 0.1}) 100%
              )
            `,
            opacity: isHovering ? 1 : 0.6,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'screen'
          }}
        />
      )}
      
      {/* Vintage Aging Effect */}
      {effects.vintage > 0 && (
        <div 
          className="absolute inset-0 z-6"
          style={{
            background: `
              radial-gradient(
                ellipse at center,
                transparent 0%,
                rgba(101, 67, 33, ${effects.vintage * 0.1}) 60%,
                rgba(101, 67, 33, ${effects.vintage * 0.2}) 100%
              )
            `,
            opacity: 0.8,
            mixBlendMode: 'multiply'
          }}
        />
      )}
      
      {/* Particle System Overlay */}
      {effects.particles && isHovering && (
        <div className="absolute inset-0 z-7">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(
                  circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                  rgba(79, 255, 176, 0.05) 0%,
                  rgba(255, 107, 74, 0.03) 50%,
                  transparent 100%
                )
              `,
              animation: 'pulse 1.5s ease-in-out infinite',
              opacity: isHovering ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          />
        </div>
      )}
    </div>
  );
};