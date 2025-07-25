
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CardRarity } from '@/components/cards/UniversalCardDisplay';

export interface CardData {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  rarity: CardRarity;
  creator_id?: string;
  creator_name?: string;
  creator_verified?: boolean;
  price?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export const useCardData = (cardId?: string) => {
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cardId) {
      setCard(null);
      setError(null);
      return;
    }

    const fetchCard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('cards')
          .select(`
            id,
            title,
            description,
            image_url,
            thumbnail_url,
            rarity,
            price,
            tags,
            created_at,
            updated_at,
            user_id
          `)
          .eq('id', cardId)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Card not found');
        }
        
        // Get creator information if creator_id exists
        let creator_name = 'Unknown Creator';
        let creator_verified = false;
        
        if (data.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, creator_verified')
            .eq('user_id', data.user_id)
            .single();
          
          if (profileData) {
            creator_name = profileData.display_name || 'Unknown Creator';
            creator_verified = profileData.creator_verified || false;
          }
        }
        
        const cardData: CardData = {
          ...data,
          creator_id: data.user_id,
          creator_name,
          creator_verified,
          rarity: data.rarity as CardRarity
        };
        
        setCard(cardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch card');
        setCard(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId]);

  return { card, loading, error };
};

export const useMultipleCards = (cardIds?: string[]) => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cardIds || cardIds.length === 0) {
      setCards([]);
      setError(null);
      return;
    }

    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('cards')
          .select(`
            id,
            title,
            description,
            image_url,
            thumbnail_url,
            rarity,
            price,
            tags,
            created_at,
            updated_at,
            user_id
          `)
          .in('id', cardIds);
        
        if (error) {
          throw error;
        }
        
        const cardsWithCreators = await Promise.all(
          (data || []).map(async (card) => {
            let creator_name = 'Unknown Creator';
            let creator_verified = false;
            
            if (card.user_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('display_name, creator_verified')
                .eq('user_id', card.user_id)
                .single();
              
              if (profileData) {
                creator_name = profileData.display_name || 'Unknown Creator';
                creator_verified = profileData.creator_verified || false;
              }
            }
            
            return {
              ...card,
              creator_id: card.user_id,
              creator_name,
              creator_verified,
              rarity: card.rarity as CardRarity
            };
          })
        );
        
        setCards(cardsWithCreators);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cards');
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [cardIds]);

  return { cards, loading, error };
};
