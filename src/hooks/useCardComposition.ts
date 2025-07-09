import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cardCacheManager } from '@/lib/storage/CardCacheManager';
import { toast } from 'sonner';

interface CardCompositionData {
  imageUrl: string;
  frameId: string;
  effects: Record<string, any>;
  cardData: {
    title: string;
    description?: string;
    rarity: string;
    tags: string[];
  };
}

interface CreatedCard {
  id: string;
  serial_number: string;
  composite_image_url: string;
  title: string;
  rarity: string;
  frame_data: any;
  effects_data: any;
  created_at: string;
}

export const useCardComposition = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<CreatedCard | null>(null);

  const generateCard = async (data: CardCompositionData): Promise<CreatedCard | null> => {
    setIsGenerating(true);
    
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Call the edge function to generate composite
      const { data: result, error } = await supabase.functions.invoke(
        'generate-card-composition',
        {
          body: data,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error('Function error:', error);
        throw new Error('Failed to generate card composition');
      }

      if (!result.success) {
        throw new Error(result.error || 'Card generation failed');
      }

      const createdCard = result.card as CreatedCard;
      setGeneratedCard(createdCard);

      // Cache the card for offline access
      try {
        await cardCacheManager.downloadAndCacheCard(
          createdCard.id,
          createdCard.composite_image_url,
          {
            title: createdCard.title,
            rarity: createdCard.rarity,
            frameId: createdCard.frame_data?.frameId || '',
            effects: createdCard.effects_data || {},
            createdAt: createdCard.created_at
          }
        );
      } catch (cacheError) {
        console.warn('Failed to cache card, but card was created:', cacheError);
      }

      toast.success(`🎉 ${result.serialNumber} created successfully!`);
      return createdCard;

    } catch (error) {
      console.error('Card generation error:', error);
      toast.error('Failed to create card: ' + (error as Error).message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const getCachedCard = async (cardId: string): Promise<string | null> => {
    try {
      return await cardCacheManager.getCachedImageUrl(cardId);
    } catch (error) {
      console.error('Failed to get cached card:', error);
      return null;
    }
  };

  const getCacheStats = async () => {
    try {
      return await cardCacheManager.getCacheStats();
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { count: 0, sizeEstimate: '0 MB' };
    }
  };

  return {
    generateCard,
    getCachedCard,
    getCacheStats,
    isGenerating,
    generatedCard,
    setGeneratedCard
  };
};