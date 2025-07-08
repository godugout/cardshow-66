import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePayments } from '@/hooks/usePayments';
import type { Card as CardType } from '@/types/card';

interface MarketplaceListing {
  id: string;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
  card: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    rarity: string;
    tags: string[];
  };
  seller: {
    username: string;
    display_name: string;
    creator_verified: boolean;
  };
}

export const MarketplaceGrid: React.FC = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { purchaseCard, loading: paymentLoading } = usePayments();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          cards (
            id,
            title,
            description,
            image_url,
            rarity,
            tags
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedListings = data?.map(listing => ({
        id: listing.id,
        price: listing.price,
        status: listing.status,
        created_at: listing.created_at,
        updated_at: listing.updated_at,
        card: listing.cards,
        seller: {
          username: 'creator',
          display_name: 'Creator',
          creator_verified: false
        }
      })) || [];

      setListings(formattedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (cardId: string, price: number) => {
    try {
      await purchaseCard(cardId);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const handleMakeOffer = (listingId: string) => {
    toast({
      title: "Make Offer",
      description: "Offer functionality coming soon",
    });
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-500',
      uncommon: 'bg-green-500',
      rare: 'bg-blue-500',
      legendary: 'bg-purple-500'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="h-96 animate-pulse bg-editor-dark" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <Card key={listing.id} className="group hover:scale-[1.02] transition-all duration-200 bg-editor-dark border-editor-border overflow-hidden">
          {/* Card Image */}
          <div className="relative aspect-[2.5/3.5] overflow-hidden">
            {listing.card?.image_url ? (
              <img
                src={listing.card.image_url}
                alt={listing.card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full bg-editor-darker flex items-center justify-center">
                <div className="text-editor-text-muted">No Image</div>
              </div>
            )}
            
            {/* Rarity Badge */}
            {listing.card?.rarity && (
              <Badge className={`absolute top-2 left-2 ${getRarityColor(listing.card.rarity)} text-white border-0`}>
                {listing.card.rarity}
              </Badge>
            )}

            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleMakeOffer(listing.id)}>
                <Heart className="h-4 w-4 mr-1" />
                Offer
              </Button>
              <Button 
                size="sm" 
                onClick={() => handlePurchase(listing.card?.id, listing.price)}
                disabled={paymentLoading}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Buy Now
              </Button>
            </div>
          </div>

          {/* Card Details */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-editor-text line-clamp-1">
                {listing.card?.title || 'Untitled Card'}
              </h3>
              <p className="text-sm text-editor-text-muted line-clamp-1">
                by {listing.seller?.display_name || listing.seller?.username || 'Unknown Creator'}
              </p>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-editor-border">
              <div className="text-xl font-bold text-primary">
                ${listing.price}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleMakeOffer(listing.id)}>
                  Offer
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handlePurchase(listing.card?.id, listing.price)}
                  disabled={paymentLoading}
                >
                  Buy
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Empty State */}
      {listings.length === 0 && !loading && (
        <div className="col-span-full text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-editor-text-muted mb-4" />
          <h3 className="text-lg font-semibold text-editor-text mb-2">No cards found</h3>
          <p className="text-editor-text-muted">
            Be the first to list a card for sale!
          </p>
        </div>
      )}
    </div>
  );
};