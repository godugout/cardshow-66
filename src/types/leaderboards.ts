export interface LeaderboardEntry {
  rank: number;
  entity: {
    id: string;
    name: string;
    avatarUrl?: string; // for users
    thumbnailUrl?: string; // for cards
  };
  metricValue: string; // Formatted string, e.g., "$1,234.56" or "5,678"
}

export type LeaderboardCategory = 
  | 'top_creators_by_sales'
  | 'top_creators_by_followers' 
  | 'most_collected_cards';

export type LeaderboardTimeframe = 'weekly' | 'monthly' | 'all_time';

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  userRank?: number;
  totalEntries: number;
}