import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RevenueOverview } from './tabs/RevenueOverview';
import { SalesAnalytics } from './revenue/SalesAnalytics';
import { PayoutManager } from './tabs/PayoutManager';
import { RevenueSummary, LegacyRevenueData } from '@/types/revenue';
import { useToast } from '@/hooks/use-toast';

// Helper function to transform legacy data to new format
const transformLegacyData = (legacyData: LegacyRevenueData): RevenueSummary => {
  return {
    balance: legacyData.balance,
    pendingBalance: Math.random() * 200, // Mock pending balance for now
    hasStripeAccount: legacyData.hasStripeAccount,
    earningsHistory: legacyData.salesAnalytics?.earningsChart || [],
    recentTransactions: legacyData.recentTransactions.slice(0, 10).map(tx => ({
      id: tx.id,
      date: tx.date,
      type: tx.type === 'sale' ? 'Sale' : tx.type === 'payout' ? 'Royalty' : 'Adjustment',
      description: tx.description,
      amount: tx.amount,
      status: 'Completed'
    })),
    payoutHistory: legacyData.payoutHistory.map(payout => ({
      id: payout.id,
      requestDate: payout.date,
      completionDate: payout.status === 'completed' ? payout.date : undefined,
      amount: payout.amount,
      status: payout.status === 'completed' ? 'Completed' : 
              payout.status === 'pending' ? 'Pending' : 'Failed',
      transactionId: payout.transactionId
    }))
  };
};

export const RevenueDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [legacyRevenueData, setLegacyRevenueData] = useState<LegacyRevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Transform legacy data to new format
  const summaryData: RevenueSummary | null = legacyRevenueData ? 
    transformLegacyData(legacyRevenueData) : null;

  const fetchRevenueData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('creator-revenue-summary');

      if (functionError) {
        throw new Error(functionError.message || 'Failed to fetch revenue data');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setLegacyRevenueData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load revenue data';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const handleRefresh = () => {
    fetchRevenueData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading revenue data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Revenue Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!summaryData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Dashboard</CardTitle>
          <CardDescription>No revenue data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
          <p className="text-muted-foreground">Track your earnings and manage payouts</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <RevenueOverview 
            summaryData={summaryData} 
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <SalesAnalytics 
            salesAnalytics={legacyRevenueData?.salesAnalytics}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutManager 
            balance={summaryData.balance}
            hasStripeAccount={summaryData.hasStripeAccount}
            payoutHistory={summaryData.payoutHistory}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};