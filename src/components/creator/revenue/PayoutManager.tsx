import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  RefreshCw, 
  DollarSign, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  ExternalLink 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  description: string;
}

interface PayoutManagerProps {
  balance: number;
  hasStripeAccount: boolean;
  payoutHistory: PayoutRecord[];
  onRefresh: () => void;
}

export const PayoutManager: React.FC<PayoutManagerProps> = ({
  balance,
  hasStripeAccount,
  payoutHistory,
  onRefresh
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleStripeConnect = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding');
      
      if (error) {
        throw new Error(error.message);
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start Stripe Connect setup',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid withdrawal amount',
        variant: 'destructive'
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: 'Insufficient Balance',
        description: 'Withdrawal amount exceeds available balance',
        variant: 'destructive'
      });
      return;
    }

    if (amount < 25) {
      toast({
        title: 'Minimum Withdrawal',
        description: 'Minimum withdrawal amount is $25',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('creator-payouts', {
        body: { amount }
      });
      
      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: 'Withdrawal Requested',
        description: `Your withdrawal request for ${formatCurrency(amount)} has been submitted`,
      });

      setWithdrawAmount('');
      setIsWithdrawDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast({
        title: 'Withdrawal Failed',
        description: error instanceof Error ? error.message : 'Failed to process withdrawal',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const minWithdrawal = 25;
  const canWithdraw = hasStripeAccount && balance >= minWithdrawal;

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

      {/* Balance Card */}
      <Card className="border-crd-green/20 bg-crd-green/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-crd-green" />
            Available for Payout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-crd-green mb-4">
            {formatCurrency(balance)}
          </div>
          
          {!hasStripeAccount ? (
            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need to set up Stripe Connect to receive payouts. This is a one-time setup process.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleStripeConnect} 
                disabled={isLoading}
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isLoading ? 'Setting up...' : 'Setup Payouts with Stripe'}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {!canWithdraw && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Minimum withdrawal amount is {formatCurrency(minWithdrawal)}. 
                    {balance < minWithdrawal && ` You need ${formatCurrency(minWithdrawal - balance)} more to withdraw.`}
                  </AlertDescription>
                </Alert>
              )}
              
              <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    disabled={!canWithdraw || isLoading}
                    className="w-full"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Request Withdrawal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Withdrawal</DialogTitle>
                    <DialogDescription>
                      Enter the amount you'd like to withdraw to your Stripe account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Withdrawal Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        min={minWithdrawal}
                        max={balance}
                        step="0.01"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Available balance: {formatCurrency(balance)}
                      </p>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsWithdrawDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleWithdrawal}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Submit Request'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Track your withdrawal requests and completed payouts</CardDescription>
        </CardHeader>
        <CardContent>
          {payoutHistory.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No payout history yet
            </div>
          ) : (
            <div className="space-y-4">
              {payoutHistory.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(payout.status)}
                    <div>
                      <p className="font-medium">{payout.description}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(payout.date)}</p>
                      {payout.transactionId && (
                        <p className="text-xs text-muted-foreground font-mono">
                          ID: {payout.transactionId}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{formatCurrency(payout.amount)}</p>
                    <Badge variant={getStatusVariant(payout.status)} className="capitalize">
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Processing Time</p>
              <p className="text-muted-foreground">1-2 business days</p>
            </div>
            <div>
              <p className="font-medium">Minimum Withdrawal</p>
              <p className="text-muted-foreground">{formatCurrency(minWithdrawal)}</p>
            </div>
            <div>
              <p className="font-medium">Payout Method</p>
              <p className="text-muted-foreground">Stripe Connect (Bank Transfer)</p>
            </div>
            <div>
              <p className="font-medium">Fees</p>
              <p className="text-muted-foreground">No additional fees</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};