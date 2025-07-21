// Enhanced Platform Header Component
import React from 'react';
import { useSubdomainRouting } from '@/hooks/useSubdomainRouting';
import { CRDButton } from '../atoms/CRDButton';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Users, 
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface PlatformHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  className?: string;
}

export const PlatformHeader: React.FC<PlatformHeaderProps> = ({
  title,
  subtitle,
  actions,
  showSearch = false,
  className
}) => {
  const { currentSubdomain } = useSubdomainRouting();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const getSubdomainGradient = () => {
    switch (currentSubdomain.primaryColor) {
      case 'orange':
        return 'from-crd-orange/20 via-crd-orange/10 to-transparent';
      case 'blue':
        return 'from-crd-blue/20 via-crd-blue/10 to-transparent';
      case 'yellow':
        return 'from-crd-yellow/20 via-crd-yellow/10 to-transparent';
      default:
        return 'from-crd-green/20 via-crd-green/10 to-transparent';
    }
  };

  const getAccentColor = () => {
    switch (currentSubdomain.primaryColor) {
      case 'orange': return 'text-crd-orange';
      case 'blue': return 'text-crd-blue';
      case 'yellow': return 'text-crd-yellow';
      default: return 'text-crd-green';
    }
  };

  return (
    <header className={cn(
      "relative border-b border-crd-border bg-crd-black/50 backdrop-blur-xl",
      className
    )}>
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r",
        getSubdomainGradient()
      )} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            {title && (
              <h1 className="text-2xl md:text-3xl font-bold text-crd-text font-display tracking-tight">
                {title}
                {currentSubdomain.name !== 'www.cardshow.app' && (
                  <span className={cn("ml-3 text-lg", getAccentColor())}>
                    {currentSubdomain.name}
                  </span>
                )}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-crd-text-dim max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

          {/* Search Bar (Desktop) */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-crd-text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search cards, creators, collections..."
                  className="w-full pl-10 pr-4 py-2 bg-crd-surface border border-crd-border rounded-lg text-crd-text placeholder-crd-text-muted focus:outline-none focus:ring-2 focus:ring-crd-green focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search Toggle */}
            {showSearch && (
              <CRDButton
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="w-5 h-5" />
              </CRDButton>
            )}

            {/* Notifications */}
            <CRDButton variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-crd-error rounded-full" />
            </CRDButton>

            {/* Custom Actions */}
            {actions}

            {/* Primary CTA */}
            <CRDButton 
              variant={currentSubdomain.primaryColor === 'orange' ? 'orange' : 
                       currentSubdomain.primaryColor === 'blue' ? 'blue' : 'primary'}
              size="default"
              icon={<Sparkles className="w-4 h-4" />}
              className="hidden sm:inline-flex"
            >
              Create
            </CRDButton>

            {/* Mobile CTA */}
            <CRDButton 
              variant={currentSubdomain.primaryColor === 'orange' ? 'orange' : 
                       currentSubdomain.primaryColor === 'blue' ? 'blue' : 'primary'}
              size="icon"
              className="sm:hidden"
            >
              <Sparkles className="w-5 h-5" />
            </CRDButton>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && isSearchOpen && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-crd-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search cards, creators, collections..."
                className="w-full pl-10 pr-10 py-3 bg-crd-surface border border-crd-border rounded-lg text-crd-text placeholder-crd-text-muted focus:outline-none focus:ring-2 focus:ring-crd-green focus:border-transparent"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-crd-text-muted hover:text-crd-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};