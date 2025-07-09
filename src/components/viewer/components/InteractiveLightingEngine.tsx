import React from 'react';

interface InteractiveLightingEngineProps {
  settings: {
    intensity: number;
    direction: { x: number; y: number };
    color: string;
    environment: string;
  };
  mousePosition: { x: number; y: number };
  isHovering: boolean;
}

export const InteractiveLightingEngine: React.FC<InteractiveLightingEngineProps> = ({
  settings,
  mousePosition,
  isHovering
}) => {
  // Environment presets
  const environments = {
    studio: {
      ambient: 'rgba(255, 255, 255, 0.3)',
      key: 'rgba(255, 255, 255, 0.6)',
      fill: 'rgba(200, 200, 200, 0.2)'
    },
    cosmic: {
      ambient: 'rgba(79, 255, 176, 0.2)',
      key: 'rgba(138, 43, 226, 0.4)',
      fill: 'rgba(255, 107, 74, 0.1)'
    },
    golden: {
      ambient: 'rgba(255, 215, 0, 0.2)',
      key: 'rgba(255, 223, 0, 0.5)',
      fill: 'rgba(255, 193, 7, 0.1)'
    },
    ice: {
      ambient: 'rgba(173, 216, 230, 0.2)',
      key: 'rgba(135, 206, 250, 0.4)',
      fill: 'rgba(176, 224, 230, 0.1)'
    }
  };

  const currentEnv = environments[settings.environment as keyof typeof environments] || environments.studio;

  // Calculate dynamic lighting based on mouse position
  const lightAngle = Math.atan2(
    mousePosition.y - settings.direction.y,
    mousePosition.x - settings.direction.x
  ) * (180 / Math.PI);

  // Convert hex color to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
      {/* Ambient Light Base */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: currentEnv.ambient,
          opacity: settings.intensity * 0.5,
          transition: 'opacity 0.3s ease'
        }}
      />
      
      {/* Key Light */}
      <div 
        className="absolute inset-0 z-11"
        style={{
          background: `
            radial-gradient(
              ellipse ${isHovering ? '60%' : '40%'} ${isHovering ? '40%' : '30%'} at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              ${hexToRgba(settings.color, settings.intensity * 0.3)} 0%,
              ${hexToRgba(settings.color, settings.intensity * 0.1)} 50%,
              transparent 100%
            )
          `,
          opacity: isHovering ? 1 : 0.7,
          transition: 'all 0.3s ease',
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Fill Light (opposite side) */}
      <div 
        className="absolute inset-0 z-12"
        style={{
          background: `
            radial-gradient(
              ellipse 40% 30% at ${(1 - mousePosition.x) * 100}% ${(1 - mousePosition.y) * 100}%,
              ${currentEnv.fill} 0%,
              transparent 70%
            )
          `,
          opacity: settings.intensity * 0.6,
          transition: 'opacity 0.3s ease',
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Directional Highlight */}
      <div 
        className="absolute inset-0 z-13"
        style={{
          background: `
            linear-gradient(
              ${lightAngle + 90}deg,
              transparent 0%,
              transparent 30%,
              ${hexToRgba(settings.color, settings.intensity * 0.15)} 50%,
              transparent 70%,
              transparent 100%
            )
          `,
          opacity: isHovering ? 1 : 0,
          transition: 'opacity 0.2s ease',
          mixBlendMode: 'overlay'
        }}
      />
      
      {/* Rim Light */}
      <div 
        className="absolute inset-0 z-14"
        style={{
          background: `
            radial-gradient(
              ellipse 120% 120% at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              transparent 0%,
              transparent 85%,
              ${hexToRgba(settings.color, settings.intensity * 0.4)} 95%,
              transparent 100%
            )
          `,
          opacity: isHovering ? 0.8 : 0.4,
          transition: 'opacity 0.3s ease',
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Environmental Reflection */}
      {settings.environment === 'cosmic' && (
        <div 
          className="absolute inset-0 z-15"
          style={{
            background: `
              conic-gradient(
                from ${mousePosition.x * 360}deg at 50% 50%,
                rgba(138, 43, 226, ${settings.intensity * 0.1}) 0deg,
                rgba(79, 255, 176, ${settings.intensity * 0.15}) 120deg,
                rgba(255, 107, 74, ${settings.intensity * 0.1}) 240deg,
                rgba(138, 43, 226, ${settings.intensity * 0.1}) 360deg
              )
            `,
            opacity: isHovering ? 0.6 : 0.3,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'screen'
          }}
        />
      )}
      
      {settings.environment === 'golden' && (
        <div 
          className="absolute inset-0 z-15"
          style={{
            background: `
              linear-gradient(
                ${lightAngle}deg,
                rgba(255, 215, 0, ${settings.intensity * 0.1}) 0%,
                rgba(255, 223, 0, ${settings.intensity * 0.2}) 50%,
                rgba(255, 193, 7, ${settings.intensity * 0.1}) 100%
              )
            `,
            opacity: isHovering ? 0.8 : 0.5,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'multiply'
          }}
        />
      )}
      
      {settings.environment === 'ice' && (
        <div 
          className="absolute inset-0 z-15"
          style={{
            background: `
              radial-gradient(
                ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(173, 216, 230, ${settings.intensity * 0.2}) 0%,
                rgba(135, 206, 250, ${settings.intensity * 0.1}) 50%,
                transparent 80%
              )
            `,
            opacity: isHovering ? 0.7 : 0.4,
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'overlay'
          }}
        />
      )}
      
      {/* Dynamic Shadow Casting */}
      <div 
        className="absolute inset-0 z-16"
        style={{
          background: `
            linear-gradient(
              ${lightAngle + 180}deg,
              transparent 0%,
              transparent 60%,
              rgba(0, 0, 0, ${settings.intensity * 0.1}) 90%,
              rgba(0, 0, 0, ${settings.intensity * 0.2}) 100%
            )
          `,
          opacity: isHovering ? 0.8 : 0.5,
          transition: 'opacity 0.3s ease',
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  );
};