
import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CardRarity } from '@/types/card';
import { uploadCardImage } from '@/lib/cardImageUploader';
import type { PSDToCardData } from '@/utils/psdToCardConverter';

interface CardData {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  rarity: CardRarity;
  template_id: string;
  tags: string[];
  is_public: boolean;
  design_metadata: any;
}

interface Layer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'effect' | 'frame';
  visible: boolean;
  locked: boolean;
  opacity: number;
  data: any;
}

export const useIntegratedCardEditor = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const [cardData, setCardData] = useState<CardData>({
    title: 'My Card',
    description: '',
    image_url: '',
    thumbnail_url: '',
    rarity: 'common',
    template_id: '',
    tags: [],
    is_public: false,
    design_metadata: {}
  });

  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'background',
      name: 'Card Background',
      type: 'shape',
      visible: true,
      locked: false,
      opacity: 1,
      data: { color: '#1a1a2e', gradient: true }
    }
  ]);

  const updateCardData = useCallback((updates: Partial<CardData>) => {
    setCardData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateField = useCallback((field: keyof CardData, value: any) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const selectFrame = useCallback((frameId: string) => {
    setSelectedFrame(frameId);
    updateField('template_id', frameId);
    updateField('design_metadata', { ...cardData.design_metadata, frameId });
    toast.success('Frame selected!');
  }, [updateField, cardData.design_metadata]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!user) {
      toast.error('Please sign in to upload images');
      return;
    }

    try {
      const result = await uploadCardImage({
        file,
        cardId: cardData.id || 'temp',
        userId: user.id
      });

      if (result) {
        updateField('image_url', result.url);
        updateField('thumbnail_url', result.thumbnailUrl || result.url);
        setUploadedImages(prev => [...prev, result.url]);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  }, [user, cardData.id, updateField]);

  const saveCard = useCallback(async (publishImmediately: boolean = false) => {
    if (!user) {
      toast.error('Please sign in to save cards');
      return false;
    }

    if (!cardData.title.trim()) {
      toast.error('Please enter a card title');
      return false;
    }

    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert({
          title: cardData.title,
          description: cardData.description,
          image_url: cardData.image_url,
          thumbnail_url: cardData.thumbnail_url || cardData.image_url,
          rarity: cardData.rarity,
          template_id: cardData.template_id || null,
          tags: cardData.tags,
          is_public: publishImmediately || cardData.is_public,
          creator_id: user.id,
          edition_size: 1,
          design_metadata: {
            ...cardData.design_metadata,
            selectedFrame,
            layers: layers.filter(l => l.visible),
            uploadedImages
          },
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving card:', error);
        toast.error('Failed to save card: ' + error.message);
        return false;
      }

      // Update local state with the returned card ID
      setCardData(prev => ({ ...prev, id: data.id }));
      
      toast.success(publishImmediately ? 'Card published successfully!' : 'Card saved successfully!');
      return true;
    } catch (error) {
      console.error('Unexpected error saving card:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, cardData, selectedFrame, layers, uploadedImages]);

  const publishCard = useCallback(async () => {
    return await saveCard(true);
  }, [saveCard]);

  const addLayer = useCallback((type: Layer['type']) => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
      type,
      visible: true,
      locked: false,
      opacity: 1,
      data: {}
    };
    setLayers(prev => [...prev, newLayer]);
    toast.success(`Added ${type} layer`);
  }, []);

  const updateLayer = useCallback((layerId: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  }, []);

  const initializeFromPSD = useCallback((psdData: PSDToCardData) => {
    setCardData({
      title: psdData.title,
      description: psdData.description,
      image_url: psdData.image_url,
      thumbnail_url: psdData.thumbnail_url,
      rarity: psdData.rarity,
      template_id: '',
      tags: psdData.tags,
      is_public: false,
      design_metadata: psdData.design_metadata
    });

    // Add layers based on PSD data
    const psdLayers: Layer[] = [
      {
        id: 'psd-background',
        name: 'PSD Background',
        type: 'image',
        visible: true,
        locked: false,
        opacity: 1,
        data: { 
          imageUrl: psdData.image_url,
          source: 'psd-import',
          psdMetadata: psdData.psd_metadata
        }
      }
    ];

    // Add additional layers for extracted images
    psdData.psd_metadata.extracted_images.forEach((imageUrl, index) => {
      if (imageUrl !== psdData.image_url) {
        psdLayers.push({
          id: `psd-layer-${index}`,
          name: `PSD Layer ${index + 1}`,
          type: 'image',
          visible: false,
          locked: false,
          opacity: 1,
          data: { imageUrl, source: 'psd-layer' }
        });
      }
    });

    setLayers(psdLayers);
    toast.success(`Initialized card from PSD: ${psdData.psd_metadata.original_filename}`);
  }, []);

  return {
    // Card data
    cardData,
    updateCardData,
    updateField,
    
    // Frame selection
    selectedFrame,
    selectFrame,
    
    // Image handling
    uploadedImages,
    handleImageUpload,
    
    // Layers
    layers,
    addLayer,
    updateLayer,
    
    // Save functionality
    saveCard,
    publishCard,
    isSaving,
    
    // PSD initialization
    initializeFromPSD,
    
    // Auth
    user
  };
};
