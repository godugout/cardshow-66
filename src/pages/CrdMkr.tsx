import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CardCreationInterface } from '@/components/cardmaker/CardCreationInterface';
import { CreatorOnboardingFlow } from '@/components/creator/CreatorOnboardingFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Sparkles, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CrdMkr() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check if user has completed onboarding (this would be stored in profile/user preferences)
  const isNewCreator = !hasCompletedOnboarding;

  const handleStartCreating = () => {
    if (isNewCreator) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = (preferences: any) => {
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
    // TODO: Save preferences to user profile
  };

  if (showOnboarding) {
    return (
      <ProtectedRoute>
        <CreatorOnboardingFlow 
          onComplete={handleOnboardingComplete}
          onSkip={() => setShowOnboarding(false)}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Card Maker Studio
                </h1>
                <p className="text-muted-foreground">
                  Create stunning digital trading cards with professional-grade tools
                </p>
              </div>
              <Link to="/profile">
                <Button variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-crd-green">0</div>
                  <div className="text-sm text-muted-foreground">Cards Created</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-crd-blue">Level 1</div>
                  <div className="text-sm text-muted-foreground">Creator Level</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-crd-orange">100</div>
                  <div className="text-sm text-muted-foreground">Credits</div>
                </CardContent>
              </Card>
            </div>

            {isNewCreator && (
              <Card className="border-crd-green/20 bg-crd-green/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-crd-green/20 rounded-full">
                      <Sparkles className="w-6 h-6 text-crd-green" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Welcome to CRD Maker!</h3>
                      <p className="text-sm text-muted-foreground">
                        Get personalized templates and tools by completing a quick setup
                      </p>
                    </div>
                    <Button onClick={handleStartCreating} className="bg-crd-green hover:bg-crd-green/90">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Creation Interface */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Create New Card</h2>
              {hasCompletedOnboarding && (
                <Button variant="outline" size="sm" onClick={() => setShowOnboarding(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Personalize Tools
                </Button>
              )}
            </div>
            
            <CardCreationInterface />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}