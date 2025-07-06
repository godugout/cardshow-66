
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
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
import CommunityHubPage from './pages/CommunityHubPage';
import CreatorsHubPage from './pages/CreatorsHub';
import PSDPreviewPage from './pages/PSDPreviewPage';
import SimplePSDAnalysisPage from './pages/SimplePSDAnalysisPage';
import BulkPSDAnalysisPage from "./pages/BulkPSDAnalysisPage";
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
                      <CommunityHubPage />
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/creators" 
                  element={
                    <MainLayout>
                      <CreatorsHubPage />
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
