import React from 'react';
import { RoundedBox } from '@react-three/drei';

interface HolographicEffectProps {
  finish: string;
}

export const HolographicEffect: React.FC<HolographicEffectProps> = ({ finish }) => {
  if (finish !== 'foil') return null;

  return (
    <RoundedBox
      args={[2.52, 3.52, 0.001]}
      radius={0.1}
      smoothness={4}
      position={[0, 0, 0.051]}
    >
      <meshPhysicalMaterial
        color="#ffd700"
        transparent
        opacity={0.3}
        roughness={0}
        metalness={1}
        envMapIntensity={2}
      />
    </RoundedBox>
  );
};