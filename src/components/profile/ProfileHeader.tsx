import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Edit, Verified, Crown } from 'lucide-react';
import { ProfileService } from '@/features/auth/services/profileService';

interface ProfileHeaderProps {
  user: any;
  profile: any;
  followers: number;
  following: number;
}

export const ProfileHeader = ({ user, profile, followers, following }: ProfileHeaderProps) => {
  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email || 'User';
  const username = profile?.username || displayName;
  const bio = profile?.bio || 'No bio yet';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const isDefaultAvatar = !avatarUrl || avatarUrl === ProfileService.getDefaultAvatarUrl();
  const cardsCount = profile?.cards_count || 0;
  const level = profile?.level || 1;
  const experience = profile?.experience || 0;
  const isVerified = profile?.is_verified || false;
  const isCreatorVerified = profile?.creator_verified || false;

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Avatar className="h-24 w-24 border-2 border-crd-green">
              <AvatarImage 
                src={avatarUrl || ProfileService.getDefaultAvatarUrl()} 
                alt={displayName}
                style={isDefaultAvatar ? ProfileService.getInvertedAvatarStyle() : undefined}
              />
              <AvatarFallback className="bg-crd-mediumGray text-crd-white text-xl">
                {(displayName?.[0] || '').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
                {isVerified && <Verified className="w-5 h-5 text-crd-blue" />}
                {isCreatorVerified && <Crown className="w-5 h-5 text-crd-orange" />}
              </div>
              <p className="text-sm text-muted-foreground">@{username}</p>
              {bio && <p className="text-sm text-foreground mt-2 max-w-md">{bio}</p>}
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{cardsCount}</div>
                <div className="text-sm text-muted-foreground">Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{followers}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{following}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">Level {level}</div>
                <div className="text-sm text-muted-foreground">{experience} XP</div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Level Progress</span>
                <Badge variant="secondary">Level {level}</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-crd-green h-2 rounded-full transition-all"
                  style={{ width: `${(experience % 1000) / 10}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};