
import { supabase } from '@/integrations/supabase/client';

export const calculateOffset = (page = 1, pageSize = 10): number => {
  return (page - 1) * pageSize;
};

export const getMemoryQuery = () => {
  // Mock implementation
  return {
    select: () => ({ eq: () => ({ data: [], error: null }) })
  };
};
