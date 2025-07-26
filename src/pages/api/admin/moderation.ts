// Mock API for content moderation
export interface FlaggedItem {
  flagId: string;
  contentId: string;
  contentType: 'Card' | 'Comment' | 'Profile';
  reason: string;
  flaggedByUser: string;
  contentPreview?: string;
  createdAt: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ReviewRequest {
  flagId: string;
  action: 'dismiss' | 'remove_content' | 'suspend_user_24h' | 'suspend_user_7d' | 'permanent_ban';
}

// Mock function to fetch flagged content
export const fetchFlaggedContent = async (): Promise<FlaggedItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      flagId: 'flag_001',
      contentId: 'card_001',
      contentType: 'Card',
      reason: 'Inappropriate content - explicit imagery',
      flaggedByUser: 'user_reporter_123',
      contentPreview: '/placeholder.svg',
      createdAt: new Date().toISOString(),
      severity: 'high'
    },
    {
      flagId: 'flag_002', 
      contentId: 'comment_002',
      contentType: 'Comment',
      reason: 'Spam - promotional content',
      flaggedByUser: 'user_reporter_456',
      contentPreview: 'Check out my amazing product at [spam-link]...',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      severity: 'medium'
    },
    {
      flagId: 'flag_003',
      contentId: 'profile_003', 
      contentType: 'Profile',
      reason: 'Impersonation - fake celebrity account',
      flaggedByUser: 'user_reporter_789',
      contentPreview: 'Profile claiming to be famous person without verification',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      severity: 'high'
    },
    {
      flagId: 'flag_004',
      contentId: 'card_004',
      contentType: 'Card', 
      reason: 'Copyright violation',
      flaggedByUser: 'user_reporter_101',
      contentPreview: '/placeholder.svg',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      severity: 'medium'
    },
    {
      flagId: 'flag_005',
      contentId: 'comment_005',
      contentType: 'Comment',
      reason: 'Harassment - personal attack',
      flaggedByUser: 'user_reporter_202',
      contentPreview: 'You are such a [offensive language]...',
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      severity: 'high'
    }
  ];
};

// Mock function to submit review action
export const submitReviewAction = async (request: ReviewRequest): Promise<{ message: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock different responses based on action
  const responses = {
    dismiss: 'Flag dismissed successfully',
    remove_content: 'Content removed and user notified',
    suspend_user_24h: 'User suspended for 24 hours',
    suspend_user_7d: 'User suspended for 7 days', 
    permanent_ban: 'User permanently banned from platform'
  };
  
  return {
    message: responses[request.action] || 'Action completed successfully'
  };
};

// This would be the API endpoint in a real backend
// For now, we just export the mock functions
export default {
  fetchFlaggedContent,
  submitReviewAction
};