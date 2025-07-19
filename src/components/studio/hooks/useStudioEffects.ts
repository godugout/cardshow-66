
import { useState, useCallback } from 'react';

export interface EffectLayerData {
  id: string;
  name: string;
  type: 'holographic' | 'chrome' | 'glow' | 'particle' | 'distortion';
  visible: boolean;
  intensity: number;
  opacity: number;
  parameters: Record<string, any>;
}

export interface EffectLayer {
  id: string;
  name: string;
  type: 'holographic' | 'chrome' | 'glow' | 'particle' | 'distortion';
  visible: boolean;
  intensity: number;
  opacity: number;
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

  const addEffectLayer = useCallback((layerData: Partial<EffectLayerData>) => {
    const newLayer: EffectLayer = {
      id: `effect-${Date.now()}`,
      name: layerData.name || `${layerData.type} Effect`,
      type: layerData.type || 'holographic',
      visible: true,
      intensity: layerData.intensity || 50,
      opacity: layerData.opacity || 100,
      parameters: layerData.parameters || {}
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
