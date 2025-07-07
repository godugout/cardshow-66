import React from 'react';
import { useCredits } from '@/hooks/useCredits';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Zap, Crown, Star, Sparkles } from 'lucide-react';

interface CreditPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CREDIT_PACKAGES = [
  {
    id: 'small',
    name: '100 CRD Tokens',
    credits: 100,
    price: '$9.99',
    icon: <Coins className="h-6 w-6" />,
    description: 'Perfect for getting started'
  },
  {
    id: 'medium',
    name: '500 CRD Tokens',
    credits: 500,
    price: '$39.99',
    icon: <Zap className="h-6 w-6" />,
    description: 'Great value for regular creators',
    bonus: '20% Bonus',
    popular: true
  },
  {
    id: 'large',
    name: '1200 CRD Tokens',
    credits: 1200,
    price: '$79.99',
    icon: <Star className="h-6 w-6" />,
    description: 'Best for power users',
    bonus: '50% Bonus'
  },
  {
    id: 'mega',
    name: '2500 CRD Tokens',
    credits: 2500,
    price: '$149.99',
    icon: <Crown className="h-6 w-6" />,
    description: 'Maximum value pack',
    bonus: '67% Bonus'
  }
];

export const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { purchaseCredits } = useCredits();

  const handlePurchase = (packageId: string) => {
    purchaseCredits(packageId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Buy CRD Tokens
          </DialogTitle>
          <DialogDescription>
            Choose a token package to power your card creation and marketplace activities.
            Unused tokens never expire!
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`relative ${pkg.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-2">
                  {pkg.icon}
                </div>
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-bold">{pkg.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
                {pkg.bonus && (
                  <Badge variant="secondary" className="text-xs">
                    {pkg.bonus}
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-xl font-semibold text-primary">
                    {pkg.credits.toLocaleString()} Tokens
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ≈ ${(pkg.credits * 0.10).toFixed(0)} value per token
                  </div>
                </div>

                <Button 
                  onClick={() => handlePurchase(pkg.id)}
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                >
                  Purchase Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">What can you do with CRD Tokens?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Create premium cards with advanced effects</li>
            <li>• Purchase templates from the marketplace</li>
            <li>• Unlock exclusive frames and designs</li>
            <li>• Trade and bid on rare cards</li>
            <li>• Access premium features and tools</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};