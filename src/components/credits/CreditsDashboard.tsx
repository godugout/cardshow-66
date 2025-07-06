import React, { useState } from 'react';
import { CreditBalance } from './CreditBalance';
import { CreditTransactions } from './CreditTransactions';
import { CreditPurchaseModal } from './CreditPurchaseModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Coins, 
  TrendingUp, 
  Calendar,
  Info,
  Gift,
  Star
} from 'lucide-react';

export const CreditsDashboard: React.FC = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Coins className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Credits Center</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your credits, view transaction history, and unlock premium features
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance and Purchase */}
        <div className="space-y-6">
          <CreditBalance 
            onPurchaseClick={() => setShowPurchaseModal(true)} 
          />
          
          {/* Earning Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Earn Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Create a Card</span>
                  <Badge variant="secondary">+10 credits</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Earn credits for each card you create and publish
                </p>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Daily Login</span>
                  <Badge variant="secondary">+5 credits</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get bonus credits for logging in daily
                </p>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Get Followed</span>
                  <Badge variant="secondary">+25 credits</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Earn credits when someone follows your profile
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Credit Usage Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Credit Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Basic Template</span>
                <Badge variant="outline">Free</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Premium Template</span>
                <Badge variant="outline">50-200</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Visual Effects</span>
                <Badge variant="outline">25-100</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Premium Cases</span>
                <Badge variant="outline">100-300</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2">
          <CreditTransactions />
        </div>
      </div>

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal 
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
      />
    </div>
  );
};