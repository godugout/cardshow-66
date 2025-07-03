import { useState } from 'react';
import type { MarketplaceListing } from '@/types/marketplace';

export const useMarketplace = () => {
  // Mock marketplace listings
  const [listings] = useState<MarketplaceListing[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchListings = async () => {
    // Mock function
  };

  return {
    listings,
    loading,
    error,
    refetch: fetchListings
  };
};