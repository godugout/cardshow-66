import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const EnhancedSignIn: React.FC = () => {
  const { signIn, signInWithOAuth, loading } = useAuth();
  const { isFeatureEnabled } = useFeatureFlags();
  const navigate = useNavigate();
  const location = useLocation();
  
  const realAuthEnabled = isFeatureEnabled('REAL_AUTH');
  const from = (location.state as any)?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.email) {
      newErrors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('Please enter a valid email address');
    }
    
    if (!formData.password) {
      newErrors.push('Password is required');
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setErrors([error.message]);
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'discord') => {
    if (!realAuthEnabled) {
      navigate(from, { replace: true });
      return;
    }

    try {
      const { error } = await signInWithOAuth(provider);
      if (error) {
        setErrors([error.message]);
      }
    } catch (error) {
      setErrors([`Failed to sign in with ${provider}. Please try again.`]);
    }
  };

  return (
    <div className="min-h-screen bg-editor-darker flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-editor-border bg-editor-dark">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <Badge className={realAuthEnabled ? 
              "bg-green-500/10 text-green-700 border-green-500/20" : 
              "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
            }>
              {realAuthEnabled ? 'Real Auth' : 'Mock Auth'}
            </Badge>
          </div>
          <CardDescription>
            {realAuthEnabled ? 
              'Sign in to your Cardshow account' : 
              'Development mode - any credentials will work'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Display */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Mock Auth Notice */}
          {!realAuthEnabled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Development Mode:</strong> You can use any email and password to sign in. 
                Real authentication is disabled.
              </AlertDescription>
            </Alert>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-editor-darker border-editor-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-editor-darker border-editor-border pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <LogIn className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* OAuth Options */}
          {realAuthEnabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">
                  Or continue with
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignIn('google')}
                    className="w-full"
                  >
                    Continue with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignIn('github')}
                    className="w-full"
                  >
                    Continue with GitHub
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Footer Links */}
          <Separator />
          <div className="flex flex-col space-y-2 text-sm text-center">
            <Link 
              to="/auth/signup" 
              className="text-primary hover:underline"
            >
              Don't have an account? Sign up
            </Link>
            {realAuthEnabled && (
              <Link 
                to="/auth/forgot-password" 
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                Forgot your password?
              </Link>
            )}
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSignIn;