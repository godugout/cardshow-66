import type { EnhancedProcessedPSD } from '@/services/psdProcessor/enhancedPsdProcessingService';
import type { Card, CardRarity } from '@/types/card';

export interface PSDToCardData {
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  rarity: CardRarity;
  tags: string[];
  suggested_category: string;
  quality_score: number;
  psd_metadata: {
    original_filename: string;
    dimensions: { width: number; height: number };
    layer_count: number;
    has_character_layers: boolean;
    has_background_layers: boolean;
    has_text_layers: boolean;
    has_effect_layers: boolean;
    extracted_images: string[];
  };
  design_metadata: {
    source: 'psd-import';
    psd_data: EnhancedProcessedPSD;
  };
}

export const convertPSDToCardData = (
  psd: EnhancedProcessedPSD,
  filename: string
): PSDToCardData => {
  // Extract layer statistics
  const layersWithImages = psd.layers.filter(layer => 
    'hasRealImage' in layer && layer.hasRealImage
  ).length;

  const characterLayers = psd.layers.filter(l => 
    l.name.toLowerCase().includes('character') || 
    l.name.toLowerCase().includes('player') ||
    l.name.toLowerCase().includes('person')
  ).length;

  const backgroundLayers = psd.layers.filter(l => 
    l.name.toLowerCase().includes('background') || 
    l.name.toLowerCase().includes('bg')
  ).length;

  const textLayers = psd.layers.filter(l => 
    l.name.toLowerCase().includes('text') || 
    l.name.toLowerCase().includes('title') ||
    l.name.toLowerCase().includes('name')
  ).length;

  const effectLayers = psd.layers.filter(l => 
    l.name.toLowerCase().includes('effect') || 
    l.name.toLowerCase().includes('shadow') ||
    l.name.toLowerCase().includes('glow')
  ).length;

  // Calculate quality score
  const qualityScore = Math.round(
    (layersWithImages / Math.max(1, psd.layers.length)) * 100
  );

  // Determine rarity based on quality and complexity
  let rarity: CardRarity = 'common';
  if (qualityScore >= 90 && psd.layers.length >= 10) {
    rarity = 'legendary';
  } else if (qualityScore >= 80 && psd.layers.length >= 7) {
    rarity = 'epic';
  } else if (qualityScore >= 70 && psd.layers.length >= 5) {
    rarity = 'rare';
  } else if (qualityScore >= 60 && psd.layers.length >= 3) {
    rarity = 'uncommon';
  }

  // Generate default title with CRD Project + date
  const now = new Date();
  const dateString = now.getFullYear().toString() + 
                    (now.getMonth() + 1).toString().padStart(2, '0') + 
                    now.getDate().toString().padStart(2, '0') + 
                    now.getHours().toString().padStart(2, '0');
  const baseTitle = `CRD Project ${dateString}`;

  // Generate description based on PSD content
  let description = `A ${rarity} card created from a high-quality PSD design`;
  if (characterLayers > 0) description += ' featuring character elements';
  if (backgroundLayers > 0) description += ' with detailed backgrounds';
  if (effectLayers > 0) description += ' and special effects';
  description += '.';

  // Generate tags based on layer names and content
  const tags = [
    'psd-import',
    rarity,
    ...(characterLayers > 0 ? ['character'] : []),
    ...(backgroundLayers > 0 ? ['background'] : []),
    ...(textLayers > 0 ? ['text'] : []),
    ...(effectLayers > 0 ? ['effects'] : []),
    ...(qualityScore >= 80 ? ['high-quality'] : []),
    ...(psd.layers.length >= 10 ? ['complex'] : ['simple'])
  ];

  // Suggest category
  let suggestedCategory = 'artwork';
  if (characterLayers > 0) suggestedCategory = 'character';
  if (filename.toLowerCase().includes('sport')) suggestedCategory = 'sports';
  if (filename.toLowerCase().includes('game')) suggestedCategory = 'gaming';

  // Get main image URL (flattened image or first layer with image)
  const mainImageUrl = psd.extractedImages?.flattenedImageUrl || 
    psd.extractedImages?.layerImages?.[0]?.imageUrl || '';

  const thumbnailUrl = psd.extractedImages?.thumbnailUrl || mainImageUrl;

  // Collect all extracted image URLs
  const extractedImages = [
    ...(psd.extractedImages?.flattenedImageUrl ? [psd.extractedImages.flattenedImageUrl] : []),
    ...(psd.extractedImages?.layerImages?.map(img => img.imageUrl) || [])
  ].filter(Boolean);

  return {
    title: baseTitle,
    description,
    image_url: mainImageUrl,
    thumbnail_url: thumbnailUrl,
    rarity,
    tags,
    suggested_category: suggestedCategory,
    quality_score: qualityScore,
    psd_metadata: {
      original_filename: filename,
      dimensions: { width: psd.width, height: psd.height },
      layer_count: psd.layers.length,
      has_character_layers: characterLayers > 0,
      has_background_layers: backgroundLayers > 0,
      has_text_layers: textLayers > 0,
      has_effect_layers: effectLayers > 0,
      extracted_images: extractedImages
    },
    design_metadata: {
      source: 'psd-import',
      psd_data: psd
    }
  };
};

// Helper function to check if PSD is ready for card creation
export const isPSDReadyForCardCreation = (psd: EnhancedProcessedPSD): boolean => {
  const hasMainImage = Boolean(psd.extractedImages?.flattenedImageUrl || 
    psd.extractedImages?.layerImages?.length > 0);
  const hasLayers = psd.layers.length > 0;
  const hasValidDimensions = psd.width > 0 && psd.height > 0;
  
  return hasMainImage && hasLayers && hasValidDimensions;
};