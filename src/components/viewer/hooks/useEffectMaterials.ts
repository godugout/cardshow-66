
import { useMemo } from 'react';
import * as THREE from 'three';
import { MATERIAL_SETTINGS, CARD_CONSTANTS } from '../constants/cardRenderer';
import { createHolographicShader } from '@/components/3d/shaders/HolographicShader';
import { createChromeShader } from '@/components/3d/shaders/ChromeShader';
import { createGoldShader } from '@/components/3d/shaders/GoldShader';
import { createCrystalShader } from '@/components/3d/shaders/CrystalShader';
import { createMatteShader } from '@/components/3d/shaders/MatteShader';

export interface EffectMaterialData {
  material: THREE.Material;
  offset: number;
}

export const useEffectMaterials = (effectValues: Record<string, Record<string, any>>) => {
  // Memoize holographic material separately
  const holographicMaterial = useMemo(() => {
    if (effectValues.holographic?.intensity <= 0) return null;
    
    const intensity = effectValues.holographic.intensity / 100;
    const shader = createHolographicShader();
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        ...shader.uniforms,
        intensity: { value: intensity },
        time: { value: 0 }
      },
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    return {
      material,
      offset: CARD_CONSTANTS.EFFECT_LAYER_OFFSET,
      isShader: true,
      updateTime: (time: number) => {
        material.uniforms.time.value = time;
      }
    };
  }, [effectValues.holographic?.intensity]);

  // Memoize chrome material separately
  const chromeMaterial = useMemo(() => {
    if (effectValues.chrome?.intensity <= 0) return null;
    
    const intensity = effectValues.chrome.intensity / 100;
    const shader = createChromeShader();
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        ...shader.uniforms,
        intensity: { value: intensity },
        time: { value: 0 }
      },
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    return {
      material,
      offset: CARD_CONSTANTS.EFFECT_LAYER_OFFSET * 2,
      isShader: true,
      updateTime: (time: number) => {
        material.uniforms.time.value = time;
      }
    };
  }, [effectValues.chrome?.intensity]);

  // Memoize gold material separately
  const goldMaterial = useMemo(() => {
    if (effectValues.gold?.intensity <= 0) return null;
    
    const intensity = effectValues.gold.intensity / 100;
    const shader = createGoldShader();
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        ...shader.uniforms,
        intensity: { value: intensity },
        time: { value: 0 }
      },
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    return {
      material,
      offset: CARD_CONSTANTS.EFFECT_LAYER_OFFSET * 3,
      isShader: true,
      updateTime: (time: number) => {
        material.uniforms.time.value = time;
      }
    };
  }, [effectValues.gold?.intensity]);

  // Memoize crystal material separately
  const crystalMaterial = useMemo(() => {
    if (effectValues.crystal?.intensity <= 0) return null;
    
    const intensity = effectValues.crystal.intensity / 100;
    const shader = createCrystalShader();
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        ...shader.uniforms,
        intensity: { value: intensity },
        time: { value: 0 }
      },
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    return {
      material,
      offset: CARD_CONSTANTS.EFFECT_LAYER_OFFSET * 4,
      isShader: true,
      updateTime: (time: number) => {
        material.uniforms.time.value = time;
      }
    };
  }, [effectValues.crystal?.intensity]);

  // Add matte material
  const matteMaterial = useMemo(() => {
    if (effectValues.matte?.intensity <= 0) return null;
    
    const intensity = effectValues.matte.intensity / 100;
    const shader = createMatteShader();
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        ...shader.uniforms,
        intensity: { value: intensity },
        time: { value: 0 }
      },
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      transparent: false,
      side: THREE.DoubleSide
    });
    
    return {
      material,
      offset: CARD_CONSTANTS.EFFECT_LAYER_OFFSET * 5,
      isShader: true,
      updateTime: (time: number) => {
        material.uniforms.time.value = time;
      }
    };
  }, [effectValues.matte?.intensity]);

  // Combine all active materials
  return useMemo(() => {
    const materials: EffectMaterialData[] = [];
    
    if (holographicMaterial) materials.push(holographicMaterial);
    if (chromeMaterial) materials.push(chromeMaterial);
    if (goldMaterial) materials.push(goldMaterial);
    if (crystalMaterial) materials.push(crystalMaterial);
    if (matteMaterial) materials.push(matteMaterial);
    
    return materials;
  }, [holographicMaterial, chromeMaterial, goldMaterial, crystalMaterial, matteMaterial]);
};
