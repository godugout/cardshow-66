-- Add security audit log table and rate limiting

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