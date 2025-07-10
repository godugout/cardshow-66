import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MediaManager } from './MediaManager';
import type {
  CRDAssetType,
  FrameRarity,
  ElementType,
  MaterialType,
  AccessLevel
} from '@/types/media/crd-assets';

// Extended upload options with CRD-specific buckets
export interface CRDUploadOptions {
  bucket: 'card-assets' | 'card-images' | 'crd-templates' | 'user-content';
  asset_type: CRDAssetType;
  folder?: string;
  category?: string;
  rarity?: FrameRarity;
  tags?: string[];
  metadata?: Record<string, any>;
  is_public?: boolean;
  generateThumbnail?: boolean;
  optimize?: boolean;
  onProgress?: (progress: number) => void;
}

export interface MediaAssetResult {
  id: string;
  user_id?: string;
  asset_type: CRDAssetType;
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

class CRDMediaManagerClass {
  private baseManager = MediaManager;

  // ========== UPLOAD METHODS ==========

  async uploadCRDAsset(file: File, options: CRDUploadOptions): Promise<MediaAssetResult | null> {
    try {
      // First upload the file using base MediaManager
      const uploadedFile = await this.baseManager.uploadFile(file, {
        bucket: options.bucket,
        folder: options.folder,
        generateThumbnail: options.generateThumbnail,
        optimize: options.optimize,
        tags: options.tags,
        metadata: options.metadata,
        onProgress: options.onProgress
      });

      if (!uploadedFile) {
        return null;
      }

      // Create media asset record in database
      const { data: user } = await supabase.auth.getUser();
      
      const mediaAssetData = {
        user_id: user.user?.id,
        asset_type: options.asset_type,
        bucket_id: options.bucket,
        file_path: uploadedFile.file_path,
        file_name: uploadedFile.file_name,
        file_size: uploadedFile.file_size,
        mime_type: uploadedFile.mime_type,
        width: uploadedFile.width,
        height: uploadedFile.height,
        thumbnail_path: uploadedFile.thumbnail_path,
        metadata: {
          ...uploadedFile.metadata,
          category: options.category,
          rarity: options.rarity
        },
        tags: options.tags || [],
        is_optimized: uploadedFile.is_optimized,
        optimization_variants: uploadedFile.optimization_variants,
        access_level: (options.is_public ? 'public' : 'private') as AccessLevel
      };

      const { data, error } = await supabase
        .from('media_assets')
        .insert([mediaAssetData])
        .select()
        .single();

      if (error) {
        console.error('Error saving media asset:', error);
        // Continue anyway, file was uploaded successfully
      }

      return {
        id: data?.id || uploadedFile.id,
        user_id: mediaAssetData.user_id,
        asset_type: options.asset_type,
        bucket_id: options.bucket,
        file_path: uploadedFile.file_path,
        file_name: uploadedFile.file_name,
        file_size: uploadedFile.file_size,
        mime_type: uploadedFile.mime_type,
        width: uploadedFile.width,
        height: uploadedFile.height,
        thumbnail_path: uploadedFile.thumbnail_path,
        metadata: mediaAssetData.metadata || {},
        tags: options.tags || [],
        is_optimized: uploadedFile.is_optimized,
        optimization_variants: uploadedFile.optimization_variants,
        access_level: mediaAssetData.access_level,
        created_at: data?.created_at || new Date().toISOString(),
        updated_at: data?.updated_at || new Date().toISOString()
      };

    } catch (error) {
      console.error('CRD asset upload error:', error);
      toast.error('Failed to upload CRD asset');
      return null;
    }
  }

  // ========== FRAME METHODS ==========

  async createFrame(frameData: {
    name: string;
    description?: string;
    category: string;
    rarity: FrameRarity;
    frame_type: string;
    compatibility_tags: string[];
    preview_url: string;
    asset_url: string;
    thumbnail_url?: string;
    metadata?: Record<string, any>;
    dimensions?: Record<string, any>;
    pricing?: Record<string, any>;
    is_public?: boolean;
    is_featured?: boolean;
  }): Promise<any | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const insertData = {
        name: frameData.name,
        description: frameData.description,
        category: frameData.category,
        rarity: frameData.rarity,
        frame_type: frameData.frame_type,
        compatibility_tags: frameData.compatibility_tags,
        preview_url: frameData.preview_url,
        asset_url: frameData.asset_url,
        thumbnail_url: frameData.thumbnail_url,
        metadata: frameData.metadata || {},
        dimensions: frameData.dimensions || {},
        pricing: frameData.pricing || {},
        is_public: frameData.is_public ?? true,
        is_featured: frameData.is_featured ?? false,
        creator_user_id: user.user?.id
      };
      
      const { data, error } = await supabase
        .from('crd_frames')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating frame:', error);
        toast.error('Failed to create frame');
        return null;
      }

      toast.success('Frame created successfully');
      return data;
    } catch (error) {
      console.error('Frame creation error:', error);
      toast.error('Failed to create frame');
      return null;
    }
  }

  async getFrames(filters: {
    category?: string;
    rarity?: FrameRarity;
    is_public?: boolean;
    is_featured?: boolean;
    creator_user_id?: string;
    tags?: string[];
  } = {}): Promise<any[]> {
    try {
      let query = supabase.from('crd_frames').select('*');

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.rarity) {
        query = query.eq('rarity', filters.rarity);
      }
      if (filters.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }
      if (filters.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }
      if (filters.creator_user_id) {
        query = query.eq('creator_user_id', filters.creator_user_id);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('compatibility_tags', filters.tags);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching frames:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Frame fetch error:', error);
      return [];
    }
  }

  async getFrame(id: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('crd_frames')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching frame:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Frame fetch error:', error);
      return null;
    }
  }

  // ========== ELEMENT METHODS ==========

  async createElement(elementData: {
    name: string;
    description?: string;
    element_type: ElementType;
    category: string;
    position_type?: string;
    compatibility_frames?: string[];
    asset_url: string;
    thumbnail_url?: string;
    metadata?: Record<string, any>;
    dimensions?: Record<string, any>;
    positioning?: Record<string, any>;
    is_public?: boolean;
  }): Promise<any | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const insertData = {
        name: elementData.name,
        description: elementData.description,
        element_type: elementData.element_type,
        category: elementData.category,
        position_type: elementData.position_type || 'flexible',
        compatibility_frames: elementData.compatibility_frames || [],
        asset_url: elementData.asset_url,
        thumbnail_url: elementData.thumbnail_url,
        metadata: elementData.metadata || {},
        dimensions: elementData.dimensions || {},
        positioning: elementData.positioning || {},
        is_public: elementData.is_public ?? true,
        creator_user_id: user.user?.id
      };
      
      const { data, error } = await supabase
        .from('crd_elements')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating element:', error);
        toast.error('Failed to create element');
        return null;
      }

      toast.success('Element created successfully');
      return data;
    } catch (error) {
      console.error('Element creation error:', error);
      toast.error('Failed to create element');
      return null;
    }
  }

  async getElements(filters: { 
    element_type?: ElementType; 
    category?: string; 
    compatibility_frames?: string[] 
  } = {}): Promise<any[]> {
    try {
      let query = supabase.from('crd_elements').select('*');

      if (filters.element_type) {
        query = query.eq('element_type', filters.element_type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.compatibility_frames && filters.compatibility_frames.length > 0) {
        query = query.overlaps('compatibility_frames', filters.compatibility_frames);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching elements:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Element fetch error:', error);
      return [];
    }
  }

  // ========== MATERIAL METHODS ==========

  async createMaterial(materialData: {
    name: string;
    description?: string;
    material_type: MaterialType;
    category: string;
    preview_url: string;
    asset_url: string;
    thumbnail_url?: string;
    properties?: Record<string, any>;
    tiling?: Record<string, any>;
    is_seamless?: boolean;
    is_public?: boolean;
  }): Promise<any | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const insertData = {
        name: materialData.name,
        description: materialData.description,
        material_type: materialData.material_type,
        category: materialData.category,
        preview_url: materialData.preview_url,
        asset_url: materialData.asset_url,
        thumbnail_url: materialData.thumbnail_url,
        properties: materialData.properties || {},
        tiling: materialData.tiling || {},
        is_seamless: materialData.is_seamless ?? false,
        is_public: materialData.is_public ?? true,
        creator_user_id: user.user?.id
      };
      
      const { data, error } = await supabase
        .from('crd_materials')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating material:', error);
        toast.error('Failed to create material');
        return null;
      }

      toast.success('Material created successfully');
      return data;
    } catch (error) {
      console.error('Material creation error:', error);
      toast.error('Failed to create material');
      return null;
    }
  }

  async getMaterials(filters: { 
    material_type?: MaterialType; 
    category?: string; 
    is_seamless?: boolean 
  } = {}): Promise<any[]> {
    try {
      let query = supabase.from('crd_materials').select('*');

      if (filters.material_type) {
        query = query.eq('material_type', filters.material_type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.is_seamless !== undefined) {
        query = query.eq('is_seamless', filters.is_seamless);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching materials:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Material fetch error:', error);
      return [];
    }
  }

  // ========== MEDIA ASSET METHODS ==========

  async getMediaAssets(filters: { 
    asset_type?: CRDAssetType; 
    user_id?: string; 
    tags?: string[] 
  } = {}): Promise<MediaAssetResult[]> {
    try {
      let query = supabase.from('media_assets').select('*');

      if (filters.asset_type) {
        query = query.eq('asset_type', filters.asset_type);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching media assets:', error);
        return [];
      }

      return (data || []) as MediaAssetResult[];
    } catch (error) {
      console.error('Media assets fetch error:', error);
      return [];
    }
  }

  async deleteMediaAsset(id: string): Promise<boolean> {
    try {
      // Get asset info first
      const { data: asset } = await supabase
        .from('media_assets')
        .select('*')
        .eq('id', id)
        .single();

      if (asset) {
        // Delete from storage
        await supabase.storage
          .from(asset.bucket_id)
          .remove([asset.file_path]);

        if (asset.thumbnail_path) {
          await supabase.storage
            .from(asset.bucket_id)
            .remove([asset.thumbnail_path]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting media asset:', error);
        toast.error('Failed to delete asset');
        return false;
      }

      toast.success('Asset deleted successfully');
      return true;
    } catch (error) {
      console.error('Media asset deletion error:', error);
      toast.error('Failed to delete asset');
      return false;
    }
  }

  // ========== UTILITY METHODS ==========

  getPublicUrl(bucket: string, path: string): string {
    return this.baseManager.getPublicUrl(bucket, path);
  }

  async generateSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string | null> {
    return this.baseManager.generateSignedUrl(bucket, path, expiresIn);
  }

  // ========== SEARCH METHODS ==========

  async searchAssets(query: string, filters: {
    is_public?: boolean;
    category?: string;
    rarity?: FrameRarity;
    tags?: string[];
    creator_user_id?: string;
  } = {}): Promise<{
    frames: any[];
    elements: any[];
    materials: any[];
    templates: any[];
  }> {
    try {
      const searchTerm = `%${query}%`;
      
      // Search frames
      let framesQuery = supabase
        .from('crd_frames')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`);
      
      if (filters.is_public !== undefined) {
        framesQuery = framesQuery.eq('is_public', filters.is_public);
      }

      // Search elements
      let elementsQuery = supabase
        .from('crd_elements')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`);
        
      if (filters.is_public !== undefined) {
        elementsQuery = elementsQuery.eq('is_public', filters.is_public);
      }

      // Search materials
      let materialsQuery = supabase
        .from('crd_materials')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`);
        
      if (filters.is_public !== undefined) {
        materialsQuery = materialsQuery.eq('is_public', filters.is_public);
      }

      // Search templates
      let templatesQuery = supabase
        .from('crd_templates')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`);
        
      if (filters.is_public !== undefined) {
        templatesQuery = templatesQuery.eq('is_public', filters.is_public);
      }

      const [framesResult, elementsResult, materialsResult, templatesResult] = await Promise.all([
        framesQuery,
        elementsQuery,
        materialsQuery,
        templatesQuery
      ]);

      return {
        frames: framesResult.data || [],
        elements: elementsResult.data || [],
        materials: materialsResult.data || [],
        templates: templatesResult.data || []
      };
    } catch (error) {
      console.error('Asset search error:', error);
      return {
        frames: [],
        elements: [],
        materials: [],
        templates: []
      };
    }
  }
}

export const CRDMediaManager = new CRDMediaManagerClass();