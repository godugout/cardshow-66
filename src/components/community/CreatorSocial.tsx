import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, User, Calendar, Trophy, Sparkles, Users } from 'lucide-react';

interface CreatorSocialProps {
  searchQuery: string;
}

export const CreatorSocial: React.FC<CreatorSocialProps> = ({ searchQuery }) => {
  // Simplified version - using mock data
  const activityFeed: any[] = [];
  const loadingFeed = false;

  const filteredFeed = activityFeed.filter(() => true);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'template_published': return Sparkles;
      case 'collaboration_started': return User;
      case 'challenge_won': return Trophy;
      case 'course_completed': return Badge;
      case 'milestone_reached': return Trophy;
      default: return Sparkles;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'template_published': return 'text-blue-400';
      case 'collaboration_started': return 'text-green-400';
      case 'challenge_won': return 'text-yellow-400';
      case 'course_completed': return 'text-purple-400';
      case 'milestone_reached': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const formatActivityMessage = (activity: any) => {
    return 'had some activity';
  };

  const getActivityDescription = (activityData: any) => {
    return 'No additional details available';
  };

  if (loadingFeed) {
    return (
      <Card className="bg-crd-dark border-crd-mediumGray">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-crd-mediumGray rounded mb-2"></div>
                <div className="h-3 bg-crd-mediumGray rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-crd-dark border-crd-mediumGray">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Community Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredFeed.length === 0 ? (
            <div className="text-center py-8 text-crd-lightGray">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No community activity yet</p>
              <p className="text-sm">Check back later for creator updates!</p>
            </div>
          ) : (
            filteredFeed.map((activity) => {
              const IconComponent = getActivityIcon(activity.activity_type);
              const colorClass = getActivityColor(activity.activity_type);
              
              return (
                <div key={activity.id} className="flex items-start gap-3 p-4 bg-crd-mediumGray rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={activity.creator_avatar} />
                    <AvatarFallback className="bg-crd-dark text-crd-lightGray">
                      {activity.creator_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">
                        {activity.creator_name || 'Unknown Creator'}
                      </span>
                      <IconComponent className={`w-4 h-4 ${colorClass}`} />
                    </div>
                    
                    <div className="text-blue-400 mb-1">
                      {formatActivityMessage(activity)}
                    </div>
                    <div className="text-sm text-crd-lightGray">{activity.title}</div>
                    <div className="text-xs text-crd-gray">{getActivityDescription(null)}</div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-4 text-sm text-crd-lightGray">
                        <Button variant="ghost" size="sm" className="text-crd-lightGray hover:text-red-400 p-1">
                          <Heart className="w-4 h-4 mr-1" />
                          0
                        </Button>
                        <Button variant="ghost" size="sm" className="text-crd-lightGray hover:text-blue-400 p-1">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          0
                        </Button>
                        <Button variant="ghost" size="sm" className="text-crd-lightGray hover:text-green-400 p-1">
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                      
                      <div className="ml-auto">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-xs p-1"
                        >
                          Follow
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-crd-gray mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(activity.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};