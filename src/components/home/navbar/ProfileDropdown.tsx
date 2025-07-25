
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, CreditCard, Bookmark, Settings, LogOut, Coins, Trophy, Shield } from "lucide-react";


export const ProfileDropdown = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  const displayName = user.user_metadata?.full_name || user.email || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;
  const isDefaultAvatar = !avatarUrl;
  const isAdmin = user?.email === 'admin@cardshow.com' || process.env.NODE_ENV === 'development';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-8 w-8 border-2 border-crd-mediumGray hover:border-crd-blue transition-colors cursor-pointer">
          <AvatarImage 
            src={avatarUrl || '/default-avatar.png'} 
            alt={displayName}
          />
          <AvatarFallback className="bg-crd-mediumGray text-crd-white text-sm">
            {(displayName?.[0] || '').toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-crd-dark border-crd-mediumGray" 
        align="end" 
        sideOffset={5}
      >
        <DropdownMenuLabel className="text-crd-white">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-crd-lightGray">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-crd-mediumGray" />
        <DropdownMenuItem asChild className="text-crd-white hover:bg-crd-mediumGray focus:bg-crd-mediumGray cursor-pointer">
          <Link to="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-crd-white hover:bg-crd-mediumGray focus:bg-crd-mediumGray cursor-pointer">
          <Link to="/cards" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>My Cards</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-crd-white hover:bg-crd-mediumGray focus:bg-crd-mediumGray cursor-pointer">
          <Link to="/collections" className="flex items-center">
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Collections</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-crd-white hover:bg-crd-mediumGray focus:bg-crd-mediumGray cursor-pointer">
          <Link to="/credits" className="flex items-center">
            <Coins className="mr-2 h-4 w-4" />
            <span>Credits</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-crd-white hover:bg-crd-mediumGray focus:bg-crd-mediumGray cursor-pointer">
          <Link to="/subscription" className="flex items-center">
            <Coins className="mr-2 h-4 w-4" />
            <span>Subscription</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-crd-white hover:bg-crd-mediumGray focus:bg-crd-mediumGray cursor-pointer">
          <Link to="/creator-dashboard" className="flex items-center">
            <Trophy className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild className="text-crd-white hover:bg-crd-mediumGray focus:bg-crd-mediumGray cursor-pointer">
            <Link to="/admin" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-crd-mediumGray" />
        <DropdownMenuItem asChild className="text-crd-white hover:bg-crd-mediumGray focus:bg-crd-mediumGray cursor-pointer">
          <Link to="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-crd-white hover:bg-crd-mediumGray focus:bg-crd-mediumGray cursor-pointer" 
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
