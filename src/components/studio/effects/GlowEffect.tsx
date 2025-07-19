
import React from 'react';

interface GlowEffectProps {
  intensity?: number;
  color?: string;
  enabled?: boolean;
  children: React.ReactNode;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({ 
  intensity = 0, 
  color = "#4ade80", 
  enabled = false, 
  children 
}) => {
  return (
    <group>
      {children}
      {enabled && intensity > 0 && (
        <mesh position={[0, 0, 0.001]}>
          <boxGeometry args={[2.52, 3.52, 0.001]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={intensity / 100 * 0.3}
          />
        </mesh>
      )}
    </group>
  );
};
