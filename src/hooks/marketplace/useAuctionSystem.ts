import { useState } from 'react';
import { AuctionBid } from '@/types/marketplace';

export const useAuctionSystem = (listingId?: string) => {
  const [bids] = useState<AuctionBid[]>([]);
  
  const winningBid = bids.find(bid => bid.is_winning_bid);
  const currentPrice = winningBid?.amount || 0;

  const placeBid = {
    mutate: () => {},
    mutateAsync: async () => ({ id: 'mock-bid' }),
    isPending: false,
  };

  return {
    bids,
    winningBid,
    currentPrice,
    bidsLoading: false,
    placeBid,
    isPlacingBid: false,
    isMobile: window.innerWidth < 768,
    supportsVibration: !!window.navigator.vibrate,
    lastBidTime: bids[0]?.created_at
  };
};