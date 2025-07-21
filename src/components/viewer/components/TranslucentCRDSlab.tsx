import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import type { CRD_DNA } from '@/types/crd-dna';

interface TranslucentCRDSlabProps {
  crdData: CRD_DNA;
  rotation: { x: number; y: number };
  zoom: number;
  imageUrl: string;
}

export const TranslucentCRDSlab: React.FC<TranslucentCRDSlabProps> = ({
  crdData,
  rotation,
  zoom,
  imageUrl
}) => {
  const slabGroupRef = useRef<THREE.Group>(null);
  const embeddedImageRef = useRef<THREE.Mesh>(null);
  
  // Load the card image texture with error handling
  let cardTexture: THREE.Texture;
  try {
    cardTexture = useLoader(TextureLoader, imageUrl);
  } catch (error) {
    console.warn('Failed to load texture:', imageUrl, error);
    // Create a fallback texture
    cardTexture = new THREE.Texture();
    cardTexture.needsUpdate = true;
  }
  
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

  // Calculate slab dimensions (2.5:3.5 aspect ratio)
  const slabDimensions = useMemo(() => ({
    width: 2.5,
    height: 3.5,
    depth: Math.max(0.15, crdData.slabDepth || 0.2) // Minimum depth for embedded image
  }), [crdData.slabDepth]);

  // Calculate embedded image dimensions (slightly smaller than slab face)
  const imageDimensions = useMemo(() => ({
    width: slabDimensions.width * 0.85, // 85% of slab width
    height: slabDimensions.height * 0.85 // 85% of slab height
  }), [slabDimensions]);

  // Create translucent slab material
  const slabMaterial = useMemo(() => {
    const material = new THREE.MeshPhysicalMaterial({
      color: crdData.slabMaterial.baseColor,
      transparent: true,
      opacity: crdData.translucency,
      roughness: crdData.slabMaterial.roughness,
      metalness: crdData.slabMaterial.metallic,
      transmission: 0.9, // High transmission for glass-like effect
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      ior: crdData.slabMaterial.refractionIndex || 1.5, // Index of refraction
      thickness: slabDimensions.depth,
      emissive: crdData.slabMaterial.emissive || '#000000',
      emissiveIntensity: 0.1
    });
    
    return material;
  }, [crdData.slabMaterial, crdData.translucency, slabDimensions.depth]);

  // Create embedded image material with fallback
  const imageMaterial = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: crdData.embeddedImage.clarity || 0.95,
      side: THREE.DoubleSide
    });
    
    // If texture loaded successfully, use it, otherwise use a solid color
    if (cardTexture && cardTexture.image && cardTexture.image.complete) {
      material.map = cardTexture;
    } else {
      // Use a gradient-like fallback color based on rarity
      const rarityColors = {
        'Common': '#8B8B8B',
        'Uncommon': '#2ECC71',
        'Rare': '#3498DB',
        'Epic': '#9B59B6',
        'Legendary': '#F39C12',
        'Mythic': '#E74C3C'
      };
      material.color = new THREE.Color(rarityColors[crdData.rarity] || '#8B8B8B');
    }
    
    return material;
  }, [cardTexture, crdData.embeddedImage.clarity, crdData.rarity]);

  // Animation frame
  useFrame((state) => {
    if (slabGroupRef.current) {
      slabGroupRef.current.rotation.x = rotation.x * 0.01;
      slabGroupRef.current.rotation.y = rotation.y * 0.01;
      slabGroupRef.current.scale.setScalar(zoom);
    }

    // Add subtle floating animation to embedded image
    if (embeddedImageRef.current) {
      const time = state.clock.getElapsedTime();
      embeddedImageRef.current.position.z = Math.sin(time * 0.5) * 0.01;
    }
  });

  return (
    <group ref={slabGroupRef}>
      {/* Translucent slab container */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[slabDimensions.width, slabDimensions.height, slabDimensions.depth]} />
        <primitive object={slabMaterial} />
      </mesh>

      {/* Embedded card image in center of slab */}
      <mesh 
        ref={embeddedImageRef}
        position={[
          crdData.embeddedImage.position.x || 0,
          crdData.embeddedImage.position.y || 0,
          crdData.embeddedImage.position.z || 0
        ]}
      >
        <planeGeometry args={[imageDimensions.width, imageDimensions.height]} />
        <primitive object={imageMaterial} />
      </mesh>

      {/* Card elements overlay */}
      {crdData.elements.map((element, index) => (
        <mesh
          key={element.id}
          position={[
            element.position.x * slabDimensions.width * 0.4,
            element.position.y * slabDimensions.height * 0.4,
            element.position.z * 0.05 + 0.01
          ]}
          scale={[element.scale, element.scale, 1]}
          rotation={[0, 0, element.rotation]}
        >
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent
            opacity={element.opacity}
          />
        </mesh>
      ))}

      {/* Effect layers */}
      {crdData.effects.map((effect, index) => {
        const effectPosition = effect.boundingArea === 'slab' 
          ? [0, 0, slabDimensions.depth / 2 + 0.02]
          : [0, 0, 0.05];

        return (
          <group key={effect.id} position={effectPosition as [number, number, number]}>
            {effect.type === 'neon' && (
              <mesh>
                <ringGeometry args={[
                  slabDimensions.width * 0.6, 
                  slabDimensions.width * 0.65, 
                  32
                ]} />
                <meshBasicMaterial
                  color={effect.color || '#00ffff'}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            )}
            
            {effect.type === 'particles' && (
              <points>
                <sphereGeometry args={[0.01, 8, 8]} />
                <pointsMaterial
                  color={effect.color || '#ffffff'}
                  size={0.05}
                  transparent
                  opacity={effect.intensity}
                />
              </points>
            )}
            
            {effect.type === 'lighting' && (
              <pointLight
                color={effect.color || '#ffffff'}
                intensity={effect.intensity}
                distance={2}
                decay={2}
              />
            )}
          </group>
        );
      })}

      {/* Ambient glow around slab */}
      <mesh position={[0, 0, 0]} scale={[1.1, 1.1, 1.1]}>
        <boxGeometry args={[slabDimensions.width, slabDimensions.height, slabDimensions.depth]} />
        <meshBasicMaterial
          color={crdData.slabMaterial.baseColor}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};