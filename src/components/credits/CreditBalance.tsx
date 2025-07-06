import React from 'react';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Plus, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CreditBalanceProps {
  showActions?: boolean;
  compact?: boolean;
  onPurchaseClick?: () => void;
}

export const CreditBalance: React.FC<CreditBalanceProps> = ({
  showActions = true,
  compact = false,
  onPurchaseClick
}) => {
  const { balance, loading } = useCredits();

  if (loading) {
    return (
      <Card className={compact ? "p-2" : ""}>
        <CardContent className={compact ? "p-2" : "p-4"}>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-16" />
            {showActions && <Skeleton className="h-8 w-20 ml-auto" />}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm">
          <Coins className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">{balance.toLocaleString()}</span>
        </div>
        {showActions && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onPurchaseClick}
            className="h-6 px-2 text-xs"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Credit Balance</p>
              <p className="text-2xl font-bold text-foreground">
                {balance.toLocaleString()}
              </p>
            </div>
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onPurchaseClick}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Buy Credits
              </Button>
            </div>
          )}
        </div>

        {/* Credit Status Badges */}
        <div className="flex gap-2 mt-4">
          {balance > 1000 && (
            <Badge className="bg-primary text-primary-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              Rich Account
            </Badge>
          )}
          {balance < 50 && (
            <Badge variant="outline" className="text-orange-600">
              Low Balance
            </Badge>
          )}
          {balance === 0 && (
            <Badge variant="destructive">
              No Credits
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};