import React from 'react';

interface MaterialWallpaperProps {
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

export const MaterialWallpaper: React.FC<MaterialWallpaperProps> = ({
  material,
  effects,
  mousePosition,
  isHovering
}) => {
  const getWallpaperStyle = (): React.CSSProperties => {
    const intensity = isHovering ? 1.2 : 0.8;
    
    switch (material) {
      case 'holographic':
        return {
          background: `
            radial-gradient(
              ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(138, 43, 226, ${0.05 * intensity}) 0%,
              rgba(255, 0, 128, ${0.03 * intensity}) 30%,
              rgba(0, 255, 255, ${0.02 * intensity}) 60%,
              rgba(0, 0, 0, 0.95) 100%
            ),
            linear-gradient(
              ${mousePosition.x * 360}deg,
              rgba(138, 43, 226, ${0.02 * intensity}),
              rgba(255, 0, 128, ${0.01 * intensity}),
              rgba(0, 255, 255, ${0.02 * intensity})
            )
          `,
          transition: 'all 0.3s ease'
        };
        
      case 'metallic':
        return {
          background: `
            radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(192, 192, 192, ${0.03 * intensity}) 0%,
              rgba(105, 105, 105, ${0.02 * intensity}) 50%,
              rgba(0, 0, 0, 0.98) 100%
            ),
            linear-gradient(
              ${mousePosition.x * 45}deg,
              rgba(220, 220, 220, ${0.02 * intensity}),
              rgba(169, 169, 169, ${0.01 * intensity}),
              rgba(105, 105, 105, ${0.02 * intensity})
            )
          `,
          transition: 'all 0.3s ease'
        };
        
      case 'chrome':
        return {
          background: `
            radial-gradient(
              ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 255, 255, ${0.04 * intensity}) 0%,
              rgba(192, 192, 192, ${0.02 * intensity}) 40%,
              rgba(0, 0, 0, 0.97) 100%
            ),
            linear-gradient(
              ${mousePosition.x * 60}deg,
              rgba(248, 248, 248, ${0.03 * intensity}),
              rgba(192, 192, 192, ${0.01 * intensity}),
              rgba(128, 128, 128, ${0.02 * intensity})
            )
          `,
          transition: 'all 0.3s ease'
        };
        
      case 'crystal':
        return {
          background: `
            radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(173, 216, 230, ${0.04 * intensity}) 0%,
              rgba(135, 206, 235, ${0.02 * intensity}) 40%,
              rgba(0, 0, 0, 0.96) 100%
            ),
            linear-gradient(
              ${mousePosition.x * 90}deg,
              rgba(240, 248, 255, ${0.02 * intensity}),
              rgba(173, 216, 230, ${0.01 * intensity}),
              rgba(135, 206, 235, ${0.02 * intensity})
            )
          `,
          transition: 'all 0.3s ease'
        };
        
      case 'vintage':
        return {
          background: `
            radial-gradient(
              ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(139, 69, 19, ${0.03 * intensity}) 0%,
              rgba(160, 82, 45, ${0.02 * intensity}) 50%,
              rgba(0, 0, 0, 0.98) 100%
            ),
            linear-gradient(
              ${mousePosition.x * 30}deg,
              rgba(222, 184, 135, ${0.02 * intensity}),
              rgba(210, 180, 140, ${0.01 * intensity}),
              rgba(139, 69, 19, ${0.02 * intensity})
            )
          `,
          transition: 'all 0.3s ease'
        };
        
      case 'prismatic':
        return {
          background: `
            conic-gradient(
              from ${mousePosition.x * 360}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 0, 0, ${0.02 * intensity}) 0deg,
              rgba(255, 165, 0, ${0.02 * intensity}) 60deg,
              rgba(255, 255, 0, ${0.02 * intensity}) 120deg,
              rgba(0, 255, 0, ${0.02 * intensity}) 180deg,
              rgba(0, 0, 255, ${0.02 * intensity}) 240deg,
              rgba(128, 0, 128, ${0.02 * intensity}) 300deg,
              rgba(255, 0, 0, ${0.02 * intensity}) 360deg
            ),
            radial-gradient(
              circle at center,
              rgba(0, 0, 0, 0.95) 0%,
              rgba(0, 0, 0, 0.98) 100%
            )
          `,
          transition: 'all 0.3s ease'
        };
        
      default:
        return {
          background: `
            radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(20, 20, 20, 0.8) 0%,
              rgba(0, 0, 0, 0.95) 100%
            )
          `,
          transition: 'all 0.3s ease'
        };
    }
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full -z-10"
      style={getWallpaperStyle()}
    />
  );
};