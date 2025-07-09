import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface CinematicLightingProps {
  preset: 'studio' | 'dramatic' | 'soft' | 'neon' | 'golden-hour' | 'rim-lit';
  intensity: number;
  colorTemperature: number;
  shadowIntensity: number;
  ambientLight: number;
  enableVolumetric?: boolean;
  enableRimLighting?: boolean;
  enableAreaLights?: boolean;
}

export const CinematicLighting: React.FC<CinematicLightingProps> = ({
  preset,
  intensity,
  colorTemperature,
  shadowIntensity,
  ambientLight,
  enableVolumetric = false,
  enableRimLighting = true,
  enableAreaLights = true
}) => {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const volumetricLightRef = useRef<THREE.SpotLight>(null);

  // Convert color temperature to RGB
  const temperatureToColor = useMemo(() => {
    const temp = colorTemperature;
    let r, g, b;

    if (temp <= 6600) {
      r = 255;
      g = temp < 1000 ? 0 : 99.4708025861 * Math.log(temp / 100) - 161.1195681661;
      b = temp >= 6600 ? 255 : temp < 2000 ? 0 : 138.5177312231 * Math.log((temp / 100) - 10) - 305.0447927307;
    } else {
      r = 329.698727446 * Math.pow((temp / 100) - 60, -0.1332047592);
      g = 288.1221695283 * Math.pow((temp / 100) - 60, -0.0755148492);
      b = 255;
    }

    return new THREE.Color(
      Math.max(0, Math.min(255, r)) / 255,
      Math.max(0, Math.min(255, g)) / 255,
      Math.max(0, Math.min(255, b)) / 255
    );
  }, [colorTemperature]);

  // Lighting setup based on preset
  const lightingConfig = useMemo(() => {
    const configs = {
      studio: {
        keyLight: { position: [5, 8, 5], intensity: intensity * 0.8, color: temperatureToColor },
        fillLight: { position: [-3, 3, 2], intensity: intensity * 0.3, color: temperatureToColor },
        rimLight: { position: [-2, 4, -3], intensity: intensity * 0.5, color: temperatureToColor },
        ambient: ambientLight * 0.2,
        environment: 'studio'
      },
      dramatic: {
        keyLight: { position: [8, 10, 3], intensity: intensity * 1.2, color: temperatureToColor },
        fillLight: { position: [-5, 2, 1], intensity: intensity * 0.15, color: temperatureToColor },
        rimLight: { position: [-3, 6, -4], intensity: intensity * 0.8, color: temperatureToColor },
        ambient: ambientLight * 0.1,
        environment: 'night'
      },
      soft: {
        keyLight: { position: [3, 6, 4], intensity: intensity * 0.6, color: temperatureToColor },
        fillLight: { position: [-2, 4, 3], intensity: intensity * 0.5, color: temperatureToColor },
        rimLight: { position: [-1, 3, -2], intensity: intensity * 0.3, color: temperatureToColor },
        ambient: ambientLight * 0.4,
        environment: 'park'
      },
      neon: {
        keyLight: { position: [4, 5, 3], intensity: intensity * 0.7, color: new THREE.Color(0x00ffff) },
        fillLight: { position: [-4, 3, 2], intensity: intensity * 0.6, color: new THREE.Color(0xff0080) },
        rimLight: { position: [0, 6, -4], intensity: intensity * 0.9, color: new THREE.Color(0x8000ff) },
        ambient: ambientLight * 0.15,
        environment: 'night'
      },
      'golden-hour': {
        keyLight: { position: [6, 4, 8], intensity: intensity * 1.0, color: new THREE.Color(0xffa500) },
        fillLight: { position: [-3, 3, 3], intensity: intensity * 0.4, color: new THREE.Color(0xffcc80) },
        rimLight: { position: [-2, 5, -3], intensity: intensity * 0.7, color: new THREE.Color(0xff8c42) },
        ambient: ambientLight * 0.3,
        environment: 'sunset'
      },
      'rim-lit': {
        keyLight: { position: [2, 8, 2], intensity: intensity * 0.5, color: temperatureToColor },
        fillLight: { position: [-1, 2, 1], intensity: intensity * 0.2, color: temperatureToColor },
        rimLight: { position: [-4, 6, -5], intensity: intensity * 1.2, color: temperatureToColor },
        ambient: ambientLight * 0.1,
        environment: 'studio'
      }
    };

    return configs[preset];
  }, [preset, intensity, temperatureToColor, ambientLight]);

  // Dynamic lighting animation
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Subtle light movement for studio preset
    if (preset === 'studio' && keyLightRef.current) {
      keyLightRef.current.position.x = lightingConfig.keyLight.position[0] + Math.sin(time * 0.2) * 0.5;
      keyLightRef.current.position.y = lightingConfig.keyLight.position[1] + Math.cos(time * 0.15) * 0.3;
    }

    // Dramatic flickering for neon preset
    if (preset === 'neon') {
      const flicker = 1 + Math.sin(time * 20) * 0.05 + Math.random() * 0.02;
      
      if (keyLightRef.current) {
        keyLightRef.current.intensity = lightingConfig.keyLight.intensity * flicker;
      }
      if (fillLightRef.current) {
        fillLightRef.current.intensity = lightingConfig.fillLight.intensity * flicker;
      }
    }

    // Volumetric light animation
    if (enableVolumetric && volumetricLightRef.current) {
      volumetricLightRef.current.angle = 0.3 + Math.sin(time) * 0.1;
      volumetricLightRef.current.intensity = intensity * 0.5 + Math.sin(time * 2) * 0.1;
    }
  });

  return (
    <>
      {/* Environment Lighting */}
      <Environment preset={lightingConfig.environment as any} backgroundIntensity={0.5} environmentIntensity={1.2}>
        {enableAreaLights && (
          <>
            {/* Area lights for soft shadows */}
            <Lightformer
              position={[4, 8, 4]}
              scale={[4, 1, 1]}
              intensity={intensity * 0.3}
              color={lightingConfig.keyLight.color}
            />
            <Lightformer
              position={[-4, 4, 2]}
              scale={[2, 2, 1]}
              intensity={intensity * 0.2}
              color={lightingConfig.fillLight.color}
            />
          </>
        )}
      </Environment>

      {/* Ambient Light */}
      <ambientLight 
        intensity={lightingConfig.ambient} 
        color={temperatureToColor}
      />

      {/* Key Light (Main illumination) */}
      <directionalLight
        ref={keyLightRef}
        position={lightingConfig.keyLight.position as [number, number, number]}
        intensity={lightingConfig.keyLight.intensity}
        color={lightingConfig.keyLight.color}
        castShadow
      />

      {/* Fill Light (Reduces harsh shadows) */}
      <directionalLight
        ref={fillLightRef}
        position={lightingConfig.fillLight.position as [number, number, number]}
        intensity={lightingConfig.fillLight.intensity}
        color={lightingConfig.fillLight.color}
      />

      {/* Rim Light (Edge highlighting) */}
      {enableRimLighting && (
        <directionalLight
          ref={rimLightRef}
          position={lightingConfig.rimLight.position as [number, number, number]}
          intensity={lightingConfig.rimLight.intensity}
          color={lightingConfig.rimLight.color}
        />
      )}
    </>
  );
};