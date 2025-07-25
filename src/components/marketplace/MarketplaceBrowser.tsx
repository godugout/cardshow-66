import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Grid, List, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MarketplaceListingCard } from './MarketplaceListingCard';

interface MarketplaceListing {
  id: string;
  price: number;
  created_at: string;
  status: string;
  user_id: string;
  card: {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    thumbnail_url?: string;
    rarity?: string;
    creator_name?: string;
    category?: string;
  };
  seller?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
  } | null;
}

export const MarketplaceBrowser: React.FC = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRarity, setFilterRarity] = useState('all');
  const [priceRange, setPriceRange] = useState<'all' | 'under-10' | '10-50' | '50-100' | 'over-100'>('all');

  useEffect(() => {
    fetchListings();
  }, [sortBy, filterRarity, priceRange]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('marketplace_listings')
        .select(`
          id,
          price,
          created_at,
          status,
          user_id,
          card:cards!inner (
            id,
            title,
            description,
            image_url,
            thumbnail_url,
            rarity,
            creator_name,
            category
          )
        `)
        .eq('status', 'active')
        .eq('card.is_public', true);

      // Apply rarity filter
      if (filterRarity !== 'all') {
        query = query.eq('card.rarity', filterRarity);
      }

      // Apply price range filter
      if (priceRange !== 'all') {
        switch (priceRange) {
          case 'under-10':
            query = query.lt('price', 10);
            break;
          case '10-50':
            query = query.gte('price', 10).lte('price', 50);
            break;
          case '50-100':
            query = query.gte('price', 50).lte('price', 100);
            break;
          case 'over-100':
            query = query.gt('price', 100);
            break;
        }
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'popular':
          // For now, sort by newest as we don't have view/like tracking on listings
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by search query on the frontend for simplicity
      let filteredData = data || [];
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(listing =>
          listing.card.title.toLowerCase().includes(query) ||
          listing.card.description?.toLowerCase().includes(query) ||
          listing.card.creator_name?.toLowerCase().includes(query)
        );
      }

      // Transform data to include seller info placeholder
      const listingsWithSeller = filteredData.map(listing => ({
        ...listing,
        seller: null // We'll fetch this separately if needed
      }));

      setListings(listingsWithSeller);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchListings();
  };

  const rarityOptions = [
    { value: 'all', label: 'All Rarities' },
    { value: 'common', label: 'Common' },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare', label: 'Rare' },
    { value: 'epic', label: 'Epic' },
    { value: 'legendary', label: 'Legendary' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Clock },
    { value: 'oldest', label: 'Oldest First', icon: Clock },
    { value: 'price-low', label: 'Price: Low to High', icon: DollarSign },
    { value: 'price-high', label: 'Price: High to Low', icon: DollarSign },
    { value: 'popular', label: 'Most Popular', icon: TrendingUp }
  ];

  const priceOptions = [
    { value: 'all', label: 'All Prices' },
    { value: 'under-10', label: 'Under $10' },
    { value: '10-50', label: '$10 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: 'over-100', label: 'Over $100' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and collect unique digital cards from creators worldwide
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search cards, creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Rarity Filter */}
            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger>
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                {rarityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select value={priceRange} onValueChange={(value) => setPriceRange(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                {priceOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${listings.length} cards found`}
            </p>
            <Button onClick={handleSearch} size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="bg-muted h-48 rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="bg-muted h-4 rounded" />
                  <div className="bg-muted h-3 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No cards found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new listings.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {listings.map(listing => (
            <MarketplaceListingCard
              key={listing.id}
              listing={listing}
              viewMode={viewMode}
              onPurchase={() => fetchListings()}
            />
          ))}
        </div>
      )}
    </div>
  );
};