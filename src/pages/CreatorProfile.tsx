import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCreatorFollow } from '@/hooks/useCreatorFollow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Users, Heart, ImageIcon, Calendar, Star, MapPin } from 'lucide-react';
import { Creator } from '@/hooks/useCreators';

interface Card {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
  rarity: string;
}

export default function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isFollowing, loading: followLoading, toggleFollow } = useCreatorFollow(id || '');

  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch creator profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', id)
          .single();

        if (profileError) throw profileError;

        // Fetch creator's public cards
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('id, title, image_url, created_at, rarity')
          .eq('user_id', id)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(12);

        if (cardsError) throw cardsError;

        setCreator(profileData);
        setCards(cardsData || []);
      } catch (err) {
        console.error('Error fetching creator data:', err);
        setError('Failed to load creator profile');
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-6 w-32" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/creators">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Creators
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-destructive mb-4">{error || 'Creator not found'}</p>
            <Button asChild>
              <Link to="/creators">Browse Creators</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = creator.display_name || creator.username || 'Anonymous Creator';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const joinDate = new Date(creator.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/creators">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Creators
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creator Info Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={creator.avatar_url || ''} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
                    {creator.creator_verified && (
                      <Badge className="bg-primary text-primary-foreground">✓</Badge>
                    )}
                  </div>
                  {creator.username && creator.display_name && (
                    <p className="text-muted-foreground">@{creator.username}</p>
                  )}
                </div>

                <Button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  variant={isFollowing ? "outline" : "default"}
                  className="w-full"
                >
                  {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>

              {/* Bio */}
              {creator.bio && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {creator.bio}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {creator.followers_count}
                  </div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {creator.cards_count}
                  </div>
                  <div className="text-xs text-muted-foreground">Cards</div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {creator.following_count}
                  </div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {joinDate}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="cards" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cards" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Cards ({cards.length})
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cards" className="space-y-6">
              {cards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cards.map((card) => (
                    <Card key={card.id} className="group hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-0">
                        <div className="aspect-[2.5/3.5] relative overflow-hidden rounded-t-lg">
                          <img
                            src={card.image_url}
                            alt={card.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground truncate">
                              {card.title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {card.rarity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(card.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No cards yet</h3>
                    <p className="text-muted-foreground">
                      This creator hasn't shared any public cards yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Activity Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Creator activity feed will be available soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}