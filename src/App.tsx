
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
import CreatorDashboardPage from './pages/CreatorDashboardPage';
import CommunityHubPage from './pages/CommunityHubPage';
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
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <SignIn />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/auth/signup" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <SignUp />
                    </ProtectedRoute>
                  } 
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
                      <ProtectedRoute>
                        <CardCreation />
                      </ProtectedRoute>
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/create/enhanced" 
                  element={
                    <MainLayout>
                      <ProtectedRoute>
                        <EnhancedCardCreationPage />
                      </ProtectedRoute>
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/create/functional" 
                  element={
                    <MainLayout>
                      <ProtectedRoute>
                        <FunctionalCardCreationPage />
                      </ProtectedRoute>
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/studio" 
                  element={
                    <ProtectedRoute>
                      <StudioPage />
                    </ProtectedRoute>
                  } 
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
                      <ProtectedRoute>
                        <CreatorDashboardPage />
                      </ProtectedRoute>
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
                
                {/* Admin routes */}
                <Route 
                  path="/admin" 
                  element={
                    <MainLayout>
                      <ProtectedRoute>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    </MainLayout>
                  } 
                />
                
                {/* Debug/Development routes */}
                <Route 
                  path="/debug/psd-preview" 
                  element={
                    <MainLayout>
                      <ProtectedRoute>
                        <SimplePSDAnalysisPage />
                      </ProtectedRoute>
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/debug/psd-preview-advanced" 
                  element={
                    <MainLayout>
                      <ProtectedRoute>
                        <PSDPreviewPage />
                      </ProtectedRoute>
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/debug/bulk-psd-analysis" 
                  element={
                    <MainLayout>
                      <ProtectedRoute>
                        <BulkPSDAnalysisPage />
                      </ProtectedRoute>
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/debug" 
                  element={
                    <MainLayout>
                      <ProtectedRoute>
                        <Debug />
                      </ProtectedRoute>
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
