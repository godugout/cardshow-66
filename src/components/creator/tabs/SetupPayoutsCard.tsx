import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SetupPayoutsCardProps {
  onSetupComplete: () => void;
}

export const SetupPayoutsCard: React.FC<SetupPayoutsCardProps> = ({ onSetupComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStripeConnect = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding');
      
      if (error) {
        throw new Error(error.message);
      }

      if (data.url) {
        // Open Stripe onboarding in new window
        const stripeWindow = window.open(data.url, '_blank', 'width=800,height=600');
        
        // Optional: Listen for window close to refresh data
        const checkClosed = setInterval(() => {
          if (stripeWindow?.closed) {
            clearInterval(checkClosed);
            onSetupComplete();
          }
        }, 1000);
      }
    } catch (error) {
      toast({
        title: 'Setup Failed',
        description: error instanceof Error ? error.message : 'Failed to start Stripe Connect setup',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-crd-orange/20 bg-crd-orange/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-crd-orange" />
          Connect with Stripe
        </CardTitle>
        <CardDescription>
          Set up payouts to start receiving your earnings directly to your bank account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to connect a Stripe account to receive payouts. This is a secure, one-time setup process that takes just a few minutes.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <div className="text-sm space-y-2">
            <p className="font-medium">What you'll need:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Bank account information</li>
              <li>Social Security Number or Tax ID</li>
              <li>Valid government-issued ID</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleStripeConnect} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isLoading ? 'Setting up...' : 'Connect with Stripe'}
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};