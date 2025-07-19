
import { useState, useCallback } from 'react';

export interface EffectLayer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  intensity: number;
  parameters: Record<string, any>;
}

export const useStudioEffects = () => {
  const [effectLayers, setEffectLayers] = useState<EffectLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [advanced3DEffects, setAdvanced3DEffects] = useState({
    shadows: true,
    reflections: true,
    ambientOcclusion: false,
    bloom: false,
    antialiasing: true
  });

  const addEffectLayer = useCallback((type: string) => {
    const newLayer: EffectLayer = {
      id: `effect-${Date.now()}`,
      name: `${type} Effect`,
      type,
      visible: true,
      intensity: 50,
      parameters: {}
    };
    setEffectLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, []);

  const updateEffectLayer = useCallback((id: string, updates: Partial<EffectLayer>) => {
    setEffectLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    ));
  }, []);

  const removeEffectLayer = useCallback((id: string) => {
    setEffectLayers(prev => prev.filter(layer => layer.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  }, [selectedLayerId]);

  const toggleLayerVisibility = useCallback((id: string) => {
    setEffectLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  }, []);

  return {
    effectLayers,
    selectedLayerId,
    advanced3DEffects,
    setAdvanced3DEffects,
    addEffectLayer,
    updateEffectLayer,
    removeEffectLayer,
    toggleLayerVisibility
  };
};
