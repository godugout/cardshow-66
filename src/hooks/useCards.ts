
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Card {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  rarity: string;
  price?: number;
  creator_name?: string;
  creator_verified?: boolean;
  tags: string[];
  created_at?: string;
  creator_id: string;
  design_metadata: Record<string, any>;
  is_public?: boolean;
}

export const useCards = () => {
  const [featuredCards, setFeaturedCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching public cards for gallery...');
        
        // Only fetch PUBLIC cards for the gallery
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
            user_id,
            creator_name,
            creator_verified,
            is_public
          `)
          .eq('is_public', true) // Only public cards for gallery
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) {
          throw error;
        }
        
        console.log('Found public cards for gallery:', data?.length || 0);
        
        // Process cards with available data
        const cardsWithCreators = (data || []).map((card) => {
          return {
            ...card,
            creator_id: card.user_id || '',
            creator_name: card.creator_name || 'Unknown Creator',
            creator_verified: card.creator_verified || false,
            tags: card.tags || [],
            design_metadata: {} // Not available in current schema
          };
        });
        
        setFeaturedCards(cardsWithCreators);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cards');
        setFeaturedCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // Provide backward compatibility aliases
  return { 
    featuredCards, 
    loading, 
    error,
    cards: featuredCards, // alias for compatibility
    userCards: featuredCards // This is now ONLY for gallery (public cards)
  };
};
