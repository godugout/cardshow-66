import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Menu, X, Shield, Activity, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminSidebar } from './AdminSidebar';
import { PlatformMetrics } from './PlatformMetrics';
import { ContentModerationPanel } from './ContentModerationPanel';
import { PlatformSettings } from './PlatformSettings';
import { cn } from '@/lib/utils';

interface UserRole {
  role: 'admin' | 'moderator' | 'creator' | 'user';
}

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activePanel, setActivePanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [flaggedContent] = useState(0); // Mock flagged content count

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for admin role in user_roles table
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator']);

      if (roles && roles.length > 0) {
        setUserRole({ role: roles[0].role as 'admin' | 'moderator' });
      } else {
        // Fallback for development
        if (user.email === 'admin@cardshow.com' || process.env.NODE_ENV === 'development') {
          setUserRole({ role: 'admin' });
        }
      }
    } catch (error) {
      console.error('Admin access check failed:', error);
      toast.error('Failed to verify admin access');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
          <p className="text-muted-foreground">Loading CRD Dugout...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground">
              You need admin or moderator privileges to access the CRD Dugout.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (activePanel) {
      case 'dashboard':
        return <PlatformMetrics />;
      case 'content-moderation':
        return <ContentModerationPanel userRole={userRole} />;
      case 'user-management':
        return <div className="p-6 text-center text-muted-foreground">User Management Panel - Coming Soon</div>;
      case 'platform-settings':
        return <PlatformSettings userRole={userRole} />;
      default:
        return <PlatformMetrics />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen w-full">
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar activePanel={activePanel} onSelectPanel={setActivePanel} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <AdminSidebar 
                activePanel={activePanel} 
                onSelectPanel={(panel) => {
                  setActivePanel(panel);
                  setSidebarOpen(false);
                }} 
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="lg:hidden w-8" /> {/* Spacer for mobile menu button */}
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">CRD Dugout</h1>
                    <p className="text-muted-foreground text-sm capitalize">{userRole.role} Dashboard</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {flaggedContent > 0 && (
                    <Badge variant="destructive">
                      <Bell className="w-3 h-3 mr-1" />
                      {flaggedContent} flagged
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    <Activity className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};