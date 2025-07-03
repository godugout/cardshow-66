import { useState } from 'react';

export interface SEOProfile {
  id: string;
  creator_id: string;
  meta_title?: string;
  meta_description?: string;
  keywords: string[];
  custom_url_slug?: string;
  social_media_links: Record<string, string>;
  seo_score: number;
  last_optimized_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetric {
  id: string;
  creator_id?: string;
  card_id?: string;
  template_id?: string;
  metric_name: string;
  metric_value: number;
  metric_date: string;
  aggregation_period?: 'daily' | 'weekly' | 'monthly';
  metadata: Record<string, any>;
  created_at: string;
}

export const useMarketplaceOptimization = () => {
  const [seoProfile] = useState<SEOProfile | null>({
    id: 'mock-seo-profile',
    creator_id: 'mock-creator',
    keywords: ['trading cards', 'collectibles'],
    social_media_links: { twitter: '', instagram: '' },
    seo_score: 85,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  });
  const [performanceMetrics] = useState<PerformanceMetric[]>([]);

  const createOrUpdateSEO = {
    mutate: () => {},
    mutateAsync: async () => ({ id: 'mock-profile' }),
    isPending: false,
  };

  const calculateSEOScore = (profile: SEOProfile | null): number => {
    if (!profile) return 0;
    
    let score = 0;
    if (profile.meta_title) score += 20;
    if (profile.meta_description) score += 20;
    if (profile.keywords.length > 0) score += 20;
    if (profile.custom_url_slug) score += 20;
    if (Object.keys(profile.social_media_links).length > 0) score += 20;
    
    return score;
  };

  const getMetricsByType = (metricType: string) => {
    return performanceMetrics?.filter(metric => metric.metric_name === metricType) || [];
  };

  const getRecentTrend = (metricType: string) => {
    const metrics = getMetricsByType(metricType).slice(0, 7);
    if (metrics.length < 2) return 0;
    
    const recent = metrics[0].metric_value;
    const previous = metrics[1].metric_value;
    return ((recent - previous) / previous) * 100;
  };

  return {
    seoProfile,
    performanceMetrics: performanceMetrics || [],
    loadingSEO: false,
    loadingMetrics: false,
    createOrUpdateSEO,
    calculateSEOScore,
    getMetricsByType,
    getRecentTrend,
  };
};