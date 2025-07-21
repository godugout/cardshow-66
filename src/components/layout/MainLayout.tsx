
import React from 'react';
import { UnifiedNavigation } from './UnifiedNavigation';
import { useSubdomainRouting } from '@/hooks/useSubdomainRouting';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showNavbar = true,
  className 
}) => {
  const { currentSubdomain } = useSubdomainRouting();
  
  return (
    <div className={cn(
      "min-h-screen font-ui",
      "bg-crd-black text-crd-text",
      className
    )}>
      {showNavbar && <UnifiedNavigation />}
      <main className={cn(
        "flex-1",
        showNavbar && "pt-0" // Navigation is sticky, no extra padding needed
      )}>
        {children}
      </main>
      
      {/* Dynamic CSS custom property for current subdomain */}
      <style>{`
        :root {
          --current-primary: ${
            currentSubdomain.primaryColor === 'orange' ? '#FF6D00' :
            currentSubdomain.primaryColor === 'blue' ? '#2D9CDB' :
            currentSubdomain.primaryColor === 'green' ? '#00C851' :
            '#FFD700'
          };
        }
      `}</style>
    </div>
  );
};
