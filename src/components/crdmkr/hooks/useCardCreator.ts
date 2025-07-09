import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CreatorState } from '../CardCreatorLayout';

interface CardData {
  id?: string;
  title: string;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  tags?: string[];
  is_public: boolean;
  design_metadata: any;
}

export const useCardCreator = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [cardData, setCardData] = useState<CardData>({
    title: 'My Card',
    description: '',
    image_url: '',
    thumbnail_url: '',
    rarity: 'common',
    tags: [],
    is_public: false,
    design_metadata: {}
  });

  const saveCard = useCallback(async (state: CreatorState) => {
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
          description: cardData.description || '',
          image_url: state.uploadedImage || '/lovable-uploads/7697ffa5-ac9b-428b-9bc0-35500bcb2286.png',
          thumbnail_url: state.uploadedImage || '/lovable-uploads/7697ffa5-ac9b-428b-9bc0-35500bcb2286.png',
          rarity: cardData.rarity,
          tags: cardData.tags || [],
          is_public: cardData.is_public,
          user_id: user.id,
          creator_name: user.email?.split('@')[0] || 'Unknown Creator',
          category: 'Custom',
          design_metadata: {
            selectedFrame: state.selectedFrame,
            frontEffects: state.frontEffects,
            backEffects: state.backEffects,
            frontMaterial: state.frontMaterial,
            backMaterial: state.backMaterial,
            frontLighting: state.frontLighting,
            backLighting: state.backLighting,
          },
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving card:', error);
        toast.error('Failed to save card: ' + error.message);
        return false;
      }

      setCardData(prev => ({ ...prev, id: data.id }));
      toast.success('Card saved successfully!');
      return true;
    } catch (error) {
      console.error('Unexpected error saving card:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, cardData]);

  const updateCardData = useCallback((updates: Partial<CardData>) => {
    setCardData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    cardData,
    updateCardData,
    saveCard,
    isSaving,
    user
  };
};