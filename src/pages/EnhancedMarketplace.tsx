// Enhanced Marketplace - Mobile-First Card Discovery
import React, { useState, useEffect, useMemo } from 'react';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';
import { CRDTokenWallet } from '@/components/economy/CRDTokenWallet';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  TrendingUp,
  Heart,
  Eye,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Card {
  id: string;
  title: string;
  creator: string;
  imageUrl: string;
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  likes: number;
  views: number;
  isLiked: boolean;
  isTrending: boolean;
  createdAt: Date;
}

interface MarketplaceFilters {
  search: string;
  category: string;
  rarity: string[];
  priceRange: [number, number];
  sortBy: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'popular' | 'trending';
  creator: string;
}

const SAMPLE_CARDS: Card[] = [
  {
    id: '1',
    title: 'Holographic Rookie Card',
    creator: 'ProCardMaker',
    imageUrl: '/placeholder-card-1.jpg',
    price: 250,
    rarity: 'legendary',
    category: 'Sports',
    likes: 1250,
    views: 5680,
    isLiked: false,
    isTrending: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Vintage Chrome Edition',
    creator: 'RetroDesigns',
    imageUrl: '/placeholder-card-2.jpg',
    price: 75,
    rarity: 'rare',
    category: 'Art',
    likes: 890,
    views: 3240,
    isLiked: true,
    isTrending: false,
    createdAt: new Date('2024-01-12')
  },
  {
    id: '3',
    title: 'Foil Fantasy Character',
    creator: 'FantasyArt',
    imageUrl: '/placeholder-card-3.jpg',
    price: 120,
    rarity: 'epic',
    category: 'Gaming',
    likes: 2100,
    views: 8900,
    isLiked: false,
    isTrending: true,
    createdAt: new Date('2024-01-10')
  }
];

export const EnhancedMarketplace: React.FC = () => {
  const [cards, setCards] = useState<Card[]>(SAMPLE_CARDS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  
  const [filters, setFilters] = useState<MarketplaceFilters>({
    search: '',
    category: 'all',
    rarity: [],
    priceRange: [0, 1000],
    sortBy: 'trending',
    creator: ''
  });

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let filtered = cards.filter(card => {
      // Search filter
      if (filters.search && !card.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !card.creator.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filters.category !== 'all' && card.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
      
      // Rarity filter
      if (filters.rarity.length > 0 && !filters.rarity.includes(card.rarity)) {
        return false;
      }
      
      // Price range filter
      if (card.price < filters.priceRange[0] || card.price > filters.priceRange[1]) {
        return false;
      }
      
      return true;
    });

    // Sort cards
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest': return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest': return a.createdAt.getTime() - b.createdAt.getTime();
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'popular': return b.likes - a.likes;
        case 'trending': return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
        default: return 0;
      }
    });

    return filtered;
  }, [cards, filters]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'uncommon': return 'border-green-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
    if (viewMode === 'list') {
      return (
        <CRDCard className="p-4 hover:bg-crd-surface-light transition-colors">
          <div className="flex items-center space-x-4">
            {/* Card Image */}
            <div className={cn("w-20 h-28 rounded-lg border-2 overflow-hidden flex-shrink-0", getRarityBorder(card.rarity))}>
              <div className="w-full h-full bg-gradient-to-br from-crd-surface to-crd-surface-light flex items-center justify-center">
                <Sparkles className={cn("w-8 h-8", getRarityColor(card.rarity))} />
              </div>
            </div>
            
            {/* Card Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-crd-text truncate">{card.title}</h3>
                  <p className="text-sm text-crd-text-dim">by {card.creator}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-crd-text">{card.price} CRD</div>
                  <div className={cn("text-xs font-medium capitalize", getRarityColor(card.rarity))}>
                    {card.rarity}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-crd-text-muted">
                  <span className="flex items-center space-x-1">
                    <Heart className={cn("w-3 h-3", card.isLiked ? "text-red-500" : "")} />
                    <span>{card.likes}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{card.views}</span>
                  </span>
                  {card.isTrending && (
                    <span className="flex items-center space-x-1 text-crd-orange">
                      <TrendingUp className="w-3 h-3" />
                      <span>Trending</span>
                    </span>
                  )}
                </div>
                
                <CRDButton variant="orange" size="sm">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Buy
                </CRDButton>
              </div>
            </div>
          </div>
        </CRDCard>
      );
    }

    // Grid view
    return (
      <CRDCard className="group hover:scale-105 transition-all duration-200 overflow-hidden">
        {/* Card Image */}
        <div className={cn("aspect-[2.5/3.5] border-2 relative overflow-hidden", getRarityBorder(card.rarity))}>
          <div className="w-full h-full bg-gradient-to-br from-crd-surface to-crd-surface-light flex items-center justify-center">
            <Sparkles className={cn("w-12 h-12", getRarityColor(card.rarity))} />
          </div>
          
          {/* Trending Badge */}
          {card.isTrending && (
            <div className="absolute top-2 left-2 bg-crd-orange text-crd-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </div>
          )}
          
          {/* Like Button */}
          <button className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-black/70 transition-colors">
            <Heart className={cn("w-4 h-4", card.isLiked ? "text-red-500 fill-current" : "text-white")} />
          </button>
        </div>
        
        {/* Card Details */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-crd-text text-sm truncate">{card.title}</h3>
              <p className="text-xs text-crd-text-dim">by {card.creator}</p>
            </div>
            <div className={cn("text-xs font-medium capitalize", getRarityColor(card.rarity))}>
              {card.rarity}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-crd-text-muted">
              <span className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{card.likes}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{card.views}</span>
              </span>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-crd-text">{card.price} CRD</div>
              <CRDButton variant="orange" size="sm" className="mt-1">
                <ShoppingCart className="w-3 h-3 mr-1" />
                Buy
              </CRDButton>
            </div>
          </div>
        </div>
      </CRDCard>
    );
  };

  return (
    <div className="min-h-screen bg-crd-black">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-crd-black/95 backdrop-blur-md border-b border-crd-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-crd-text">Marketplace</h1>
            <div className="flex items-center space-x-2">
              <CRDButton 
                variant="ghost" 
                size="sm"
                onClick={() => setShowWallet(!showWallet)}
              >
                1,250 CRD
              </CRDButton>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crd-text-muted" />
            <input
              type="text"
              placeholder="Search cards, creators..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 bg-crd-surface border border-crd-border rounded-lg text-crd-text placeholder-crd-text-muted focus:outline-none focus:ring-2 focus:ring-crd-orange focus:border-transparent"
            />
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="sticky top-[84px] z-30 bg-crd-surface/95 backdrop-blur-md border-b border-crd-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-x-auto">
              <CRDButton
                variant={showFilters ? "orange" : "ghost"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </CRDButton>
              
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="px-3 py-2 bg-crd-black border border-crd-border rounded-lg text-crd-text text-sm focus:outline-none focus:ring-2 focus:ring-crd-orange"
              >
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-lg", viewMode === 'grid' ? "bg-crd-orange text-crd-black" : "text-crd-text-dim")}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn("p-2 rounded-lg", viewMode === 'list' ? "bg-crd-orange text-crd-black" : "text-crd-text-dim")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="sticky top-[144px] z-20 bg-crd-surface border-b border-crd-border">
          <div className="px-4 py-4 space-y-4">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-crd-text mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'sports', 'art', 'gaming', 'music'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilters(prev => ({ ...prev, category }))}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm capitalize transition-colors",
                      filters.category === category 
                        ? "bg-crd-orange text-crd-black" 
                        : "bg-crd-black text-crd-text-dim border border-crd-border"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Rarity */}
            <div>
              <label className="block text-sm font-medium text-crd-text mb-2">Rarity</label>
              <div className="flex flex-wrap gap-2">
                {['common', 'uncommon', 'rare', 'epic', 'legendary'].map((rarity) => (
                  <button
                    key={rarity}
                    onClick={() => {
                      const newRarity = filters.rarity.includes(rarity)
                        ? filters.rarity.filter(r => r !== rarity)
                        : [...filters.rarity, rarity];
                      setFilters(prev => ({ ...prev, rarity: newRarity }));
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm capitalize transition-colors",
                      filters.rarity.includes(rarity)
                        ? "bg-crd-orange text-crd-black" 
                        : "bg-crd-black text-crd-text-dim border border-crd-border"
                    )}
                  >
                    {rarity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Sidebar */}
      {showWallet && (
        <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
          <div className="absolute inset-0 bg-black/80 lg:hidden" onClick={() => setShowWallet(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-crd-black border-l border-crd-border overflow-y-auto lg:relative lg:max-w-none">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-crd-text">Your Wallet</h2>
                <button
                  onClick={() => setShowWallet(false)}
                  className="text-crd-text-dim hover:text-crd-text lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CRDTokenWallet />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-crd-text">
              {filteredCards.length} Cards Found
            </h2>
            <p className="text-sm text-crd-text-dim">
              Discover amazing digital collectibles
            </p>
          </div>
        </div>

        {/* Cards Grid/List */}
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' 
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
            : "grid-cols-1"
        )}>
          {filteredCards.map((card) => (
            <CardComponent key={card.id} card={card} />
          ))}
        </div>

        {/* Load More */}
        {filteredCards.length > 0 && (
          <div className="text-center mt-8">
            <CRDButton variant="ghost">
              Load More Cards
            </CRDButton>
          </div>
        )}

        {/* Empty State */}
        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-crd-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-crd-text mb-2">No cards found</h3>
            <p className="text-crd-text-dim">Try adjusting your search or filters</p>
            <CRDButton 
              variant="orange" 
              className="mt-4"
              onClick={() => setFilters({
                search: '',
                category: 'all',
                rarity: [],
                priceRange: [0, 1000],
                sortBy: 'trending',
                creator: ''
              })}
            >
              Clear Filters
            </CRDButton>
          </div>
        )}
      </main>
    </div>
  );
};