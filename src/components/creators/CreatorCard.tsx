import React from 'react';
import { Creator } from '@/hooks/useCreators';
import { useCreatorFollow } from '@/hooks/useCreatorFollow';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Heart, ImageIcon } from 'lucide-react';

interface CreatorCardProps {
  creator: Creator;
  onView?: (creatorId: string) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onView }) => {
  const { isFollowing, loading, toggleFollow } = useCreatorFollow(creator.user_id);

  const displayName = creator.display_name || creator.username || 'Anonymous Creator';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div 
            className="flex items-center space-x-3 flex-1 cursor-pointer"
            onClick={() => onView?.(creator.user_id)}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={creator.avatar_url || ''} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {displayName}
                </h3>
                {creator.creator_verified && (
                  <Badge className="bg-primary text-primary-foreground text-xs">✓</Badge>
                )}
              </div>
              {creator.username && creator.display_name && (
                <p className="text-sm text-muted-foreground">@{creator.username}</p>
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            onClick={toggleFollow}
            disabled={loading}
            className="ml-2"
          >
            {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>

        {/* Bio */}
        {creator.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {creator.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{creator.followers_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              <span>{creator.cards_count}</span>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-xs">
            Creator
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};