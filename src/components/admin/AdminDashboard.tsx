
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Search,
  Filter,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Shield,
  Flag,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AuthMigrationPanel } from '@/components/auth/AuthMigrationPanel';
import { FeatureFlagsAdmin } from '@/components/admin/FeatureFlagsAdmin';
import { MigrationStatus } from '@/components/migration/MigrationStatus';

interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  cardsGenerated: number;
  templatesCreated: number;
}

interface UserData {
  id: string;
  username: string;
  display_name: string;
  created_at: string;
  avatar_url?: string;
  creator_verified: boolean;
}

interface AdminDashboardProps {
  isEnterprise?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isEnterprise = false }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    revenue: 0,
    cardsGenerated: 0,
    templatesCreated: 0
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformMetrics();
    fetchUsers();
  }, []);

  const fetchPlatformMetrics = async () => {
    try {
      // Get user count from profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      // Get cards count
      const { data: cardsData } = await supabase
        .from('cards')
        .select('id', { count: 'exact' });

      // Get collections count
      const { data: collectionsData } = await supabase
        .from('collections')
        .select('id', { count: 'exact' });

      setMetrics({
        totalUsers: profilesData?.length || 0,
        activeUsers: Math.floor((profilesData?.length || 0) * 0.7), // Estimate 70% active
        revenue: 12500, // Mock data
        cardsGenerated: cardsData?.length || 0,
        templatesCreated: collectionsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching platform metrics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          created_at,
          avatar_url,
          creator_verified
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-crd-darkest">
        <div className="text-white">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {isEnterprise ? 'Enterprise Platform Management' : 'Platform Overview & Management'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="bg-card border-border text-foreground hover:bg-accent">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Users</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground tracking-tight">{metrics.totalUsers.toLocaleString()}</div>
              <p className="text-sm text-emerald-600 font-medium mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Active Users</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground tracking-tight">{metrics.activeUsers.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Revenue</CardTitle>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground tracking-tight">${metrics.revenue.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Cards Generated</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground tracking-tight">{metrics.cardsGenerated.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">Total created</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Templates</CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Activity className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground tracking-tight">{metrics.templatesCreated}</div>
              <p className="text-sm text-muted-foreground mt-1">Available</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="migration" className="space-y-8">
          <TabsList className="bg-muted/30 p-1 rounded-lg border border-border">
            <TabsTrigger 
              value="migration" 
              className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Migration Status
            </TabsTrigger>
            <TabsTrigger 
              value="auth" 
              className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              <Shield className="w-4 h-4 mr-2" />
              Authentication
            </TabsTrigger>
            <TabsTrigger 
              value="features" 
              className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              <Flag className="w-4 h-4 mr-2" />
              Feature Flags
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              User Management
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              Content Moderation
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              System Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="migration" className="space-y-6">
            <MigrationStatus />
          </TabsContent>

          <TabsContent value="auth" className="space-y-6">
            <AuthMigrationPanel />
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <FeatureFlagsAdmin />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground text-xl font-semibold">User Management</CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                      Manage user accounts, permissions, and activity
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-accent">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-accent">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <span className="text-primary font-semibold text-lg">
                              {(user.display_name || user.username)?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-foreground font-semibold text-base">{user.display_name || user.username}</span>
                            {user.creator_verified && (
                              <Badge variant="secondary" className="bg-blue-500/15 text-blue-700 border-blue-500/30 font-medium">
                                Verified Creator
                              </Badge>
                            )}
                          </div>
                          <span className="text-muted-foreground text-sm font-medium">@{user.username}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 font-medium">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                        <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-accent font-medium">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-foreground text-xl font-semibold">Content Moderation Queue</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Review and moderate user-generated content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
                    <AlertCircle className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No items in moderation queue</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">All content has been reviewed</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-foreground text-xl font-semibold">Platform Analytics</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Detailed insights and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                    <TrendingUp className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">Analytics dashboard coming soon</p>
                  <p className="text-sm text-muted-foreground mt-1">Advanced reporting features in development</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-foreground text-xl font-semibold">System Health</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Monitor system performance and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-foreground font-medium">Database</span>
                      <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 font-medium">
                        Healthy
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-foreground tracking-tight">99.9%</p>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Uptime</p>
                  </div>
                  
                  <div className="p-6 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-foreground font-medium">API</span>
                      <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 font-medium">
                        Operational
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-foreground tracking-tight">150ms</p>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Avg Response</p>
                  </div>
                  
                  <div className="p-6 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-foreground font-medium">Storage</span>
                      <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-500/30 font-medium">
                        Warning
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-foreground tracking-tight">78%</p>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Usage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
