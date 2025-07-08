
import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
const EnhancedSignIn = React.lazy(() => import('./pages/auth/EnhancedSignIn'));
import Index from "./pages/Index";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import AuthCallback from "./pages/auth/AuthCallback";
import CardCreation from "./pages/CardCreation";
import EnhancedCardCreationPage from "./pages/EnhancedCardCreationPage";
import FunctionalCardCreationPage from "./pages/FunctionalCardCreationPage";
import StudioPage from "@/pages/studio";
import Collections from './pages/Collections';
import { UnifiedCreationFlow } from './components/creation/UnifiedCreationFlow';
import CreatorDashboardPage from './pages/CreatorDashboardPage';
import CommunityPage from './pages/CommunityPage';
import CreatorProfilePage from './pages/CreatorProfile';
import CreditsDashboardPage from './pages/CreditsDashboard';
import { Trading } from './pages/Trading';
import CreditsPage from './pages/CreditsPage';
import CreditsSuccessPage from './pages/credits/SuccessPage';
import SubscriptionPage from './pages/SubscriptionPage';
import PSDPreviewPage from './pages/PSDPreviewPage';
import SimplePSDAnalysisPage from './pages/SimplePSDAnalysisPage';
import BulkPSDAnalysisPage from "./pages/BulkPSDAnalysisPage";
import MarketplacePage from './pages/Marketplace';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFound from './pages/NotFound';
import Debug from "./pages/Debug";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className="min-h-screen">
              <Toaster />
              <Routes>
                {/* Auth routes - no navbar */}
                <Route 
                  path="/auth/signin" 
                  element={<SignIn />} 
                />
                <Route 
                  path="/auth/enhanced-signin" 
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <EnhancedSignIn />
                    </React.Suspense>
                  } 
                />
                <Route 
                  path="/auth/signup" 
                  element={<SignUp />} 
                />
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                {/* Main routes - with universal navbar */}
                <Route 
                  path="/" 
                  element={
                    <MainLayout>
                      <Index />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/create" 
                  element={
                    <MainLayout>
                      <UnifiedCreationFlow />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/create/enhanced" 
                  element={
                    <MainLayout>
                      <EnhancedCardCreationPage />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/create/functional" 
                  element={
                    <MainLayout>
                      <FunctionalCardCreationPage />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/studio" 
                  element={<StudioPage />} 
                />
                <Route 
                  path="/collections" 
                  element={
                    <MainLayout>
                      <Collections />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/creator-dashboard" 
                  element={
                    <MainLayout>
                      <CreatorDashboardPage />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/community" 
                  element={
                    <MainLayout>
                      <CommunityPage />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/creators/:id" 
                  element={
                    <MainLayout>
                      <CreatorProfilePage />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/credits"
                  element={
                    <MainLayout>
                      <CreditsPage />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/credits/success" 
                  element={
                    <MainLayout>
                      <CreditsSuccessPage />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/subscription" 
                  element={
                    <MainLayout>
                      <SubscriptionPage />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/trading" 
                  element={
                    <MainLayout>
                      <Trading />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/marketplace" 
                  element={
                    <MainLayout>
                      <MarketplacePage />
                    </MainLayout>
                  } 
                />
                
                {/* Admin routes */}
                <Route 
                  path="/admin" 
                  element={
                    <MainLayout>
                      <AdminDashboardPage />
                    </MainLayout>
                  } 
                />
                
                {/* Debug/Development routes */}
                <Route 
                  path="/debug/psd-preview" 
                  element={
                    <MainLayout>
                      <SimplePSDAnalysisPage />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/debug/psd-preview-advanced" 
                  element={
                    <MainLayout>
                      <PSDPreviewPage />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/debug/bulk-psd-analysis" 
                  element={
                    <MainLayout>
                      <BulkPSDAnalysisPage />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/debug" 
                  element={
                    <MainLayout>
                      <Debug />
                    </MainLayout>
                  } 
                />
                
                {/* 404 catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
