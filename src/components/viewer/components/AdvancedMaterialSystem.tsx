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
  // Enhanced material configurations with dramatic real-world effects
  const materialConfigs = {
    standard: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      opacity: 1,
      blend: 'normal'
    },
    holographic: {
      background: `
        conic-gradient(
          from ${mousePosition.x * 720}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          rgba(255, 0, 128, ${0.3 + effects.holographic * 0.4}) 0deg,
          rgba(0, 255, 255, ${0.4 + effects.holographic * 0.5}) 60deg,
          rgba(255, 255, 0, ${0.3 + effects.holographic * 0.4}) 120deg,
          rgba(255, 0, 255, ${0.35 + effects.holographic * 0.45}) 180deg,
          rgba(0, 255, 128, ${0.3 + effects.holographic * 0.4}) 240deg,
          rgba(128, 0, 255, ${0.4 + effects.holographic * 0.5}) 300deg,
          rgba(255, 0, 128, ${0.3 + effects.holographic * 0.4}) 360deg
        )
      `,
      opacity: 0.8 + (effects.holographic * 0.2),
      blend: 'screen',
      animation: 'shimmer 2s ease-in-out infinite alternate'
    },
    metallic: {
      background: `
        linear-gradient(
          ${mousePosition.x * 120 + 45}deg,
          rgba(255, 215, 0, ${0.2 + effects.metallic * 0.6}) 0%,
          rgba(255, 255, 255, ${0.8 + effects.metallic * 0.2}) 15%,
          rgba(255, 223, 0, ${0.4 + effects.metallic * 0.6}) 30%,
          rgba(255, 245, 157, ${0.3 + effects.metallic * 0.5}) 50%,
          rgba(255, 223, 0, ${0.4 + effects.metallic * 0.6}) 70%,
          rgba(255, 255, 255, ${0.8 + effects.metallic * 0.2}) 85%,
          rgba(255, 215, 0, ${0.2 + effects.metallic * 0.6}) 100%
        )
      `,
      opacity: 0.7 + (effects.metallic * 0.3),
      blend: 'overlay',
      reflection: true
    },
    chrome: {
      background: `
        linear-gradient(
          ${mousePosition.x * 180}deg,
          rgba(220, 220, 255, ${0.2 + effects.chrome * 0.8}) 0%,
          rgba(255, 255, 255, ${0.9 + effects.chrome * 0.1}) 20%,
          rgba(180, 180, 220, ${0.3 + effects.chrome * 0.7}) 40%,
          rgba(255, 255, 255, ${0.95}) 50%,
          rgba(180, 180, 220, ${0.3 + effects.chrome * 0.7}) 60%,
          rgba(255, 255, 255, ${0.9 + effects.chrome * 0.1}) 80%,
          rgba(220, 220, 255, ${0.2 + effects.chrome * 0.8}) 100%
        )
      `,
      opacity: 0.8 + (effects.chrome * 0.2),
      blend: 'hard-light',
      mirror: true
    },
    crystal: {
      background: `
        radial-gradient(
          ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          rgba(173, 216, 230, ${0.4 + effects.crystal * 0.6}) 0%,
          rgba(135, 206, 250, ${0.3 + effects.crystal * 0.5}) 30%,
          rgba(176, 224, 230, ${0.2 + effects.crystal * 0.4}) 60%,
          transparent 80%
        )
      `,
      opacity: 0.6 + (effects.crystal * 0.4),
      blend: 'overlay',
      refraction: true
    },
    matte: {
      background: `
        linear-gradient(
          135deg,
          rgba(64, 64, 64, 0.2) 0%,
          rgba(48, 48, 48, 0.3) 100%
        )
      `,
      opacity: 0.8,
      blend: 'multiply',
      absorption: true
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
      
      {/* Enhanced Prismatic Dispersion */}
      {effects.prismatic > 0 && (
        <div 
          className="absolute inset-0 z-3"
          style={{
            background: `
              conic-gradient(
                from ${mousePosition.x * 720}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 0, 0, ${effects.prismatic * 0.2}) 0deg,
                rgba(255, 127, 0, ${effects.prismatic * 0.25}) 30deg,
                rgba(255, 255, 0, ${effects.prismatic * 0.2}) 60deg,
                rgba(0, 255, 0, ${effects.prismatic * 0.3}) 90deg,
                rgba(0, 255, 255, ${effects.prismatic * 0.25}) 150deg,
                rgba(0, 0, 255, ${effects.prismatic * 0.2}) 210deg,
                rgba(127, 0, 255, ${effects.prismatic * 0.3}) 270deg,
                rgba(255, 0, 255, ${effects.prismatic * 0.25}) 330deg,
                rgba(255, 0, 0, ${effects.prismatic * 0.2}) 360deg
              )
            `,
            opacity: isHovering ? 1 : 0.7,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'screen',
            filter: `blur(${effects.prismatic * 2}px)`,
            transform: `scale(${1 + effects.prismatic * 0.1}) rotate(${mousePosition.x * effects.prismatic * 30}deg)`
          }}
        />
      )}
      
      {/* Secondary Prismatic Layer */}
      {effects.prismatic > 0.5 && (
        <div 
          className="absolute inset-0 z-3"
          style={{
            background: `
              radial-gradient(
                ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 255, 255, ${effects.prismatic * 0.1}) 0%,
                transparent 50%
              )
            `,
            opacity: isHovering ? 0.8 : 0.5,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'overlay'
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
      
      {/* Enhanced Chrome Reflection */}
      {(material === 'chrome' || effects.chrome > 0.3) && (
        <div 
          className="absolute inset-0 z-7"
          style={{
            background: `
              linear-gradient(
                ${mousePosition.x * 180 + 45}deg,
                transparent 0%,
                rgba(255, 255, 255, ${0.3 + effects.chrome * 0.7}) 48%,
                rgba(255, 255, 255, ${0.9 + effects.chrome * 0.1}) 50%,
                rgba(255, 255, 255, ${0.3 + effects.chrome * 0.7}) 52%,
                transparent 100%
              )
            `,
            opacity: isHovering ? 1 : 0.7,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'screen',
            transform: `skewX(${mousePosition.x * 10 - 5}deg)`
          }}
        />
      )}

      {/* Metallic Environment Reflection */}
      {(material === 'metallic' || effects.metallic > 0.4) && (
        <div 
          className="absolute inset-0 z-8"
          style={{
            background: `
              conic-gradient(
                from ${mousePosition.x * 360}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 215, 0, ${effects.metallic * 0.2}) 0deg,
                rgba(255, 255, 255, ${effects.metallic * 0.4}) 30deg,
                rgba(255, 223, 0, ${effects.metallic * 0.3}) 60deg,
                rgba(255, 245, 157, ${effects.metallic * 0.2}) 90deg,
                rgba(255, 215, 0, ${effects.metallic * 0.2}) 120deg,
                rgba(255, 255, 255, ${effects.metallic * 0.4}) 150deg,
                rgba(255, 223, 0, ${effects.metallic * 0.3}) 180deg,
                rgba(255, 245, 157, ${effects.metallic * 0.2}) 210deg,
                rgba(255, 215, 0, ${effects.metallic * 0.2}) 240deg,
                rgba(255, 255, 255, ${effects.metallic * 0.4}) 270deg,
                rgba(255, 223, 0, ${effects.metallic * 0.3}) 300deg,
                rgba(255, 245, 157, ${effects.metallic * 0.2}) 330deg,
                rgba(255, 215, 0, ${effects.metallic * 0.2}) 360deg
              )
            `,
            opacity: isHovering ? 0.9 : 0.6,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'overlay'
          }}
        />
      )}

      {/* Crystal Refraction Effect */}
      {(material === 'crystal' || effects.crystal > 0.3) && (
        <div 
          className="absolute inset-0 z-9"
          style={{
            background: `
              radial-gradient(
                ellipse ${isHovering ? '80%' : '60%'} ${isHovering ? '60%' : '40%'} at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 255, 255, ${effects.crystal * 0.3}) 0%,
                rgba(173, 216, 230, ${effects.crystal * 0.2}) 30%,
                rgba(135, 206, 250, ${effects.crystal * 0.15}) 60%,
                transparent 80%
              )
            `,
            opacity: isHovering ? 1 : 0.7,
            transition: 'all 0.3s ease',
            mixBlendMode: 'overlay',
            filter: `blur(${effects.crystal * 1}px)`
          }}
        />
      )}

      {/* Particle System Overlay */}
      {effects.particles && isHovering && (
        <div className="absolute inset-0 z-10">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(
                  circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                  rgba(79, 255, 176, 0.1) 0%,
                  rgba(255, 107, 74, 0.05) 30%,
                  rgba(74, 144, 255, 0.08) 60%,
                  transparent 100%
                )
              `,
              animation: 'pulse 1.5s ease-in-out infinite',
              opacity: isHovering ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          />
          {/* Secondary particle layer */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                repeating-radial-gradient(
                  circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                  transparent 0px,
                  rgba(255, 255, 255, 0.02) 2px,
                  transparent 4px
                )
              `,
              animation: 'spin 3s linear infinite',
              opacity: 0.6
            }}
          />
        </div>
      )}
    </div>
  );
};