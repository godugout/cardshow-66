
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types/user';

export const useUser = () => {
  const { user: authUser, loading: authLoading } = useAuth();

  const { data: user, isLoading: profileLoading, error } = useQuery({
    queryKey: ['profile', authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return {
        id: authUser.id,
        email: authUser.email || '',
        username: data.username || '',
        full_name: data.display_name,
        avatar_url: data.avatar_url,
        bio: data.bio,
        team_id: null, // Not in current schema
        createdAt: authUser.created_at,
        preferences: null,
        profileImage: data.avatar_url,
      } as User;
    },
    enabled: !!authUser,
  });

  return { 
    user, 
    loading: authLoading || profileLoading, 
    error: error ? new Error(error.message) : null 
  };
};
