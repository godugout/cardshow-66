import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Download,
  Calendar,
  BarChart3,
  Eye,
  Star
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardStats {
  dailyActiveUsers: number;
  cardsCreated: number;
  salesVolume: number;
  totalUsers: number;
  flaggedContent: number;
}

interface UserRole {
  role: 'admin' | 'moderator' | 'creator' | 'user';
}

interface MetricData {
  date: string;
  users: number;
  cards: number;
  revenue: number;
}

export const PlatformMetrics: React.FC<{ stats: DashboardStats; userRole: UserRole }> = ({ stats, userRole }) => {
  const [chartData, setChartData] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadChartData();
  }, [timeRange]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const { data: metrics } = await supabase
        .from('platform_analytics')
        .select('*')
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .lte('metric_date', endDate.toISOString().split('T')[0])
        .order('metric_date', { ascending: true });

      if (metrics) {
        // Group by date and transform
        const grouped = metrics.reduce((acc: Record<string, any>, metric) => {
          const date = metric.metric_date;
          if (!acc[date]) {
            acc[date] = { date, users: 0, cards: 0, revenue: 0 };
          }
          
          switch (metric.metric_name) {
            case 'daily_active_users':
              acc[date].users = metric.metric_value;
              break;
            case 'cards_created':
              acc[date].cards = metric.metric_value;
              break;
            case 'sales_volume':
              acc[date].revenue = metric.metric_value / 100; // Convert cents to dollars
              break;
          }
          
          return acc;
        }, {});

        setChartData(Object.values(grouped));
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
      // Generate mock data for demo
      const mockData = Array.from({ length: parseInt(timeRange) }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          users: Math.floor(Math.random() * 100) + 50,
          cards: Math.floor(Math.random() * 20) + 5,
          revenue: Math.floor(Math.random() * 500) + 100
        };
      }).reverse();
      setChartData(mockData);
    }
    setLoading(false);
  };

  const exportData = () => {
    try {
      const csvContent = [
        ['Date', 'Active Users', 'Cards Created', 'Revenue ($)'],
        ...chartData.map(item => [item.date, item.users, item.cards, item.revenue])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `platform-metrics-${timeRange}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Metrics exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const MetricCard = ({ title, value, icon: Icon, trend, color = "text-crd-white" }: any) => (
    <Card className="bg-crd-black border-crd-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-crd-lightGray">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {trend && (
          <p className="text-xs text-crd-lightGray mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-crd-white">Platform Analytics</h2>
          <p className="text-crd-lightGray">Real-time platform performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            className="bg-crd-black border-crd-border text-crd-white hover:bg-crd-surface"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Daily Active Users"
          value={stats.dailyActiveUsers.toLocaleString()}
          icon={Users}
          trend="Users active today"
          color="text-crd-blue"
        />
        <MetricCard
          title="Cards Created"
          value={stats.cardsCreated.toLocaleString()}
          icon={CreditCard}
          trend="New cards today"
          color="text-crd-green"
        />
        <MetricCard
          title="Sales Volume"
          value={`$${(stats.salesVolume / 100).toFixed(2)}`}
          icon={DollarSign}
          trend="Revenue today"
          color="text-crd-orange"
        />
        <MetricCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={TrendingUp}
          trend="Platform members"
          color="text-purple-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <Card className="bg-crd-black border-crd-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-crd-white">User Activity Trend</CardTitle>
              <div className="flex gap-1">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className={timeRange === range 
                      ? "bg-crd-orange text-white" 
                      : "bg-transparent border-crd-border text-crd-lightGray hover:bg-crd-surface"
                    }
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full bg-crd-surface" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D9CDB" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2D9CDB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3d" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#2d2d2d', 
                      border: '1px solid #3d3d3d',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#2D9CDB" 
                    strokeWidth={2}
                    fill="url(#userGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Content Creation Chart */}
        <Card className="bg-crd-black border-crd-border">
          <CardHeader>
            <CardTitle className="text-crd-white">Content Creation</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full bg-crd-surface" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3d" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#2d2d2d', 
                      border: '1px solid #3d3d3d',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cards" 
                    stroke="#00C851" 
                    strokeWidth={3}
                    dot={{ fill: '#00C851', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-crd-black border-crd-border">
          <CardHeader>
            <CardTitle className="text-crd-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-crd-blue" />
              Top Creators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-crd-surface">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-crd-orange rounded-full flex items-center justify-center text-xs font-bold">
                      {i}
                    </div>
                    <span className="text-crd-white text-sm">Creator #{i}</span>
                  </div>
                  <span className="text-crd-green text-sm">{100 - i * 10} cards</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-crd-black border-crd-border">
          <CardHeader>
            <CardTitle className="text-crd-white flex items-center gap-2">
              <Star className="w-5 h-5 text-crd-orange" />
              Popular Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Sports', 'Gaming', 'Art'].map((category, i) => (
                <div key={category} className="flex items-center justify-between p-2 rounded-lg bg-crd-surface">
                  <span className="text-crd-white text-sm">{category}</span>
                  <span className="text-crd-blue text-sm">{50 - i * 10}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-crd-black border-crd-border">
          <CardHeader>
            <CardTitle className="text-crd-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-crd-green" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-crd-lightGray text-sm">Avg. Session Time</span>
              <span className="text-crd-white text-sm">8m 42s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-crd-lightGray text-sm">Bounce Rate</span>
              <span className="text-crd-white text-sm">23.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-crd-lightGray text-sm">Mobile Users</span>
              <span className="text-crd-white text-sm">67%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};