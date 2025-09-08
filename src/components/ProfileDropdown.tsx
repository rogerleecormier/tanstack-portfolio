import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, Shield, PenTool, Wrench, LogOut, ChevronDown } from 'lucide-react';
import { useAuth, CloudflareUser } from '@/hooks/useAuth';

interface ProfileDropdownProps {
  user: CloudflareUser;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setIsOpen(false);
  };

  const getUserInitials = (user: CloudflareUser): string => {
    if (user.name) {
      return user.name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = (user: CloudflareUser): string => {
    return user.name || user.email || 'User';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-auto min-w-[100px] max-w-[180px] px-2 py-1 bg-white/5 hover:bg-white/15 text-white border-0 rounded-full transition-all duration-200 flex-shrink-0 group"
      >
        <div className="flex items-center gap-2">
          {/* Minimalist Avatar */}
          <Avatar className="h-7 w-7 rounded-full ring-2 ring-white/30 group-hover:ring-white/50 transition-all duration-200">
            <AvatarImage src={user.picture} alt={getUserDisplayName(user)} />
            <AvatarFallback className="text-xs font-medium bg-teal-600 text-white">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium truncate max-w-28 text-white">
              {getUserDisplayName(user)}
            </div>
          </div>
          
          {/* Simple chevron */}
          <ChevronDown className={`h-3 w-3 text-white/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Simple header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">
              {getUserDisplayName(user)}
            </div>
            <div className="text-xs text-gray-500">
              {user.email}
            </div>
          </div>
          
          {/* Clean menu items */}
          <div className="py-1">
            <button
              onClick={() => handleNavigation('/protected/settings')}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <Settings className="mr-3 h-4 w-4 text-gray-500" />
              <span>Settings</span>
            </button>
            
            <button
              onClick={() => handleNavigation('/protected/site-admin')}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <Shield className="mr-3 h-4 w-4 text-gray-500" />
              <span>Site Admin</span>
            </button>

            <button
              onClick={() => handleNavigation('/protected/content-studio')}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <PenTool className="mr-3 h-4 w-4 text-gray-500" />
              <span>Content Studio</span>
            </button>

            <button
              onClick={() => handleNavigation('/protected/private-tools')}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <Wrench className="mr-3 h-4 w-4 text-gray-500" />
              <span>Private Tools</span>
            </button>

          </div>
          
          {/* Logout */}
          <div className="border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-3 h-4 w-4 text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
