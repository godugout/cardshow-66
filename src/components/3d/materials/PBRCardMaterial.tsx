import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface PBRTextureSet {
  albedo?: THREE.Texture;
  normal?: THREE.Texture;
  roughness?: THREE.Texture;
  metalness?: THREE.Texture;
  ao?: THREE.Texture;
  height?: THREE.Texture;
  emissive?: THREE.Texture;
}

interface PBRCardMaterialProps {
  textures: PBRTextureSet;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  material: {
    preset: 'standard' | 'metallic' | 'chrome' | 'crystal' | 'holographic';
    metalness: number;
    roughness: number;
    transparency: number;
    emission: number;
  };
  effects?: {
    holographic?: { intensity: number; colorShift: number };
    anisotropic?: { strength: number; direction: THREE.Vector2 };
    subsurface?: { thickness: number; color: THREE.Color };
    clearcoat?: { intensity: number; roughness: number };
  };
}

export const PBRCardMaterial: React.FC<PBRCardMaterialProps> = ({
  textures,
  rarity,
  material,
  effects = {}
}) => {
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  
  // Create procedural textures for missing maps
  const proceduralTextures = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return {};

    // Generate normal map if missing
    const generateNormalMap = () => {
      const imageData = ctx.createImageData(512, 512);
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 128;     // R (X normal)
        imageData.data[i + 1] = 128; // G (Y normal)
        imageData.data[i + 2] = 255; // B (Z normal)
        imageData.data[i + 3] = 255; // A
      }
      ctx.putImageData(imageData, 0, 0);
      return new THREE.CanvasTexture(canvas);
    };

    // Generate roughness map based on rarity
    const generateRoughnessMap = () => {
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      const roughnessValue = material.roughness / 100;
      
      gradient.addColorStop(0, `rgb(${roughnessValue * 255}, ${roughnessValue * 255}, ${roughnessValue * 255})`);
      gradient.addColorStop(1, `rgb(${roughnessValue * 200}, ${roughnessValue * 200}, ${roughnessValue * 200})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      return new THREE.CanvasTexture(canvas);
    };

    // Generate metalness map
    const generateMetalnessMap = () => {
      const metalnessValue = material.metalness / 100;
      ctx.fillStyle = `rgb(${metalnessValue * 255}, ${metalnessValue * 255}, ${metalnessValue * 255})`;
      ctx.fillRect(0, 0, 512, 512);
      return new THREE.CanvasTexture(canvas);
    };

    return {
      normal: textures.normal || generateNormalMap(),
      roughness: textures.roughness || generateRoughnessMap(),
      metalness: textures.metalness || generateMetalnessMap()
    };
  }, [textures, material.roughness, material.metalness]);

  // Material configuration based on preset and rarity
  const materialConfig = useMemo(() => {
    const base = {
      map: textures.albedo,
      normalMap: proceduralTextures.normal,
      roughnessMap: proceduralTextures.roughness,
      metalnessMap: proceduralTextures.metalness,
      aoMap: textures.ao,
      emissiveMap: textures.emissive,
      
      metalness: material.metalness / 100,
      roughness: material.roughness / 100,
      transparent: material.transparency > 0,
      opacity: 1 - (material.transparency / 100),
      
      // Physical properties for realistic card material
      thickness: 0.76, // Standard trading card thickness in mm
      ior: 1.45, // Index of refraction for card stock
      reflectivity: 0.5,
      sheen: 0.1,
      sheenColor: new THREE.Color(0xffffff),
      
      // Environment mapping
      envMapIntensity: 1.0,
      
      // Clearcoat for protective finish
      clearcoat: effects.clearcoat?.intensity || 0.1,
      clearcoatRoughness: effects.clearcoat?.roughness || 0.05
    };

    // Rarity-specific enhancements
    switch (rarity) {
      case 'legendary':
        return {
          ...base,
          metalness: Math.min(1, base.metalness + 0.3),
          roughness: Math.max(0, base.roughness - 0.2),
          clearcoat: 0.8,
          clearcoatRoughness: 0.02,
          sheen: 0.5,
          sheenColor: new THREE.Color(0xffd700), // Gold tint
          emissive: new THREE.Color(0x1a1a1a),
          emissiveIntensity: material.emission / 100
        };
      
      case 'epic':
        return {
          ...base,
          metalness: Math.min(1, base.metalness + 0.2),
          roughness: Math.max(0, base.roughness - 0.1),
          clearcoat: 0.6,
          sheen: 0.3,
          sheenColor: new THREE.Color(0xc0c0c0), // Silver tint
          emissiveIntensity: material.emission / 100 * 0.8
        };
      
      case 'rare':
        return {
          ...base,
          metalness: Math.min(1, base.metalness + 0.1),
          clearcoat: 0.4,
          sheen: 0.2,
          emissiveIntensity: material.emission / 100 * 0.6
        };
      
      default:
        return {
          ...base,
          emissiveIntensity: material.emission / 100 * 0.4
        };
    }
  }, [textures, proceduralTextures, material, rarity, effects]);

  // Holographic effect implementation
  useFrame(({ clock }) => {
    if (!materialRef.current) return;

    const time = clock.getElapsedTime();

    // Holographic color shifting
    if (effects.holographic && material.preset === 'holographic') {
      const hue = (time * 0.1 + effects.holographic.colorShift) % 1;
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      materialRef.current.emissive = color;
      materialRef.current.emissiveIntensity = 
        (Math.sin(time * 2) * 0.5 + 0.5) * effects.holographic.intensity;
    }

    // Anisotropic reflection (for foil effects)
    if (effects.anisotropic && effects.anisotropic.strength > 0) {
      // This would require a custom shader for true anisotropic reflection
      // For now, we simulate it with varying metalness
      const variation = Math.sin(time * 3) * 0.1 * effects.anisotropic.strength;
      materialRef.current.metalness = Math.max(0, Math.min(1, 
        materialConfig.metalness + variation
      ));
    }

    // Subsurface scattering simulation
    if (effects.subsurface && effects.subsurface.thickness > 0) {
      const subsurfaceGlow = Math.sin(time * 1.5) * 0.05 + 0.05;
      materialRef.current.transmission = effects.subsurface.thickness * subsurfaceGlow;
    }
  });

  // Apply material configuration
  useEffect(() => {
    if (materialRef.current) {
      Object.assign(materialRef.current, materialConfig);
      materialRef.current.needsUpdate = true;
    }
  }, [materialConfig]);

  return (
    <meshPhysicalMaterial
      ref={materialRef}
      {...materialConfig}
      side={THREE.DoubleSide}
    />
  );
};