export interface Auction {
  id: string;
  card_id: string;
  seller_id: string;
  starting_price: number;
  current_bid: number;
  buy_now_price?: number;
  auction_end_time: string;
  status: 'active' | 'ended' | 'cancelled';
  bid_count: number;
  created_at: string;
  updated_at: string;
  
  // Related data
  card?: {
    id: string;
    title: string;
    image_url?: string;
    rarity: string;
  };
  seller?: {
    username: string;
    avatar_url?: string;
  };
  highest_bidder_id?: string;
}

export interface AuctionBid {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  bid_type: 'manual' | 'proxy' | 'auto_increment';
  is_winning_bid: boolean;
  created_at: string;
  
  // For display purposes (anonymized)
  bidder_display_name?: string; // e.g., "Bidder #1"
}

export interface AuctionCreateRequest {
  cardId: string;
  startingPrice: number;
  durationHours: number;
  buyNowPrice?: number;
}

export interface PlaceBidRequest {
  auctionId: string;
  amount: number;
}

export interface AuctionRealtimeUpdate {
  type: 'bid_update' | 'auction_ended' | 'buy_now_purchased';
  auction_id: string;
  current_bid: number;
  bid_count: number;
  highest_bidder_id?: string;
  bid_history?: AuctionBid[];
  ended?: boolean;
}