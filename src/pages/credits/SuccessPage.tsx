import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Coins, ArrowRight } from 'lucide-react';

export default function CreditsSuccessPage() {
  const { refreshBalance } = useCredits();

  useEffect(() => {
    // Refresh balance when user lands on success page
    const timer = setTimeout(() => {
      refreshBalance();
    }, 2000);

    return () => clearTimeout(timer);
  }, [refreshBalance]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              Purchase Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Coins className="h-5 w-5" />
                <span className="font-medium">CRD Tokens Added</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your tokens have been added to your account and are ready to use!
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/create">
                  Start Creating Cards
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link to="/credits">
                  View Credit Balance
                </Link>
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              It may take a few minutes for your balance to update
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}