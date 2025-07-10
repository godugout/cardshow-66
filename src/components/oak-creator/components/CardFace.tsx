import React, { forwardRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { Mesh, Texture } from 'three';

interface CardFaceProps {
  texture: Texture | null;
  materialProps: any;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export const CardFace = forwardRef<Mesh, CardFaceProps>(
  ({ texture, materialProps, position, rotation }, ref) => {
    return (
      <RoundedBox
        ref={ref}
        args={[2.5, 3.5, 0.05]}
        radius={0.1}
        smoothness={4}
        castShadow
        receiveShadow
        position={position}
        rotation={rotation}
      >
        <meshPhysicalMaterial
          map={texture}
          color={texture ? undefined : '#0f4c3a'}
          {...materialProps}
          transparent={false}
        />
      </RoundedBox>
    );
  }
);

CardFace.displayName = 'CardFace';