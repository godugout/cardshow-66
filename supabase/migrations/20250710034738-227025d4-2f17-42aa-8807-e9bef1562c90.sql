-- Create CRD-specific asset tables for MediaManager
-- First, add a bucket for CRD templates if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('crd-templates', 'crd-templates', true)
ON CONFLICT (id) DO NOTHING;

-- Create CRD frames table
CREATE TABLE IF NOT EXISTS crd_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'standard',
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  frame_type TEXT NOT NULL DEFAULT 'basic' CHECK (frame_type IN ('basic', 'premium', 'animated', 'holographic')),
  compatibility_tags TEXT[] DEFAULT '{}',
  preview_url TEXT NOT NULL,
  asset_url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  dimensions JSONB DEFAULT '{}', -- {width, height, aspectRatio}
  pricing JSONB DEFAULT '{}', -- {type: 'free'|'premium'|'credits', cost: number}
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  creator_id UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create CRD elements table  
CREATE TABLE IF NOT EXISTS crd_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  element_type TEXT NOT NULL CHECK (element_type IN ('logo', 'corner', 'border', 'accent', 'label', 'decoration')),
  category TEXT NOT NULL DEFAULT 'general',
  position_type TEXT DEFAULT 'flexible' CHECK (position_type IN ('fixed', 'flexible', 'corner', 'edge')),
  compatibility_frames TEXT[] DEFAULT '{}', -- Frame IDs this element works with
  asset_url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  dimensions JSONB DEFAULT '{}',
  positioning JSONB DEFAULT '{}', -- {defaultX, defaultY, anchor, constraints}
  is_public BOOLEAN DEFAULT true,
  creator_id UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create CRD materials table
CREATE TABLE IF NOT EXISTS crd_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL CHECK (material_type IN ('texture', 'pattern', 'surface', 'finish', 'effect')),
  category TEXT NOT NULL DEFAULT 'basic',
  preview_url TEXT NOT NULL,
  asset_url TEXT NOT NULL,
  thumbnail_url TEXT,
  properties JSONB DEFAULT '{}', -- {roughness, metallic, normal, etc.}
  tiling JSONB DEFAULT '{}', -- {repeat, scale, offset}
  is_seamless BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  creator_id UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create CRD templates table (complete assembled frames)
CREATE TABLE IF NOT EXISTS crd_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  style TEXT NOT NULL DEFAULT 'modern',
  complexity TEXT DEFAULT 'basic' CHECK (complexity IN ('basic', 'intermediate', 'advanced')),
  frame_id UUID REFERENCES crd_frames(id),
  elements JSONB DEFAULT '[]', -- Array of element configurations
  materials JSONB DEFAULT '{}', -- Material assignments
  layout JSONB DEFAULT '{}', -- Complete layout definition
  preview_url TEXT NOT NULL,
  asset_bundle_url TEXT, -- ZIP file with all assets
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  pricing JSONB DEFAULT '{}',
  creator_id UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create media assets table to integrate with MediaManager
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('frame', 'element', 'material', 'template', 'user_content', 'upload')),
  asset_reference_id UUID, -- References crd_frames, crd_elements, etc.
  bucket_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  thumbnail_path TEXT,
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_optimized BOOLEAN DEFAULT false,
  optimization_variants JSONB DEFAULT '{}',
  access_level TEXT DEFAULT 'private' CHECK (access_level IN ('public', 'private', 'shared')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_crd_frames_category ON crd_frames(category);
CREATE INDEX IF NOT EXISTS idx_crd_frames_rarity ON crd_frames(rarity);
CREATE INDEX IF NOT EXISTS idx_crd_frames_frame_type ON crd_frames(frame_type);
CREATE INDEX IF NOT EXISTS idx_crd_frames_creator_id ON crd_frames(creator_id);
CREATE INDEX IF NOT EXISTS idx_crd_frames_compatibility_tags ON crd_frames USING GIN(compatibility_tags);

CREATE INDEX IF NOT EXISTS idx_crd_elements_element_type ON crd_elements(element_type);
CREATE INDEX IF NOT EXISTS idx_crd_elements_category ON crd_elements(category);
CREATE INDEX IF NOT EXISTS idx_crd_elements_creator_id ON crd_elements(creator_id);
CREATE INDEX IF NOT EXISTS idx_crd_elements_compatibility_frames ON crd_elements USING GIN(compatibility_frames);

CREATE INDEX IF NOT EXISTS idx_crd_materials_material_type ON crd_materials(material_type);
CREATE INDEX IF NOT EXISTS idx_crd_materials_category ON crd_materials(category);
CREATE INDEX IF NOT EXISTS idx_crd_materials_creator_id ON crd_materials(creator_id);

CREATE INDEX IF NOT EXISTS idx_crd_templates_category ON crd_templates(category);
CREATE INDEX IF NOT EXISTS idx_crd_templates_style ON crd_templates(style);
CREATE INDEX IF NOT EXISTS idx_crd_templates_creator_id ON crd_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_crd_templates_frame_id ON crd_templates(frame_id);

CREATE INDEX IF NOT EXISTS idx_media_assets_user_id ON media_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_asset_type ON media_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_bucket_id ON media_assets(bucket_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON media_assets USING GIN(tags);

-- Enable RLS on all tables
ALTER TABLE crd_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE crd_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE crd_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE crd_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- RLS policies for crd_frames
CREATE POLICY "Public can view public frames" ON crd_frames
  FOR SELECT USING (is_public = true);

CREATE POLICY "Creators can manage their frames" ON crd_frames
  FOR ALL USING (creator_id = auth.uid());

-- RLS policies for crd_elements
CREATE POLICY "Public can view public elements" ON crd_elements
  FOR SELECT USING (is_public = true);

CREATE POLICY "Creators can manage their elements" ON crd_elements
  FOR ALL USING (creator_id = auth.uid());

-- RLS policies for crd_materials
CREATE POLICY "Public can view public materials" ON crd_materials
  FOR SELECT USING (is_public = true);

CREATE POLICY "Creators can manage their materials" ON crd_materials
  FOR ALL USING (creator_id = auth.uid());

-- RLS policies for crd_templates
CREATE POLICY "Public can view public templates" ON crd_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Creators can manage their templates" ON crd_templates
  FOR ALL USING (creator_id = auth.uid());

-- RLS policies for media_assets
CREATE POLICY "Users can view public media assets" ON media_assets
  FOR SELECT USING (access_level = 'public' OR user_id = auth.uid());

CREATE POLICY "Users can manage their media assets" ON media_assets
  FOR ALL USING (user_id = auth.uid());

-- Add updated_at triggers
CREATE TRIGGER update_crd_frames_updated_at BEFORE UPDATE ON crd_frames
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crd_elements_updated_at BEFORE UPDATE ON crd_elements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crd_materials_updated_at BEFORE UPDATE ON crd_materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crd_templates_updated_at BEFORE UPDATE ON crd_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();