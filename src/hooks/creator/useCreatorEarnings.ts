import { useState } from 'react';

export interface CreatorEarning {
  id: string;
  source_type: 'card_sale' | 'template_sale' | 'commission' | 'royalty' | 'subscription';
  amount: number;
  platform_fee: number;
  net_amount: number;
  transaction_date: string;
  payout_date?: string;
  payout_status: 'pending' | 'processing' | 'paid' | 'failed';
  card?: {
    id: string;
    title: string;
  };
  template?: {
    id: string;
    name: string;
  };
}

export const useCreatorEarnings = () => {
  const [earnings] = useState<CreatorEarning[]>([]);

  return {
    earnings,
    monthlyStats: { total: 0, bySource: {} },
    pendingPayouts: 0,
    isLoading: false,
  };
};