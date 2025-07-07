import React, { useState } from 'react';
import { CreditBalance } from '@/components/credits/CreditBalance';
import { CreditPurchaseModal } from '@/components/credits/CreditPurchaseModal';
import { CreditTransactions } from '@/components/credits/CreditTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Coins, 
  ShoppingCart,
  TrendingUp,
  Zap,
  Shield,
  Gift
} from 'lucide-react';

export default function CreditsPage() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Coins className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">CRD Tokens</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Power your creativity with CRD Tokens. Create premium cards, unlock exclusive content, and participate in the marketplace.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Balance and Purchase */}
        <div className="space-y-6">
          <CreditBalance onPurchaseClick={() => setShowPurchaseModal(true)} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Quick Purchase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowPurchaseModal(true)}
                className="w-full"
                size="lg"
              >
                Buy CRD Tokens
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Features */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Premium Creation</h4>
                  <p className="text-sm text-muted-foreground">
                    Access advanced effects and premium templates
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Marketplace Trading</h4>
                  <p className="text-sm text-muted-foreground">
                    Buy, sell, and bid on exclusive cards
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">No Expiration</h4>
                  <p className="text-sm text-muted-foreground">
                    Your tokens never expire, use them anytime
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Gift className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Bonus Rewards</h4>
                  <p className="text-sm text-muted-foreground">
                    Earn extra tokens through community activities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Transaction History */}
        <div className="space-y-6">
          <CreditTransactions />
        </div>
      </div>

      {/* Purchase Modal */}
      <CreditPurchaseModal 
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
      />
    </div>
  );
}