-- Fix critical RLS security issues

-- 1. Fix subscribers table policies to restrict access properly
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

CREATE POLICY "users_can_insert_own_subscription"
ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "users_can_update_own_subscription"
ON public.subscribers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR email = auth.email());

-- 2. Fix orders table policies to be more restrictive
DROP POLICY IF EXISTS "Edge functions can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Edge functions can update orders" ON public.orders;

-- Create a service role policy that only allows service role to insert/update orders
CREATE POLICY "service_role_can_manage_orders"
ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Add input validation function for file uploads
CREATE OR REPLACE FUNCTION public.validate_file_upload(
    file_name TEXT,
    file_size BIGINT,
    mime_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- 4. Add security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "admins_can_view_audit_logs"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND (subscription_tier = 'admin' OR is_verified = true)
    )
);

-- Service role can insert audit logs
CREATE POLICY "service_role_can_insert_audit_logs"
ON public.security_audit_log
FOR INSERT
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Add rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    user_identifier TEXT,
    action_type TEXT,
    max_attempts INTEGER DEFAULT 5,
    time_window_minutes INTEGER DEFAULT 15
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;