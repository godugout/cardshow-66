import React from 'react';
import { useCredits, CreditTransaction } from '@/hooks/useCredits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Gift, 
  ShoppingCart,
  Undo2,
  Clock
} from 'lucide-react';

const getTransactionIcon = (type: CreditTransaction['transaction_type']) => {
  switch (type) {
    case 'earn':
      return <ArrowUpCircle className="h-4 w-4 text-green-500" />;
    case 'spend':
      return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
    case 'bonus':
      return <Gift className="h-4 w-4 text-purple-500" />;
    case 'purchase':
      return <ShoppingCart className="h-4 w-4 text-blue-500" />;
    case 'refund':
      return <Undo2 className="h-4 w-4 text-orange-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getTransactionColor = (type: CreditTransaction['transaction_type']) => {
  switch (type) {
    case 'earn':
    case 'bonus':
    case 'purchase':
    case 'refund':
      return 'text-green-600';
    case 'spend':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
  }
};

const formatTransactionType = (type: CreditTransaction['transaction_type']) => {
  switch (type) {
    case 'earn':
      return 'Earned';
    case 'spend':
      return 'Spent';
    case 'bonus':
      return 'Bonus';
    case 'purchase':
      return 'Purchase';
    case 'refund':
      return 'Refund';
    default:
      return type;
  }
};

export const CreditTransactions: React.FC = () => {
  const { transactions, loading } = useCredits();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground">
              Start creating cards to earn credits!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                      >
                        {formatTransactionType(transaction.transaction_type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <span 
                      className={`text-sm font-medium ${getTransactionColor(transaction.transaction_type)}`}
                    >
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </span>
                    <p className="text-xs text-muted-foreground">credits</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};