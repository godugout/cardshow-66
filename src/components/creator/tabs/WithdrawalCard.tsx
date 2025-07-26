import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalCardProps {
  balance: number;
  onWithdrawalSuccess: () => void;
}

export const WithdrawalCard: React.FC<WithdrawalCardProps> = ({ 
  balance, 
  onWithdrawalSuccess 
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
        description: `Your withdrawal request for ${formatCurrency(amount)} has been submitted successfully`,
      });

      setWithdrawAmount('');
      onWithdrawalSuccess();
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
  const canWithdraw = balance >= minWithdrawal;
  const requestedAmount = parseFloat(withdrawAmount) || 0;

  return (
    <Card className="border-crd-green/20 bg-crd-green/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-crd-green" />
          Request Withdrawal
        </CardTitle>
        <CardDescription>
          Available balance: {formatCurrency(balance)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canWithdraw && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Minimum withdrawal amount is {formatCurrency(minWithdrawal)}. 
              You need {formatCurrency(minWithdrawal - balance)} more to withdraw.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-3">
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
              disabled={!canWithdraw}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minimum: {formatCurrency(minWithdrawal)} • Maximum: {formatCurrency(balance)}
            </p>
          </div>
          
          <Button 
            onClick={handleWithdrawal}
            disabled={!canWithdraw || isLoading || requestedAmount < minWithdrawal || requestedAmount > balance}
            className="w-full"
            size="lg"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            {isLoading ? 'Processing...' : `Request ${withdrawAmount ? formatCurrency(requestedAmount) : 'Withdrawal'}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};