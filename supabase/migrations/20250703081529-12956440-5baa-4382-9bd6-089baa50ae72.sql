-- Temporarily disable Row Level Security for development
-- This allows all users to access data without authentication

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_history DISABLE ROW LEVEL SECURITY;