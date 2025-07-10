import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Share2, Eye, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Card as CardType } from '@/types/cards';

interface Collection {
  id: string;
  title: string;
  description?: string;
  owner_id: string; // This will be mapped from user_id
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'cards' | 'activity'>('overview');

  const { data: collection, isLoading: collectionLoading } = useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Map user_id to owner_id for compatibility
      return {
        ...data,
        owner_id: data.user_id
      } as Collection;
    },
    enabled: !!id
  });

  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['collection-cards', id],
    queryFn: async (): Promise<CardType[]> => {
      // Get cards that are in this collection using the correct table
      const { data: items } = await supabase
        .from('collection_items')
        .select(`
          card_id,
          cards (
            id,
            title,
            description,
            image_url,
            thumbnail_url,
            price,
            user_id,
            tags,
            rarity,
            is_public,
            created_at,
            updated_at
          )
        `)
        .eq('collection_id', id);

      if (!items) return [];

      // Transform the data to match our Card type
      const processedCards: CardType[] = items.map(item => {
        const card = item.cards as any;
        if (!card) return null;

        return {
          ...card,
          creator_id: card.user_id || '', // Map user_id to creator_id
          creator_name: 'Unknown Creator',
          creator_verified: false,
          price: card.price || 0,
          tags: card.tags || [],
          is_public: card.is_public !== false,
          edition_size: null,
          verification_status: 'unverified' as any,
          creator_attribution: { type: 'unknown', value: '' },
          print_metadata: { dpi: 300, color_profile: 'sRGB' },
          publishing_options: { 
            allow_downloads: false, 
            watermark: true,
            license_type: 'all_rights_reserved'
          },
          design_metadata: { layers: [], effects: [] },
          current_case: 'penny-sleeve',
          rarity: card.rarity || 'common',
          category: '',
          activity_type: null,
          activity_data: null,
          like_count: 0,
          views_count: 0,
          watchers_count: 0,
          for_sale: false
        } as CardType;
      }).filter(Boolean) as CardType[];

      return processedCards;
    },
    enabled: !!id
  });

  if (collectionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="aspect-[2.5/3.5] rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Collection not found</h2>
          <p className="text-muted-foreground">The collection you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Collection Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{collection.title}</h1>
                  {collection.description && (
                    <p className="text-muted-foreground mb-4">{collection.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant={collection.is_public ? "default" : "secondary"}>
                  {collection.is_public ? "Public" : "Private"}
                </Badge>
                <Badge variant="outline">{cards.length} Cards</Badge>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {cards.slice(0, 8).map((card) => (
                    <div key={card.id} className="group cursor-pointer">
                      <div className="aspect-[2.5/3.5] rounded-lg overflow-hidden bg-card border mb-2">
                        {card.image_url ? (
                          <img
                            src={card.image_url}
                            alt={card.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">No Image</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-sm truncate">{card.title}</h3>
                      <p className="text-xs text-muted-foreground">{card.rarity}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="cards" className="mt-6">
                {cardsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="aspect-[2.5/3.5] rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {cards.map((card) => (
                      <div key={card.id} className="group cursor-pointer">
                        <div className="aspect-[2.5/3.5] rounded-lg overflow-hidden bg-card border mb-2">
                          {card.image_url ? (
                            <img
                              src={card.image_url}
                              alt={card.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground">No Image</span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-sm truncate">{card.title}</h3>
                        <p className="text-xs text-muted-foreground">{card.rarity}</p>
                        {card.price && card.price > 0 && (
                          <p className="text-xs font-medium">${card.price}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Collection Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Collection Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Total Cards</span>
                  </div>
                  <span className="font-medium">{cards.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Likes</span>
                  </div>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Created</span>
                  </div>
                  <span className="font-medium text-xs">
                    {new Date(collection.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Creator</p>
                    <p className="text-sm text-muted-foreground">Collection Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionDetail;