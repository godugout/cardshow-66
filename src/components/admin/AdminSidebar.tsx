import React from 'react';
import { BarChart3, Flag, Settings, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activePanel: string;
  onSelectPanel: (panel: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activePanel, onSelectPanel }) => {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Platform metrics & analytics'
    },
    {
      id: 'content-moderation',
      label: 'Content Moderation',
      icon: Flag,
      description: 'Review flagged content'
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: Users,
      description: 'Manage users & permissions'
    },
    {
      id: 'platform-settings',
      label: 'Platform Settings',
      icon: Settings,
      description: 'System configuration'
    }
  ];

  return (
    <div className="w-60 bg-background border-r border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">CRD Dugout</h2>
            <p className="text-sm text-muted-foreground">Admin Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSelectPanel(item.id)}
              className={cn(
                "w-full flex items-start gap-3 p-4 rounded-lg text-left transition-all duration-200 group",
                isActive 
                  ? "bg-orange-500/10 text-orange-600 shadow-sm border border-orange-200/50" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0 mt-0.5",
                isActive ? "text-orange-600" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium text-sm",
                  isActive ? "text-orange-600 font-semibold" : "text-foreground"
                )}>
                  {item.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-tight">
                  {item.description}
                </div>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          Cardshow Platform v2.0
        </div>
      </div>
    </div>
  );
};