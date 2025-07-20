
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface EffectLayer {
  id: string;
  type: 'holographic' | 'chrome' | 'glow' | 'particle' | 'distortion';
  enabled: boolean;
  intensity: number;
  opacity: number;
  blendMode: string;
  parameters: Record<string, any>;
}

export interface AdvancedStudioState {
  selectedCard: any | null;
  viewMode: '2d' | '3d';
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
    backgroundBlur: number;
    backgroundBrightness: number;
  };
  effectLayers: EffectLayer[];
}

interface AdvancedStudioContextType {
  state: AdvancedStudioState;
  updateMaterial: (updates: Partial<AdvancedStudioState['material']>) => void;
  updateLighting: (updates: Partial<AdvancedStudioState['lighting']>) => void;
  updateAnimation: (updates: Partial<AdvancedStudioState['animation']>) => void;
  updateEnvironment: (updates: Partial<AdvancedStudioState['environment']>) => void;
  setSelectedCard: (card: any) => void;
  setViewMode: (mode: '2d' | '3d') => void;
  applyPreset: (type: string, presetId: string) => void;
  addEffectLayer: (layer: Partial<EffectLayer>) => void;
  updateEffectLayer: (id: string, updates: Partial<EffectLayer>) => void;
  removeEffectLayer: (id: string) => void;
}

const AdvancedStudioContext = createContext<AdvancedStudioContextType | undefined>(undefined);

const defaultCard = {
  id: 'default-studio-card',
  title: 'Welcome to Studio',
  description: 'Your canvas awaits! Start customizing this card or create a new one.',
  rarity: 'common',
  tags: ['welcome', 'studio'],
  image_url: '/lovable-uploads/7546e555-f08f-4ee6-8337-7cc99ed1cfb7.png',
  thumbnail_url: '/lovable-uploads/7546e555-f08f-4ee6-8337-7cc99ed1cfb7.png',
  design_metadata: { isDefault: true },
  visibility: 'private'
};

const initialState: AdvancedStudioState = {
  selectedCard: defaultCard,
  viewMode: '3d',
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
    hdriIntensity: 1,
    backgroundBlur: 0,
    backgroundBrightness: 100
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

  const setViewMode = useCallback((mode: '2d' | '3d') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const applyPreset = useCallback((type: string, presetId: string) => {
    // Apply environment, material, or lighting presets
    if (type === 'environment') {
      const environmentPresets = {
        studio: { hdriIntensity: 1, backgroundBlur: 0, backgroundBrightness: 100 },
        nature: { hdriIntensity: 1.2, backgroundBlur: 20, backgroundBrightness: 80 },
        sunset: { hdriIntensity: 0.8, backgroundBlur: 30, backgroundBrightness: 60 },
        neon: { hdriIntensity: 1.5, backgroundBlur: 50, backgroundBrightness: 40 }
      };
      const preset = environmentPresets[presetId as keyof typeof environmentPresets];
      if (preset) {
        updateEnvironment({ preset: presetId, ...preset });
      }
    }
  }, []);

  const addEffectLayer = useCallback((layer: Partial<EffectLayer>) => {
    const newLayer: EffectLayer = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'holographic',
      enabled: true,
      intensity: 50,
      opacity: 100,
      blendMode: 'normal',
      parameters: {},
      ...layer
    };
    setState(prev => ({ ...prev, effectLayers: [...prev.effectLayers, newLayer] }));
  }, []);

  const updateEffectLayer = useCallback((id: string, updates: Partial<EffectLayer>) => {
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
    setViewMode,
    applyPreset,
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
