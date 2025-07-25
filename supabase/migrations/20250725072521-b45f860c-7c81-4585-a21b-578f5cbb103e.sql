-- Create admin role system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'creator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create analytics tracking table
CREATE TABLE public.platform_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value BIGINT NOT NULL,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (metric_name, metric_date)
);

ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view analytics"
ON public.platform_analytics
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Function to calculate daily metrics
CREATE OR REPLACE FUNCTION public.calculate_daily_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Daily active users (users who created/updated content today)
  INSERT INTO public.platform_analytics (metric_name, metric_value, metric_date)
  SELECT 
    'daily_active_users',
    COUNT(DISTINCT user_id),
    CURRENT_DATE
  FROM (
    SELECT user_id FROM public.cards WHERE DATE(updated_at) = CURRENT_DATE
    UNION
    SELECT user_id FROM public.marketplace_listings WHERE DATE(updated_at) = CURRENT_DATE
    UNION  
    SELECT user_id FROM public.profiles WHERE DATE(updated_at) = CURRENT_DATE
  ) active_users
  ON CONFLICT (metric_name, metric_date) DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    created_at = now();

  -- Cards created today
  INSERT INTO public.platform_analytics (metric_name, metric_value, metric_date)
  SELECT 
    'cards_created',
    COUNT(*),
    CURRENT_DATE
  FROM public.cards 
  WHERE DATE(created_at) = CURRENT_DATE
  ON CONFLICT (metric_name, metric_date) DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    created_at = now();

  -- Sales volume today
  INSERT INTO public.platform_analytics (metric_name, metric_value, metric_date)
  SELECT 
    'sales_volume',
    COALESCE(SUM(amount), 0),
    CURRENT_DATE
  FROM public.orders 
  WHERE DATE(created_at) = CURRENT_DATE AND status = 'paid'
  ON CONFLICT (metric_name, metric_date) DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    created_at = now();

  -- Total users
  INSERT INTO public.platform_analytics (metric_name, metric_value, metric_date)
  SELECT 
    'total_users',
    COUNT(*),
    CURRENT_DATE
  FROM public.profiles
  ON CONFLICT (metric_name, metric_date) DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    created_at = now();
END;
$$;