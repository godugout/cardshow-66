
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Card3DMeshProps {
  card: any;
  material: any;
  animation: any;
  effectLayers: any[];
}

export const Card3DMesh: React.FC<Card3DMeshProps> = ({ 
  card, 
  material, 
  animation, 
  effectLayers 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  // Load card texture safely
  useEffect(() => {
    if (card?.image || card?.image_url) {
      const loader = new THREE.TextureLoader();
      const imageUrl = card.image || card.image_url || '/placeholder.svg';
      loader.load(
        imageUrl,
        (loadedTexture) => {
          setTexture(loadedTexture);
        },
        undefined,
        (error) => {
          console.warn('Failed to load texture:', error);
          // Create a simple colored texture as fallback
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 712;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(0, 0, 512, 712);
            ctx.fillStyle = '#4a9eff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('CRD', 256, 356);
          }
          const fallbackTexture = new THREE.CanvasTexture(canvas);
          setTexture(fallbackTexture);
        }
      );
    }
  }, [card?.image, card?.image_url]);
  
  // Animation logic with safety checks
  useFrame((state, delta) => {
    if (!meshRef.current || !animation) return;
    
    if (animation.preset === 'rotate' && animation.isPlaying) {
      meshRef.current.rotation.y += delta * ((animation.speed || 50) / 50);
    }
    
    if (animation.preset === 'float' && animation.isPlaying) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2 * ((animation.amplitude || 50) / 100);
    }
    
    if (animation.preset === 'pulse' && animation.isPlaying) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1 * ((animation.amplitude || 50) / 100);
      meshRef.current.scale.setScalar(scale);
    }
  });

  // Create material based on preset with safe defaults
  const createMaterial = () => {
    const baseProps = {
      transparent: (material?.transparency || 0) > 0,
      opacity: 1 - ((material?.transparency || 0) / 100),
      map: texture
    };

    const metalness = (material?.metalness || 50) / 100;
    const roughness = (material?.roughness || 50) / 100;
    const emission = (material?.emission || 0) / 100;
    
    // Apply template colors if available
    const backgroundColor = card?.backgroundColor || '#2a2a2a';
    const primaryColor = card?.primaryColor || '#4a9eff';

    switch (material?.preset) {
      case 'holographic':
        return (
          <meshStandardMaterial
            {...baseProps}
            color={primaryColor}
            metalness={0.3}
            roughness={0.1}
            emissive={new THREE.Color(backgroundColor)}
            emissiveIntensity={emission * 0.5}
          />
        );
      case 'metallic':
      case 'chrome':
        return (
          <meshStandardMaterial
            {...baseProps}
            color={backgroundColor}
            metalness={metalness}
            roughness={roughness}
            emissive={emission > 0 ? new THREE.Color(primaryColor) : new THREE.Color(0x000000)}
            emissiveIntensity={emission}
            envMapIntensity={2}
          />
        );
      case 'crystal':
        return (
          <meshPhysicalMaterial
            {...baseProps}
            metalness={0}
            roughness={0}
            transmission={Math.min(0.9, (material?.transparency || 0) / 100)}
            thickness={0.5}
            ior={1.5}
          />
        );
      default:
        return (
          <meshStandardMaterial
            {...baseProps}
            color={backgroundColor}
            metalness={metalness}
            roughness={roughness}
            emissive={emission > 0 ? new THREE.Color(primaryColor) : new THREE.Color(backgroundColor)}
            emissiveIntensity={emission * 0.3}
          />
        );
    }
  };

  // Check for active effects safely
  const glowEffect = effectLayers?.find(e => e.type === 'glow' && e.enabled);

  return (
    <group>
      {/* Main card mesh */}
      <mesh ref={meshRef}>
        <boxGeometry args={[2.5, 3.5, 0.1]} />
        {createMaterial()}
      </mesh>
      
      {/* Simple glow effect if enabled */}
      {glowEffect && (
        <mesh position={[0, 0, 0.052]}>
          <boxGeometry args={[2.52, 3.52, 0.001]} />
          <meshBasicMaterial
            color="#4ade80"
            transparent
            opacity={(glowEffect.intensity || 50) / 100 * 0.3}
          />
        </mesh>
      )}
    </group>
  );
};
