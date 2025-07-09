
export interface CardCreationState {
  step: 'upload' | 'frame' | 'customize' | 'preview' | 'export';  
  uploadedImage: string | null;
  imageFile: File | null;
  cardData: {
    title: string;
    description: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    frame: string;
    effectPreset?: string;
    effects: {
      holographic: number;
      metallic: number;
      chrome: number;
      particles: boolean;
    };
  };
  processing: boolean;
  error: string | null;
}

export interface ImageProcessingOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
}

// Unified card data interface for all components
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
  design_metadata?: {
    layout_type?: string;
    frame_id?: string;
    frame_style?: string;
    effects?: Record<string, any>;
    serial_number?: string;
    card_id?: string;
  };
  template_id?: string;
  visibility?: string;
  creator_attribution?: Record<string, any>;
  publishing_options?: Record<string, any>;
}
