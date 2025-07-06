import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCreatorFollow = (creatorId: string) => {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user?.id || !creatorId) return;

      try {
        const { data } = await supabase
          .from('creator_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', creatorId)
          .single();
        
        setIsFollowing(!!data);
      } catch (error) {
        // Not following (expected for single() when no match)
        setIsFollowing(false);
      }
    };

    checkFollowStatus();
  }, [user?.id, creatorId]);

  const toggleFollow = async () => {
    if (!user?.id || !creatorId) {
      toast.error('Please sign in to follow creators');
      return;
    }

    if (user.id === creatorId) {
      toast.error("You can't follow yourself");
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('creator_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', creatorId);

        if (error) throw error;
        
        setIsFollowing(false);
        toast.success('Unfollowed creator');
      } else {
        // Follow
        const { error } = await supabase
          .from('creator_follows')
          .insert({
            follower_id: user.id,
            following_id: creatorId
          });

        if (error) throw error;
        
        setIsFollowing(true);
        toast.success('Following creator');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    loading,
    toggleFollow
  };
};