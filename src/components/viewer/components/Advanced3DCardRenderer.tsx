
import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, TextureLoader } from 'three';
import * as THREE from 'three';
import type { CardData } from '@/types/card';
import { Enhanced3DEffectSystem } from './Enhanced3DEffectSystem';
import { useEffectContext } from '../contexts/EffectContext';

interface Advanced3DCardRendererProps {
  card: CardData;
  rotation: { x: number; y: number };
  zoom: number;
  materialSettings: {
    metalness: number;
    roughness: number;
    clearcoat: number;
    transmission: number;
    reflectivity: number;
  };
  effectValues?: Record<string, any>;
  selectedFrame?: string;
  frameConfig?: any;
}

export const Advanced3DCardRenderer: React.FC<Advanced3DCardRendererProps> = ({
  card,
  rotation,
  zoom,
  materialSettings,
  effectValues = {},
  selectedFrame,
  frameConfig
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const effectContext = useEffectContext();
  
  // Load card texture
  const cardTexture = useLoader(TextureLoader, card.image_url || '');
  
  // Use effect values from context if available, otherwise use props
  const activeEffectValues = effectContext?.effectValues || effectValues;
  const activeMousePosition = effectContext?.mousePosition || { x: 0.5, y: 0.5 };

  // Configure card texture
  useMemo(() => {
    if (cardTexture) {
      cardTexture.flipY = false;
      cardTexture.wrapS = THREE.ClampToEdgeWrapping;
      cardTexture.wrapT = THREE.ClampToEdgeWrapping;
      cardTexture.minFilter = THREE.LinearFilter;
      cardTexture.magFilter = THREE.LinearFilter;
    }
  }, [cardTexture]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = rotation.x * 0.01;
      groupRef.current.rotation.y = rotation.y * 0.01;
      groupRef.current.scale.setScalar(zoom);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base card mesh with image */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[4, 5.6]} />
        <meshBasicMaterial 
          map={cardTexture}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Enhanced effect system overlay */}
      <Enhanced3DEffectSystem
        effectValues={activeEffectValues}
        materialSettings={materialSettings}
        mousePosition={activeMousePosition}
        cardTexture={cardTexture}
      />

      {/* Card frame if selected */}
      {selectedFrame && selectedFrame !== 'none' && (
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[4.2, 5.8]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};
