
import { supabase } from '@/integrations/supabase/client';
import type { Comment } from '@/types/social';

export interface AddCommentParams {
  userId: string;
  content: string;
  cardId?: string;
  collectionId?: string;
  teamId?: string;
  parentId?: string;
}

export interface GetCommentsParams {
  cardId?: string;
  collectionId?: string;
  teamId?: string;
  parentId?: string; // Changed from parentCommentId to parentId
  page?: number;
  limit?: number;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  hasMore: boolean;
}

export const addComment = async (params: AddCommentParams): Promise<Comment> => {
  try {
    // Since comments table doesn't exist, return mock comment
    const mockComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: params.userId,
      cardId: params.cardId,
      collectionId: params.collectionId,
      teamId: params.teamId,
      parentId: params.parentId,
      content: params.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: params.userId,
        username: 'User',
        profileImage: null
      },
      replyCount: 0
    };
    
    return mockComment;
  } catch (error) {
    console.error('Error in addComment:', error);
    
    // Try using the mock API as a fallback
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: params.userId,
          cardId: params.cardId,
          collectionId: params.collectionId,
          teamId: params.teamId,
          parentId: params.parentId,
          content: params.content
        })
      });
      
      if (!response.ok) {
        throw new Error(`Mock API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (e) {
      console.error('Mock API fallback failed:', e);
      throw error;
    }
  }
};

export const getComments = async (params: GetCommentsParams): Promise<CommentsResponse> => {
  try {
    // Since comments table doesn't exist, return empty results
    return {
      comments: [],
      total: 0,
      hasMore: false
    };
  } catch (error) {
    console.error('Error in getComments:', error);
    
    // Try using the mock API as a fallback
    try {
      const queryParams = new URLSearchParams();
      
      if (params.cardId) {
        queryParams.append('cardId', params.cardId);
      } else if (params.collectionId) {
        queryParams.append('collectionId', params.collectionId);
      } else if (params.teamId) {
        queryParams.append('teamId', params.teamId);
      }
      
      if (params.parentId) {
        queryParams.append('parentId', params.parentId);
      }
      
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      const response = await fetch(`/api/comments?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Mock API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        comments: data.items || [],
        total: data.total || 0,
        hasMore: data.hasMore || false
      };
    } catch (e) {
      console.error('Mock API fallback failed:', e);
      return {
        comments: [],
        total: 0,
        hasMore: false
      };
    }
  }
};

export const updateComment = async (commentId: string, userId: string, content: string): Promise<Comment> => {
  try {
    // Since comments table doesn't exist, return mock updated comment
    return {
      id: commentId,
      userId: userId,
      content: content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: userId,
        username: 'User',
        profileImage: null
      },
      replyCount: 0
    };
  } catch (error) {
    console.error('Error in updateComment:', error);
    
    // Try using the mock API as a fallback
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          content
        })
      });
      
      if (!response.ok) {
        throw new Error(`Mock API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (e) {
      console.error('Mock API fallback failed:', e);
      throw error;
    }
  }
};

export const deleteComment = async (commentId: string, userId: string): Promise<void> => {
  try {
    // Since comments table doesn't exist, just return success
    return;
  } catch (error) {
    console.error('Error in deleteComment:', error);
    
    // Try using the mock API as a fallback
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error(`Mock API error: ${response.status}`);
      }
    } catch (e) {
      console.error('Mock API fallback failed:', e);
      throw error;
    }
  }
};
