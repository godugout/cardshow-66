import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Standard trading card dimensions in mm converted to Three.js units (1 unit = 10mm)
const CARD_DIMENSIONS = {
  width: 6.35,  // 63.5mm
  height: 8.89, // 88.9mm
  depth: 0.076  // 0.76mm
};

// Physical properties of a trading card
const CARD_PHYSICS = {
  mass: 2.7,           // 2.7 grams
  density: 0.7,        // g/cm³
  flexibility: 0.002,  // Flexure modulus
  friction: 0.6,       // Surface friction
  restitution: 0.3,    // Bounce factor
  airResistance: 0.98  // Air resistance coefficient
};

interface CardPhysicsProps {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  enablePhysics?: boolean;
  enableFlexure?: boolean;
  enableGravity?: boolean;
  enableCollisions?: boolean;
  flexureIntensity?: number;
  children: React.ReactNode;
}

export const CardPhysics: React.FC<CardPhysicsProps> = ({
  position = new THREE.Vector3(0, 0, 0),
  rotation = new THREE.Euler(0, 0, 0),
  enablePhysics = true,
  enableFlexure = true,
  enableGravity = false,
  enableCollisions = true,
  flexureIntensity = 1.0,
  children
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef(new THREE.Vector3());
  const angularVelocityRef = useRef(new THREE.Vector3());
  const forceAccumulatorRef = useRef(new THREE.Vector3());
  const lastMousePosition = useRef(new THREE.Vector2());
  const isDragging = useRef(false);
  const flexureNodesRef = useRef<THREE.Vector3[]>([]);

  // Initialize flexure simulation nodes
  useEffect(() => {
    if (!enableFlexure) return;

    // Create a grid of control points for flexure simulation
    const nodes = [];
    const gridSize = 5;
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const nodeX = (x / (gridSize - 1) - 0.5) * CARD_DIMENSIONS.width;
        const nodeY = (y / (gridSize - 1) - 0.5) * CARD_DIMENSIONS.height;
        nodes.push(new THREE.Vector3(nodeX, nodeY, 0));
      }
    }
    
    flexureNodesRef.current = nodes;
  }, [enableFlexure]);

  // Mouse interaction for physics
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      isDragging.current = true;
      lastMousePosition.current.set(event.clientX, event.clientY);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging.current || !enablePhysics) return;

      const deltaX = event.clientX - lastMousePosition.current.x;
      const deltaY = event.clientY - lastMousePosition.current.y;

      // Apply force based on mouse movement
      const force = new THREE.Vector3(deltaX * 0.01, -deltaY * 0.01, 0);
      forceAccumulatorRef.current.add(force);

      lastMousePosition.current.set(event.clientX, event.clientY);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enablePhysics]);

  // Physics simulation
  useFrame((state, delta) => {
    if (!groupRef.current || !enablePhysics) return;

    const deltaTime = Math.min(delta, 1/30); // Cap delta time for stability

    // Apply gravity
    if (enableGravity) {
      forceAccumulatorRef.current.y -= 9.81 * CARD_PHYSICS.mass * deltaTime;
    }

    // Apply air resistance
    velocityRef.current.multiplyScalar(CARD_PHYSICS.airResistance);
    angularVelocityRef.current.multiplyScalar(0.95);

    // Update velocity based on accumulated forces
    const acceleration = forceAccumulatorRef.current.clone().divideScalar(CARD_PHYSICS.mass);
    velocityRef.current.add(acceleration.multiplyScalar(deltaTime));

    // Update position
    const deltaPosition = velocityRef.current.clone().multiplyScalar(deltaTime);
    groupRef.current.position.add(deltaPosition);

    // Update rotation
    const deltaRotation = angularVelocityRef.current.clone().multiplyScalar(deltaTime);
    groupRef.current.rotation.x += deltaRotation.x;
    groupRef.current.rotation.y += deltaRotation.y;
    groupRef.current.rotation.z += deltaRotation.z;

    // Flexure simulation
    if (enableFlexure && flexureNodesRef.current.length > 0) {
      simulateFlexure(deltaTime);
    }

    // Ground collision
    if (enableCollisions && groupRef.current.position.y < -2) {
      groupRef.current.position.y = -2;
      velocityRef.current.y = Math.abs(velocityRef.current.y) * CARD_PHYSICS.restitution;
      
      // Add surface friction
      velocityRef.current.x *= CARD_PHYSICS.friction;
      velocityRef.current.z *= CARD_PHYSICS.friction;
    }

    // Boundary constraints (keep card in reasonable bounds)
    const maxDistance = 20;
    if (groupRef.current.position.length() > maxDistance) {
      const direction = groupRef.current.position.clone().normalize();
      groupRef.current.position.copy(direction.multiplyScalar(maxDistance));
      velocityRef.current.reflect(direction);
    }

    // Reset force accumulator
    forceAccumulatorRef.current.set(0, 0, 0);
  });

  // Flexure simulation function
  const simulateFlexure = (deltaTime: number) => {
    if (!groupRef.current || !flexureNodesRef.current.length) return;

    // Simple spring-based flexure simulation
    const springStrength = 0.1 * flexureIntensity;
    const damping = 0.95;

    flexureNodesRef.current.forEach((node, index) => {
      // Apply random micro-movements for natural card behavior
      const noise = (Math.random() - 0.5) * 0.001;
      node.z += noise;

      // Spring back to rest position
      node.z *= damping;
      
      // Apply constraints to prevent unrealistic bending
      node.z = Math.max(-0.1, Math.min(0.1, node.z));
    });

    // Apply global flex based on physics forces
    const globalFlex = velocityRef.current.length() * 0.001 * flexureIntensity;
    if (groupRef.current) {
      groupRef.current.rotation.x += Math.sin(globalFlex) * 0.01;
      groupRef.current.rotation.z += Math.cos(globalFlex) * 0.005;
    }
  };

  // Haptic feedback simulation
  const triggerHapticFeedback = (intensity: number) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(intensity * 10);
    }
  };

  // Public methods for external force application
  const applyForce = (force: THREE.Vector3) => {
    forceAccumulatorRef.current.add(force);
  };

  const applyTorque = (torque: THREE.Vector3) => {
    angularVelocityRef.current.add(torque);
  };

  const resetPhysics = () => {
    velocityRef.current.set(0, 0, 0);
    angularVelocityRef.current.set(0, 0, 0);
    forceAccumulatorRef.current.set(0, 0, 0);
    if (groupRef.current) {
      groupRef.current.position.copy(position);
      groupRef.current.rotation.copy(rotation);
    }
  };

  // Set initial position and rotation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(position);
      groupRef.current.rotation.copy(rotation);
    }
  }, [position, rotation]);

  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
};
