import React from 'react';
import { Link } from 'react-router-dom';
import { useCards } from '@/hooks/useCards';
import { UniversalCard, UniversalBadge } from '@/components/ui/design-system';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Heart, Star } from 'lucide-react';

export const FeaturedCardsGrid: React.FC = () => {
  const { featuredCards, loading, error } = useCards();

  if (loading) {
    return (
      <div className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Featured Cards
          </h2>
          <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto">
            Discover amazing cards created by our community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[300px] w-full rounded-lg bg-[#1e293b]" />
              <Skeleton className="h-4 w-3/4 bg-[#1e293b]" />
              <Skeleton className="h-4 w-1/2 bg-[#1e293b]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || featuredCards.length === 0) {
    return (
      <div className="py-20">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Featured Cards
          </h2>
          <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto mb-8">
            {error ? 'Unable to load cards right now' : 'No featured cards available yet'}
          </p>
          <Link 
            to="/create/enhanced"
            className="inline-flex items-center px-6 py-3 bg-[#4ade80] text-black font-medium rounded-lg hover:bg-[#22c55e] transition-colors"
          >
            Create the First Card
          </Link>
        </div>
      </div>
    );
  }

  // Show only first 6 cards
  const displayCards = featuredCards.slice(0, 6);

  return (
    <div className="py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Featured Cards
        </h2>
        <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto">
          Discover amazing cards created by our community
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCards.map((card) => (
          <Link key={card.id} to={`/cards/${card.id}`} className="group">
            <UniversalCard 
              hover="glow" 
              className="h-full overflow-hidden group-hover:border-[#4ade80]/40 transition-all duration-300"
            >
              {/* Card Image */}
              <div className="aspect-[3/4] bg-gradient-to-br from-[#1e293b] to-[#0f172a] relative overflow-hidden">
                {card.image_url || card.thumbnail_url ? (
                  <img
                    src={card.thumbnail_url || card.image_url}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl font-bold text-[#334155]">
                      {card.title.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                
                {/* Rarity Badge */}
                <div className="absolute top-3 left-3">
                  <UniversalBadge 
                    variant={card.rarity === 'legendary' ? 'success' : 'outline'} 
                    size="sm"
                  >
                    {card.rarity}
                  </UniversalBadge>
                </div>
                
                {/* Verified Creator Badge */}
                {card.creator_verified && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-[#4ade80] rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-black" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Card Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-[#4ade80] transition-colors line-clamp-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#94a3b8] line-clamp-1">
                    by {card.creator_name}
                  </p>
                </div>
                
                {card.description && (
                  <p className="text-sm text-[#64748b] line-clamp-2">
                    {card.description}
                  </p>
                )}
                
                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-[#334155]/50">
                  <div className="flex items-center space-x-4 text-xs text-[#94a3b8]">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>Like</span>
                    </div>
                  </div>
                  
                  {card.price && (
                    <div className="text-sm font-medium text-[#4ade80]">
                      ${card.price}
                    </div>
                  )}
                </div>
              </div>
            </UniversalCard>
          </Link>
        ))}
      </div>
      
      {featuredCards.length > 6 && (
        <div className="text-center mt-12">
          <Link 
            to="/collections"
            className="inline-flex items-center px-6 py-3 bg-transparent border border-[#4ade80] text-[#4ade80] font-medium rounded-lg hover:bg-[#4ade80] hover:text-black transition-colors"
          >
            View All Cards
          </Link>
        </div>
      )}
    </div>
  );
};