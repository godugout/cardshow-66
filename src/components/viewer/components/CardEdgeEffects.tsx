import React from 'react';

interface CardEdgeEffectsProps {
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
  material: string;
  lighting: {
    intensity: number;
    direction: { x: number; y: number };
    color: string;
    environment: string;
  };
  mousePosition: { x: number; y: number };
  isHovering: boolean;
}

export const CardEdgeEffects: React.FC<CardEdgeEffectsProps> = ({
  effects,
  material,
  lighting,
  mousePosition,
  isHovering
}) => {
  // Calculate lighting direction for edge highlights
  const lightAngle = Math.atan2(
    mousePosition.y - 0.5, 
    mousePosition.x - 0.5
  ) * (180 / Math.PI);
  
  // Base edge shadow and highlight
  const baseEdgeShadow = `
    inset 0 0 0 1px rgba(255, 255, 255, ${isHovering ? 0.3 : 0.1}),
    inset 0 0 0 2px rgba(0, 0, 0, 0.1),
    0 0 20px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(0, 0, 0, 0.1)
  `;

  // Material-specific edge effects
  const getMaterialEdgeEffect = () => {
    switch (material) {
      case 'holographic':
        return `
          ${baseEdgeShadow},
          inset 0 0 0 1px rgba(79, 255, 176, ${effects.holographic * 0.5}),
          0 0 30px rgba(79, 255, 176, ${effects.holographic * 0.3})
        `;
      
      case 'metallic':
        return `
          ${baseEdgeShadow},
          inset 0 0 0 1px rgba(255, 215, 0, ${effects.metallic * 0.6}),
          0 0 25px rgba(255, 215, 0, ${effects.metallic * 0.2})
        `;
      
      case 'chrome':
        return `
          ${baseEdgeShadow},
          inset 0 0 0 1px rgba(200, 200, 255, ${effects.chrome * 0.8}),
          0 0 35px rgba(200, 200, 255, ${effects.chrome * 0.4})
        `;
      
      case 'crystal':
        return `
          ${baseEdgeShadow},
          inset 0 0 0 1px rgba(123, 179, 189, ${effects.crystal * 0.7}),
          0 0 40px rgba(123, 179, 189, ${effects.crystal * 0.3})
        `;
      
      default:
        return baseEdgeShadow;
    }
  };

  // Dynamic thickness effect based on lighting
  const edgeThickness = 2 + (lighting.intensity * 3);
  
  return (
    <>
      {/* Main Edge Effect Layer */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none z-50"
        style={{
          boxShadow: getMaterialEdgeEffect(),
          transition: 'box-shadow 0.3s ease'
        }}
      />
      
      {/* Interactive Light Reflection on Edges */}
      {isHovering && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none z-51"
          style={{
            background: `
              linear-gradient(
                ${lightAngle + 90}deg,
                transparent 0%,
                transparent 40%,
                rgba(255, 255, 255, ${lighting.intensity * 0.2}) 50%,
                transparent 60%,
                transparent 100%
              )
            `,
            opacity: isHovering ? 1 : 0,
            transition: 'opacity 0.2s ease'
          }}
        />
      )}
      
      {/* Corner Highlights */}
      <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none z-52">
        <div 
          className="w-full h-full rounded-tl-xl"
          style={{
            background: `
              radial-gradient(
                ellipse at top left,
                rgba(255, 255, 255, ${isHovering ? 0.4 : 0.2}) 0%,
                transparent 70%
              )
            `,
            opacity: lighting.intensity,
            transition: 'opacity 0.3s ease'
          }}
        />
      </div>
      
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none z-52">
        <div 
          className="w-full h-full rounded-tr-xl"
          style={{
            background: `
              radial-gradient(
                ellipse at top right,
                rgba(255, 255, 255, ${isHovering ? 0.4 : 0.2}) 0%,
                transparent 70%
              )
            `,
            opacity: lighting.intensity,
            transition: 'opacity 0.3s ease'
          }}
        />
      </div>
      
      <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none z-52">
        <div 
          className="w-full h-full rounded-bl-xl"
          style={{
            background: `
              radial-gradient(
                ellipse at bottom left,
                rgba(255, 255, 255, ${isHovering ? 0.3 : 0.15}) 0%,
                transparent 70%
              )
            `,
            opacity: lighting.intensity * 0.8,
            transition: 'opacity 0.3s ease'
          }}
        />
      </div>
      
      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none z-52">
        <div 
          className="w-full h-full rounded-br-xl"
          style={{
            background: `
              radial-gradient(
                ellipse at bottom right,
                rgba(255, 255, 255, ${isHovering ? 0.3 : 0.15}) 0%,
                transparent 70%
              )
            `,
            opacity: lighting.intensity * 0.8,
            transition: 'opacity 0.3s ease'
          }}
        />
      </div>
      
      {/* Prismatic Edge Dispersion */}
      {effects.prismatic > 0 && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none z-53"
          style={{
            background: `
              conic-gradient(
                from ${mousePosition.x * 360}deg,
                rgba(255, 0, 0, ${effects.prismatic * 0.1}) 0deg,
                rgba(255, 255, 0, ${effects.prismatic * 0.1}) 60deg,
                rgba(0, 255, 0, ${effects.prismatic * 0.1}) 120deg,
                rgba(0, 255, 255, ${effects.prismatic * 0.1}) 180deg,
                rgba(0, 0, 255, ${effects.prismatic * 0.1}) 240deg,
                rgba(255, 0, 255, ${effects.prismatic * 0.1}) 300deg,
                rgba(255, 0, 0, ${effects.prismatic * 0.1}) 360deg
              )
            `,
            maskImage: `
              linear-gradient(to center, transparent 85%, black 95%)
            `,
            WebkitMaskImage: `
              linear-gradient(to center, transparent 85%, black 95%)
            `,
            opacity: isHovering ? 1 : 0.6,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
      
      {/* Particle Edge Effect */}
      {effects.particles && isHovering && (
        <div className="absolute inset-0 rounded-xl pointer-events-none z-54 overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(
                  circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                  rgba(79, 255, 176, 0.3) 0%,
                  rgba(255, 107, 74, 0.2) 30%,
                  transparent 60%
                )
              `,
              animation: 'pulse 2s ease-in-out infinite',
              maskImage: `
                linear-gradient(to center, transparent 80%, black 90%)
              `,
              WebkitMaskImage: `
                linear-gradient(to center, transparent 80%, black 90%)
              `
            }}
          />
        </div>
      )}
    </>
  );
};