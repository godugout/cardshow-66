-- Fix database function security vulnerabilities
-- Add proper search_path security to all functions

-- Update existing functions to be secure
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_card_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.cards 
    SET like_count = like_count + 1 
    WHERE id = NEW.card_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.cards 
    SET like_count = like_count - 1 
    WHERE id = OLD.card_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
    -- Increment followers count for followed user
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE user_id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE public.profiles 
    SET following_count = following_count - 1 
    WHERE user_id = OLD.follower_id;
    
    -- Decrement followers count for followed user
    UPDATE public.profiles 
    SET followers_count = followers_count - 1 
    WHERE user_id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_credit_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Update user's credit balance
  UPDATE public.profiles 
  SET credits_balance = credits_balance + NEW.amount 
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_sufficient_credits(_user_id uuid, _amount integer)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT credits_balance >= _amount
  FROM public.profiles
  WHERE user_id = _user_id;
$function$;

CREATE OR REPLACE FUNCTION public.has_subscription_tier(_user_id uuid, _required_tier text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT 
    CASE 
      WHEN _required_tier = 'free' THEN true
      WHEN _required_tier = 'creator' THEN subscription_tier IN ('creator', 'pro')
      WHEN _required_tier = 'pro' THEN subscription_tier = 'pro'
      ELSE false
    END
  FROM public.profiles
  WHERE user_id = _user_id;
$function$;

CREATE OR REPLACE FUNCTION public.validate_file_upload(file_name text, file_size bigint, mime_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Check file size (max 10MB)
    IF file_size > 10485760 THEN
        RETURN FALSE;
    END IF;
    
    -- Check allowed file types
    IF mime_type NOT IN (
        'image/jpeg',
        'image/png', 
        'image/webp',
        'image/gif'
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Check file extension matches MIME type
    IF (mime_type = 'image/jpeg' AND file_name !~* '\.(jpg|jpeg)$') OR
       (mime_type = 'image/png' AND file_name !~* '\.png$') OR
       (mime_type = 'image/webp' AND file_name !~* '\.webp$') OR
       (mime_type = 'image/gif' AND file_name !~* '\.gif$') THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(user_identifier text, action_type text, max_attempts integer DEFAULT 5, time_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    attempt_count INTEGER;
BEGIN
    -- Count recent attempts
    SELECT COUNT(*) INTO attempt_count
    FROM public.security_audit_log
    WHERE event_data->>'identifier' = user_identifier
    AND event_type = action_type
    AND created_at > (now() - (time_window_minutes || ' minutes')::INTERVAL);
    
    -- Insert current attempt
    INSERT INTO public.security_audit_log (event_type, event_data, created_at)
    VALUES (action_type, jsonb_build_object('identifier', user_identifier), now());
    
    RETURN attempt_count < max_attempts;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Update profile email when auth user email changes
  UPDATE public.profiles 
  SET email = NEW.email 
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$function$;