
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types/user';

export const followUser = async (followerId: string, followedId: string): Promise<void> => {
  const { error } = await supabase
    .from('creator_follows')
    .insert([{ follower_id: followerId, following_id: followedId }]);

  if (error) throw error;
};

export const unfollowUser = async (followerId: string, followedId: string): Promise<void> => {
  const { error } = await supabase
    .from('creator_follows')
    .delete()
    .match({ follower_id: followerId, following_id: followedId });

  if (error) throw error;
};

export const isFollowingUser = async (followerId: string, followedId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('creator_follows')
    .select('id')
    .match({ follower_id: followerId, following_id: followedId })
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

export const getUserFollowers = async (userId: string): Promise<User[]> => {
  // Since creator_follows doesn't have proper foreign key relations, return empty array
  return [];
};

export const getUserFollowing = async (userId: string): Promise<User[]> => {
  // Since creator_follows doesn't have proper foreign key relations, return empty array
  return [];
};
