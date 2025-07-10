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
      background: 'linear-gradient(135deg, rgba(248, 249, 250, 0.1) 0%, rgba(233, 236, 239, 0.1) 100%)',
      opacity: 0.3,
      blend: 'normal'
    },
    holographic: {
      background: `
        conic-gradient(
          from ${mousePosition.x * 720 + Date.now() * 0.05}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          rgba(79, 255, 176, ${0.4 + effects.holographic * 0.6}) 0deg,
          rgba(255, 107, 74, ${0.5 + effects.holographic * 0.5}) 60deg,
          rgba(74, 144, 255, ${0.4 + effects.holographic * 0.6}) 120deg,
          rgba(255, 0, 255, ${0.45 + effects.holographic * 0.55}) 180deg,
          rgba(0, 255, 128, ${0.4 + effects.holographic * 0.6}) 240deg,
          rgba(128, 0, 255, ${0.5 + effects.holographic * 0.5}) 300deg,
          rgba(79, 255, 176, ${0.4 + effects.holographic * 0.6}) 360deg
        )
      `,
      opacity: 0.7 + (effects.holographic * 0.3),
      blend: 'color-dodge',
      animation: 'shimmer 1.5s ease-in-out infinite alternate'
    },
    metallic: {
      background: `
        linear-gradient(
          ${mousePosition.x * 180 + 45}deg,
          rgba(255, 215, 0, ${0.3 + effects.metallic * 0.7}) 0%,
          rgba(255, 255, 255, ${0.9 + effects.metallic * 0.1}) 10%,
          rgba(255, 223, 0, ${0.5 + effects.metallic * 0.5}) 20%,
          rgba(255, 245, 157, ${0.4 + effects.metallic * 0.6}) 35%,
          rgba(255, 255, 255, ${0.95}) 50%,
          rgba(255, 245, 157, ${0.4 + effects.metallic * 0.6}) 65%,
          rgba(255, 223, 0, ${0.5 + effects.metallic * 0.5}) 80%,
          rgba(255, 255, 255, ${0.9 + effects.metallic * 0.1}) 90%,
          rgba(255, 215, 0, ${0.3 + effects.metallic * 0.7}) 100%
        )
      `,
      opacity: 0.8 + (effects.metallic * 0.2),
      blend: 'hard-light',
      reflection: true
    },
    chrome: {
      background: `
        linear-gradient(
          ${mousePosition.x * 200}deg,
          rgba(200, 200, 255, ${0.3 + effects.chrome * 0.7}) 0%,
          rgba(255, 255, 255, ${0.95 + effects.chrome * 0.05}) 10%,
          rgba(180, 180, 220, ${0.4 + effects.chrome * 0.6}) 25%,
          rgba(255, 255, 255, ${0.98}) 40%,
          rgba(255, 255, 255, ${1.0}) 50%,
          rgba(255, 255, 255, ${0.98}) 60%,
          rgba(180, 180, 220, ${0.4 + effects.chrome * 0.6}) 75%,
          rgba(255, 255, 255, ${0.95 + effects.chrome * 0.05}) 90%,
          rgba(200, 200, 255, ${0.3 + effects.chrome * 0.7}) 100%
        )
      `,
      opacity: 0.9 + (effects.chrome * 0.1),
      blend: 'screen',
      mirror: true
    },
    crystal: {
      background: `
        radial-gradient(
          ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          rgba(173, 216, 230, ${0.5 + effects.crystal * 0.5}) 0%,
          rgba(135, 206, 250, ${0.4 + effects.crystal * 0.6}) 20%,
          rgba(176, 224, 230, ${0.3 + effects.crystal * 0.5}) 40%,
          rgba(255, 255, 255, ${0.2 + effects.crystal * 0.3}) 60%,
          transparent 90%
        )
      `,
      opacity: 0.7 + (effects.crystal * 0.3),
      blend: 'soft-light',
      refraction: true
    },
    matte: {
      background: `
        linear-gradient(
          135deg,
          rgba(64, 64, 64, 0.3) 0%,
          rgba(48, 48, 48, 0.4) 50%,
          rgba(32, 32, 32, 0.5) 100%
        )
      `,
      opacity: 0.6,
      blend: 'multiply',
      absorption: true
    }
  };

  const currentConfig = materialConfigs[material as keyof typeof materialConfigs] || materialConfigs.standard;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Base Material Layer */}
      <div 
        className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]"
        style={{
          background: currentConfig.background,
          opacity: currentConfig.opacity,
          mixBlendMode: currentConfig.blend as any,
          transition: 'all 0.3s ease',
          filter: 'blur(0.5px)'
        }}
      />
      
      {/* Surface Texture */}
      <div 
        className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]"
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
          className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]"
          style={{
            background: `
              radial-gradient(
                circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 255, 255, 0.15) 0%,
                rgba(255, 255, 255, 0.08) 30%,
                rgba(255, 255, 255, 0.02) 60%,
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
          className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]"
          style={{
            background: `
              conic-gradient(
                from ${mousePosition.x * 720 + Date.now() * 0.01}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 0, 0, ${effects.prismatic * 0.25}) 0deg,
                rgba(255, 127, 0, ${effects.prismatic * 0.3}) 30deg,
                rgba(255, 255, 0, ${effects.prismatic * 0.25}) 60deg,
                rgba(0, 255, 0, ${effects.prismatic * 0.35}) 90deg,
                rgba(0, 255, 255, ${effects.prismatic * 0.3}) 150deg,
                rgba(0, 0, 255, ${effects.prismatic * 0.25}) 210deg,
                rgba(127, 0, 255, ${effects.prismatic * 0.35}) 270deg,
                rgba(255, 0, 255, ${effects.prismatic * 0.3}) 330deg,
                rgba(255, 0, 0, ${effects.prismatic * 0.25}) 360deg
              )
            `,
            opacity: isHovering ? 0.9 : 0.6,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'screen',
            filter: `blur(${effects.prismatic * 1.5}px)`,
            transform: `scale(${1 + effects.prismatic * 0.05}) rotate(${mousePosition.x * effects.prismatic * 15}deg)`
          }}
        />
      )}
      
      {/* Secondary Prismatic Layer */}
      {effects.prismatic > 0.4 && (
        <div 
          className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]"
          style={{
            background: `
              radial-gradient(
                ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 255, 255, ${effects.prismatic * 0.12}) 0%,
                rgba(255, 255, 255, ${effects.prismatic * 0.06}) 40%,
                transparent 70%
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
          className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]"
          style={{
            background: `
              repeating-linear-gradient(
                ${mousePosition.x * 180}deg,
                transparent 0px,
                rgba(255, 255, 255, ${effects.interference * 0.03}) 1px,
                transparent 2px,
                transparent 4px
              )
            `,
            opacity: 0.6,
            mixBlendMode: 'overlay'
          }}
        />
      )}
      
      {/* Rainbow Effect */}
      {effects.rainbow > 0 && (
        <div 
          className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]"
          style={{
            background: `
              linear-gradient(
                ${mousePosition.x * 360}deg,
                rgba(255, 0, 0, ${effects.rainbow * 0.12}) 0%,
                rgba(255, 127, 0, ${effects.rainbow * 0.12}) 14%,
                rgba(255, 255, 0, ${effects.rainbow * 0.12}) 28%,
                rgba(0, 255, 0, ${effects.rainbow * 0.12}) 42%,
                rgba(0, 255, 255, ${effects.rainbow * 0.12}) 57%,
                rgba(0, 0, 255, ${effects.rainbow * 0.12}) 71%,
                rgba(127, 0, 255, ${effects.rainbow * 0.12}) 85%,
                rgba(255, 0, 0, ${effects.rainbow * 0.12}) 100%
              )
            `,
            opacity: isHovering ? 0.9 : 0.5,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'screen',
            filter: 'blur(1px)'
          }}
        />
      )}
      
      {/* Vintage Aging Effect */}
      {effects.vintage > 0 && (
        <div 
          className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]"
          style={{
            background: `
              radial-gradient(
                ellipse at center,
                transparent 0%,
                rgba(101, 67, 33, ${effects.vintage * 0.12}) 50%,
                rgba(101, 67, 33, ${effects.vintage * 0.25}) 100%
              )
            `,
            opacity: 0.7,
            mixBlendMode: 'multiply'
          }}
        />
      )}
      
      {/* Enhanced Chrome Reflection */}
      {(material === 'chrome' || effects.chrome > 0.3) && (
        <div 
          className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]"
          style={{
            background: `
              linear-gradient(
                ${mousePosition.x * 180 + 45}deg,
                transparent 0%,
                rgba(255, 255, 255, ${0.2 + effects.chrome * 0.6}) 47%,
                rgba(255, 255, 255, ${0.8 + effects.chrome * 0.2}) 50%,
                rgba(255, 255, 255, ${0.2 + effects.chrome * 0.6}) 53%,
                transparent 100%
              )
            `,
            opacity: isHovering ? 0.9 : 0.6,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'screen',
            transform: `skewX(${mousePosition.x * 8 - 4}deg)`,
            filter: 'blur(0.5px)'
          }}
        />
      )}

      {/* Metallic Environment Reflection */}
      {(material === 'metallic' || effects.metallic > 0.4) && (
        <div 
          className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]"
          style={{
            background: `
              conic-gradient(
                from ${mousePosition.x * 360}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 215, 0, ${effects.metallic * 0.25}) 0deg,
                rgba(255, 255, 255, ${effects.metallic * 0.5}) 30deg,
                rgba(255, 223, 0, ${effects.metallic * 0.35}) 60deg,
                rgba(255, 245, 157, ${effects.metallic * 0.25}) 90deg,
                rgba(255, 215, 0, ${effects.metallic * 0.25}) 120deg,
                rgba(255, 255, 255, ${effects.metallic * 0.5}) 150deg,
                rgba(255, 223, 0, ${effects.metallic * 0.35}) 180deg,
                rgba(255, 245, 157, ${effects.metallic * 0.25}) 210deg,
                rgba(255, 215, 0, ${effects.metallic * 0.25}) 240deg,
                rgba(255, 255, 255, ${effects.metallic * 0.5}) 270deg,
                rgba(255, 223, 0, ${effects.metallic * 0.35}) 300deg,
                rgba(255, 245, 157, ${effects.metallic * 0.25}) 330deg,
                rgba(255, 215, 0, ${effects.metallic * 0.25}) 360deg
              )
            `,
            opacity: isHovering ? 0.8 : 0.5,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'overlay',
            filter: 'blur(1px)'
          }}
        />
      )}

      {/* Crystal Refraction Effect */}
      {(material === 'crystal' || effects.crystal > 0.3) && (
        <div 
          className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]"
          style={{
            background: `
              radial-gradient(
                ellipse ${isHovering ? '75%' : '55%'} ${isHovering ? '55%' : '35%'} at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 255, 255, ${effects.crystal * 0.35}) 0%,
                rgba(173, 216, 230, ${effects.crystal * 0.25}) 25%,
                rgba(135, 206, 250, ${effects.crystal * 0.18}) 50%,
                transparent 75%
              )
            `,
            opacity: isHovering ? 0.9 : 0.6,
            transition: 'all 0.3s ease',
            mixBlendMode: 'overlay',
            filter: `blur(${effects.crystal * 0.8}px)`
          }}
        />
      )}

      {/* Particle System Overlay */}
      {effects.particles && isHovering && (
        <div className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(
                  circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                  rgba(79, 255, 176, 0.12) 0%,
                  rgba(255, 107, 74, 0.06) 25%,
                  rgba(74, 144, 255, 0.09) 50%,
                  transparent 80%
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
                  rgba(255, 255, 255, 0.03) 1px,
                  transparent 3px
                )
              `,
              animation: 'spin 4s linear infinite',
              opacity: 0.4,
              filter: 'blur(0.5px)'
            }}
          />
        </div>
      )}
    </div>
  );
};