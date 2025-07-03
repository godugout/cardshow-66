import { useState } from 'react';

export interface CreatorForum {
  id: string;
  name: string;
  description?: string;
  specialty: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  moderator_ids: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatorChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'design' | 'speed' | 'theme' | 'collaboration';
  status: 'upcoming' | 'active' | 'judging' | 'completed' | 'cancelled';
  created_at: string;
}

export const useCreatorCommunity = () => {
  const [activityFeed] = useState([]);
  
  return {
    forums: [],
    loadingForums: false,
    getForumTopics: () => ({ data: [], isLoading: false }),
    createForumTopic: { mutate: () => {} },
    challenges: [],
    loadingChallenges: false,
    submitToChallenge: { mutate: () => {} },
    myCollaborations: [],
    loadingCollaborations: false,
    createCollaboration: { mutate: () => {} },
    activityFeed,
    loadingFeed: false,
    followCreator: { mutate: () => {} },
  };
};