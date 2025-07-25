import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Shield,
  BarChart3,
  Settings,
  Flag,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlatformMetrics } from './PlatformMetrics';
import { ContentModerationPanel } from './ContentModerationPanel';
import { PlatformSettings } from './PlatformSettings';
import { useSidebar, Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface DashboardStats {
  dailyActiveUsers: number;
  cardsCreated: number;
  salesVolume: number;
  totalUsers: number;
  flaggedContent: number;
}

interface UserRole {
  role: 'admin' | 'moderator' | 'creator' | 'user';
}

const AdminSidebar = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => {
  const { state } = useSidebar();
  
  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'moderation', label: 'Moderation', icon: Flag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-crd-black border-r border-crd-border">
      <div className="p-4 border-b border-crd-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-crd-orange to-red-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          {state === 'expanded' && (
            <div>
              <h2 className="text-lg font-bold text-crd-white">CRD Dugout</h2>
              <p className="text-xs text-crd-lightGray">Admin Center</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mb-1",
              activeTab === item.id 
                ? "bg-crd-orange/20 text-crd-orange" 
                : "text-crd-lightGray hover:bg-crd-surface hover:text-crd-white"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {state === 'expanded' && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    dailyActiveUsers: 0,
    cardsCreated: 0,
    salesVolume: 0,
    totalUsers: 0,
    flaggedContent: 0
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        await loadDashboardData();
      } else {
        // Fallback for development
        if (user.email === 'admin@cardshow.com' || process.env.NODE_ENV === 'development') {
          setUserRole({ role: 'admin' });
          await loadDashboardData();
        }
      }
    } catch (error) {
      console.error('Admin access check failed:', error);
      toast.error('Failed to verify admin access');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Load platform metrics
      const { data: metrics } = await supabase
        .from('platform_analytics')
        .select('*')
        .eq('metric_date', today);

      // Count flagged content (mock for now)
      const flaggedCount = 0;

      if (metrics) {
        setStats({
          dailyActiveUsers: metrics.find(m => m.metric_name === 'daily_active_users')?.metric_value || 0,
          cardsCreated: metrics.find(m => m.metric_name === 'cards_created')?.metric_value || 0,
          salesVolume: metrics.find(m => m.metric_name === 'sales_volume')?.metric_value || 0,
          totalUsers: metrics.find(m => m.metric_name === 'total_users')?.metric_value || 0,
          flaggedContent: flaggedCount
        });
      }
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-crd-darkest flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crd-orange mx-auto" />
          <p className="text-crd-lightGray">Loading CRD Dugout...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-crd-darkest flex items-center justify-center">
        <Card className="max-w-md bg-crd-black border-crd-border">
          <CardContent className="p-8 text-center space-y-4">
            <Shield className="w-16 h-16 text-crd-lightGray mx-auto" />
            <h2 className="text-2xl font-bold text-crd-white">Access Denied</h2>
            <p className="text-crd-lightGray">
              You need admin or moderator privileges to access the CRD Dugout.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <PlatformMetrics stats={stats} userRole={userRole} />;
      case 'moderation':
        return <ContentModerationPanel userRole={userRole} />;
      case 'settings':
        return <PlatformSettings userRole={userRole} />;
      default:
        return <PlatformMetrics stats={stats} userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-crd-darkest">
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full">
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-crd-black border-crd-border text-crd-white"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar className="w-64 border-r border-crd-border">
              <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </Sidebar>
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
              <div className="w-64 h-full bg-crd-black" onClick={(e) => e.stopPropagation()}>
                <AdminSidebar activeTab={activeTab} onTabChange={(tab) => {
                  setActiveTab(tab);
                  setSidebarOpen(false);
                }} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {/* Header */}
            <div className="bg-crd-black/80 backdrop-blur-sm border-b border-crd-border sticky top-0 z-30">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="lg:hidden w-8" /> {/* Spacer for mobile menu button */}
                    <div>
                      <h1 className="text-2xl font-bold text-crd-white">CRD Dugout</h1>
                      <p className="text-crd-lightGray text-sm capitalize">{userRole.role} Dashboard</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {stats.flaggedContent > 0 && (
                      <Badge variant="destructive" className="bg-red-500/20 text-red-400">
                        <Bell className="w-3 h-3 mr-1" />
                        {stats.flaggedContent} flagged
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-crd-green/20 text-crd-green">
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
      </SidebarProvider>
    </div>
  );
};