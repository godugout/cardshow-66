export interface UserAchievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  progress: {
    current: number;
    target: number;
  };
  unlockedAt?: string; // ISO 8601 Date
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  target: number;
  category: 'creation' | 'social' | 'marketplace' | 'milestone';
  trigger: string; // Event that triggers this achievement
}

export interface UserAchievementProgress {
  id: string;
  userId: string;
  achievementId: string;
  current: number;
  unlockedAt?: string;
  createdAt: string;
  updatedAt: string;
}