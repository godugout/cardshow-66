import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';

export const ViewerScene: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [time, setTime] = useState(0);
  
  // Safe context access with fallback
  let state;
  try {
    const context = useAdvancedStudio();
    state = context.state;
  } catch (error) {
    // Fallback state when context is not available
    state = {
      selectedCard: {
        image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&h=1120'
      },
      material: {
        preset: 'standard',
        metalness: 50,
        roughness: 50,
        transparency: 0,
        emission: 0
      },
      lighting: {
        preset: 'studio',
        ambientLight: 70,
        intensity: 80,
        shadowIntensity: 40
      },
      animation: {
        preset: 'none',
        isPlaying: false,
        speed: 50,
        amplitude: 50
      },
      effectLayers: []
    };
  }

  // Load card texture
  const texture = useLoader(TextureLoader, state.selectedCard?.image_url || '/placeholder.svg');

  // Configure texture
  useMemo(() => {
    if (texture && !Array.isArray(texture)) {
      texture.flipY = false;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
  }, [texture]);

  useFrame((frameState, delta) => {
    setTime(time + delta);
    
    if (meshRef.current) {
      // Apply animation based on studio state
      if (state.animation.isPlaying) {
        switch (state.animation.preset) {
          case 'rotate':
            meshRef.current.rotation.y += delta * (state.animation.speed / 100);
            break;
          case 'float':
            meshRef.current.position.y = Math.sin(time * (state.animation.speed / 50)) * (state.animation.amplitude / 100);
            break;
          case 'pulse':
            const scale = 1 + Math.sin(time * (state.animation.speed / 50)) * (state.animation.amplitude / 200);
            meshRef.current.scale.setScalar(scale);
            break;
        }
      }
    }
  });

  // Material configuration
  const materialConfig = useMemo(() => {
    const config: any = {
      map: texture,
      metalness: state.material.metalness / 100,
      roughness: state.material.roughness / 100,
      transparent: state.material.transparency > 0,
      opacity: 1 - (state.material.transparency / 100),
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: state.material.emission / 100,
    };

    if (state.material.preset === 'holographic') {
      config.iridescence = 1;
      config.iridescenceIOR = 1.3;
      config.iridescenceThicknessRange = [100, 800];
    }

    return config;
  }, [texture, state.material]);

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={state.lighting.ambientLight / 100} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={state.lighting.intensity / 100}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />

      {/* Card mesh */}
      <Float 
        enabled={state.animation.preset === 'float' && state.animation.isPlaying}
        speed={state.animation.speed / 50}
        rotationIntensity={state.animation.amplitude / 100}
        floatIntensity={state.animation.amplitude / 100}
      >
        <mesh 
          ref={meshRef}
          castShadow
          receiveShadow
          position={[0, 0, 0]}
        >
          <planeGeometry args={[4, 5.6]} />
          {state.material.preset === 'crystal' ? (
            <MeshDistortMaterial
              {...materialConfig}
              distort={0.3}
              speed={2}
              roughness={0}
              transmission={0.8}
              thickness={0.2}
            />
          ) : (
            <meshStandardMaterial {...materialConfig} />
          )}
        </mesh>
      </Float>

      {/* Ground plane for shadows */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -3, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={state.lighting.shadowIntensity / 100} />
      </mesh>

      {/* Effect layers */}
      {state.effectLayers.map((layer) => (
        <group key={layer.id}>
          {layer.type === 'particle' && layer.enabled && (
            <Sparkles
              count={50}
              scale={5}
              size={2}
              speed={0.5}
              opacity={layer.opacity / 100}
            />
          )}
          {layer.type === 'glow' && layer.enabled && (
            <pointLight
              position={[0, 0, 2]}
              color="#4FFFB0"
              intensity={layer.intensity / 50}
              distance={10}
            />
          )}
        </group>
      ))}
    </>
  );
};