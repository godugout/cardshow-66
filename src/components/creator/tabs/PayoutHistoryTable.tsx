import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { Payout } from '@/types/revenue';

interface PayoutHistoryTableProps {
  payouts: Payout[];
}

export const PayoutHistoryTable: React.FC<PayoutHistoryTableProps> = ({ payouts }) => {
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
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'In Transit':
        return <ArrowRight className="h-4 w-4 text-blue-600" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'In Transit':
        return 'outline';
      case 'Failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (payouts.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No payout history yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payouts.map((payout) => (
        <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(payout.status)}
            <div>
              <p className="font-medium">Withdrawal Request</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Requested: {formatDate(payout.requestDate)}</p>
                {payout.completionDate && (
                  <p>Completed: {formatDate(payout.completionDate)}</p>
                )}
                {payout.transactionId && (
                  <p className="font-mono text-xs">ID: {payout.transactionId}</p>
                )}
              </div>
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
  );
};