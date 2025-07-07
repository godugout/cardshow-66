import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreators } from '@/hooks/useCreators';
import { CreatorCard } from './CreatorCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Star, Users } from 'lucide-react';

export const CreatorsHub: React.FC = () => {
  const navigate = useNavigate();
  const { creators, loading, error, refetch, fetchFeatured } = useCreators();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('featured');

  const filteredCreators = creators.filter(creator => {
    if (!searchQuery) return true;
    const displayName = creator.display_name || creator.username || '';
    return displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           creator.bio?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreatorView = (creatorId: string) => {
    navigate(`/creators/${creatorId}`);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'featured') {
      fetchFeatured();
    } else if (value === 'all') {
      refetch();
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-crd-darkest min-h-screen">
        <Card className="bg-crd-darkGray border-crd-mediumGray">
          <CardContent className="text-center py-8">
            <p className="text-red-400">{error}</p>
            <Button 
              onClick={refetch} 
              className="mt-4 bg-crd-green text-crd-darkest hover:bg-crd-green/90"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 bg-crd-darkest min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Star className="h-8 w-8 text-crd-green" />
          <h1 className="text-4xl font-bold text-crd-white">Creators Hub</h1>
        </div>
        <p className="text-lg text-crd-lightGray max-w-2xl mx-auto">
          Discover talented creators, follow your favorites, and get inspired by the CRD community
        </p>
        
        <div className="flex items-center justify-center gap-4 text-sm text-crd-lightGray">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{creators.length} Creators</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Updated Daily</span>
          </div>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-crd-lightGray" />
          <Input
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-crd-darkGray border-crd-mediumGray text-crd-white placeholder:text-crd-lightGray focus:border-crd-green"
          />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-crd-darkGray border-crd-mediumGray">
            <TabsTrigger 
              value="featured" 
              className="flex items-center gap-2 text-crd-lightGray data-[state=active]:text-crd-white data-[state=active]:bg-crd-green"
            >
              <Star className="h-4 w-4" />
              Featured
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              className="flex items-center gap-2 text-crd-lightGray data-[state=active]:text-crd-white data-[state=active]:bg-crd-green"
            >
              <Users className="h-4 w-4" />
              All Creators
            </TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="space-y-6">
            {/* Featured Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-crd-darkGray border-crd-mediumGray">
                <CardContent className="p-4 text-center">
                  <Badge className="bg-crd-green text-crd-darkest mb-2">✓ Verified</Badge>
                  <p className="text-sm text-crd-lightGray">
                    Verified creators with quality content
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-crd-darkGray border-crd-mediumGray">
                <CardContent className="p-4 text-center">
                  <Badge className="bg-crd-orange text-crd-darkest mb-2">🔥 Trending</Badge>
                  <p className="text-sm text-crd-lightGray">
                    Most followed creators this week
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-crd-darkGray border-crd-mediumGray">
                <CardContent className="p-4 text-center">
                  <Badge className="bg-crd-purple text-crd-white mb-2">💎 Premium</Badge>
                  <p className="text-sm text-crd-lightGray">
                    Creators with exclusive content
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Featured Creators Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse bg-crd-darkGray border-crd-mediumGray">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-crd-mediumGray rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-crd-mediumGray rounded w-3/4"></div>
                          <div className="h-3 bg-crd-mediumGray rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="h-3 bg-crd-mediumGray rounded w-full"></div>
                      <div className="h-3 bg-crd-mediumGray rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCreators.map((creator) => (
                  <CreatorCard
                    key={creator.user_id}
                    creator={creator}
                    onView={handleCreatorView}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="animate-pulse bg-crd-darkGray border-crd-mediumGray">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-crd-mediumGray rounded-full"></div>
                        <div className="space-y-1 flex-1">
                          <div className="h-3 bg-crd-mediumGray rounded w-3/4"></div>
                          <div className="h-2 bg-crd-mediumGray rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="h-2 bg-crd-mediumGray rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredCreators.map((creator) => (
                  <CreatorCard
                    key={creator.user_id}
                    creator={creator}
                    onView={handleCreatorView}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Empty State */}
      {!loading && filteredCreators.length === 0 && (
        <Card className="bg-crd-darkGray border-crd-mediumGray">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-crd-lightGray mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-crd-white mb-2">
              {searchQuery ? 'No creators found' : 'No creators yet'}
            </h3>
            <p className="text-crd-lightGray mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Be the first to create and share amazing cards!'
              }
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className="border-crd-green text-crd-green hover:bg-crd-green hover:text-crd-darkest"
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};