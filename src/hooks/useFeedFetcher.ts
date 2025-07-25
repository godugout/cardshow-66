
import { supabase } from '@/integrations/supabase/client';
import type { Memory } from '@/types/memory';
import type { FeedType } from './use-feed-types';

export const fetchMemoriesFromFeed = async (
  userId: string | undefined,
  currentPage: number,
  feedType: FeedType,
  existingMemories: Memory[],
  setMemories: React.Dispatch<React.SetStateAction<Memory[]>>,
  setHasMore: (v: boolean) => void,
  setError: (error: Error | null) => void,
  setLoading: (b: boolean) => void,
) => {
  console.log('useFeed: fetchMemories called', { currentPage, feedType, userId });

  if (!userId && feedType === 'following') {
    console.log('useFeed: skipping fetch for following feed with no user');
    return;
  }

  setLoading(true);
  setError(null);
  const limit = 10;
  const offset = (currentPage - 1) * limit;
  
  try {
    // Create mock memories for testing
    const mockMemories: Memory[] = Array(5).fill(null).map((_, i) => ({
      id: `mock-${i}-${Date.now()}`,
      title: `Mock Memory ${i + 1}`,
      description: 'This is a mock memory for testing when the database is empty',
      userId: 'mock-user', 
      teamId: 'mock-team',
      gameId: undefined,
      location: null,
      visibility: 'public',
      createdAt: new Date().toISOString(),
      tags: ['mock', 'testing'],
      metadata: undefined,
      user: {
        id: 'mock-user',
        username: 'mockuser',
        email: 'mock@example.com',
        profileImage: null,
        bio: null,
        createdAt: new Date().toISOString(),
        preferences: null
      },
      media: [],
      reactions: [],
      commentCount: 0
    }));

    // Memory-based feed not implemented in current schema, return mock data
    console.log('useFeed: Using mock data as memories table not in schema');
    
    setMemories(currentPage === 1 ? mockMemories : [...existingMemories, ...mockMemories]);
    setHasMore(false);
    setLoading(false);
    return;

  } catch (error) {
    console.error('Error fetching memories:', error);
    setError(error instanceof Error ? error : new Error('Unknown error fetching memories'));
  } finally {
    setLoading(false);
  }
};
