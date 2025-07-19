import React from 'react';

interface MetallicMaterialProps {
  metalness?: number;
  roughness?: number;
  children: React.ReactNode;
}

export const MetallicMaterial: React.FC<MetallicMaterialProps> = ({ 
  children 
}) => {
  // Simple wrapper that returns the children as-is
  // This is a placeholder for the actual metallic shader
  return <>{children}</>;
};
