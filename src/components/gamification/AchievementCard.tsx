import React from 'react';
import { UserAchievement } from '@/types/achievements';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementCardProps {
  achievement: UserAchievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const isUnlocked = achievement.progress.current >= achievement.progress.target;
  const progressPercentage = (achievement.progress.current / achievement.progress.target) * 100;

  return (
    <div className={cn(
      "relative p-6 rounded-lg border transition-all duration-200",
      isUnlocked 
        ? "bg-card border-primary/20 shadow-md" 
        : "bg-muted/50 border-border grayscale"
    )}>
      {/* Achievement Icon */}
      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center",
          isUnlocked ? "bg-primary/20" : "bg-muted"
        )}>
          {achievement.iconUrl ? (
            <img 
              src={achievement.iconUrl} 
              alt={achievement.name}
              className="w-8 h-8"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/40" />
          )}
          
          {/* Status Indicator */}
          <div className="absolute -top-1 -right-1">
            {isUnlocked ? (
              <CheckCircle className="w-6 h-6 text-green-500 bg-background rounded-full" />
            ) : (
              <Lock className="w-5 h-5 text-muted-foreground bg-background rounded-full p-1" />
            )}
          </div>
        </div>

        <div className="flex-1">
          <h3 className={cn(
            "font-semibold text-lg mb-1",
            isUnlocked ? "text-foreground" : "text-muted-foreground"
          )}>
            {achievement.name}
          </h3>
          <p className={cn(
            "text-sm",
            isUnlocked ? "text-muted-foreground" : "text-muted-foreground/70"
          )}>
            {achievement.description}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      {!isUnlocked && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-muted-foreground">
              {achievement.progress.current} / {achievement.progress.target}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {/* Unlock Date */}
      {isUnlocked && achievement.unlockedAt && (
        <div className="mt-4 pt-4 border-t">
          <Badge variant="secondary" className="text-xs">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </Badge>
        </div>
      )}
    </div>
  );
};