import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, CheckCircle, Shield, Users } from 'lucide-react';

export const AuthMigrationPanel: React.FC = () => {
  const { featureFlags, updateFeatureFlag, isLoading } = useFeatureFlags();
  const { user, session, loading } = useAuth();
  
  const realAuthEnabled = featureFlags.REAL_AUTH;
  const isMockUser = user?.id === '00000000-0000-0000-0000-000000000001';

  const handleToggleRealAuth = () => {
    const newValue = !realAuthEnabled;
    updateFeatureFlag('REAL_AUTH', newValue);
    
    if (newValue) {
      // When enabling real auth, user will be logged out
      window.location.reload();
    }
  };

  if (isLoading) {
    return <div>Loading authentication settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
            <Shield className="h-5 w-5" />
            Authentication Migration
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Safely switch between mock and real Supabase authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          
          {/* Current Status */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-foreground">
              Current Status
              {isMockUser ? (
                <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 font-medium">
                  Mock Auth
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 font-medium">
                  Real Auth
                </Badge>
              )}
            </h3>
            
            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <div className="text-sm space-y-2 font-medium">
                <div className="text-foreground"><strong>User ID:</strong> <span className="text-muted-foreground font-mono text-xs">{user?.id || 'None'}</span></div>
                <div className="text-foreground"><strong>Email:</strong> <span className="text-muted-foreground">{user?.email || 'None'}</span></div>
                <div className="text-foreground"><strong>Auth Type:</strong> <span className="text-muted-foreground">{isMockUser ? 'Mock/Development' : 'Real Supabase'}</span></div>
                <div className="text-foreground"><strong>Loading:</strong> <span className="text-muted-foreground">{loading ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
          </div>

          {/* Feature Flag Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground">Enable Real Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Switch from mock authentication to real Supabase auth
              </p>
            </div>
            <Switch
              checked={realAuthEnabled}
              onCheckedChange={handleToggleRealAuth}
            />
          </div>

          {/* Warnings and Information */}
          {!realAuthEnabled && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Mock Authentication Active:</strong> You're using development authentication. 
                All users share the same mock profile. Switch to real auth for production use.
              </AlertDescription>
            </Alert>
          )}

          {realAuthEnabled && !user && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                <strong>Real Authentication Enabled:</strong> You need to sign in with real credentials. 
                Use the sign in/sign up forms to authenticate.
              </AlertDescription>
            </Alert>
          )}

          {realAuthEnabled && user && !isMockUser && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Real Authentication Active:</strong> You're successfully authenticated with Supabase. 
                All your actions are now linked to your real user account.
              </AlertDescription>
            </Alert>
          )}

          {/* Migration Safety Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Migration Safety Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <div className="font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                  ✓ Preserved Features
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• User profiles & subscriptions</li>
                  <li>• Card creation & ownership</li>
                  <li>• Trading system</li>
                  <li>• Marketplace purchases</li>
                </ul>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <div className="font-semibold text-blue-600 mb-2 flex items-center gap-1">
                  ⚡ Safety Measures
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Feature flag controlled</li>
                  <li>• Adapter pattern compatibility</li>
                  <li>• Gradual migration support</li>
                  <li>• Rollback capability</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            {realAuthEnabled && !user && (
              <>
                <Button 
                  onClick={() => window.location.href = '/auth/signin'}
                  size="sm"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => window.location.href = '/auth/signup'}
                  variant="outline"
                  size="sm"
                >
                  Sign Up
                </Button>
              </>
            )}
            {!realAuthEnabled && (
              <Button 
                onClick={() => updateFeatureFlag('REAL_AUTH', true)}
                size="sm"
              >
                Enable Real Auth
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};