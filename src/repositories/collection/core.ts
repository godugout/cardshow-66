
import { supabase } from '@/integrations/supabase/client';

export const calculateOffset = (page = 1, pageSize = 10): number => {
  return (page - 1) * pageSize;
};

export const getCollectionQuery = () => {
  return supabase
    .from('collections')
    .select('*, media(*)');
};

// We need to modify this function since collection_items table doesn't exist in the schema
// Mock implementation
export const getCollectionItemsQuery = () => {
  return {
    select: () => ({ eq: () => ({ data: [], error: null }) })
  };
};
