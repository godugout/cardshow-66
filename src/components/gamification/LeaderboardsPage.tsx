import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeaderboardData, LeaderboardCategory, LeaderboardTimeframe } from '@/types/leaderboards';
import { LeaderboardTable } from './LeaderboardTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UnifiedEmptyState } from '@/components/ui/UnifiedEmptyState';
import { Trophy, Loader2, TrendingUp } from 'lucide-react';

export const LeaderboardsPage: React.FC = () => {
  const [category, setCategory] = useState<LeaderboardCategory>('top_creators_by_sales');
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('weekly');

  const { data: leaderboardData, isLoading, error } = useQuery({
    queryKey: ['leaderboards', category, timeframe],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-leaderboards', {
        body: { category, timeframe }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as LeaderboardData;
    }
  });

  const categoryOptions = [
    { value: 'top_creators_by_sales', label: 'Top Creators (by Sales)' },
    { value: 'top_creators_by_followers', label: 'Top Creators (by Followers)' },
    { value: 'most_collected_cards', label: 'Most Collected Cards' }
  ];

  const timeframeOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'all_time', label: 'All Time' }
  ];

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
        title="Unable to load leaderboards"
        description="There was an error loading the leaderboard data. Please try again later."
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Leaderboards</h1>
        <p className="text-muted-foreground">
          Discover top creators and trending content across the platform.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Category
          </label>
          <Select value={category} onValueChange={(value) => setCategory(value as LeaderboardCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Timeframe
          </label>
          <Select value={timeframe} onValueChange={(value) => setTimeframe(value as LeaderboardTimeframe)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leaderboard */}
      {!leaderboardData?.entries.length ? (
        <UnifiedEmptyState
          icon={<TrendingUp className="w-12 h-12 text-muted-foreground" />}
          title="No leaderboard data yet"
          description="Be the first to create cards and climb the rankings!"
        />
      ) : (
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <LeaderboardTable
            entries={leaderboardData.entries}
            userRank={leaderboardData.userRank}
            category={category}
          />
        </div>
      )}

      {leaderboardData?.totalEntries && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Showing top {leaderboardData.entries.length} of {leaderboardData.totalEntries} entries
        </div>
      )}
    </div>
  );
};