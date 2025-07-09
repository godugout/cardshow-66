import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { LOD } from 'three';
import * as THREE from 'three';

interface LODLevel {
  distance: number;
  geometry: THREE.BufferGeometry;
  material?: THREE.Material;
  visible?: boolean;
}

interface LODSystemProps {
  levels: LODLevel[];
  children?: React.ReactNode;
  enableAutoLOD?: boolean;
  performanceTarget?: number; // Target FPS
}

export const LODSystem: React.FC<LODSystemProps> = ({
  levels,
  children,
  enableAutoLOD = true,
  performanceTarget = 60
}) => {
  const { camera } = useThree();
  const lodRef = useRef<LOD>(null);
  const performanceRef = useRef({
    frameCount: 0,
    lastTime: performance.now(),
    avgFrameTime: 16.67,
    currentLOD: 0
  });

  // Create LOD system with multiple detail levels
  const lodSystem = useMemo(() => {
    const lod = new LOD();
    
    levels.forEach((level, index) => {
      const mesh = new THREE.Mesh(level.geometry, level.material);
      lod.addLevel(mesh, level.distance);
    });

    return lod;
  }, [levels]);

  // Performance monitoring and adaptive LOD
  useFrame(() => {
    if (!lodRef.current || !enableAutoLOD) return;

    const now = performance.now();
    const frameTime = now - performanceRef.current.lastTime;
    performanceRef.current.lastTime = now;
    performanceRef.current.frameCount++;

    // Calculate rolling average frame time
    performanceRef.current.avgFrameTime = 
      performanceRef.current.avgFrameTime * 0.9 + frameTime * 0.1;

    const currentFPS = 1000 / performanceRef.current.avgFrameTime;

    // Adaptive LOD adjustment every 60 frames
    if (performanceRef.current.frameCount % 60 === 0) {
      const targetFrameTime = 1000 / performanceTarget;
      
      if (currentFPS < performanceTarget * 0.8) {
        // Performance is low, reduce quality
        adjustLODForPerformance('down');
      } else if (currentFPS > performanceTarget * 1.2) {
        // Performance is good, can increase quality
        adjustLODForPerformance('up');
      }
    }

    // Update LOD based on camera distance
    if (lodRef.current) {
      lodRef.current.update(camera);
    }
  });

  const adjustLODForPerformance = (direction: 'up' | 'down') => {
    if (direction === 'down' && performanceRef.current.currentLOD < levels.length - 1) {
      performanceRef.current.currentLOD++;
      console.log('LOD System: Reducing quality for performance');
    } else if (direction === 'up' && performanceRef.current.currentLOD > 0) {
      performanceRef.current.currentLOD--;
      console.log('LOD System: Increasing quality');
    }
  };

  return (
    <primitive object={lodSystem} ref={lodRef}>
      {children}
    </primitive>
  );
};

// Pre-defined LOD configurations for cards
export const createCardLODLevels = (baseGeometry: THREE.BufferGeometry, baseMaterial: THREE.Material) => {
  const levels: LODLevel[] = [
    {
      distance: 0,
      geometry: baseGeometry, // Full detail
      material: baseMaterial
    },
    {
      distance: 5,
      geometry: baseGeometry.clone().scale(1, 1, 0.5), // Reduced thickness
      material: baseMaterial
    },
    {
      distance: 10,
      geometry: new THREE.PlaneGeometry(6.35, 8.89), // Flat plane
      material: new THREE.MeshBasicMaterial({ 
        map: (baseMaterial as any).map,
        transparent: true
      })
    },
    {
      distance: 20,
      geometry: new THREE.PlaneGeometry(3.175, 4.445), // Half-size plane
      material: new THREE.MeshBasicMaterial({
        map: (baseMaterial as any).map,
        transparent: true,
        opacity: 0.8
      })
    }
  ];

  return levels;
};