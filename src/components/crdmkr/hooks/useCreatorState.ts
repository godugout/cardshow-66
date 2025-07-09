import { useState, useCallback } from 'react';
import type { CreatorState } from '../types/CreatorState';
import { 
  getDefaultCreatorState,
  getCurrentEffects,
  getCurrentMaterial,
  getCurrentLighting,
  createEffectsUpdate,
  createMaterialUpdate,
  createLightingUpdate
} from '../utils/creatorHelpers';

export const useCreatorState = () => {
  const [creatorState, setCreatorState] = useState<CreatorState>(getDefaultCreatorState());

  const updateCreatorState = useCallback((updates: Partial<CreatorState>) => {
    setCreatorState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateCurrentEffects = useCallback((effects: Record<string, number>) => {
    const update = createEffectsUpdate(creatorState, effects);
    updateCreatorState(update);
  }, [creatorState, updateCreatorState]);

  const updateCurrentMaterial = useCallback((material: string) => {
    const update = createMaterialUpdate(creatorState, material);
    updateCreatorState(update);
  }, [creatorState, updateCreatorState]);

  const updateCurrentLighting = useCallback((lighting: CreatorState['frontLighting']) => {
    const update = createLightingUpdate(creatorState, lighting);
    updateCreatorState(update);
  }, [creatorState, updateCreatorState]);

  return {
    creatorState,
    updateCreatorState,
    getCurrentEffects: () => getCurrentEffects(creatorState),
    getCurrentMaterial: () => getCurrentMaterial(creatorState),
    getCurrentLighting: () => getCurrentLighting(creatorState),
    updateCurrentEffects,
    updateCurrentMaterial,
    updateCurrentLighting
  };
};