import React, { useState, useEffect } from 'react';
import { MetricCard } from './MetricCard';
import { MetricChart } from './MetricChart';
import { Users, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdminMetrics } from '../../pages/api/admin/metrics';

interface MetricsData {
  kpis: {
    totalUsers: { value: number; change: string };
    cardsCreated: { value: number; change: string };
    marketplaceVolume: { value: number; change: string };
    dailyActiveUsers: { value: number; change: string };
  };
  userGrowthChart: Array<{ date: string; value: number }>;
}

export const PlatformMetrics: React.FC = () => {
  const [data, setData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the mock function directly since we don't have a real API endpoint
      const metricsData = await fetchAdminMetrics();
      setData(metricsData);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch platform metrics');
      toast.error('Failed to load platform metrics');
      
      // Fallback to mock data for development
      setData({
        kpis: {
          totalUsers: { value: 15234, change: '+2.1%' },
          cardsCreated: { value: 7890, change: '+5.5%' },
          marketplaceVolume: { value: 21567.50, change: '-1.2%' },
          dailyActiveUsers: { value: 1203, change: '+10.3%' }
        },
        userGrowthChart: generateMockChartData()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockChartData = () => {
    const days = 30;
    const today = new Date();
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 500) + 800 + (days - i) * 10
      });
    }
    
    return data;
  };

  const getChangeType = (change: string): 'increase' | 'decrease' => {
    return change.startsWith('+') ? 'increase' : 'decrease';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (error && !data) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          <TrendingUp className="w-12 h-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Unable to Load Metrics</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Platform Metrics</h2>
        <p className="text-muted-foreground">
          Overview of key performance indicators and platform health
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={data?.kpis.totalUsers.value || 0}
          change={data?.kpis.totalUsers.change || '+0%'}
          changeType={getChangeType(data?.kpis.totalUsers.change || '+0%')}
          isLoading={isLoading}
          icon={<Users className="w-5 h-5" />}
          description="vs last month"
        />
        
        <MetricCard
          title="Cards Created"
          value={data?.kpis.cardsCreated.value || 0}
          change={data?.kpis.cardsCreated.change || '+0%'}
          changeType={getChangeType(data?.kpis.cardsCreated.change || '+0%')}
          isLoading={isLoading}
          icon={<CreditCard className="w-5 h-5" />}
          description="this month"
        />
        
        <MetricCard
          title="Marketplace Volume"
          value={formatCurrency(data?.kpis.marketplaceVolume.value || 0)}
          change={data?.kpis.marketplaceVolume.change || '+0%'}
          changeType={getChangeType(data?.kpis.marketplaceVolume.change || '+0%')}
          isLoading={isLoading}
          icon={<DollarSign className="w-5 h-5" />}
          description="monthly revenue"
        />
        
        <MetricCard
          title="Daily Active Users"
          value={data?.kpis.dailyActiveUsers.value || 0}
          change={data?.kpis.dailyActiveUsers.change || '+0%'}
          changeType={getChangeType(data?.kpis.dailyActiveUsers.change || '+0%')}
          isLoading={isLoading}
          icon={<TrendingUp className="w-5 h-5" />}
          description="last 24 hours"
        />
      </div>

      {/* User Growth Chart */}
      <div className="mt-8">
        <MetricChart
          data={data?.userGrowthChart || []}
          title="New Users Over Time (Last 30 Days)"
          color="#f97316"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};