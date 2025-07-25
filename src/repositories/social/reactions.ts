
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Reaction, ReactionCount } from '@/types/social';

interface AddReactionParams {
  targetId: string;
  targetType: 'memory' | 'comment' | 'collection';
  type: string;
  userId?: string;
}

interface GetReactionsParams {
  memoryId?: string;
  collectionId?: string;
  commentId?: string;
  userId?: string;
}

interface GetReactionsResponse {
  reactions: Reaction[];
  counts: ReactionCount[];
}

export const getReactions = async (params: GetReactionsParams): Promise<GetReactionsResponse> => {
  try {
    // Use card_likes table for card reactions since reactions table doesn't exist
    if (params.memoryId) {
      const { data, error } = await supabase
        .from('card_likes')
        .select('*')
        .eq('card_id', params.memoryId);

      if (error) throw error;

      // Transform card_likes to reactions format
      const reactions = (data || []).map((like) => ({
        id: like.id,
        userId: like.user_id,
        memoryId: like.card_id,
        type: 'like', // card_likes only support 'like' type
        createdAt: like.created_at,
      }));

      const counts = reactions.length > 0 ? [{ type: 'like', count: reactions.length }] : [];

      return { reactions, counts };
    }

    // For collections and comments, return empty since those tables don't exist
    return { reactions: [], counts: [] };
  } catch (error) {
    console.error('Error getting reactions:', error);
    toast({
      title: 'Error',
      description: 'Failed to get reactions',
      variant: 'destructive'
    });
    return { reactions: [], counts: [] };
  }
};

export const addReaction = async (params: AddReactionParams): Promise<Reaction> => {
  try {
    // Handle memory reactions using card_likes table
    if (params.targetType === 'memory' && params.type === 'like') {
      const { data, error } = await supabase
        .from('card_likes')
        .insert({
          card_id: params.targetId,
          user_id: params.userId || 'demo-user'
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        memoryId: data.card_id,
        type: 'like',
        createdAt: data.created_at
      };
    }
    
    // For other reaction types or targets, return mock reaction
    return {
      id: `reaction-${Date.now()}`,
      userId: params.userId || 'demo-user',
      type: params.type,
      createdAt: new Date().toISOString(),
      ...(params.targetType === 'memory' ? { memoryId: params.targetId } : {}),
      ...(params.targetType === 'comment' ? { commentId: params.targetId } : {})
    };
  } catch (error) {
    console.error('Error adding reaction:', error);
    toast({
      title: 'Error',
      description: 'Failed to add reaction',
      variant: 'destructive'
    });
    throw error;
  }
};

export const removeReaction = async (reactionId: string): Promise<boolean> => {
  try {
    // Try to remove from card_likes table
    const { error } = await supabase
      .from('card_likes')
      .delete()
      .eq('id', reactionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing reaction:', error);
    toast({
      title: 'Error',
      description: 'Failed to remove reaction',
      variant: 'destructive'
    });
    throw error;
  }
};
