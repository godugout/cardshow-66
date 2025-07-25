// Stable Sign In Page - Beta Baseline
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useCRDData } from '@/services/crdDataService';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';
import { CRDInput } from '@/components/ui/design-system/atoms/CRDInput';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const StableSignIn: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, loading, signIn, signUp } = useCRDData();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-crd-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-crd-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSignUp && !username) {
      toast.error('Username is required for sign up');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, username);
        if (!error) {
          toast.success('Account created! Check your email to verify.');
          setIsSignUp(false);
          setPassword('');
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          // Navigation will happen via useEffect
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-crd-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-crd-orange to-crd-yellow rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-crd-black">C</span>
          </div>
          <h1 className="text-3xl font-bold text-crd-text">Welcome to Cardshow</h1>
          <p className="text-crd-text-dim mt-2">
            {isSignUp ? 'Create your creator account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Auth Form */}
        <CRDCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-crd-text mb-2">
                  Username
                </label>
                <CRDInput
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-crd-text mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-crd-text-muted" />
                <CRDInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-11"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-crd-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-crd-text-muted" />
                <CRDInput
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-11 pr-11"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-crd-text-muted hover:text-crd-text"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <CRDButton
              type="submit"
              variant="orange"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-crd-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </CRDButton>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword('');
                setUsername('');
              }}
              className="text-crd-orange hover:text-crd-yellow transition-colors text-sm"
              disabled={isLoading}
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </CRDCard>

        {/* Beta Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-crd-text-muted">
            Cardshow Beta • Create, Collect, Share Digital Cards
          </p>
        </div>
      </div>
    </div>
  );
};