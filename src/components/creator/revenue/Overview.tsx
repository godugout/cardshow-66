import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'sale' | 'payout' | 'fee';
  cardTitle?: string;
}

interface OverviewProps {
  revenueData: {
    balance: number;
    recentTransactions: Transaction[];
    salesAnalytics: {
      earningsChart: Array<{ date: string; earnings: number }>;
      totalEarnings: number;
      thisMonthEarnings: number;
    };
  };
  onRefresh: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ revenueData, onRefresh }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'payout':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'fee':
        return <DollarSign className="h-4 w-4 text-orange-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'text-green-600';
      case 'payout':
        return 'text-blue-600';
      case 'fee':
        return 'text-orange-600';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Revenue Overview</h2>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-crd-green">
              {formatCurrency(revenueData.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready to withdraw
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.salesAnalytics.thisMonthEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              Earnings this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.salesAnalytics.totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Over Last 30 Days</CardTitle>
          <CardDescription>Daily earnings from card sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData.salesAnalytics.earningsChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value: number) => [formatCurrency(value), 'Earnings']}
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="hsl(var(--crd-green))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--crd-green))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your 5 most recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueData.recentTransactions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-4">
              {revenueData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      {transaction.cardTitle && (
                        <p className="text-sm text-muted-foreground">{transaction.cardTitle}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'fee' ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};