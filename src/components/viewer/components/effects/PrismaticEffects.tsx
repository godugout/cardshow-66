
import React from 'react';
import type { EffectValues } from '../../hooks/useEnhancedCardEffects';
import type { EnhancedLightingData } from '../../hooks/useEnhancedInteractiveLighting';
import { HolographicEffect } from './HolographicEffect';
import { InterferenceEffect } from './InterferenceEffect';
import { PrizmEffect } from './PrizmEffect';
import { CrystalEffect } from './CrystalEffect';
import { GoldEffect } from './GoldEffect';
import { FoilSprayEffect } from './FoilSprayEffect';

interface PrismaticEffectsProps {
  effectValues: EffectValues;
  mousePosition: { x: number; y: number };
  enhancedLightingData?: EnhancedLightingData;
}

export const PrismaticEffects: React.FC<PrismaticEffectsProps> = ({
  effectValues,
  mousePosition,
  enhancedLightingData
}) => {
  // Check if any effects are active
  const hasActiveEffects = Object.values(effectValues).some(effect => 
    typeof effect === 'object' && effect?.intensity > 0
  );

  if (!hasActiveEffects) return null;

  return (
    <>
      <HolographicEffect effectValues={effectValues} mousePosition={mousePosition} />
      <InterferenceEffect effectValues={effectValues} mousePosition={mousePosition} />
      <PrizmEffect effectValues={effectValues} mousePosition={mousePosition} />
      <CrystalEffect effectValues={effectValues} mousePosition={mousePosition} />
      <GoldEffect effectValues={effectValues} mousePosition={mousePosition} />
      <FoilSprayEffect effectValues={effectValues} mousePosition={mousePosition} />
    </>
  );
};
