import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { SetupPayoutsCard } from './SetupPayoutsCard';
import { WithdrawalCard } from './WithdrawalCard';
import { PayoutHistoryTable } from './PayoutHistoryTable';
import { Payout } from '@/types/revenue';

interface PayoutManagerProps {
  balance: number;
  hasStripeAccount: boolean;
  payoutHistory: Payout[];
  onRefresh: () => void;
}

export const PayoutManager: React.FC<PayoutManagerProps> = ({
  balance,
  hasStripeAccount,
  payoutHistory,
  onRefresh
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Payout Management</h2>
          <p className="text-muted-foreground">Manage your withdrawals and payout settings</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Conditional Logic based on hasStripeAccount */}
      {!hasStripeAccount ? (
        <SetupPayoutsCard onSetupComplete={onRefresh} />
      ) : (
        <WithdrawalCard balance={balance} onWithdrawalSuccess={onRefresh} />
      )}

      {/* Payout History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Request Date, Completion Date, Amount, Status, Transaction ID</CardDescription>
        </CardHeader>
        <CardContent>
          <PayoutHistoryTable payouts={payoutHistory} />
        </CardContent>
      </Card>
    </div>
  );
};