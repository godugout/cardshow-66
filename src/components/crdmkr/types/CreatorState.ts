export interface CreatorState {
  selectedFrame: string;
  uploadedImage?: string;
  currentSide: 'front' | 'back';
  frontEffects: Record<string, number>;
  backEffects: Record<string, number>;
  frontMaterial: string;
  backMaterial: string;
  frontLighting: {
    intensity: number;
    direction: { x: number; y: number };
    color: string;
    environment: string;
  };
  backLighting: {
    intensity: number;
    direction: { x: number; y: number };
    color: string;
    environment: string;
  };
}

export interface CardCreatorLayoutProps {
  card: import('@/types/card').CardData;
}