-- Fix critical RLS security issues (corrected syntax)

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
USING (user_id = auth.uid() OR email = auth.email())
WITH CHECK (user_id = auth.uid() OR email = auth.email());

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