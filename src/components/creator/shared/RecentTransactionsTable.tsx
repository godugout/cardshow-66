import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CreditCard, DollarSign } from 'lucide-react';
import { Transaction } from '@/types/revenue';

interface RecentTransactionsTableProps {
  transactions: Transaction[];
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ transactions }) => {
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
      case 'Sale':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Royalty':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'Adjustment':
        return <DollarSign className="h-4 w-4 text-orange-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'Sale':
        return 'text-green-600';
      case 'Royalty':
        return 'text-blue-600';
      case 'Adjustment':
        return 'text-orange-600';
      default:
        return 'text-foreground';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getTransactionIcon(transaction.type)}
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
              +{formatCurrency(transaction.amount)}
            </p>
            <Badge variant="outline" className="text-xs">
              {transaction.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};