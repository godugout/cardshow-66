
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Creator {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  creator_verified: boolean;
  followers_count: number;
  following_count: number;
  cards_count: number;
  created_at: string;
}

export const useCreators = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get creators with public cards
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('followers_count', { ascending: false })
        .limit(20);

      if (fetchError) {
        throw fetchError;
      }

      setCreators(data || []);
    } catch (err) {
      console.error('Error fetching creators:', err);
      setError('Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get verified creators or creators with most followers
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .or('creator_verified.eq.true,followers_count.gte.10')
        .order('followers_count', { ascending: false })
        .limit(12);

      if (fetchError) {
        throw fetchError;
      }

      setCreators(data || []);
    } catch (err) {
      console.error('Error fetching featured creators:', err);
      setError('Failed to load featured creators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  return {
    creators,
    loading,
    error,
    refetch: fetchCreators,
    fetchFeatured
  };
};
