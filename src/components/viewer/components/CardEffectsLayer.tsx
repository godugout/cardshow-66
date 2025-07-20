
import React from 'react';
import { useEffectContext } from '../contexts/EffectContext';

interface CardEffectsLayerProps {
  // Remove all the previously passed props since we'll get them from context
}

export const CardEffectsLayer: React.FC<CardEffectsLayerProps> = () => {
  const context = useEffectContext();
  
  if (!context) {
    return null;
  }

  const {
    showEffects,
    isHovering,
    effectIntensity,
    mousePosition,
    effectValues,
    materialSettings,
    interactiveLighting
  } = context;

  if (!showEffects) {
    return null;
  }

  // Enhanced physical effect styles with depth
  const physicalEffectStyles: React.CSSProperties = {
    transform: `
      perspective(1000px) 
      rotateX(${mousePosition.y * 8}deg) 
      rotateY(${mousePosition.x * 8}deg)
      translateZ(${isHovering ? 10 : 0}px)
    `,
    transformStyle: 'preserve-3d',
    transition: 'transform 0.15s ease-out',
  };

  // Calculate overall effect intensity
  const totalEffectIntensity = Object.values(effectValues).reduce((total, effect) => {
    return total + (typeof effect === 'object' && effect?.intensity ? effect.intensity : 0);
  }, 0);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Enhanced metallic reflection overlay */}
      {(effectValues.chrome?.intensity > 0 || effectValues.gold?.intensity > 0) && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                ${45 + mousePosition.x * 45}deg,
                rgba(255, 255, 255, ${0.05 * (materialSettings.reflectivity / 100)}) 0%,
                rgba(255, 255, 255, ${0.4 * (materialSettings.reflectivity / 100)}) 25%,
                rgba(255, 255, 255, ${0.6 * (materialSettings.reflectivity / 100)}) 50%,
                rgba(255, 255, 255, ${0.4 * (materialSettings.reflectivity / 100)}) 75%,
                rgba(255, 255, 255, ${0.05 * (materialSettings.reflectivity / 100)}) 100%
              ),
              radial-gradient(
                ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 255, 255, 0.3) 0%,
                rgba(255, 255, 255, 0.1) 40%,
                transparent 80%
              )
            `,
            mixBlendMode: 'overlay',
            opacity: isHovering ? 0.9 : 0.6,
            transition: 'opacity 0.3s ease',
            filter: `blur(${isHovering ? 0 : 0.5}px)`,
            ...physicalEffectStyles
          }}
        />
      )}

      {/* Advanced holographic prismatic effects */}
      {effectValues.holographic?.intensity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              conic-gradient(
                from ${mousePosition.x * 360}deg at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%,
                transparent 0deg,
                rgba(255, 0, 150, ${(effectValues.holographic.intensity / 100) * 0.2}) 45deg,
                rgba(0, 255, 255, ${(effectValues.holographic.intensity / 100) * 0.25}) 90deg,
                rgba(255, 255, 0, ${(effectValues.holographic.intensity / 100) * 0.2}) 135deg,
                rgba(255, 0, 150, ${(effectValues.holographic.intensity / 100) * 0.22}) 180deg,
                rgba(0, 255, 255, ${(effectValues.holographic.intensity / 100) * 0.25}) 225deg,
                rgba(255, 255, 0, ${(effectValues.holographic.intensity / 100) * 0.2}) 270deg,
                rgba(255, 0, 150, ${(effectValues.holographic.intensity / 100) * 0.22}) 315deg,
                transparent 360deg
              ),
              radial-gradient(
                ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 255, 255, ${(effectValues.holographic.intensity / 100) * 0.3}) 0%,
                rgba(255, 255, 255, ${(effectValues.holographic.intensity / 100) * 0.15}) 50%,
                transparent 100%
              )
            `,
            mixBlendMode: 'color-dodge',
            opacity: (effectValues.holographic.intensity / 100) * 0.8,
            transition: 'opacity 0.3s ease',
            filter: `blur(${1 - (effectValues.holographic.intensity / 100)}px)`,
            ...physicalEffectStyles
          }}
        />
      )}

      {/* Enhanced crystal facet effects */}
      {effectValues.crystal?.intensity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 255, 255, ${(effectValues.crystal.intensity / 100) * 0.4}) 0%,
                rgba(230, 245, 255, ${(effectValues.crystal.intensity / 100) * 0.25}) 30%,
                rgba(200, 230, 255, ${(effectValues.crystal.intensity / 100) * 0.15}) 60%,
                transparent 100%
              ),
              linear-gradient(
                ${mousePosition.x * 180}deg,
                transparent 0%,
                rgba(255, 255, 255, ${(effectValues.crystal.intensity / 100) * 0.5}) 48%,
                rgba(255, 255, 255, ${(effectValues.crystal.intensity / 100) * 0.7}) 50%,
                rgba(255, 255, 255, ${(effectValues.crystal.intensity / 100) * 0.5}) 52%,
                transparent 100%
              )
            `,
            mixBlendMode: 'overlay',
            opacity: effectValues.crystal.intensity / 100,
            transition: 'opacity 0.3s ease',
            ...physicalEffectStyles
          }}
        />
      )}

      {/* Prizm geometric effects */}
      {effectValues.prizm?.intensity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              conic-gradient(
                from ${mousePosition.x * 360}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 0, 127, ${(effectValues.prizm.intensity / 100) * 0.25}) 0deg,
                rgba(127, 255, 0, ${(effectValues.prizm.intensity / 100) * 0.3}) 72deg,
                rgba(0, 127, 255, ${(effectValues.prizm.intensity / 100) * 0.25}) 144deg,
                rgba(255, 127, 0, ${(effectValues.prizm.intensity / 100) * 0.28}) 216deg,
                rgba(127, 0, 255, ${(effectValues.prizm.intensity / 100) * 0.25}) 288deg,
                rgba(255, 0, 127, ${(effectValues.prizm.intensity / 100) * 0.25}) 360deg
              )
            `,
            clipPath: `polygon(
              ${15 + mousePosition.x * 15}% ${15 + mousePosition.y * 15}%,
              ${85 - mousePosition.x * 15}% ${15 + mousePosition.y * 15}%,
              ${95 - mousePosition.x * 10}% ${50}%,
              ${85 - mousePosition.x * 15}% ${85 - mousePosition.y * 15}%,
              ${15 + mousePosition.x * 15}% ${85 - mousePosition.y * 15}%,
              ${5 + mousePosition.x * 10}% ${50}%
            )`,
            mixBlendMode: 'color-dodge',
            opacity: (effectValues.prizm.intensity / 100) * 0.7,
            transition: 'opacity 0.3s ease',
            ...physicalEffectStyles
          }}
        />
      )}

      {/* Gold shimmer effect */}
      {effectValues.gold?.intensity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse at ${40 + mousePosition.x * 20}% ${40 + mousePosition.y * 20}%,
                rgba(255, 215, 0, ${(effectValues.gold.intensity / 100) * 0.3}) 0%,
                rgba(255, 165, 0, ${(effectValues.gold.intensity / 100) * 0.2}) 40%,
                rgba(184, 134, 11, ${(effectValues.gold.intensity / 100) * 0.15}) 70%,
                transparent 100%
              ),
              linear-gradient(
                ${45 + mousePosition.x * 90}deg,
                transparent 0%,
                rgba(255, 255, 153, ${(effectValues.gold.intensity / 100) * 0.4}) 25%,
                rgba(255, 215, 0, ${(effectValues.gold.intensity / 100) * 0.3}) 50%,
                rgba(255, 255, 153, ${(effectValues.gold.intensity / 100) * 0.4}) 75%,
                transparent 100%
              )
            `,
            mixBlendMode: 'screen',
            opacity: (effectValues.gold.intensity / 100) * 0.8,
            transition: 'opacity 0.3s ease',
            ...physicalEffectStyles
          }}
        />
      )}

      {/* Foil spray particle effect */}
      {effectValues.foilspray?.intensity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 25%, rgba(192, 192, 192, ${(effectValues.foilspray.intensity / 100) * 0.3}) 1px, transparent 3px),
              radial-gradient(circle at 65% 75%, rgba(255, 255, 255, ${(effectValues.foilspray.intensity / 100) * 0.25}) 1px, transparent 3px),
              radial-gradient(circle at 85% 15%, rgba(176, 176, 176, ${(effectValues.foilspray.intensity / 100) * 0.3}) 1px, transparent 3px),
              radial-gradient(circle at 25% 85%, rgba(208, 208, 208, ${(effectValues.foilspray.intensity / 100) * 0.25}) 1px, transparent 3px),
              radial-gradient(circle at 75% 35%, rgba(224, 224, 224, ${(effectValues.foilspray.intensity / 100) * 0.25}) 1px, transparent 3px),
              radial-gradient(circle at 45% 55%, rgba(240, 240, 240, ${(effectValues.foilspray.intensity / 100) * 0.2}) 1px, transparent 3px)
            `,
            backgroundSize: '60px 60px, 45px 45px, 55px 55px, 48px 48px, 52px 52px, 35px 35px',
            backgroundPosition: `
              ${mousePosition.x * 15}px ${mousePosition.y * 15}px, 
              ${mousePosition.x * -12}px ${mousePosition.y * 18}px,
              ${mousePosition.x * 20}px ${mousePosition.y * -8}px,
              ${mousePosition.x * -15}px ${mousePosition.y * -12}px,
              ${mousePosition.x * 8}px ${mousePosition.y * 20}px,
              ${mousePosition.x * -6}px ${mousePosition.y * 10}px
            `,
            mixBlendMode: 'screen',
            opacity: (effectValues.foilspray.intensity / 100) * 0.6,
            transition: 'opacity 0.3s ease',
            ...physicalEffectStyles
          }}
        />
      )}

      {/* Global transparency overlay for advanced blending */}
      {totalEffectIntensity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(255, 255, 255, ${Math.min(0.1, totalEffectIntensity / 1000)}) 0%,
                transparent 60%
              )
            `,
            mixBlendMode: 'soft-light',
            opacity: 0.3,
            transition: 'opacity 0.3s ease',
            ...physicalEffectStyles
          }}
        />
      )}
    </div>
  );
};
