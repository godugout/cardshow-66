
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
            user_id,
            creator_name,
            creator_verified
          `)
          .eq('id', cardId)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Card not found');
        }
        
        // Process card data with available information
        const cardData: CardData = {
          ...data,
          rarity: data.rarity as CardRarity,
          creator_id: data.user_id,
          creator_name: data.creator_name || 'Unknown Creator',
          creator_verified: data.creator_verified || false
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
            user_id,
            creator_name,
            creator_verified
          `)
          .in('id', cardIds);
        
        if (error) {
          throw error;
        }
        
        const cardsWithCreators = (data || []).map((card) => {
          return {
            ...card,
            rarity: card.rarity as CardRarity,
            creator_id: card.user_id,
            creator_name: card.creator_name || 'Unknown Creator',
            creator_verified: card.creator_verified || false
          };
        });
        
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
