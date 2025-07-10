// Simplified follows using creator_follows table
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types/user';

export const followUser = async (followerId: string, followedId: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from('creator_follows')
    .insert([{ 
      follower_id: followerId, 
      following_id: followedId 
    }]);

  if (error) throw error;
};

export const unfollowUser = async (followerId: string, followedId: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from('creator_follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followedId);

  if (error) throw error;
};

export const isFollowingUser = async (followerId: string, followedId: string): Promise<boolean> => {
  const { data, error } = await (supabase as any)
    .from('creator_follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followedId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

export const getUserFollowers = async (userId: string): Promise<User[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('creator_follows')
      .select('follower_id')
      .eq('following_id', userId);

    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Get user profiles for followers
    const followerIds = data.map((f: any) => f.follower_id);
    const { data: profiles, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('*')
      .in('user_id', followerIds);

    if (profileError) throw profileError;

    const followers = (profiles || []).map((profile: any) => ({
      id: profile.user_id,
      username: profile.username || '',
      email: profile.email || '',
      profileImage: profile.avatar_url || '',
      bio: profile.bio || '',
      createdAt: profile.created_at,
      preferences: {}
    } as User));
    
    return followers;
  } catch (error) {
    console.error('Error getting followers:', error);
    return [];
  }
};

export const getUserFollowing = async (userId: string): Promise<User[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('creator_follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Get user profiles for following
    const followingIds = data.map((f: any) => f.following_id);
    const { data: profiles, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('*')
      .in('user_id', followingIds);

    if (profileError) throw profileError;

    const following = (profiles || []).map((profile: any) => ({
      id: profile.user_id,
      username: profile.username || '',
      email: profile.email || '',
      profileImage: profile.avatar_url || '',
      bio: profile.bio || '',
      createdAt: profile.created_at,
      preferences: {}
    } as User));
    
    return following;
  } catch (error) {
    console.error('Error getting following:', error);
    return [];
  }
};