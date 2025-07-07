import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier: 'free' | 'creator' | 'pro';
  subscription_end?: string;
}

export const useSubscription = () => {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    subscribed: false,
    subscription_tier: 'free'
  });
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to check subscription status');
    }
  };

  const createCheckout = async (priceId: string, tier: 'creator' | 'pro') => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, tier }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to create checkout session');
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast.error('Please sign in to manage subscription');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      // Open customer portal in new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open customer portal');
    }
  };

  const hasFeature = (requiredTier: 'free' | 'creator' | 'pro'): boolean => {
    const tierHierarchy = { free: 0, creator: 1, pro: 2 };
    return tierHierarchy[subscription.subscription_tier] >= tierHierarchy[requiredTier];
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true);
      await checkSubscription();
      setLoading(false);
    };

    if (user) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    hasFeature
  };
};