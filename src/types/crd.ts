// ============================================
// CRD (Cardshow Renderer & Display) Framework
// Complete specification for card rendering
// ============================================

export interface CRDCard {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  frameId: string;
  material: CRDMaterial;
  effects: CRDEffects;
  lighting: CRDLighting;
  metadata?: CRDMetadata;
}

export interface CRDMaterial {
  type: 'standard' | 'holographic' | 'metallic' | 'chrome' | 'crystal' | 'vintage' | 'prismatic';
  intensity: number; // 0-100
  surface: {
    roughness: number; // 0-100
    reflectivity: number; // 0-100
    transparency: number; // 0-100
  };
  animation: {
    enabled: boolean;
    speed: number; // 0.1-5.0
    pattern: 'wave' | 'ripple' | 'spiral' | 'linear';
  };
}

export interface CRDEffects {
  metallic: number;
  holographic: number;
  chrome: number;
  crystal: number;
  vintage: number;
  prismatic: number;
  interference: number;
  rainbow: number;
  particles: boolean;
  glow: {
    enabled: boolean;
    color: string;
    intensity: number;
    radius: number;
  };
  distortion: {
    enabled: boolean;
    type: 'wave' | 'ripple' | 'twist';
    intensity: number;
  };
}

export interface CRDLighting {
  environment: 'studio' | 'outdoor' | 'neon' | 'candlelight' | 'dramatic';
  intensity: number; // 0-100
  color: {
    primary: string;
    secondary: string;
    ambient: string;
  };
  shadows: {
    enabled: boolean;
    softness: number; // 0-100
    intensity: number; // 0-100
  };
  highlights: {
    enabled: boolean;
    sharpness: number; // 0-100
    intensity: number; // 0-100
  };
}

export interface CRDMetadata {
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  edition: string;
  serialNumber?: string;
  artist?: string;
  collection?: string;
}

// Frame system
export interface CRDFrame {
  id: string;
  name: string;
  category: 'sports' | 'gaming' | 'art' | 'custom';
  elements: CRDFrameElement[];
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  imagePlaceholder: {
    x: number;
    y: number;
    width: number;
    height: number;
    shape: 'rectangle' | 'circle' | 'rounded' | 'custom';
    borderRadius?: number;
  };
  style: {
    border: CRDBorder;
    background: CRDBackground;
    texture?: CRDTexture;
  };
}

export interface CRDFrameElement {
  id: string;
  type: 'border' | 'decoration' | 'text' | 'image' | 'pattern';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
  };
  style: CRDElementStyle;
  content?: string;
  animation?: CRDAnimation;
}

export interface CRDElementStyle {
  color?: string;
  gradient?: CRDGradient;
  opacity: number;
  filter?: string;
  transform?: string;
  mixBlendMode?: string;
}

export interface CRDBorder {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'gradient' | 'animated';
  color: string | CRDGradient;
  radius: number;
  glow?: {
    enabled: boolean;
    color: string;
    blur: number;
  };
}

export interface CRDBackground {
  type: 'solid' | 'gradient' | 'pattern' | 'texture';
  color?: string;
  gradient?: CRDGradient;
  pattern?: string;
  opacity: number;
}

export interface CRDGradient {
  type: 'linear' | 'radial' | 'conic';
  direction?: number; // degrees
  stops: Array<{
    color: string;
    position: number; // 0-100
  }>;
}

export interface CRDTexture {
  type: 'paper' | 'canvas' | 'metal' | 'fabric' | 'noise';
  intensity: number; // 0-100
  scale: number;
}

export interface CRDAnimation {
  type: 'pulse' | 'rotate' | 'scale' | 'float' | 'shimmer';
  duration: number; // seconds
  easing: string;
  infinite: boolean;
  delay?: number;
}

// Render context
export interface CRDRenderContext {
  card: CRDCard;
  frame: CRDFrame;
  viewport: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  interactive: boolean;
  mousePosition?: { x: number; y: number };
  isHovering: boolean;
  performance: 'low' | 'medium' | 'high';
}

// Effect presets
export const CRD_MATERIAL_PRESETS: Record<string, Partial<CRDMaterial>> = {
  standard: {
    type: 'standard',
    intensity: 0,
    surface: { roughness: 50, reflectivity: 10, transparency: 0 },
    animation: { enabled: false, speed: 1, pattern: 'linear' }
  },
  holographic: {
    type: 'holographic',
    intensity: 80,
    surface: { roughness: 20, reflectivity: 90, transparency: 5 },
    animation: { enabled: true, speed: 1.5, pattern: 'wave' }
  },
  metallic: {
    type: 'metallic',
    intensity: 70,
    surface: { roughness: 30, reflectivity: 80, transparency: 0 },
    animation: { enabled: true, speed: 0.8, pattern: 'linear' }
  },
  chrome: {
    type: 'chrome',
    intensity: 90,
    surface: { roughness: 10, reflectivity: 95, transparency: 0 },
    animation: { enabled: true, speed: 2, pattern: 'ripple' }
  },
  crystal: {
    type: 'crystal',
    intensity: 85,
    surface: { roughness: 5, reflectivity: 85, transparency: 20 },
    animation: { enabled: true, speed: 1.2, pattern: 'spiral' }
  },
  vintage: {
    type: 'vintage',
    intensity: 40,
    surface: { roughness: 80, reflectivity: 20, transparency: 0 },
    animation: { enabled: false, speed: 1, pattern: 'linear' }
  },
  prismatic: {
    type: 'prismatic',
    intensity: 95,
    surface: { roughness: 15, reflectivity: 90, transparency: 10 },
    animation: { enabled: true, speed: 3, pattern: 'spiral' }
  }
};

export const CRD_LIGHTING_PRESETS: Record<string, Partial<CRDLighting>> = {
  studio: {
    environment: 'studio',
    intensity: 80,
    color: { primary: '#ffffff', secondary: '#f0f0f0', ambient: '#e8e8e8' },
    shadows: { enabled: true, softness: 70, intensity: 40 },
    highlights: { enabled: true, sharpness: 60, intensity: 80 }
  },
  dramatic: {
    environment: 'dramatic',
    intensity: 90,
    color: { primary: '#ffffff', secondary: '#666666', ambient: '#333333' },
    shadows: { enabled: true, softness: 30, intensity: 80 },
    highlights: { enabled: true, sharpness: 90, intensity: 90 }
  },
  neon: {
    environment: 'neon',
    intensity: 95,
    color: { primary: '#00ffff', secondary: '#ff00ff', ambient: '#1a1a2e' },
    shadows: { enabled: true, softness: 90, intensity: 60 },
    highlights: { enabled: true, sharpness: 80, intensity: 95 }
  }
};