import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface SearchFilters {
  searchTerm: string;
  priceRange: [number, number];
  rarities: string[];
  tags: string[];
  creatorVerified: boolean;
  sortBy: string;
  listingAge: string;
}

interface AdvancedMarketplaceSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  availableTags: string[];
}

export const AdvancedMarketplaceSearch: React.FC<AdvancedMarketplaceSearchProps> = ({
  onFiltersChange,
  availableTags
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    priceRange: [0, 1000],
    rarities: [],
    tags: [],
    creatorVerified: false,
    sortBy: 'newest',
    listingAge: 'all'
  });

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const toggleRarity = (rarity: string) => {
    const newRarities = filters.rarities.includes(rarity)
      ? filters.rarities.filter(r => r !== rarity)
      : [...filters.rarities, rarity];
    updateFilters({ rarities: newRarities });
  };

  const activeFiltersCount = 
    (filters.searchTerm ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0) +
    filters.rarities.length +
    filters.tags.length +
    (filters.creatorVerified ? 1 : 0) +
    (filters.listingAge !== 'all' ? 1 : 0);

  return (
    <Card className="bg-editor-dark border-editor-border">
      <div className="p-4">
        {/* Main Search Bar */}
        <div className="flex gap-4 items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-editor-text-muted h-4 w-4" />
            <Input
              placeholder="Search cards, creators, descriptions..."
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 bg-editor-darker rounded-lg border border-editor-border">
                
                {/* Rarity Filter */}
                <div className="space-y-3">
                  <Label className="text-editor-text font-semibold">Rarity</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['common', 'uncommon', 'rare', 'legendary'].map(rarity => (
                      <div key={rarity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rarity-${rarity}`}
                          checked={filters.rarities.includes(rarity)}
                          onCheckedChange={() => toggleRarity(rarity)}
                        />
                        <label
                          htmlFor={`rarity-${rarity}`}
                          className="text-sm cursor-pointer capitalize"
                        >
                          {rarity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Creator Options */}
                <div className="space-y-3">
                  <Label className="text-editor-text font-semibold">Creator Options</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified-creators"
                      checked={filters.creatorVerified}
                      onCheckedChange={(checked) => updateFilters({ creatorVerified: !!checked })}
                    />
                    <label htmlFor="verified-creators" className="text-sm cursor-pointer">
                      Verified Creators Only
                    </label>
                  </div>
                </div>

                {/* Listing Age */}
                <div className="space-y-3">
                  <Label className="text-editor-text font-semibold">Listing Age</Label>
                  <Select value={filters.listingAge} onValueChange={(value) => updateFilters({ listingAge: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="1d">Last 24 Hours</SelectItem>
                      <SelectItem value="1w">Last Week</SelectItem>
                      <SelectItem value="1m">Last Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{filters.searchTerm}"
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ searchTerm: '' })}
                />
              </Badge>
            )}
            
            {filters.rarities.map(rarity => (
              <Badge key={rarity} variant="secondary" className="flex items-center gap-1">
                {rarity}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleRarity(rarity)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};