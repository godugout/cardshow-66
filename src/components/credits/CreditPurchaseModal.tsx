import React, { useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useCredits } from '@/hooks/useCredits';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Star, Zap, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus: number;
  popular?: boolean;
  icon: React.ReactNode;
  description: string;
}

interface CreditPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 4.99,
    bonus: 0,
    icon: <Coins className="h-6 w-6" />,
    description: 'Perfect for getting started'
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 500,
    price: 19.99,
    bonus: 50,
    popular: true,
    icon: <Star className="h-6 w-6" />,
    description: 'Most popular choice'
  },
  {
    id: 'value',
    name: 'Value Pack',
    credits: 1000,
    price: 34.99,
    bonus: 150,
    icon: <Zap className="h-6 w-6" />,
    description: 'Best value for money'
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    credits: 2500,
    price: 79.99,
    bonus: 500,
    icon: <Crown className="h-6 w-6" />,
    description: 'For serious creators'
  }
];

export const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useUser();
  const { earnCredits } = useCredits();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (pkg: CreditPackage) => {
    if (!user?.id) {
      toast.error('Please sign in to purchase credits');
      return;
    }

    setPurchasing(pkg.id);

    try {
      // TODO: Integrate with Stripe or payment processor
      // For now, simulate successful purchase for demo
      const totalCredits = pkg.credits + pkg.bonus;
      
      const success = await earnCredits(
        totalCredits,
        `Purchased ${pkg.name}`,
        'purchase',
        pkg.id,
        'credit_package'
      );

      if (success) {
        toast.success(`Successfully purchased ${totalCredits} credits!`);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package to unlock premium templates, effects, and features
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {creditPackages.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                pkg.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {pkg.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {pkg.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Credits:</span>
                    <span className="font-medium text-foreground">
                      {pkg.credits.toLocaleString()}
                    </span>
                  </div>
                  
                  {pkg.bonus > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bonus:</span>
                      <span className="font-medium text-green-600">
                        +{pkg.bonus.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="font-bold text-lg text-primary">
                      {(pkg.credits + pkg.bonus).toLocaleString()} credits
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-foreground">
                      ${pkg.price}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">USD</span>
                  </div>
                  
                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchasing === pkg.id}
                    className="w-full"
                    size="lg"
                  >
                    {purchasing === pkg.id ? 'Processing...' : 'Purchase Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">What can you do with credits?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Unlock premium card templates (50-200 credits)</li>
            <li>• Apply advanced visual effects (25-100 credits)</li>
            <li>• Access exclusive case designs (100-300 credits)</li>
            <li>• Purchase creator-made templates from the marketplace</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};