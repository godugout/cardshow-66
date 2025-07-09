import type { CreatorState } from '../types/CreatorState';

/**
 * Get the current effects based on the active side
 */
export const getCurrentEffects = (state: CreatorState): Record<string, number> => {
  return state.currentSide === 'front' ? state.frontEffects : state.backEffects;
};

/**
 * Get the current material based on the active side
 */
export const getCurrentMaterial = (state: CreatorState): string => {
  return state.currentSide === 'front' ? state.frontMaterial : state.backMaterial;
};

/**
 * Get the current lighting based on the active side
 */
export const getCurrentLighting = (state: CreatorState): CreatorState['frontLighting'] => {
  return state.currentSide === 'front' ? state.frontLighting : state.backLighting;
};

/**
 * Create state update for current side effects
 */
export const createEffectsUpdate = (
  state: CreatorState, 
  effects: Record<string, number>
): Partial<CreatorState> => {
  if (state.currentSide === 'front') {
    return { frontEffects: effects };
  } else {
    return { backEffects: effects };
  }
};

/**
 * Create state update for current side material
 */
export const createMaterialUpdate = (
  state: CreatorState, 
  material: string
): Partial<CreatorState> => {
  if (state.currentSide === 'front') {
    return { frontMaterial: material };
  } else {
    return { backMaterial: material };
  }
};

/**
 * Create state update for current side lighting
 */
export const createLightingUpdate = (
  state: CreatorState, 
  lighting: CreatorState['frontLighting']
): Partial<CreatorState> => {
  if (state.currentSide === 'front') {
    return { frontLighting: lighting };
  } else {
    return { backLighting: lighting };
  }
};

/**
 * Get the default creator state
 */
export const getDefaultCreatorState = (): CreatorState => ({
  selectedFrame: 'crd-default',
  currentSide: 'front',
  frontEffects: {
    metallic: 0.2,
    holographic: 0.1,
    chrome: 0,
    crystal: 0,
    vintage: 0.1,
    prismatic: 0,
    interference: 0,
    rainbow: 0
  },
  backEffects: {
    metallic: 0.1,
    holographic: 0.7,
    chrome: 0,
    crystal: 0.3,
    vintage: 0,
    prismatic: 0.4,
    interference: 0.2,
    rainbow: 0.1
  },
  frontMaterial: 'standard',
  backMaterial: 'holographic',
  frontLighting: {
    intensity: 0.6,
    direction: { x: 0.4, y: 0.6 },
    color: '#FF6B4A',
    environment: 'studio'
  },
  backLighting: {
    intensity: 0.8,
    direction: { x: 0.3, y: 0.7 },
    color: '#4FFFB0',
    environment: 'cosmic'
  }
});