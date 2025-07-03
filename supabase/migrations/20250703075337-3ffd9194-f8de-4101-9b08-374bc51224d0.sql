-- Add missing columns to existing tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_verified BOOLEAN DEFAULT false;

ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add activity tracking columns to cards for community features
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS activity_type TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS activity_data JSONB;

-- Create marketplace_listings table
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create creator_courses table for education features
CREATE TABLE IF NOT EXISTS public.creator_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Users can view their own listings" ON public.marketplace_listings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own listings" ON public.marketplace_listings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own courses" ON public.creator_courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own courses" ON public.creator_courses FOR ALL USING (auth.uid() = user_id);