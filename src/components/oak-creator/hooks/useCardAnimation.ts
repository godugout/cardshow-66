import { useFrame } from '@react-three/fiber';
import { Vector3, Mesh } from 'three';
import { RefObject } from 'react';

export const useCardAnimation = (
  meshRef: RefObject<Mesh>,
  backMeshRef: RefObject<Mesh>,
  rotation: Vector3
) => {
  useFrame((state) => {
    try {
      if (meshRef.current && backMeshRef.current) {
        const time = state.clock.getElapsedTime();
        
        // Gentle floating animation
        meshRef.current.position.y = Math.sin(time * 0.5) * 0.02;
        backMeshRef.current.position.y = meshRef.current.position.y;
        
        // Apply rotation if provided
        if (rotation) {
          meshRef.current.rotation.x = rotation.x + Math.sin(time * 0.3) * 0.02;
          meshRef.current.rotation.y = rotation.y + Math.sin(time * 0.2) * 0.01;
          meshRef.current.rotation.z = rotation.z;
          
          backMeshRef.current.rotation.x = meshRef.current.rotation.x;
          backMeshRef.current.rotation.y = meshRef.current.rotation.y + Math.PI;
          backMeshRef.current.rotation.z = meshRef.current.rotation.z;
        }
      }
    } catch (error) {
      console.warn('Error in animation frame:', error);
    }
  });
};