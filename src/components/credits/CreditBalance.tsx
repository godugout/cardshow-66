import React from 'react';
import { useCredits } from '@/hooks/useCredits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Coins, Plus, RefreshCw } from 'lucide-react';

interface CreditBalanceProps {
  onPurchaseClick?: () => void;
  compact?: boolean;
}

export const CreditBalance: React.FC<CreditBalanceProps> = ({ 
  onPurchaseClick, 
  compact = false 
}) => {
  const { balance, loading, refreshBalance } = useCredits();

  if (loading) {
    return (
      <Card className={compact ? "w-full" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Coins className="h-5 w-5 text-primary" />
            CRD Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-24" />
          {!compact && <Skeleton className="h-8 w-32" />}
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
        <Coins className="h-4 w-4 text-primary" />
        <span className="font-medium">{balance.toLocaleString()}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onPurchaseClick}
          className="h-6 w-6 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            CRD Balance
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshBalance}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {balance.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">CRD Tokens</p>
        </div>
        
        {onPurchaseClick && (
          <Button onClick={onPurchaseClick} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Buy More Tokens
          </Button>
        )}
      </CardContent>
    </Card>
  );
};