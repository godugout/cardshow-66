
import React from 'react';
import * as THREE from 'three';

interface LightingSystemProps {
  lighting: any;
}

export const LightingSystem: React.FC<LightingSystemProps> = ({ lighting }) => {
  // Create realistic lighting colors based on temperature
  const lightColor = new THREE.Color();
  const temp = lighting.colorTemperature;
  
  if (temp < 3500) {
    lightColor.setRGB(1.0, 0.7, 0.4); // Warm
  } else if (temp < 5000) {
    lightColor.setRGB(1.0, 0.9, 0.8); // Neutral warm
  } else if (temp < 6500) {
    lightColor.setRGB(1.0, 1.0, 1.0); // Neutral
  } else {
    lightColor.setRGB(0.8, 0.9, 1.0); // Cool
  }

  return (
    <>
      {/* Ambient light */}
      <ambientLight 
        intensity={lighting.ambientLight / 100} 
        color={lightColor} 
      />
      
      {/* Main directional light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={lighting.intensity / 100}
        color={lightColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Dramatic lighting */}
      {lighting.preset === 'dramatic' && (
        <>
          <spotLight
            position={[0, 10, 0]}
            angle={0.3}
            penumbra={1}
            intensity={lighting.shadowIntensity / 50}
            color={lightColor}
            castShadow
          />
          <pointLight position={[-5, 5, 3]} intensity={0.3} color="#ffffff" />
        </>
      )}
      
      {/* Neon lighting */}
      {lighting.preset === 'neon' && (
        <>
          <pointLight position={[3, 3, 3]} intensity={0.5} color="#ff0080" />
          <pointLight position={[-3, 3, 3]} intensity={0.5} color="#0080ff" />
          <pointLight position={[0, -3, 2]} intensity={0.3} color="#00ff80" />
        </>
      )}
      
      {/* Studio lighting for material showcase */}
      {lighting.preset === 'studio' && (
        <>
          <directionalLight
            position={[5, 5, 5]}
            intensity={lighting.intensity / 120}
            color="#ffffff"
            castShadow
          />
          <directionalLight
            position={[-5, 5, 5]}
            intensity={lighting.intensity / 150}
            color="#f0f0ff"
          />
          <pointLight position={[0, 0, 8]} intensity={0.2} color="#ffffff" />
        </>
      )}
      
      {/* Environment light for different materials */}
      <hemisphereLight 
        args={["#87CEEB", "#8B4513", 0.2]}
      />
      
      {/* Fill light to prevent harsh shadows */}
      <pointLight 
        position={[0, -5, 3]} 
        intensity={0.1} 
        color="#ffffff" 
      />
    </>
  );
};
