import { useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePayments = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const purchaseCard = async (cardId: string) => {
    if (!user) {
      toast.error('Please sign in to purchase cards');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { cardId }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      
      toast.success('Redirecting to payment...');
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to start payment process');
    } finally {
      setLoading(false);
    }
  };

  const getOrderHistory = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          cards (
            id,
            title,
            image_url,
            creator_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast.error('Failed to load order history');
      return [];
    }
  };

  return {
    purchaseCard,
    getOrderHistory,
    loading
  };
};