// Unified Navigation for the Cardshow Platform
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSubdomainRouting } from '@/hooks/useSubdomainRouting';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Palette, 
  Box, 
  ShoppingBag, 
  Users, 
  Settings,
  CreditCard,
  Trophy,
  ChevronDown
} from 'lucide-react';

const NAVIGATION_ITEMS = [
  { 
    label: 'Home', 
    path: '/', 
    icon: Home, 
    subdomain: 'main',
    description: 'Dashboard and featured content'
  },
  { 
    label: 'CRDMKR', 
    path: '/crdmkr', 
    icon: Palette, 
    subdomain: 'crdmkr',
    description: 'Professional frame builder'
  },
  { 
    label: '3D Studio', 
    path: '/studio', 
    icon: Box, 
    subdomain: 'studio3d',
    description: 'Immersive card rendering'
  },
  { 
    label: 'Marketplace', 
    path: '/marketplace', 
    icon: ShoppingBag, 
    subdomain: 'marketplace',
    description: 'Buy and sell cards'
  },
  { 
    label: 'Community', 
    path: '/community', 
    icon: Users, 
    subdomain: 'main',
    description: 'Connect with creators'
  },
  { 
    label: 'Collections', 
    path: '/collections', 
    icon: Trophy, 
    subdomain: 'main',
    description: 'Your card galleries'
  }
];

export const UnifiedNavigation: React.FC = () => {
  const location = useLocation();
  const { currentSubdomain, isCurrentSubdomain } = useSubdomainRouting();

  const getNavItemColor = (item: typeof NAVIGATION_ITEMS[0]) => {
    const isActive = location.pathname === item.path || 
                    (item.path !== '/' && location.pathname.startsWith(item.path));
    
    if (isActive) {
      switch (item.subdomain) {
        case 'crdmkr': return 'text-crd-orange border-crd-orange';
        case 'studio3d': return 'text-crd-blue border-crd-blue';
        case 'marketplace': return 'text-crd-blue border-crd-blue';
        default: return 'text-crd-green border-crd-green';
      }
    }
    
    return 'text-crd-text-dim hover:text-crd-text border-transparent hover:border-crd-border';
  };

  return (
    <nav className="sticky top-0 z-50 bg-crd-black/95 backdrop-blur-md border-b border-crd-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-crd-text hover:text-crd-green transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-crd-green to-crd-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold font-display tracking-tight">
              Cardshow
            </span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-b-2",
                    getNavItemColor(item),
                    "hover:bg-crd-surface/50"
                  )}
                  title={item.description}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Subdomain Indicator & User Actions */}
          <div className="flex items-center space-x-4">
            {/* Current Subdomain Badge */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-crd-surface rounded-full text-xs font-mono">
              <div className={cn(
                "w-2 h-2 rounded-full",
                currentSubdomain.primaryColor === 'orange' && "bg-crd-orange",
                currentSubdomain.primaryColor === 'blue' && "bg-crd-blue", 
                currentSubdomain.primaryColor === 'green' && "bg-crd-green",
                currentSubdomain.primaryColor === 'yellow' && "bg-crd-yellow"
              )} />
              <span className="text-crd-text-dim">{currentSubdomain.name}</span>
            </div>

            {/* User Profile */}
            <Link 
              to="/profile"
              className="flex items-center space-x-2 px-3 py-2 text-crd-text-dim hover:text-crd-text transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-crd-green to-crd-blue rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">U</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-crd-border bg-crd-surface/30">
        <div className="flex overflow-x-auto py-2 px-4 space-x-1">
          {NAVIGATION_ITEMS.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs whitespace-nowrap min-w-0 flex-shrink-0",
                  getNavItemColor(item)
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};