import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { Card } from '@/components/ui/card';

const SubscriptionPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-editor-darker">
        <div className="container mx-auto px-4 py-8 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-editor-text">Choose Your Plan</h1>
            <p className="text-xl text-editor-text-muted max-w-2xl mx-auto">
              Unlock the full potential of CRD with our flexible pricing plans
            </p>
          </div>

          {/* Current Subscription Status */}
          <Card className="bg-editor-dark border-editor-border p-6">
            <SubscriptionStatus />
          </Card>

          {/* Pricing Plans */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-editor-text">
              Available Plans
            </h2>
            <SubscriptionPlans />
          </div>

          {/* Features Comparison */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-editor-text">
              What's Included
            </h2>
            <div className="bg-editor-dark border border-editor-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div>
                  <h3 className="font-semibold text-editor-text mb-3">Free</h3>
                  <ul className="space-y-2 text-editor-text-muted">
                    <li>• 5 cards per month</li>
                    <li>• Basic templates</li>
                    <li>• Community access</li>
                    <li>• Standard effects</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-3">Collector ($2.99)</h3>
                  <ul className="space-y-2 text-editor-text-muted">
                    <li>• 25 cards per month</li>
                    <li>• Premium templates</li>
                    <li>• Advanced effects</li>
                    <li>• Marketplace access</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-3">Crafter ($5.99)</h3>
                  <ul className="space-y-2 text-editor-text-muted">
                    <li>• 100 cards per month</li>
                    <li>• All templates</li>
                    <li>• Professional effects</li>
                    <li>• Marketplace selling</li>
                    <li>• Analytics dashboard</li>
                    <li>• Custom frames</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-3">Pro ($9.99)</h3>
                  <ul className="space-y-2 text-editor-text-muted">
                    <li>• Unlimited cards</li>
                    <li>• All premium features</li>
                    <li>• API access</li>
                    <li>• White-label options</li>
                    <li>• Advanced analytics</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default SubscriptionPage;