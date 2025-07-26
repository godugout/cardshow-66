export interface Bundle {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  price: number;
  status: 'active' | 'sold' | 'cancelled';
  created_at: string;
  updated_at: string;
  
  // Related data
  cards?: BundleCard[];
  creator?: {
    username: string;
    avatar_url?: string;
  };
}

export interface BundleCard {
  id: string;
  bundle_id: string;
  card_id: string;
  added_at: string;
  
  // Card details
  card?: {
    id: string;
    title: string;
    image_url?: string;
    thumbnail_url?: string;
    rarity: string;
  };
}

export interface BundleCreateRequest {
  title: string;
  description?: string;
  price: number;
  cardIds: string[];
}

export interface BundleDetails {
  title: string;
  description: string;
  price: number;
}

export interface AvailableCard {
  id: string;
  title: string;
  image_url?: string;
  thumbnail_url?: string;
  rarity: string;
  category?: string;
  tags?: string[];
  is_public: boolean;
  for_sale: boolean;
  bundle_id?: string;
}