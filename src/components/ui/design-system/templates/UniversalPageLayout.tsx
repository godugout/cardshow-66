
import React from 'react';
import { cn } from '@/lib/utils';
import { UniversalCard } from '../atoms/UniversalCard';

interface UniversalPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  background?: 'default' | 'gradient' | 'dark';
}

export const UniversalPageLayout: React.FC<UniversalPageLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  sidebar,
  className,
  contentClassName,
  background = 'default'
}) => {
  const backgroundClasses = {
    default: 'bg-[#0a0a0b]',
    gradient: 'bg-gradient-to-br from-[#0a0a0b] via-[#131316] to-[#0a0a0b]',
    dark: 'bg-[#0a0a0b]',
  };

  return (
    <div className={cn(
      'min-h-screen',
      backgroundClasses[background],
      className
    )}>
      {/* Page Header */}
      {(title || actions) && (
        <div className="border-b border-[#334155]/50 bg-[#131316]/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-[#94a3b8]">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {sidebar ? (
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0">
              <UniversalCard className="sticky top-24">
                {sidebar}
              </UniversalCard>
            </aside>
            
            {/* Content */}
            <main className={cn('flex-1', contentClassName)}>
              {children}
            </main>
          </div>
        ) : (
          <main className={cn('w-full', contentClassName)}>
            {children}
          </main>
        )}
      </div>
    </div>
  );
};
