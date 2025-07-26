import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, TrendingUp, Star, Trophy, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TopCard {
  id: string;
  title: string;
  sales: number;
  revenue: number;
  rarity: string;
}

interface SalesAnalyticsData {
  topSellingCards: TopCard[];
  revenueByCardType: Array<{ type: string; revenue: number; count: number }>;
  salesTrends: Array<{ date: string; sales: number; revenue: number }>;
  performanceMetrics: {
    averageSalePrice: number;
    totalCards: number;
    conversionRate: number;
    topRarity: string;
  };
}

interface SalesAnalyticsProps {
  salesAnalytics: SalesAnalyticsData;
  onRefresh: () => void;
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ salesAnalytics, onRefresh }) => {
  const [dateRange, setDateRange] = useState('30d');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'bg-yellow-500';
      case 'epic':
        return 'bg-purple-500';
      case 'rare':
        return 'bg-blue-500';
      case 'uncommon':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const COLORS = ['#00C851', '#FF6D00', '#2D9CDB', '#FFD700', '#FF4444'];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Sales Analytics</h2>
          <p className="text-muted-foreground">Detailed insights into your card performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sale Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(salesAnalytics.performanceMetrics.averageSalePrice)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesAnalytics.performanceMetrics.totalCards.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesAnalytics.performanceMetrics.conversionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Rarity</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {salesAnalytics.performanceMetrics.topRarity}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trends</CardTitle>
            <CardDescription>Daily sales and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesAnalytics.salesTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : 'Sales'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="sales" fill="hsl(var(--crd-blue))" name="sales" />
                  <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--crd-green))" name="revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Card Type */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Card Type</CardTitle>
            <CardDescription>Distribution of revenue across different card rarities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesAnalytics.revenueByCardType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {salesAnalytics.revenueByCardType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Cards</CardTitle>
          <CardDescription>Your best performing cards by sales volume</CardDescription>
        </CardHeader>
        <CardContent>
          {salesAnalytics.topSellingCards.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No sales data available
            </div>
          ) : (
            <div className="space-y-4">
              {salesAnalytics.topSellingCards.map((card, index) => (
                <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-crd-surface rounded-full text-sm font-semibold">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold">{card.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-white ${getRarityColor(card.rarity)}`}
                        >
                          {card.rarity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {card.sales} sales
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{formatCurrency(card.revenue)}</p>
                    <p className="text-sm text-muted-foreground">Total revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Card Type Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Rarity</CardTitle>
          <CardDescription>Detailed breakdown of sales by card rarity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Card Type</th>
                  <th className="text-right py-2">Cards Sold</th>
                  <th className="text-right py-2">Total Revenue</th>
                  <th className="text-right py-2">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {salesAnalytics.revenueByCardType.map((type) => (
                  <tr key={type.type} className="border-b">
                    <td className="py-3">
                      <Badge 
                        variant="outline" 
                        className={`text-white ${getRarityColor(type.type)}`}
                      >
                        {type.type}
                      </Badge>
                    </td>
                    <td className="text-right py-3">{type.count}</td>
                    <td className="text-right py-3 font-semibold">
                      {formatCurrency(type.revenue)}
                    </td>
                    <td className="text-right py-3">
                      {formatCurrency(type.revenue / type.count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};