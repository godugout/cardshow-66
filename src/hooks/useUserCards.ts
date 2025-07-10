
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserCard {
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
  visibility?: string;
}

interface UseUserCardsOptions {
  page?: number;
  pageSize?: number;
}

export const useUserCards = (userId?: string, options: UseUserCardsOptions = {}) => {
  const { page = 1, pageSize = 12 } = options;
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchUserCards = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching cards for user:', userId, 'page:', page);
        
        const offset = (page - 1) * pageSize;
        
        const { data, error, count } = await supabase
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
            is_public
          `, { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + pageSize - 1);
        
        if (error) {
          throw error;
        }
        
        console.log('Found user cards:', data?.length || 0, 'total:', count);
        setTotal(count || 0);
        setHasMore((count || 0) > offset + pageSize);
        
        // Get creator information for each card
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
              creator_id: card.user_id || '',
              creator_name,
              creator_verified,
              tags: card.tags || [],
              design_metadata: {} // Default empty object since field doesn't exist in schema
            };
          })
        );
        
        // If no cards exist for this user, add a default card
        const finalCards = cardsWithCreators.length === 0 && page === 1 ? [
          {
            id: 'default-card',
            title: 'Welcome Card',
            description: 'Your first card! Start creating amazing content.',
            image_url: '/lovable-uploads/7546e555-f08f-4ee6-8337-7cc99ed1cfb7.png',
            thumbnail_url: '/lovable-uploads/7546e555-f08f-4ee6-8337-7cc99ed1cfb7.png',
            rarity: 'common',
            price: 0,
            creator_name: 'Cardshow',
            creator_verified: true,
            tags: ['welcome', 'starter'],
            created_at: new Date().toISOString(),
            creator_id: userId || '',
            design_metadata: { isDefault: true },
            is_public: false,
            visibility: 'private'
          }
        ] : cardsWithCreators;

        if (page === 1) {
          setUserCards(finalCards);
        } else {
          setUserCards(prev => [...prev, ...finalCards]);
        }
      } catch (err) {
        console.error('Error fetching user cards:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user cards');
        if (page === 1) {
          setUserCards([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserCards();
  }, [userId, page, pageSize]);

  const loadMore = () => {
    if (!loading && hasMore) {
      return { page: page + 1, pageSize };
    }
    return null;
  };

  const refetch = () => {
    if (userId) {
      setLoading(true);
      setUserCards([]);
      // Re-trigger the effect by updating a dependency
    }
  };

  return { 
    userCards, 
    loading, 
    error,
    hasMore,
    total,
    loadMore,
    refetch
  };
};
