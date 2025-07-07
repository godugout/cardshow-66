import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star } from 'lucide-react';

// Stripe Price IDs - Replace with your actual Stripe price IDs
const STRIPE_PRICES = {
  creator: 'price_creator_monthly', // Replace with actual price ID
  pro: 'price_pro_monthly' // Replace with actual price ID
};

export const SubscriptionPlans: React.FC = () => {
  const { subscription, createCheckout, loading } = useSubscription();

  const plans = [
    {
      name: 'Free',
      tier: 'free' as const,
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      icon: <Star className="h-6 w-6" />,
      features: [
        '5 cards per month',
        'Basic templates',
        'Standard effects',
        'Community access'
      ],
      limitations: [
        'Limited monthly cards',
        'Basic templates only'
      ]
    },
    {
      name: 'Creator',
      tier: 'creator' as const,
      price: '$9',
      period: 'month',
      description: 'For serious card creators',
      icon: <Zap className="h-6 w-6" />,
      popular: true,
      features: [
        'Unlimited cards',
        'All premium templates',
        'Advanced effects',
        'Marketplace access',
        'Priority support'
      ],
      priceId: STRIPE_PRICES.creator
    },
    {
      name: 'Pro',
      tier: 'pro' as const,
      price: '$29',
      period: 'month',
      description: 'Maximum creative power',
      icon: <Crown className="h-6 w-6" />,
      features: [
        'Everything in Creator',
        'Advanced 3D effects',
        'Analytics dashboard',
        'White-label options',
        'API access',
        'Premium support'
      ],
      priceId: STRIPE_PRICES.pro
    }
  ];

  const handleSubscribe = (tier: 'creator' | 'pro', priceId: string) => {
    createCheckout(priceId, tier);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const isCurrentPlan = subscription.subscription_tier === plan.tier;
        const isFreePlan = plan.tier === 'free';
        
        return (
          <Card 
            key={plan.tier}
            className={`relative ${plan.popular ? 'border-primary' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-2">
                {plan.icon}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limitations for free plan */}
              {plan.limitations && (
                <div className="space-y-2 pt-2 border-t">
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-2 opacity-60">
                      <span className="text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4">
                {isCurrentPlan ? (
                  <Button className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : isFreePlan ? (
                  <Button variant="outline" className="w-full" disabled>
                    Always Free
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe(plan.tier, plan.priceId!)}
                    disabled={loading}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Subscribe to {plan.name}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};