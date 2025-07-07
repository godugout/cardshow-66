import React from 'react';
import { SubscriptionStatus } from './SubscriptionStatus';
import { SubscriptionPlans } from './SubscriptionPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Crown, 
  Zap,
  TrendingUp,
  Users,
  Palette,
  BarChart3
} from 'lucide-react';

export const SubscriptionDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Subscription Plans</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock premium features and take your card creation to the next level
        </p>
      </div>

      {/* Current Status */}
      <div className="max-w-md mx-auto">
        <SubscriptionStatus />
      </div>

      {/* Plans */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Choose Your Plan</h2>
        <SubscriptionPlans />
      </div>

      {/* Feature Comparison */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Why Upgrade?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center pb-4">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Unlimited Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Create as many cards as you want without monthly limits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-4">
              <Palette className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Premium Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Access exclusive templates and advanced visual effects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-4">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Marketplace Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Sell your templates and earn from your creativity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-4">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Track performance and optimize your card strategy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};