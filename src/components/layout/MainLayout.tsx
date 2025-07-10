
import React from 'react';
import { UniversalNavbar } from '@/components/ui/design-system';

interface MainLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showNavbar = true 
}) => {
  return (
    <div className="min-h-screen bg-background relative">
      {showNavbar && <UniversalNavbar />}
      <main className="flex-1 relative z-0">
        {children}
      </main>
    </div>
  );
};
