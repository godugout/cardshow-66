export type CRDAssetType = 'frame' | 'element' | 'material' | 'template' | 'user_content' | 'upload';

export type FrameRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type FrameType = 'basic' | 'premium' | 'animated' | 'holographic';
export type ElementType = 'logo' | 'corner' | 'border' | 'accent' | 'label' | 'decoration';
export type MaterialType = 'texture' | 'pattern' | 'surface' | 'finish' | 'effect';
export type PositionType = 'fixed' | 'flexible' | 'corner' | 'edge';
export type ComplexityLevel = 'basic' | 'intermediate' | 'advanced';
export type AccessLevel = 'public' | 'private' | 'shared';

export interface CRDDimensions {
  width: number;
  height: number;
  aspectRatio?: number;
}

export interface CRDPricing {
  type: 'free' | 'premium' | 'credits';
  cost?: number;
}

export interface CRDPositioning {
  defaultX?: number;
  defaultY?: number;
  anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  constraints?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
}

export interface MaterialProperties {
  roughness?: number;
  metallic?: number;
  normal?: string; // Normal map URL
  emission?: number;
  opacity?: number;
}

export interface MaterialTiling {
  repeat?: { x: number; y: number };
  scale?: number;
  offset?: { x: number; y: number };
}

export interface CRDFrame {
  id: string;
  name: string;
  description?: string;
  category: string;
  rarity: FrameRarity;
  frame_type: FrameType;
  compatibility_tags: string[];
  preview_url: string;
  asset_url: string;
  thumbnail_url?: string;
  metadata: Record<string, any>;
  dimensions: CRDDimensions;
  pricing: CRDPricing;
  is_public: boolean;
  is_featured: boolean;
  download_count: number;
  creator_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CRDElement {
  id: string;
  name: string;
  description?: string;
  element_type: ElementType;
  category: string;
  position_type: PositionType;
  compatibility_frames: string[];
  asset_url: string;
  thumbnail_url?: string;
  metadata: Record<string, any>;
  dimensions: CRDDimensions;
  positioning: CRDPositioning;
  is_public: boolean;
  creator_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CRDMaterial {
  id: string;
  name: string;
  description?: string;
  material_type: MaterialType;
  category: string;
  preview_url: string;
  asset_url: string;
  thumbnail_url?: string;
  properties: MaterialProperties;
  tiling: MaterialTiling;
  is_seamless: boolean;
  is_public: boolean;
  creator_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CRDTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  style: string;
  complexity: ComplexityLevel;
  frame_id?: string;
  elements: any[]; // Array of element configurations
  materials: Record<string, any>; // Material assignments
  layout: Record<string, any>; // Complete layout definition
  preview_url: string;
  asset_bundle_url?: string;
  is_public: boolean;
  is_featured: boolean;
  download_count: number;
  rating: number;
  rating_count: number;
  pricing: CRDPricing;
  creator_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  user_id?: string;
  asset_type: CRDAssetType;
  asset_reference_id?: string;
  bucket_id: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_path?: string;
  metadata: Record<string, any>;
  tags: string[];
  is_optimized: boolean;
  optimization_variants: Record<string, any>;
  access_level: AccessLevel;
  created_at: string;
  updated_at: string;
}

export interface CRDAssetSearchFilters {
  type?: CRDAssetType;
  category?: string;
  rarity?: FrameRarity;
  tags?: string[];
  creator_user_id?: string;
  is_public?: boolean;
  is_featured?: boolean;
  pricing_type?: 'free' | 'premium' | 'credits';
}

export interface CRDAssetUploadOptions {
  asset_type: CRDAssetType;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  metadata?: Record<string, any>;
  generate_thumbnail?: boolean;
  optimize?: boolean;
}
