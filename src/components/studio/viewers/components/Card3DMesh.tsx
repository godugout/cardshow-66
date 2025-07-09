import React from 'react';
import { PhotorealisticCard } from '@/components/3d/rendering/PhotorealisticCard';
import type { CardData } from '@/types/card';

interface Card3DMeshProps {
  card: CardData;
  material: any;
  animation: any;
  effectLayers: any[];
}

export const Card3DMesh: React.FC<Card3DMeshProps> = ({
  card,
  material,
  animation,
  effectLayers
}) => {
  return (
    <PhotorealisticCard
      card={card}
      enablePhysics={true}
      enablePostProcessing={true}
      quality="high"
    />
  );
};