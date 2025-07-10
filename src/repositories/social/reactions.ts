// Simplified reactions using card_likes table since reactions table doesn't exist
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
    // Use card_likes table as a substitute for reactions
    let query = (supabase as any).from('card_likes').select('*');

    if (params.memoryId) {
      query = query.eq('card_id', params.memoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Process reactions data
    const reactions = (data || []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      memoryId: r.card_id,
      collectionId: params.collectionId,
      commentId: params.commentId,
      type: 'like', // Default type for card_likes
      createdAt: r.created_at,
    }));

    // Count reactions by type
    const counts = [{
      type: 'like',
      count: reactions.length
    }];

    return { reactions, counts };
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
    if (params.targetType === 'memory') {
      const { data, error } = await (supabase as any)
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
    
    // For other types, return a mock reaction
    const reaction: Reaction = {
      id: crypto.randomUUID(),
      userId: params.userId || 'demo-user',
      type: params.type,
      createdAt: new Date().toISOString()
    };

    if (params.targetType === 'comment') {
      reaction.commentId = params.targetId;
    } else if (params.targetType === 'collection') {
      reaction.collectionId = params.targetId;
    }

    return reaction;
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
    const { error } = await (supabase as any)
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