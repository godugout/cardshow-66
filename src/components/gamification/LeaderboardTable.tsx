import React from 'react';
import { LeaderboardEntry } from '@/types/leaderboards';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-user';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  userRank?: number;
  category: string;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  userRank,
  category
}) => {
  const { user } = useUser();

  const getMetricLabel = (category: string) => {
    switch (category) {
      case 'top_creators_by_sales':
        return 'Weekly Sales';
      case 'top_creators_by_followers':
        return 'Total Followers';
      case 'most_collected_cards':
        return 'Number of Owners';
      default:
        return 'Value';
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return 'default';
    if (rank === 2) return 'secondary';
    if (rank === 3) return 'outline';
    return 'outline';
  };

  const isCurrentUser = (entityId: string) => {
    return user?.id === entityId;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
        <div className="col-span-2">Rank</div>
        <div className="col-span-6">User/Card</div>
        <div className="col-span-4 text-right">{getMetricLabel(category)}</div>
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.entity.id}
            className={`grid grid-cols-12 gap-4 p-4 rounded-lg border transition-colors ${
              isCurrentUser(entry.entity.id)
                ? 'bg-primary/5 border-primary'
                : 'bg-card border-border hover:bg-accent'
            }`}
          >
            {/* Rank */}
            <div className="col-span-2 flex items-center">
              <Badge variant={getRankBadgeVariant(entry.rank)} className="w-8 h-8 rounded-full flex items-center justify-center">
                {entry.rank}
              </Badge>
            </div>

            {/* Entity Info */}
            <div className="col-span-6 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={entry.entity.avatarUrl || entry.entity.thumbnailUrl} 
                  alt={entry.entity.name} 
                />
                <AvatarFallback>
                  {entry.entity.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-foreground">{entry.entity.name}</div>
                {isCurrentUser(entry.entity.id) && (
                  <div className="text-xs text-primary font-medium">You</div>
                )}
              </div>
            </div>

            {/* Metric Value */}
            <div className="col-span-4 flex items-center justify-end">
              <div className="text-lg font-semibold text-foreground">
                {entry.metricValue}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Rank Info */}
      {userRank && userRank > entries.length && (
        <div className="p-4 bg-muted rounded-lg border border-dashed border-border">
          <div className="text-center text-muted-foreground">
            Your rank: <span className="font-semibold text-foreground">#{userRank}</span>
          </div>
        </div>
      )}
    </div>
  );
};