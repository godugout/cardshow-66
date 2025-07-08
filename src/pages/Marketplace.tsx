import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { AdvancedMarketplaceSearch } from '@/components/marketplace/AdvancedMarketplaceSearch';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Star, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  searchTerm: string;
  priceRange: [number, number];
  rarities: string[];
  tags: string[];
  creatorVerified: boolean;
  sortBy: string;
  listingAge: string;
}

const MarketplacePage: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    searchTerm: '',
    priceRange: [0, 1000],
    rarities: [],
    tags: [],
    creatorVerified: false,
    sortBy: 'newest',
    listingAge: 'all'
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [marketplaceStats, setMarketplaceStats] = useState({
    totalListings: 0,
    averagePrice: 0,
    topSeller: null as string | null,
    recentSales: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      // Fetch available tags from cards
      const { data: cardsData } = await supabase
        .from('cards')
        .select('tags')
        .not('tags', 'is', null);

      const tagsSet = new Set<string>();
      cardsData?.forEach(card => {
        card.tags?.forEach((tag: string) => tagsSet.add(tag));
      });
      setAvailableTags(Array.from(tagsSet));

      // Fetch marketplace stats
      const { data: statsData } = await supabase
        .from('marketplace_listings')
        .select('price, user_id')
        .eq('status', 'active');

      if (statsData) {
        const totalListings = statsData.length;
        const averagePrice = statsData.reduce((sum, listing) => sum + Number(listing.price), 0) / totalListings || 0;
        
        setMarketplaceStats({
          totalListings,
          averagePrice,
          topSeller: null, // Would need more complex query
          recentSales: Math.floor(Math.random() * 50) // Mock data
        });
      }
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
    }
  };

  const handleFiltersChange = (filters: SearchFilters) => {
    setActiveFilters(filters);
  };

  const handleCreateListing = () => {
    toast({
      title: "Create Listing",
      description: "Listing creation feature coming soon!",
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-editor-darker">
        <div className="container mx-auto px-4 py-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-editor-text mb-2">Marketplace</h1>
              <p className="text-editor-text-muted">
                Discover and trade unique digital cards from creators worldwide
              </p>
            </div>
            <Button onClick={handleCreateListing} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              List Your Card
            </Button>
          </div>

          {/* Marketplace Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-editor-dark border-editor-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-editor-text-muted">Total Listings</p>
                  <p className="text-xl font-bold text-editor-text">{marketplaceStats.totalListings}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-editor-dark border-editor-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Star className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-editor-text-muted">Average Price</p>
                  <p className="text-xl font-bold text-editor-text">
                    ${marketplaceStats.averagePrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-editor-dark border-editor-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-editor-text-muted">Recent Sales</p>
                  <p className="text-xl font-bold text-editor-text">{marketplaceStats.recentSales}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-editor-dark border-editor-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Badge className="h-5 w-5 text-purple-500 bg-transparent border-0 p-0">🏆</Badge>
                </div>
                <div>
                  <p className="text-sm text-editor-text-muted">Top Category</p>
                  <p className="text-xl font-bold text-editor-text">Sports</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <AdvancedMarketplaceSearch
            onFiltersChange={handleFiltersChange}
            availableTags={availableTags}
          />

          {/* Featured Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-editor-text">Featured Cards</h2>
              <div className="flex gap-2">
                <Badge variant="outline">Trending</Badge>
                <Badge variant="outline">New Releases</Badge>
                <Badge variant="outline">Staff Picks</Badge>
              </div>
            </div>
          </div>

          {/* Marketplace Grid */}
          <MarketplaceGrid />
        </div>
      </div>
    </MainLayout>
  );
};

export default MarketplacePage;