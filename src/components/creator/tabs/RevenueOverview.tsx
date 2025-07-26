import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { MetricCard } from '../shared/MetricCard';
import { EarningsLineChart } from '../shared/EarningsLineChart';
import { RecentTransactionsTable } from '../shared/RecentTransactionsTable';
import { RevenueSummary } from '@/types/revenue';

interface RevenueOverviewProps {
  summaryData: RevenueSummary;
  isLoading: boolean;
  onRefresh: () => void;
}

export const RevenueOverview: React.FC<RevenueOverviewProps> = ({ 
  summaryData, 
  isLoading, 
  onRefresh 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Revenue Overview</h2>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metric Display - Two prominent MetricCard components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Available for Payout"
          value={formatCurrency(summaryData.balance)}
          subtitle="Ready to withdraw"
          icon={DollarSign}
          className="border-crd-green/20 bg-crd-green/5"
        />
        <MetricCard
          title="Pending Revenue"
          value={formatCurrency(summaryData.pendingBalance)}
          subtitle="Processing payments"
          icon={TrendingUp}
        />
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Over Last 30 Days</CardTitle>
          <CardDescription>Daily earnings from card sales and royalties</CardDescription>
        </CardHeader>
        <CardContent>
          <EarningsLineChart data={summaryData.earningsHistory} />
        </CardContent>
      </Card>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your 10 most recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTransactionsTable transactions={summaryData.recentTransactions} />
        </CardContent>
      </Card>
    </div>
  );
};