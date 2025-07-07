export interface Trade {
  id: string;
  creator_id: string;
  recipient_id?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  expires_at: string;
  created_at: string;
  updated_at: string;
  message?: string;
  trade_type: 'card_for_card' | 'card_for_credits' | 'card_for_cash';
}

export interface TradeItem {
  id: string;
  trade_id: string;
  card_id?: string;
  owner_type: 'creator' | 'recipient';
  quantity: number;
  credits_value: number;
  cash_value: number;
  created_at: string;
  // Relations
  card?: any;
}

export interface TradingRoom {
  id: string;
  name: string;
  description?: string;
  room_type: 'public' | 'private' | 'invite_only';
  max_participants: number;
  created_by: string;
  created_at: string;
  is_active: boolean;
  // Relations
  participant_count?: number;
  current_user_role?: 'owner' | 'moderator' | 'member';
}

export interface TradingRoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  role: 'owner' | 'moderator' | 'member';
  is_online: boolean;
  // Relations
  user?: any;
}

export interface TradeOffer {
  offeredCards: string[];
  requestedCards: string[];
  offeredCredits: number;
  requestedCredits: number;
  message: string;
  expiresIn: number; // days
}