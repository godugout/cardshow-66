import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserAchievement } from '@/types/achievements';
import { AchievementCard } from './AchievementCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedEmptyState } from '@/components/ui/UnifiedEmptyState';
import { Trophy, Target, Loader2 } from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'unlocked' | 'in-progress'>('unlocked');

  const { data: achievements, isLoading, error } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-user-achievements');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as UserAchievement[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <UnifiedEmptyState
        icon={<Trophy className="w-12 h-12 text-muted-foreground" />}
        title="Unable to load achievements"
        description="There was an error loading your achievements. Please try again later."
      />
    );
  }

  const unlockedAchievements = achievements?.filter(
    achievement => achievement.progress.current >= achievement.progress.target
  ) || [];

  const inProgressAchievements = achievements?.filter(
    achievement => achievement.progress.current < achievement.progress.target
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock rewards as you create and engage on the platform.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'unlocked' | 'in-progress')}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="unlocked" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Unlocked ({unlockedAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            In Progress ({inProgressAchievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unlocked">
          {unlockedAchievements.length === 0 ? (
            <UnifiedEmptyState
              icon={<Trophy className="w-12 h-12 text-muted-foreground" />}
              title="No achievements unlocked yet"
              description="Start creating cards, engaging with the community, and trading to unlock your first achievements!"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unlockedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress">
          {inProgressAchievements.length === 0 ? (
            <UnifiedEmptyState
              icon={<Target className="w-12 h-12 text-muted-foreground" />}
              title="All achievements unlocked!"
              description="Congratulations! You've unlocked all available achievements. Check back for new ones!"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};