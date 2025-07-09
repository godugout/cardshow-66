import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PhotorealisticEngineProps {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  enableSSR?: boolean;
  enableTAA?: boolean;
  enableDepthOfField?: boolean;
  enableBloom?: boolean;
  enableFilmGrain?: boolean;
  colorGrading?: {
    exposure: number;
    brightness: number;
    contrast: number;
    saturation: number;
  };
}

export const PhotorealisticEngine: React.FC<PhotorealisticEngineProps> = ({
  quality = 'high',
  enableSSR = false, // Disabled by default for compatibility
  enableTAA = false, // Disabled by default for compatibility  
  enableDepthOfField = false,
  enableBloom = true,
  enableFilmGrain = false,
  colorGrading = {
    exposure: 1.0,
    brightness: 0.0,
    contrast: 1.0,
    saturation: 1.0
  }
}) => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<any>();
  
  // Performance monitoring
  const performanceRef = useRef({
    fps: 60,
    frameTime: 16.67,
    lastTime: performance.now(),
    frameCount: 0
  });

  // Quality settings based on performance
  const qualitySettings = useMemo(() => {
    const settings = {
      low: {
        pixelRatio: Math.min(window.devicePixelRatio, 1),
        shadowMapSize: 1024,
        antialias: false,
        postProcessing: false,
        bloomThreshold: 0.9,
        bloomStrength: 0.5,
        bloomRadius: 0.4
      },
      medium: {
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        shadowMapSize: 2048,
        antialias: true,
        postProcessing: true,
        bloomThreshold: 0.8,
        bloomStrength: 0.7,
        bloomRadius: 0.5
      },
      high: {
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        shadowMapSize: 4096,
        antialias: true,
        postProcessing: true,
        bloomThreshold: 0.7,
        bloomStrength: 1.0,
        bloomRadius: 0.6
      },
      ultra: {
        pixelRatio: window.devicePixelRatio,
        shadowMapSize: 8192,
        antialias: true,
        postProcessing: true,
        bloomThreshold: 0.6,
        bloomStrength: 1.2,
        bloomRadius: 0.8
      }
    };
    return settings[quality];
  }, [quality]);

  // Performance monitoring and adaptive quality
  useFrame((state, delta) => {
    const now = performance.now();
    const frameTime = now - performanceRef.current.lastTime;
    performanceRef.current.lastTime = now;
    performanceRef.current.frameCount++;

    // Calculate FPS every 60 frames
    if (performanceRef.current.frameCount % 60 === 0) {
      performanceRef.current.fps = 1000 / frameTime;
      performanceRef.current.frameTime = frameTime;

      // Adaptive quality adjustment
      if (performanceRef.current.fps < 30 && quality !== 'low') {
        console.warn('PhotorealisticEngine: Low FPS detected, consider reducing quality');
      }
    }
  });

  // Configure renderer settings with modern Three.js API
  useEffect(() => {
    gl.setPixelRatio(qualitySettings.pixelRatio);
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.shadowMap.autoUpdate = true;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = colorGrading.exposure;
    
    // Modern Three.js API - outputColorSpace instead of outputEncoding
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl, qualitySettings, colorGrading.exposure, quality]);

  // Simple bloom effect using CSS filters for now
  // TODO: Implement proper post-processing when drei EffectComposer is stabilized
  useEffect(() => {
    if (!enableBloom || !qualitySettings.postProcessing) return;

    const canvas = gl.domElement;
    const bloomIntensity = qualitySettings.bloomStrength;
    
    canvas.style.filter = enableBloom ? 
      `brightness(${1 + colorGrading.brightness * 0.1}) 
       contrast(${1 + colorGrading.contrast * 0.1}) 
       saturate(${1 + colorGrading.saturation * 0.1})
       ${enableFilmGrain ? 'sepia(0.1) contrast(1.1)' : ''}` : 'none';

    return () => {
      canvas.style.filter = 'none';
    };
  }, [
    gl, enableBloom, enableFilmGrain, qualitySettings, colorGrading
  ]);

  // Apply depth of field via CSS blur when enabled
  useEffect(() => {
    if (!enableDepthOfField) return;

    const canvas = gl.domElement;
    const blurAmount = quality === 'ultra' ? '1px' : '0.5px';
    
    canvas.style.transition = 'filter 0.3s ease';
    canvas.style.filter = (canvas.style.filter || '') + ` blur(${blurAmount})`;

    return () => {
      canvas.style.filter = canvas.style.filter.replace(/blur\([^)]*\)/g, '').trim();
    };
  }, [gl, enableDepthOfField, quality]);

  return null;
};