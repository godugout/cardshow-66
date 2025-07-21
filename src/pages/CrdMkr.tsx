import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CardCreationInterface } from '@/components/cardmaker/CardCreationInterface';
import { CreatorOnboardingFlow } from '@/components/creator/CreatorOnboardingFlow';
import { OverlayProvider } from '@/components/overlay/OverlayProvider';
import { AdvancedStudioProvider } from '@/contexts/AdvancedStudioContext';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';
import { Plus, Sparkles, ArrowRight, User, Palette } from 'lucide-react';
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
                <h1 className="text-4xl font-bold text-crd-text mb-2 font-display">
                  CRDMKR Studio
                </h1>
                <p className="text-crd-text-dim">
                  Professional PSD-to-Frame conversion and card creation tools
                </p>
              </div>
              <Link to="/profile">
                <CRDButton variant="ghost">
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </CRDButton>
              </Link>
            </div>

            {/* Creator Tools Quick Access */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Link to="/crdmkr/frame-builder">
                <CRDCard hover="lift" className="p-6 border-crd-orange/20 hover:border-crd-orange">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-crd-orange to-crd-yellow rounded-xl flex items-center justify-center">
                      <Palette className="w-6 h-6 text-crd-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-crd-text mb-1">Frame Builder</h3>
                      <p className="text-sm text-crd-text-dim">Convert PSD files into professional frame templates</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-crd-orange" />
                  </div>
                </CRDCard>
              </Link>
              
              <Link to="/create">
                <CRDCard hover="lift" className="p-6 border-crd-green/20 hover:border-crd-green">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-crd-green to-crd-blue rounded-xl flex items-center justify-center">
                      <Plus className="w-6 h-6 text-crd-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-crd-text mb-1">Card Creator</h3>
                      <p className="text-sm text-crd-text-dim">Create cards using frames and templates</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-crd-green" />
                  </div>
                </CRDCard>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <CRDCard padding="sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-crd-green font-display">0</div>
                  <div className="text-sm text-crd-text-dim">Cards Created</div>
                </div>
              </CRDCard>
              <CRDCard padding="sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-crd-blue font-display">Level 1</div>
                  <div className="text-sm text-crd-text-dim">Creator Level</div>
                </div>
              </CRDCard>
              <CRDCard padding="sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-crd-orange font-display">100</div>
                  <div className="text-sm text-crd-text-dim">Credits</div>
                </div>
              </CRDCard>
            </div>

            {isNewCreator && (
              <CRDCard className="border-crd-green/20 bg-crd-green/5 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-crd-green/20 rounded-full">
                    <Sparkles className="w-6 h-6 text-crd-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-crd-text mb-1">Welcome to CRDMKR!</h3>
                    <p className="text-sm text-crd-text-dim">
                      Get personalized templates and tools by completing a quick setup
                    </p>
                  </div>
                  <CRDButton onClick={handleStartCreating} variant="success">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </CRDButton>
                </div>
              </CRDCard>
            )}
          </div>

          {/* Main Creation Interface */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-crd-text font-display">Create New Card</h2>
              {hasCompletedOnboarding && (
                <CRDButton variant="ghost" size="sm" onClick={() => setShowOnboarding(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Personalize Tools
                </CRDButton>
              )}
            </div>
            
            <AdvancedStudioProvider>
              <OverlayProvider>
                <CardCreationInterface />
              </OverlayProvider>
            </AdvancedStudioProvider>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}