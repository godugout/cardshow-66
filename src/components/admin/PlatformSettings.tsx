import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  Globe,
  DollarSign,
  Users,
  Shield,
  Bell,
  Palette,
  Server,
  Database
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserRole {
  role: 'admin' | 'moderator' | 'creator' | 'user';
}

interface PlatformConfig {
  // Feature Flags
  enableMarketplace: boolean;
  enable3DCards: boolean;
  enableAIAssistant: boolean;
  enableBulkOperations: boolean;
  enableSocialFeatures: boolean;
  
  // Financial Settings
  platformCommissionRate: number;
  minimumPayoutAmount: number;
  crdTokenValue: number;
  
  // Content Settings
  maxCardFileSize: number;
  allowedImageFormats: string[];
  maxCardsPerUser: number;
  autoModerationEnabled: boolean;
  
  // Platform Settings
  maintenanceMode: boolean;
  announcementBanner: string;
  newUserSignupEnabled: boolean;
  requireEmailVerification: boolean;
  
  // Security Settings
  maxLoginAttempts: number;
  sessionTimeoutMinutes: number;
  enableTwoFactor: boolean;
}

export const PlatformSettings: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [config, setConfig] = useState<PlatformConfig>({
    // Feature Flags
    enableMarketplace: true,
    enable3DCards: true,
    enableAIAssistant: true,
    enableBulkOperations: false,
    enableSocialFeatures: true,
    
    // Financial Settings
    platformCommissionRate: 15,
    minimumPayoutAmount: 100,
    crdTokenValue: 0.10,
    
    // Content Settings
    maxCardFileSize: 10,
    allowedImageFormats: ['jpg', 'png', 'webp'],
    maxCardsPerUser: 1000,
    autoModerationEnabled: true,
    
    // Platform Settings
    maintenanceMode: false,
    announcementBanner: '',
    newUserSignupEnabled: true,
    requireEmailVerification: true,
    
    // Security Settings
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 60,
    enableTwoFactor: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPlatformSettings();
  }, []);

  const loadPlatformSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would load from a platform_settings table
      // For now, we'll use the current config as default
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load platform settings:', error);
      toast.error('Failed to load platform settings');
    }
    setLoading(false);
  };

  const savePlatformSettings = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Platform settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save platform settings:', error);
      toast.error('Failed to save platform settings');
    }
    setSaving(false);
  };

  const updateConfig = (key: keyof PlatformConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const SettingCard = ({ 
    icon: Icon, 
    title, 
    description, 
    children, 
    adminOnly = false 
  }: {
    icon: any;
    title: string;
    description: string;
    children: React.ReactNode;
    adminOnly?: boolean;
  }) => {
    if (adminOnly && userRole.role !== 'admin') {
      return null;
    }

    return (
      <Card className="bg-crd-black border-crd-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-crd-white">
            <Icon className="w-5 h-5 text-crd-orange" />
            {title}
            {adminOnly && (
              <Badge variant="outline" className="text-xs text-crd-orange border-crd-orange">
                Admin Only
              </Badge>
            )}
          </CardTitle>
          <p className="text-crd-lightGray text-sm">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    );
  };

  const ToggleSetting = ({ 
    label, 
    description, 
    checked, 
    onCheckedChange,
    disabled = false 
  }: {
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-crd-white">{label}</Label>
        {description && (
          <p className="text-sm text-crd-lightGray">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crd-orange mx-auto" />
          <p className="text-crd-lightGray">Loading platform settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-crd-white">Platform Settings</h2>
          <p className="text-crd-lightGray">Configure platform-wide settings and features</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadPlatformSettings}
            disabled={loading}
            className="bg-crd-black border-crd-border text-crd-white hover:bg-crd-surface"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={savePlatformSettings}
            disabled={!hasChanges || saving}
            className="bg-crd-orange hover:bg-crd-orange/80"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Changes Warning */}
      {hasChanges && (
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">You have unsaved changes</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Flags */}
        <SettingCard
          icon={Globe}
          title="Feature Flags"
          description="Enable or disable platform features"
        >
          <ToggleSetting
            label="Marketplace"
            description="Enable card buying and selling"
            checked={config.enableMarketplace}
            onCheckedChange={(checked) => updateConfig('enableMarketplace', checked)}
          />
          <ToggleSetting
            label="3D Cards"
            description="Enable 3D card viewer and studio"
            checked={config.enable3DCards}
            onCheckedChange={(checked) => updateConfig('enable3DCards', checked)}
          />
          <ToggleSetting
            label="AI Assistant"
            description="Enable AI-powered card creation assistance"
            checked={config.enableAIAssistant}
            onCheckedChange={(checked) => updateConfig('enableAIAssistant', checked)}
          />
          <ToggleSetting
            label="Bulk Operations"
            description="Allow bulk card operations for creators"
            checked={config.enableBulkOperations}
            onCheckedChange={(checked) => updateConfig('enableBulkOperations', checked)}
          />
          <ToggleSetting
            label="Social Features"
            description="Enable comments, likes, and following"
            checked={config.enableSocialFeatures}
            onCheckedChange={(checked) => updateConfig('enableSocialFeatures', checked)}
          />
        </SettingCard>

        {/* Financial Settings */}
        <SettingCard
          icon={DollarSign}
          title="Financial Settings"
          description="Configure monetization and payments"
          adminOnly={true}
        >
          <div className="space-y-2">
            <Label className="text-crd-white">Platform Commission Rate (%)</Label>
            <Input
              type="number"
              min="0"
              max="50"
              value={config.platformCommissionRate}
              onChange={(e) => updateConfig('platformCommissionRate', parseFloat(e.target.value))}
              className="bg-crd-surface border-crd-border text-crd-white"
            />
            <p className="text-xs text-crd-lightGray">Percentage taken from each sale</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-crd-white">Minimum Payout Amount (CRD)</Label>
            <Input
              type="number"
              min="1"
              value={config.minimumPayoutAmount}
              onChange={(e) => updateConfig('minimumPayoutAmount', parseFloat(e.target.value))}
              className="bg-crd-surface border-crd-border text-crd-white"
            />
            <p className="text-xs text-crd-lightGray">Minimum balance required for payout</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-crd-white">CRD Token Value (USD)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={config.crdTokenValue}
              onChange={(e) => updateConfig('crdTokenValue', parseFloat(e.target.value))}
              className="bg-crd-surface border-crd-border text-crd-white"
            />
            <p className="text-xs text-crd-lightGray">Exchange rate: 1 CRD = $X.XX USD</p>
          </div>
        </SettingCard>

        {/* Content Settings */}
        <SettingCard
          icon={Palette}
          title="Content Settings"
          description="Configure content creation limits and moderation"
        >
          <div className="space-y-2">
            <Label className="text-crd-white">Max Card File Size (MB)</Label>
            <Input
              type="number"
              min="1"
              max="50"
              value={config.maxCardFileSize}
              onChange={(e) => updateConfig('maxCardFileSize', parseFloat(e.target.value))}
              className="bg-crd-surface border-crd-border text-crd-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-crd-white">Max Cards Per User</Label>
            <Input
              type="number"
              min="1"
              value={config.maxCardsPerUser}
              onChange={(e) => updateConfig('maxCardsPerUser', parseInt(e.target.value))}
              className="bg-crd-surface border-crd-border text-crd-white"
            />
          </div>
          
          <ToggleSetting
            label="Auto Moderation"
            description="Automatically flag inappropriate content"
            checked={config.autoModerationEnabled}
            onCheckedChange={(checked) => updateConfig('autoModerationEnabled', checked)}
          />
        </SettingCard>

        {/* Platform Settings */}
        <SettingCard
          icon={Server}
          title="Platform Settings"
          description="General platform configuration"
          adminOnly={true}
        >
          <ToggleSetting
            label="Maintenance Mode"
            description="Disable platform access for maintenance"
            checked={config.maintenanceMode}
            onCheckedChange={(checked) => updateConfig('maintenanceMode', checked)}
          />
          
          <div className="space-y-2">
            <Label className="text-crd-white">Announcement Banner</Label>
            <Textarea
              value={config.announcementBanner}
              onChange={(e) => updateConfig('announcementBanner', e.target.value)}
              placeholder="Platform-wide announcement (leave empty to hide)"
              className="bg-crd-surface border-crd-border text-crd-white"
              rows={3}
            />
          </div>
          
          <ToggleSetting
            label="New User Signups"
            description="Allow new users to register"
            checked={config.newUserSignupEnabled}
            onCheckedChange={(checked) => updateConfig('newUserSignupEnabled', checked)}
          />
          
          <ToggleSetting
            label="Email Verification Required"
            description="Require email verification for new accounts"
            checked={config.requireEmailVerification}
            onCheckedChange={(checked) => updateConfig('requireEmailVerification', checked)}
          />
        </SettingCard>

        {/* Security Settings */}
        <SettingCard
          icon={Shield}
          title="Security Settings"
          description="Configure security and authentication settings"
          adminOnly={true}
        >
          <div className="space-y-2">
            <Label className="text-crd-white">Max Login Attempts</Label>
            <Input
              type="number"
              min="3"
              max="20"
              value={config.maxLoginAttempts}
              onChange={(e) => updateConfig('maxLoginAttempts', parseInt(e.target.value))}
              className="bg-crd-surface border-crd-border text-crd-white"
            />
            <p className="text-xs text-crd-lightGray">Lock account after X failed attempts</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-crd-white">Session Timeout (minutes)</Label>
            <Input
              type="number"
              min="15"
              max="1440"
              value={config.sessionTimeoutMinutes}
              onChange={(e) => updateConfig('sessionTimeoutMinutes', parseInt(e.target.value))}
              className="bg-crd-surface border-crd-border text-crd-white"
            />
          </div>
          
          <ToggleSetting
            label="Two-Factor Authentication"
            description="Enable 2FA for admin accounts"
            checked={config.enableTwoFactor}
            onCheckedChange={(checked) => updateConfig('enableTwoFactor', checked)}
          />
        </SettingCard>

        {/* System Status */}
        <SettingCard
          icon={Database}
          title="System Status"
          description="Current platform health and statistics"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-crd-lightGray">Database Status</span>
              <Badge className="bg-crd-green/20 text-crd-green">Online</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-crd-lightGray">Storage Usage</span>
              <span className="text-crd-white">2.3GB / 10GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-crd-lightGray">Active Sessions</span>
              <span className="text-crd-white">127</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-crd-lightGray">Last Backup</span>
              <span className="text-crd-white">2 hours ago</span>
            </div>
          </div>
        </SettingCard>
      </div>
    </div>
  );
};