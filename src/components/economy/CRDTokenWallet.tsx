// CRD Token System - Core Economy Component
import React, { useState, useEffect } from 'react';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp,
  CreditCard,
  History,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface CRDTokenWalletProps {
  className?: string;
}

interface TokenTransaction {
  id: string;
  type: 'purchase' | 'sale' | 'reward' | 'transfer';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletStats {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  monthlyGrowth: number;
}

export const CRDTokenWallet: React.FC<CRDTokenWalletProps> = ({ className }) => {
  const [wallet, setWallet] = useState<WalletStats>({
    balance: 1250,
    totalEarned: 3480,
    totalSpent: 2230,
    monthlyGrowth: 15.7
  });
  
  const [transactions, setTransactions] = useState<TokenTransaction[]>([
    {
      id: '1',
      type: 'sale',
      amount: 150,
      description: 'Card sale: Holographic Rookie',
      timestamp: new Date('2024-01-15T14:30:00'),
      status: 'completed'
    },
    {
      id: '2', 
      type: 'purchase',
      amount: -25,
      description: 'Premium frame template',
      timestamp: new Date('2024-01-14T09:15:00'),
      status: 'completed'
    },
    {
      id: '3',
      type: 'reward',
      amount: 50,
      description: 'Creator milestone bonus',
      timestamp: new Date('2024-01-13T16:45:00'),
      status: 'completed'
    }
  ]);

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('100');

  const formatCRD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatUSD = (crdAmount: number) => {
    // Example: 1 CRD = $0.10 USD
    const usdValue = crdAmount * 0.10;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(usdValue);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale': return <ArrowUpRight className="w-4 h-4 text-crd-green" />;
      case 'purchase': return <ArrowDownLeft className="w-4 h-4 text-crd-orange" />;
      case 'reward': return <Gift className="w-4 h-4 text-crd-yellow" />;
      default: return <History className="w-4 h-4 text-crd-text-dim" />;
    }
  };

  const handlePurchaseCRD = async () => {
    try {
      // TODO: Integrate with Stripe for CRD token purchases
      const response = await supabase.functions.invoke('create-payment', {
        body: {
          amount: parseInt(purchaseAmount) * 10, // Convert CRD to cents (1 CRD = $0.10)
          currency: 'usd',
          description: `Purchase ${purchaseAmount} CRD tokens`
        }
      });
      
      if (response.data?.url) {
        window.open(response.data.url, '_blank');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Wallet Overview */}
      <CRDCard className="p-6 bg-gradient-to-br from-crd-surface to-crd-surface-light">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-crd-yellow rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-crd-black" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-crd-text">CRD Wallet</h3>
              <p className="text-sm text-crd-text-dim">Your digital currency</p>
            </div>
          </div>
          
          <CRDButton 
            variant="orange" 
            size="sm"
            onClick={() => setShowPurchaseModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Buy CRD
          </CRDButton>
        </div>

        {/* Balance Display */}
        <div className="mb-6">
          <div className="text-4xl font-bold text-crd-text mb-1">
            {formatCRD(wallet.balance)} <span className="text-crd-yellow">CRD</span>
          </div>
          <div className="text-lg text-crd-text-dim">
            ≈ {formatUSD(wallet.balance)}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-semibold text-crd-green">
              +{formatCRD(wallet.totalEarned)}
            </div>
            <div className="text-xs text-crd-text-dim">Total Earned</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-semibold text-crd-orange">
              -{formatCRD(wallet.totalSpent)}
            </div>
            <div className="text-xs text-crd-text-dim">Total Spent</div>
          </div>
          
          <div className="text-center col-span-2 md:col-span-1">
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className="w-4 h-4 text-crd-green" />
              <span className="text-xl font-semibold text-crd-green">
                +{wallet.monthlyGrowth}%
              </span>
            </div>
            <div className="text-xs text-crd-text-dim">This Month</div>
          </div>
        </div>
      </CRDCard>

      {/* Recent Transactions */}
      <CRDCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-crd-text">Recent Activity</h4>
          <CRDButton variant="ghost" size="sm">
            View All
          </CRDButton>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg bg-crd-black/50 hover:bg-crd-surface transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-crd-surface rounded-lg flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <div className="font-medium text-crd-text text-sm">
                    {transaction.description}
                  </div>
                  <div className="text-xs text-crd-text-dim">
                    {transaction.timestamp.toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={cn(
                  "font-semibold",
                  transaction.amount > 0 ? "text-crd-green" : "text-crd-orange"
                )}>
                  {transaction.amount > 0 ? '+' : ''}{formatCRD(Math.abs(transaction.amount))} CRD
                </div>
                <div className="text-xs text-crd-text-muted">
                  {formatUSD(Math.abs(transaction.amount))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CRDCard>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <CRDCard className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-crd-text">Purchase CRD Tokens</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-crd-text-dim hover:text-crd-text"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-crd-text mb-2">
                  CRD Amount
                </label>
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-crd-black border border-crd-border rounded-lg text-crd-text focus:outline-none focus:ring-2 focus:ring-crd-yellow focus:border-transparent"
                  placeholder="100"
                />
                <div className="text-sm text-crd-text-dim mt-1">
                  ≈ {formatUSD(parseInt(purchaseAmount) || 0)}
                </div>
              </div>

              <div className="bg-crd-surface/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-crd-text-dim">CRD Tokens</span>
                  <span className="font-medium text-crd-text">{purchaseAmount || 0}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-crd-text-dim">USD Price</span>
                  <span className="font-medium text-crd-text">
                    {formatUSD(parseInt(purchaseAmount) || 0)}
                  </span>
                </div>
                <div className="border-t border-crd-border pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-crd-text">Total</span>
                    <span className="font-bold text-crd-yellow">
                      {formatUSD(parseInt(purchaseAmount) || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <CRDButton
                variant="orange"
                size="lg"
                className="w-full"
                onClick={handlePurchaseCRD}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Purchase with Card
              </CRDButton>

              <div className="text-xs text-crd-text-muted text-center">
                Secure payment processed by Stripe
              </div>
            </div>
          </CRDCard>
        </div>
      )}
    </div>
  );
};