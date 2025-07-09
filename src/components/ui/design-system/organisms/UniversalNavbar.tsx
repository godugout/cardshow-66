
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UniversalButton } from '../atoms/UniversalButton';
import { UniversalNavItem } from '../molecules/UniversalNavItem';
import { 
  Home, Plus, Palette, Users, ShoppingBag, 
  FileImage, Shield, Sparkles, User, Settings 
} from 'lucide-react';

const navigationItems = [
  { href: '/', label: 'Home', icon: <Home className="w-4 h-4" />, public: true },
  { href: '/crdmkr', label: 'Create', icon: <Plus className="w-4 h-4" />, protected: true },
  { href: '/studio', label: 'Studio', icon: <Palette className="w-4 h-4" />, protected: true },
  { href: '/collections', label: 'Collections', icon: <FileImage className="w-4 h-4" />, public: true },
  { href: '/community', label: 'Community', icon: <Users className="w-4 h-4" />, public: true },
  { href: '/marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-4 h-4" />, public: true },
  ...(process.env.NODE_ENV === 'development' ? [
    { href: '/debug/psd-preview', label: 'PSD Analysis', icon: <FileImage className="w-4 h-4" />, protected: true },
    { href: '/admin', label: 'Admin', icon: <Shield className="w-4 h-4" />, protected: true }
  ] : [])
];

export const UniversalNavbar: React.FC = () => {
  const { user, signOut } = useAuth();

  const visibleItems = navigationItems.filter(item => 
    item.public || (item.protected && user)
  );

  return (
    <nav id="universal-navbar-unique" className="bg-[#1a1f2e]/95 backdrop-blur-md border-b border-[#334155]/50 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#4ade80] rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-[#4ade80] transition-colors">
              CardShow
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleItems.map((item) => (
              <UniversalNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.email?.split('@')[0]}</span>
                </div>
                <UniversalButton
                  onClick={() => signOut()}
                  variant="outline"
                  size="sm"
                >
                  Sign Out
                </UniversalButton>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth/signin">
                  <UniversalButton variant="outline" size="sm">
                    Sign In
                  </UniversalButton>
                </Link>
                <Link to="/auth/signup">
                  <UniversalButton size="sm">
                    Sign Up
                  </UniversalButton>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <UniversalButton
              variant="ghost"
              size="icon"
            >
              <Settings className="w-5 h-5" />
            </UniversalButton>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-[#334155]/50 py-3">
          <div className="flex flex-wrap gap-2">
            {visibleItems.map((item) => (
              <UniversalNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
