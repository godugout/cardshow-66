import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { CardData } from '@/types/card';

// Standard trading card dimensions (in Three.js units where 1 unit = 10mm)
const CARD_DIMENSIONS = {
  width: 6.35,   // 63.5mm standard width
  height: 8.89,  // 88.9mm standard height  
  depth: 0.076,  // 0.76mm standard thickness
  cornerRadius: 0.3 // Rounded corners
};

interface CardGeometryProps {
  card: CardData;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  enableRoundedCorners?: boolean;
  children?: React.ReactNode;
}

export const CardGeometry: React.FC<CardGeometryProps> = ({
  card,
  quality = 'high',
  enableRoundedCorners = true,
  children
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create rounded rectangle geometry for realistic card shape
  const geometry = useMemo(() => {
    if (!enableRoundedCorners || quality === 'low') {
      // Simple box geometry for performance
      return new THREE.BoxGeometry(
        CARD_DIMENSIONS.width,
        CARD_DIMENSIONS.height,
        CARD_DIMENSIONS.depth
      );
    }

    // Create rounded rectangle shape
    const shape = new THREE.Shape();
    const { width, height, cornerRadius } = CARD_DIMENSIONS;
    const x = -width / 2;
    const y = -height / 2;

    shape.moveTo(x, y + cornerRadius);
    shape.lineTo(x, y + height - cornerRadius);
    shape.quadraticCurveTo(x, y + height, x + cornerRadius, y + height);
    shape.lineTo(x + width - cornerRadius, y + height);
    shape.quadraticCurveTo(x + width, y + height, x + width, y + height - cornerRadius);
    shape.lineTo(x + width, y + cornerRadius);
    shape.quadraticCurveTo(x + width, y, x + width - cornerRadius, y);
    shape.lineTo(x + cornerRadius, y);
    shape.quadraticCurveTo(x, y, x, y + cornerRadius);

    // Extrude the shape to create 3D card
    const extrudeSettings = {
      depth: CARD_DIMENSIONS.depth,
      bevelEnabled: true,
      bevelSegments: quality === 'ultra' ? 8 : 4,
      bevelSize: 0.01,
      bevelThickness: 0.005
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [enableRoundedCorners, quality]);

  // UV mapping for proper texture application
  React.useEffect(() => {
    if (!geometry) return;

    // Ensure proper UV coordinates for front and back faces
    const uvs = geometry.attributes.uv.array;
    const positions = geometry.attributes.position.array;

    // Update UV mapping based on face normals
    for (let i = 0; i < positions.length; i += 3) {
      const index = Math.floor(i / 3);
      const uvIndex = index * 2;

      // Get vertex position
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      // Map front and back faces
      if (Math.abs(z - CARD_DIMENSIONS.depth / 2) < 0.001) {
        // Front face
        uvs[uvIndex] = (x + CARD_DIMENSIONS.width / 2) / CARD_DIMENSIONS.width;
        uvs[uvIndex + 1] = (y + CARD_DIMENSIONS.height / 2) / CARD_DIMENSIONS.height;
      } else if (Math.abs(z + CARD_DIMENSIONS.depth / 2) < 0.001) {
        // Back face (flipped for card back design)
        uvs[uvIndex] = 1 - (x + CARD_DIMENSIONS.width / 2) / CARD_DIMENSIONS.width;
        uvs[uvIndex + 1] = (y + CARD_DIMENSIONS.height / 2) / CARD_DIMENSIONS.height;
      }
    }

    geometry.attributes.uv.needsUpdate = true;
  }, [geometry]);

  // Optimize geometry for performance
  React.useEffect(() => {
    if (!geometry) return;

    // Compute vertex normals for smooth lighting
    geometry.computeVertexNormals();
    
    // Compute bounding box and sphere for frustum culling
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    // Generate tangent attributes for normal mapping
    if (quality === 'high' || quality === 'ultra') {
      geometry.computeTangents();
    }

    return () => {
      geometry.dispose();
    };
  }, [geometry, quality]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      castShadow
      receiveShadow
      frustumCulled={true}
    >
      {children}
    </mesh>
  );
};