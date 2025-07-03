
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MarketAnalytics, MarketTrend, MarketplaceMetrics } from '@/types/marketplace';

export const useMarketAnalytics = () => {
  // Mock market metrics
  const marketMetrics: MarketplaceMetrics = {
    totalVolume: 125000,
    totalTransactions: 342,
    averagePrice: 85.50,
    priceChange24h: 12.5,
    topTrendingCards: [
      { card_id: '1', title: 'Rookie Star', trending_score: 98, price_change: 15.2 },
      { card_id: '2', title: 'Legend Card', trending_score: 95, price_change: 8.7 }
    ],
    marketCap: 2500000
  };

  const metricsLoading = false;

  // Mock trending cards
  const trendingCards = [
    { card_id: '1', title: 'Rookie Star', trending_score: 98, price_change: 15.2 },
    { card_id: '2', title: 'Legend Card', trending_score: 95, price_change: 8.7 }
  ];
  const trendingLoading = false;

  // Mock market trends
  const marketTrends: MarketTrend[] = [
    {
      id: '1',
      trend_name: 'Sports Cards Surge',
      trend_type: 'category' as const,
      strength: 0.85,
      trend_data: { category: 'sports', growth: 45 },
      created_at: new Date().toISOString()
    }
  ];
  const trendsLoading = false;

  // Mock card analytics function
  const getCardAnalytics = async (cardId: string, days: number = 30) => {
    return [];
  };

  return {
    marketMetrics,
    metricsLoading,
    trendingCards,
    trendingLoading,
    marketTrends,
    trendsLoading,
    getCardAnalytics
  };
};
