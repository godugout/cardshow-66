-- Create trading system tables
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  message TEXT,
  trade_type TEXT DEFAULT 'card_for_card' CHECK (trade_type IN ('card_for_card', 'card_for_credits', 'card_for_cash'))
);

CREATE TABLE public.trade_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('creator', 'recipient')),
  quantity INTEGER DEFAULT 1,
  credits_value INTEGER DEFAULT 0,
  cash_value DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.trading_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT DEFAULT 'public' CHECK (room_type IN ('public', 'private', 'invite_only')),
  max_participants INTEGER DEFAULT 50,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.trading_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.trading_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  is_online BOOLEAN DEFAULT false,
  UNIQUE(room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_room_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trades
CREATE POLICY "Users can view trades they're involved in"
ON public.trades FOR SELECT
USING (auth.uid() = creator_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create trades"
ON public.trades FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own trades"
ON public.trades FOR UPDATE
USING (auth.uid() = creator_id OR auth.uid() = recipient_id);

-- RLS Policies for trade_items
CREATE POLICY "Users can view trade items for their trades"
ON public.trade_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trades t 
    WHERE t.id = trade_id AND (t.creator_id = auth.uid() OR t.recipient_id = auth.uid())
  )
);

CREATE POLICY "Users can add items to their trades"
ON public.trade_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trades t 
    WHERE t.id = trade_id AND t.creator_id = auth.uid()
  )
);

-- RLS Policies for trading_rooms
CREATE POLICY "Anyone can view public trading rooms"
ON public.trading_rooms FOR SELECT
USING (room_type = 'public' OR created_by = auth.uid());

CREATE POLICY "Users can create trading rooms"
ON public.trading_rooms FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms"
ON public.trading_rooms FOR UPDATE
USING (auth.uid() = created_by);

-- RLS Policies for trading_room_participants
CREATE POLICY "Users can view participants in rooms they're in"
ON public.trading_room_participants FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.trading_room_participants trp 
    WHERE trp.room_id = trading_room_participants.room_id AND trp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join trading rooms"
ON public.trading_room_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_trades_creator_id ON public.trades(creator_id);
CREATE INDEX idx_trades_recipient_id ON public.trades(recipient_id);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_trade_items_trade_id ON public.trade_items(trade_id);
CREATE INDEX idx_trading_room_participants_room_id ON public.trading_room_participants(room_id);
CREATE INDEX idx_trading_room_participants_user_id ON public.trading_room_participants(user_id);