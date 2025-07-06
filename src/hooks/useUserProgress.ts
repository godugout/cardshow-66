import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { supabase } from '@/integrations/supabase/client';
import { UserProgress } from '@/types/template';

export const useUserProgress = () => {
  const { user } = useUser();
  const [progress, setProgress] = useState({
    cardsCreated: 0,
    casesUnlocked: ['penny-sleeve'],
    templatesUnlocked: ['basic-sports', 'simple-fantasy'],
    subscriptionTier: 'free' as 'free' | 'creator' | 'pro'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get user's card count
        const { count: cardsCount } = await supabase
          .from('cards')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', user.id);

        // Get user profile for subscription tier
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const cardsCreated = cardsCount || 0;
        
        // Calculate unlocked cases based on progress
        const unlockedCases = ['penny-sleeve']; // Always unlocked
        if (cardsCreated >= 3) unlockedCases.push('toploader');
        if (cardsCreated >= 8) unlockedCases.push('magnetic');
        if (cardsCreated >= 15) unlockedCases.push('graded');
        
        // Calculate unlocked templates based on progress
        const unlockedTemplates = ['basic-sports', 'simple-fantasy']; // Always unlocked
        if (cardsCreated >= 5) {
          unlockedTemplates.push('chrome-sports', 'holographic-fantasy', 'cyber-scifi');
        }
        if (cardsCreated >= 10) {
          unlockedTemplates.push('legendary-sports', 'vintage-classic');
        }

        setProgress({
          cardsCreated,
          casesUnlocked: unlockedCases,
          templatesUnlocked: unlockedTemplates,
          subscriptionTier: 'free' // TODO: Get from profile when subscription system is implemented
        });

      } catch (error) {
        console.error('Error fetching user progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
  }, [user?.id]);

  const refreshProgress = () => {
    // Simple refresh that re-triggers the useEffect
    setLoading(true);
  };

  return {
    progress,
    loading,
    refreshProgress
  };
};