import { useState } from 'react';
import { toast } from 'sonner';

export interface CreatorProfile {
  id: string;
  user_id: string;
  stripe_account_id?: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
  portfolio_url?: string;
  bio?: string;
  bio_extended?: string;
  specialties: string[];
  commission_rates: {
    standard: number;
    premium: number;
    custom: number;
  };
  total_earnings: number;
  cards_created: number;
  avg_rating: number;
  rating_count: number;
}

export const useCreatorProfile = () => {
  const [profile] = useState<CreatorProfile | null>(null);

  const createProfile = {
    mutate: () => {},
    mutateAsync: async () => ({ id: 'mock-profile-id' }),
    isPending: false,
  };

  const updateProfile = {
    mutate: () => {},
    mutateAsync: async () => ({ id: 'mock-profile-id' }),
    isPending: false,
  };

  const setupStripeAccount = {
    mutate: () => {},
    mutateAsync: async () => ({ url: 'https://mock-stripe-url.com' }),
    isPending: false,
  };

  return {
    profile,
    isLoading: false,
    createProfile,
    updateProfile,
    setupStripeAccount,
    isCreator: false,
    isVerified: false,
  };
};