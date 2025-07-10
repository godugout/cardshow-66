
import React, { useRef, useMemo, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Box } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import { OakTemplate } from '@/types/oakTemplates';
import { getMaterialProps } from './utils/materialConfigs';
import { createOaklandAsBrandingTexture } from './utils/textureUtils';
import { useCardAnimation } from './hooks/useCardAnimation';
import { CardFace } from './components/CardFace';
import { HolographicEffect } from './components/HolographicEffect';

interface OakMemory3DCardProps {
  template: OakTemplate;
  rotation?: Vector3;
  finish?: 'matte' | 'glossy' | 'foil';
  scale?: number;
}

export const OakMemory3DCard: React.FC<OakMemory3DCardProps> = ({
  template,
  rotation = new Vector3(0, 0, 0),
  finish = 'glossy',
  scale = 1
}) => {
  const meshRef = useRef<Mesh>(null);
  const backMeshRef = useRef<Mesh>(null);
  const [textureError, setTextureError] = useState(false);

  // Validate template data
  if (!template || typeof template !== 'object' || !template.thumbnail) {
    console.warn('Invalid template data provided to OakMemory3DCard:', template);
    return null;
  }

  // Validate and sanitize props
  const safeRotation = useMemo(() => {
    if (rotation instanceof Vector3) {
      return rotation;
    }
    return new Vector3(0, 0, 0);
  }, [rotation]);

  const safeScale = useMemo(() => {
    const scaleValue = typeof scale === 'number' && !isNaN(scale) && scale > 0 ? scale : 1;
    return Math.max(0.1, Math.min(5, scaleValue));
  }, [scale]);

  const safeFinish = useMemo(() => {
    return ['matte', 'glossy', 'foil'].includes(finish) ? finish : 'glossy';
  }, [finish]);

  // Load template texture with improved error handling
  let frontTexture;
  try {
    frontTexture = useLoader(TextureLoader, template.thumbnail, undefined, (error) => {
      console.warn('Failed to load template texture:', template.thumbnail, error);
      setTextureError(true);
    });
  } catch (error) {
    console.error('TextureLoader error for template:', error);
    setTextureError(true);
    // Use default texture as last resort
    try {
      frontTexture = useLoader(TextureLoader, '/lovable-uploads/7697ffa5-ac9b-428b-9bc0-35500bcb2286.png');
    } catch (fallbackError) {
      console.error('Failed to load fallback texture:', fallbackError);
      return null;
    }
  }

  // Oakland A's card back design
  const oaklandAsBrandingTexture = useMemo(() => createOaklandAsBrandingTexture(), []);

  // Material properties based on finish
  const materialProps = useMemo(() => getMaterialProps(safeFinish), [safeFinish]);

  // Use animation hook
  useCardAnimation(meshRef, backMeshRef, safeRotation);

  if (!frontTexture) {
    return null;
  }

  return (
    <group scale={safeScale}>
      {/* Front of card */}
      <CardFace
        ref={meshRef}
        texture={frontTexture}
        materialProps={materialProps}
        position={[0, 0, 0.025]}
      />

      {/* Back of card */}
      <CardFace
        ref={backMeshRef}
        texture={oaklandAsBrandingTexture}
        materialProps={materialProps}
        position={[0, 0, -0.025]}
        rotation={[0, Math.PI, 0]}
      />

      {/* Card edge (thickness) */}
      <Box args={[2.5, 3.5, 0.05]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.8}
          metalness={0.1}
        />
      </Box>

      {/* Holographic effect for foil finish */}
      <HolographicEffect finish={safeFinish} />
    </group>
  );
};
