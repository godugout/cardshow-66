
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UniversalBadge } from '../atoms/UniversalBadge';

interface UniversalNavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const UniversalNavItem: React.FC<UniversalNavItemProps> = ({
  href,
  label,
  icon,
  badge,
  isActive: propIsActive,
  className,
  onClick
}) => {
  const location = useLocation();
  const isActive = propIsActive ?? (href === '/' ? location.pathname === '/' : location.pathname.startsWith(href));

  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
        isActive 
          ? "bg-[#4ade80] text-black shadow-md" 
          : "text-gray-300 hover:text-white hover:bg-[#1a1f2e]",
        className
      )}
    >
      <span className={cn(
        "transition-transform duration-200",
        "group-hover:scale-110"
      )}>
        {icon}
      </span>
      
      <span className="flex items-center gap-2">
        {label}
        {badge && (
          <UniversalBadge 
            variant={isActive ? "secondary" : "outline"} 
            size="sm"
          >
            {badge}
          </UniversalBadge>
        )}
      </span>
    </Link>
  );
};
