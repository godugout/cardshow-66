
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
    <div className="min-h-screen bg-[#0a0a0b]">
      {showNavbar && <UniversalNavbar />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
