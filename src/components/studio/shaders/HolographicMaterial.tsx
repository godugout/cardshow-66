import React from 'react';

interface HolographicMaterialProps {
  intensity?: number;
  children: React.ReactNode;
}

export const HolographicMaterial: React.FC<HolographicMaterialProps> = ({ 
  intensity = 50, 
  children 
}) => {
  // Simple wrapper that returns the children as-is
  // This is a placeholder for the actual holographic shader
  return <>{children}</>;
};
