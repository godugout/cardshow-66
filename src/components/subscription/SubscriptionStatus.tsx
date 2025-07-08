import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Crown, 
  Zap, 
  Star, 
  Calendar,
  Settings,
  RefreshCw
} from 'lucide-react';

export const SubscriptionStatus: React.FC = () => {
  const { subscription, loading, checkSubscription, openCustomerPortal } = useSubscription();

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'pro':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'creator':
        return <Zap className="h-5 w-5 text-primary" />;
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'Pro';
      case 'creator':
        return 'Creator';
      default:
        return 'Free';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'creator':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Current Subscription
          <Button
            variant="ghost"
            size="sm"
            onClick={checkSubscription}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Plan */}
        <div className="flex items-center gap-3">
          {getTierIcon(subscription.subscription_tier)}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {getTierName(subscription.subscription_tier)} Plan
              </span>
              <Badge className={getTierColor(subscription.subscription_tier)}>
                {subscription.subscribed ? 'Active' : 'Free'}
              </Badge>
            </div>
            {subscription.subscription_end && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Renews {new Date(subscription.subscription_end).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Plan Features */}
        <div className="text-sm text-muted-foreground">
          {subscription.subscription_tier === 'free' && (
            <p>5 cards per month • Basic templates • Community access</p>
          )}
          {subscription.subscription_tier === 'collector' && (
            <p>25 cards per month • Premium templates • Marketplace access</p>
          )}
          {subscription.subscription_tier === 'crafter' && (
            <p>100 cards per month • All templates • Marketplace selling</p>
          )}
          {subscription.subscription_tier === 'pro' && (
            <p>All features • Advanced effects • Analytics • API access</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {subscription.subscribed && (
            <Button
              variant="outline"
              size="sm"
              onClick={openCustomerPortal}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Manage Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};