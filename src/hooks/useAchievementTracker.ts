import { useUser } from '@/hooks/use-user';
import { supabase } from '@/integrations/supabase/client';

export const useAchievementTracker = () => {
  const { user } = useUser();

  const trackAction = async (eventType: string, eventData?: Record<string, any>) => {
    if (!user?.id) {
      console.warn('Cannot track achievement action: user not authenticated');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('track-user-action', {
        body: {
          eventType,
          userId: user.id,
          eventData: eventData || {}
        }
      });

      if (error) {
        console.error('Error tracking achievement action:', error);
      }
    } catch (error) {
      console.error('Failed to track achievement action:', error);
    }
  };

  // Convenience methods for common actions
  const trackCardCreated = () => trackAction('card_created');
  const trackCardLiked = () => trackAction('card_liked');
  const trackFollowCreated = () => trackAction('follow_created');
  const trackSaleCompleted = (saleData?: Record<string, any>) => trackAction('sale_completed', saleData);

  return {
    trackAction,
    trackCardCreated,
    trackCardLiked,
    trackFollowCreated,
    trackSaleCompleted
  };
};