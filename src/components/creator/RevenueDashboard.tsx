import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Overview } from './revenue/Overview';
import { SalesAnalytics } from './revenue/SalesAnalytics';
import { PayoutManager } from './revenue/PayoutManager';
import { useToast } from '@/hooks/use-toast';

interface RevenueData {
  balance: number;
  hasStripeAccount: boolean;
  recentTransactions: any[];
  payoutHistory: any[];
  salesAnalytics: any;
}

export const RevenueDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

      setRevenueData(data);
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

  if (!revenueData) {
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
          <Overview 
            revenueData={revenueData} 
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <SalesAnalytics 
            salesAnalytics={revenueData.salesAnalytics}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutManager 
            balance={revenueData.balance}
            hasStripeAccount={revenueData.hasStripeAccount}
            payoutHistory={revenueData.payoutHistory}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};