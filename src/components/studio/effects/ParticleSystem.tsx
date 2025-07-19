import React from 'react';

interface ParticleSystemProps {
  count?: number;
  intensity?: number;
  enabled?: boolean;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  count = 50, 
  intensity = 50, 
  enabled = false 
}) => {
  // Return null if not enabled or simple placeholder
  if (!enabled) return null;
  
  return (
    <group>
      {/* Placeholder for particle system - could add simple animated points here */}
    </group>
  );
};
