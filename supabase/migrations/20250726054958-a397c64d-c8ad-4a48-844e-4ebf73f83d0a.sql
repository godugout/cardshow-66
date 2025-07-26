-- Create achievements tables
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  target INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT 'milestone',
  trigger_event TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievement_definitions(id),
  current_progress INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.user_action_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_action_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievement_definitions
CREATE POLICY "Public can view active achievements" 
ON public.achievement_definitions 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage user achievements" 
ON public.user_achievements 
FOR ALL 
USING (true);

-- RLS Policies for user_action_events
CREATE POLICY "Users can create their own events" 
ON public.user_action_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage events" 
ON public.user_action_events 
FOR ALL 
USING (true);

-- Create function to process achievement progress
CREATE OR REPLACE FUNCTION public.process_achievement_progress(
  _user_id UUID,
  _event_type TEXT,
  _event_data JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  achievement_record RECORD;
  current_progress INTEGER;
  new_progress INTEGER;
BEGIN
  -- Loop through all achievements that match this event type
  FOR achievement_record IN 
    SELECT * FROM public.achievement_definitions 
    WHERE trigger_event = _event_type AND is_active = true
  LOOP
    -- Get or create user achievement record
    INSERT INTO public.user_achievements (user_id, achievement_id, current_progress)
    VALUES (_user_id, achievement_record.id, 0)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    -- Get current progress
    SELECT current_progress INTO current_progress
    FROM public.user_achievements
    WHERE user_id = _user_id AND achievement_id = achievement_record.id;
    
    -- Calculate new progress based on event type
    CASE achievement_record.trigger_event
      WHEN 'card_created' THEN
        SELECT COUNT(*) INTO new_progress
        FROM public.cards
        WHERE user_id = _user_id;
      WHEN 'card_liked' THEN
        SELECT COUNT(*) INTO new_progress
        FROM public.card_likes
        WHERE user_id = _user_id;
      WHEN 'follow_created' THEN
        SELECT COUNT(*) INTO new_progress
        FROM public.creator_follows
        WHERE follower_id = _user_id;
      WHEN 'sale_completed' THEN
        SELECT COUNT(*) INTO new_progress
        FROM public.orders
        WHERE card_id IN (SELECT id FROM public.cards WHERE user_id = _user_id)
        AND status = 'paid';
      ELSE
        new_progress := current_progress + 1;
    END CASE;
    
    -- Update progress and check if unlocked
    UPDATE public.user_achievements
    SET 
      current_progress = new_progress,
      unlocked_at = CASE 
        WHEN new_progress >= achievement_record.target AND unlocked_at IS NULL 
        THEN now() 
        ELSE unlocked_at 
      END,
      updated_at = now()
    WHERE user_id = _user_id AND achievement_id = achievement_record.id;
  END LOOP;
END;
$function$;

-- Insert default achievement definitions
INSERT INTO public.achievement_definitions (name, description, icon_url, target, category, trigger_event) VALUES
('First Card', 'Create your very first card', '/achievements/first-card.png', 1, 'creation', 'card_created'),
('Card Creator', 'Create 10 cards', '/achievements/card-creator.png', 10, 'creation', 'card_created'),
('Prolific Creator', 'Create 50 cards', '/achievements/prolific-creator.png', 50, 'creation', 'card_created'),
('Card Master', 'Create 100 cards', '/achievements/card-master.png', 100, 'creation', 'card_created'),
('First Like', 'Like your first card', '/achievements/first-like.png', 1, 'social', 'card_liked'),
('Social Butterfly', 'Like 25 cards', '/achievements/social-butterfly.png', 25, 'social', 'card_liked'),
('Card Enthusiast', 'Like 100 cards', '/achievements/card-enthusiast.png', 100, 'social', 'card_liked'),
('First Follow', 'Follow your first creator', '/achievements/first-follow.png', 1, 'social', 'follow_created'),
('Network Builder', 'Follow 10 creators', '/achievements/network-builder.png', 10, 'social', 'follow_created'),
('Community Member', 'Follow 25 creators', '/achievements/community-member.png', 25, 'social', 'follow_created'),
('First Sale', 'Make your first sale', '/achievements/first-sale.png', 1, 'marketplace', 'sale_completed'),
('Merchant', 'Complete 10 sales', '/achievements/merchant.png', 10, 'marketplace', 'sale_completed'),
('Top Seller', 'Complete 50 sales', '/achievements/top-seller.png', 50, 'marketplace', 'sale_completed')
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at
CREATE TRIGGER update_achievement_definitions_updated_at
BEFORE UPDATE ON public.achievement_definitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at
BEFORE UPDATE ON public.user_achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();