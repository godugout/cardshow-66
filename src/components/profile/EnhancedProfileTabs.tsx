import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { DraftsGrid } from './DraftsGrid';
import { ProfileSettingsPanel } from './ProfileSettingsPanel';
import { Loader, Image, FileText, FolderOpen, Settings, Heart } from 'lucide-react';
import type { Memory } from '@/types/memory';

interface CardData {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  price?: string;
  rarity?: string;
  creator_name?: string;
  creator_verified?: boolean;
  stock?: number;
  highest_bid?: number;
  edition_size?: number;
  tags?: string[];
}

interface EnhancedProfileTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  memories: Memory[];
  memoriesLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const EnhancedProfileTabs = ({ 
  activeTab, 
  setActiveTab, 
  memories, 
  memoriesLoading, 
  hasMore, 
  onLoadMore 
}: EnhancedProfileTabsProps) => {
  // Convert memories that have card properties to CardData format
  const convertMemoryToCard = (memory: Memory): CardData => ({
    id: memory.id,
    title: memory.title,
    description: memory.description,
    image_url: (memory as any).image_url,
    thumbnail_url: (memory as any).thumbnail_url,
    rarity: (memory as any).rarity || 'common',
    creator_name: (memory as any).creator_name,
    creator_verified: (memory as any).creator_verified,
    stock: (memory as any).stock,
    highest_bid: (memory as any).highest_bid,
    edition_size: (memory as any).edition_size,
    tags: memory.tags
  });

  // Filter memories that have card-specific properties and convert them
  const cards = memories
    .filter(item => 
      'rarity' in item || 'design_metadata' in item || 'creator_id' in item
    )
    .map(convertMemoryToCard);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6 grid w-full grid-cols-5">
        <TabsTrigger value="gallery" className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          Gallery ({cards.length})
        </TabsTrigger>
        <TabsTrigger value="drafts" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Drafts
        </TabsTrigger>
        <TabsTrigger value="collections" className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Collections
        </TabsTrigger>
        <TabsTrigger value="liked" className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Liked
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="gallery">
        {memoriesLoading && memories.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-64 animate-pulse bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16">
            <Image className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No cards yet</h3>
            <p className="text-gray-500 mb-6">Start creating beautiful cards to share with the world</p>
            <Button asChild>
              <Link to="/crdmkr">Create Your First Card</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cards.map((card) => (
                <Card key={card.id} className="group relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="aspect-[3/4] relative bg-muted">
                      {card.image_url ? (
                        <img
                          src={card.image_url}
                          alt={card.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Image className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-1">{card.title}</h3>
                      {card.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {card.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={onLoadMore} 
                  disabled={memoriesLoading}
                >
                  {memoriesLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="drafts">
        <DraftsGrid />
      </TabsContent>
      
      <TabsContent value="collections">
        <div className="text-center py-16">
          <FolderOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium mb-2">No collections yet</h3>
          <p className="text-gray-500 mb-6">Create collections to organize your cards</p>
          <Button asChild>
            <Link to="/collections">Create Collection</Link>
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="liked">
        <div className="text-center py-16">
          <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium mb-2">No liked cards</h3>
          <p className="text-gray-500 mb-6">Cards you like will appear here</p>
          <Button asChild>
            <Link to="/marketplace">Explore Marketplace</Link>
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="settings">
        <ProfileSettingsPanel />
      </TabsContent>
    </Tabs>
  );
};