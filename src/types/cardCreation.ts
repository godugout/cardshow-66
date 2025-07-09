// Essential card creation types

export interface UnifiedCardData {
  title: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  frame: string;
  effects: {
    holographic: number;
    metallic: number;
    chrome: number;
    particles: boolean;
  };
  imageUrl?: string;
  image_url?: string;
  tags?: string[];
}