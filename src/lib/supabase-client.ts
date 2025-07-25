
/**
 * @deprecated This file contains hardcoded credentials and should be removed
 * Use @/integrations/supabase/client instead
 * 
 * SECURITY WARNING: Never hardcode API keys in source code
 * This violates security best practices and exposes credentials
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// SECURITY ISSUE: Hardcoded credentials - should use environment variables
// This configuration should be moved to environment variables or removed entirely
const supabaseUrl = "https://wxlwhqlbxyuyujhqeyur.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bHdocWxieHl1eXVqaHFleXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMjAyNTMsImV4cCI6MjA1Mzc5NjI1M30.6TlBEqXOPZRgwhPrHQBYjMMVzmCTmCb-Q1-sNnFhVrc";

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
