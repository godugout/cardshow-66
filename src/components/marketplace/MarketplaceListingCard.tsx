import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ShoppingCart, 
  Eye, 
  Heart, 
  Star, 
  DollarSign, 
  User,
  Calendar,
  Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MarketplaceListingCardProps {
  listing: {
    id: string;
    price: number;
    created_at: string;
    status: string;
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
  };
  viewMode: 'grid' | 'list';
  onPurchase?: () => void;
}

export const MarketplaceListingCard: React.FC<MarketplaceListingCardProps> = ({
  listing,
  viewMode,
  onPurchase
}) => {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to purchase cards');
        return;
      }

      // Call marketplace checkout edge function
      const { data, error } = await supabase.functions.invoke('marketplace-checkout', {
        body: {
          listing_id: listing.id,
          card_id: listing.card.id,
          amount: Math.round(listing.price * 100), // Convert to cents
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        toast.success('Redirecting to secure checkout...');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate purchase');
    } finally {
      setIsPurchasing(false);
    }
  };

  const rarityColors = {
    common: 'bg-gray-500 text-white',
    uncommon: 'bg-green-500 text-white',
    rare: 'bg-blue-500 text-white',
    epic: 'bg-purple-500 text-white',
    legendary: 'bg-yellow-500 text-black'
  };

  const imageUrl = listing.card.thumbnail_url || listing.card.image_url;
  const sellerName = listing.seller?.display_name || listing.seller?.username || 'Anonymous';
  const timeAgo = formatDistanceToNow(new Date(listing.created_at), { addSuffix: true });

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Card Image */}
            <div className="relative flex-shrink-0">
              <img
                src={imageUrl || '/placeholder.svg'}
                alt={listing.card.title}
                className="w-24 h-32 object-cover rounded-lg"
              />
              {listing.card.rarity && (
                <Badge 
                  className={`absolute -top-2 -right-2 text-xs ${rarityColors[listing.card.rarity as keyof typeof rarityColors]}`}
                >
                  {listing.card.rarity.charAt(0).toUpperCase()}
                </Badge>
              )}
            </div>

            {/* Card Details */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg truncate">{listing.card.title}</h3>
                  <p className="text-sm text-muted-foreground">by {listing.card.creator_name}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">${listing.price}</div>
                  <div className="text-xs text-muted-foreground">{timeAgo}</div>
                </div>
              </div>

              {listing.card.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {listing.card.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={listing.seller?.avatar_url} />
                    <AvatarFallback>
                      <User className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{sellerName}</span>
                  {listing.seller?.is_verified && (
                    <Shield className="w-4 h-4 text-blue-500" />
                  )}
                </div>

                <Button onClick={handlePurchase} disabled={isPurchasing}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isPurchasing ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardContent className="p-0">
        {/* Card Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={imageUrl || '/placeholder.svg'}
            alt={listing.card.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex gap-2">
              <Button size="sm" variant="secondary">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button size="sm" variant="secondary">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Rarity Badge */}
          {listing.card.rarity && (
            <Badge 
              className={`absolute top-2 left-2 ${rarityColors[listing.card.rarity as keyof typeof rarityColors]}`}
            >
              {listing.card.rarity.charAt(0).toUpperCase() + listing.card.rarity.slice(1)}
            </Badge>
          )}

          {/* Price Badge */}
          <Badge className="absolute top-2 right-2 bg-black/80 text-white">
            ${listing.price}
          </Badge>
        </div>

        {/* Card Details */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{listing.card.title}</h3>
            <p className="text-sm text-muted-foreground">by {listing.card.creator_name}</p>
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={listing.seller?.avatar_url} />
              <AvatarFallback>
                <User className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium flex-1 truncate">{sellerName}</span>
            {listing.seller?.is_verified && (
              <Shield className="w-4 h-4 text-blue-500" />
            )}
          </div>

          {/* Time and Purchase */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {timeAgo}
            </div>
          </div>

          <Button 
            onClick={handlePurchase} 
            disabled={isPurchasing}
            className="w-full"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isPurchasing ? 'Processing...' : 'Buy Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};