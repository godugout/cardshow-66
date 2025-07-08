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
      <Card className="border-editor-border bg-editor-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Migration
          </CardTitle>
          <CardDescription>
            Safely switch between mock and real Supabase authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Current Status */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              Current Status
              {isMockUser ? (
                <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                  Mock Auth
                </Badge>
              ) : (
                <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                  Real Auth
                </Badge>
              )}
            </h3>
            
            <div className="bg-editor-darker p-3 rounded-lg border border-editor-border">
              <div className="text-sm space-y-1">
                <div><strong>User ID:</strong> {user?.id || 'None'}</div>
                <div><strong>Email:</strong> {user?.email || 'None'}</div>
                <div><strong>Auth Type:</strong> {isMockUser ? 'Mock/Development' : 'Real Supabase'}</div>
                <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          {/* Feature Flag Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-editor-border bg-editor-darker">
            <div className="space-y-1">
              <h4 className="font-medium">Enable Real Authentication</h4>
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
          <div className="space-y-3">
            <h3 className="font-medium">Migration Safety Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-editor-darker p-3 rounded-lg border border-editor-border">
                <div className="font-medium text-green-400 mb-1">✓ Preserved Features</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• User profiles & subscriptions</li>
                  <li>• Card creation & ownership</li>
                  <li>• Trading system</li>
                  <li>• Marketplace purchases</li>
                </ul>
              </div>
              <div className="bg-editor-darker p-3 rounded-lg border border-editor-border">
                <div className="font-medium text-blue-400 mb-1">⚡ Safety Measures</div>
                <ul className="space-y-1 text-muted-foreground">
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