
import React, { useState } from 'react';
import { UniversalPageLayout, UniversalCard, UniversalButton, UniversalInput, UniversalBadge } from '@/components/ui/design-system';
import { Search, Filter, Grid3x3, List, Star, Eye, Heart } from 'lucide-react';

const Collections = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const collections = [
    {
      id: 1,
      title: 'Fantasy Warriors',
      description: 'Epic fantasy character cards with magical abilities',
      cardCount: 24,
      creator: 'ArtMaster',
      thumbnail: '/api/placeholder/300/400',
      rating: 4.8,
      views: 1200,
      likes: 89,
      tags: ['Fantasy', 'Warriors', 'Magic'],
    },
    {
      id: 2,
      title: 'Cyberpunk Heroes',
      description: 'Futuristic heroes in a neon-lit dystopian world',
      cardCount: 18,
      creator: 'NeonDesign',
      thumbnail: '/api/placeholder/300/400',
      rating: 4.6,
      views: 850,
      likes: 64,
      tags: ['Cyberpunk', 'Sci-Fi', 'Heroes'],
    },
    {
      id: 3,
      title: 'Mystical Beasts',
      description: 'Legendary creatures from ancient mythologies',
      cardCount: 32,
      creator: 'MythCraft',
      thumbnail: '/api/placeholder/300/400',
      rating: 4.9,
      views: 2100,
      likes: 156,
      tags: ['Mythology', 'Beasts', 'Legends'],
    },
    {
      id: 4,
      title: 'Space Explorers',
      description: 'Brave explorers venturing into the unknown cosmos',
      cardCount: 20,
      creator: 'CosmicArt',
      thumbnail: '/api/placeholder/300/400',
      rating: 4.7,
      views: 980,
      likes: 72,
      tags: ['Space', 'Exploration', 'Adventure'],
    },
  ];

  const filteredCollections = collections.filter(collection =>
    collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <UniversalPageLayout
      title="Collections"
      subtitle="Discover amazing card collections from our community"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#1a1f2e] rounded-lg p-1">
            <UniversalButton
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </UniversalButton>
            <UniversalButton
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </UniversalButton>
          </div>
        </div>
      }
    >
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <UniversalInput
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <UniversalButton variant="outline">
          <Filter className="w-4 h-4" />
          Filter
        </UniversalButton>
      </div>

      {/* Collections Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {filteredCollections.map((collection) => (
          <UniversalCard 
            key={collection.id} 
            hover="lift"
            className="overflow-hidden group cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="aspect-[3/4] bg-gradient-to-br from-[#1a1f2e] to-[#131316] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <UniversalBadge variant="secondary" size="sm">
                  {collection.cardCount} cards
                </UniversalBadge>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-[#4ade80] transition-colors">
                  {collection.title}
                </h3>
                <p className="text-[#94a3b8] text-sm line-clamp-2">
                  {collection.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {collection.tags.slice(0, 3).map((tag, index) => (
                  <UniversalBadge key={index} variant="outline" size="sm">
                    {tag}
                  </UniversalBadge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-2 border-t border-[#334155]/50">
                <div className="flex items-center gap-4 text-sm text-[#94a3b8]">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-[#f59e0b] fill-current" />
                    {collection.rating}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {collection.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {collection.likes}
                  </div>
                </div>
                <div className="text-sm text-[#94a3b8]">
                  by {collection.creator}
                </div>
              </div>
            </div>
          </UniversalCard>
        ))}
      </div>

      {/* Empty State */}
      {filteredCollections.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-[#64748b] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No collections found
          </h3>
          <p className="text-[#94a3b8] mb-6">
            Try adjusting your search terms or browse all collections
          </p>
          <UniversalButton onClick={() => setSearchQuery('')}>
            Clear Search
          </UniversalButton>
        </div>
      )}
    </UniversalPageLayout>
  );
};

export default Collections;
