
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AdvancedStudioState {
  selectedCard: any | null;
  material: {
    preset: string;
    metalness: number;
    roughness: number;
    transparency: number;
    emission: number;
  };
  lighting: {
    preset: string;
    ambientLight: number;
    intensity: number;
    colorTemperature: number;
    shadowIntensity: number;
  };
  animation: {
    preset: string;
    isPlaying: boolean;
    speed: number;
    amplitude: number;
  };
  environment: {
    preset: string;
    hdriIntensity: number;
  };
  effectLayers: Array<{
    id: string;
    type: string;
    enabled: boolean;
    intensity: number;
  }>;
}

interface AdvancedStudioContextType {
  state: AdvancedStudioState;
  updateMaterial: (updates: Partial<AdvancedStudioState['material']>) => void;
  updateLighting: (updates: Partial<AdvancedStudioState['lighting']>) => void;
  updateAnimation: (updates: Partial<AdvancedStudioState['animation']>) => void;
  updateEnvironment: (updates: Partial<AdvancedStudioState['environment']>) => void;
  setSelectedCard: (card: any) => void;
  addEffectLayer: (layer: any) => void;
  updateEffectLayer: (id: string, updates: any) => void;
  removeEffectLayer: (id: string) => void;
}

const AdvancedStudioContext = createContext<AdvancedStudioContextType | undefined>(undefined);

const initialState: AdvancedStudioState = {
  selectedCard: null,
  material: {
    preset: 'standard',
    metalness: 50,
    roughness: 50,
    transparency: 0,
    emission: 0
  },
  lighting: {
    preset: 'studio',
    ambientLight: 70,
    intensity: 80,
    colorTemperature: 5500,
    shadowIntensity: 40
  },
  animation: {
    preset: 'none',
    isPlaying: false,
    speed: 50,
    amplitude: 50
  },
  environment: {
    preset: 'studio',
    hdriIntensity: 1
  },
  effectLayers: []
};

export const AdvancedStudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AdvancedStudioState>(initialState);

  const updateMaterial = useCallback((updates: Partial<AdvancedStudioState['material']>) => {
    setState(prev => ({ ...prev, material: { ...prev.material, ...updates } }));
  }, []);

  const updateLighting = useCallback((updates: Partial<AdvancedStudioState['lighting']>) => {
    setState(prev => ({ ...prev, lighting: { ...prev.lighting, ...updates } }));
  }, []);

  const updateAnimation = useCallback((updates: Partial<AdvancedStudioState['animation']>) => {
    setState(prev => ({ ...prev, animation: { ...prev.animation, ...updates } }));
  }, []);

  const updateEnvironment = useCallback((updates: Partial<AdvancedStudioState['environment']>) => {
    setState(prev => ({ ...prev, environment: { ...prev.environment, ...updates } }));
  }, []);

  const setSelectedCard = useCallback((card: any) => {
    setState(prev => ({ ...prev, selectedCard: card }));
  }, []);

  const addEffectLayer = useCallback((layer: any) => {
    setState(prev => ({ ...prev, effectLayers: [...prev.effectLayers, layer] }));
  }, []);

  const updateEffectLayer = useCallback((id: string, updates: any) => {
    setState(prev => ({
      ...prev,
      effectLayers: prev.effectLayers.map(layer =>
        layer.id === id ? { ...layer, ...updates } : layer
      )
    }));
  }, []);

  const removeEffectLayer = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      effectLayers: prev.effectLayers.filter(layer => layer.id !== id)
    }));
  }, []);

  const value = {
    state,
    updateMaterial,
    updateLighting,
    updateAnimation,
    updateEnvironment,
    setSelectedCard,
    addEffectLayer,
    updateEffectLayer,
    removeEffectLayer
  };

  return (
    <AdvancedStudioContext.Provider value={value}>
      {children}
    </AdvancedStudioContext.Provider>
  );
};

export const useAdvancedStudio = () => {
  const context = useContext(AdvancedStudioContext);
  if (context === undefined) {
    throw new Error('useAdvancedStudio must be used within an AdvancedStudioProvider');
  }
  return context;
};
