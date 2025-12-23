import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Shield,
  PenTool,
  Wrench,
  Mail,
  LogOut,
  ChevronDown,
} from 'lucide-react';
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
    void navigate({ to: path });
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
    return user.name ?? user.email ?? 'User';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
    <div className='relative' ref={dropdownRef}>
      <Button
        variant='ghost'
        onClick={() => setIsOpen(!isOpen)}
        className='group relative h-10 w-auto min-w-[100px] max-w-[180px] shrink-0 rounded-full border-0 bg-white/5 px-2 py-1 text-white transition-all duration-200 hover:bg-white/15'
      >
        <div className='flex items-center gap-2'>
          {/* Minimalist Avatar */}
          <Avatar className='size-7 rounded-full ring-2 ring-white/30 transition-all duration-200 group-hover:ring-white/50'>
            <AvatarImage src={user.picture} alt={getUserDisplayName(user)} />
            <AvatarFallback className='bg-strategy-gold text-xs font-medium text-white'>
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>

          <div className='hidden text-left sm:block'>
            <div className='max-w-28 truncate text-sm font-medium text-white'>
              {getUserDisplayName(user)}
            </div>
          </div>

          {/* Simple chevron */}
          <ChevronDown
            className={`size-3 text-white/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </Button>

      {isOpen && (
        <div className='absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-gray-200 bg-white shadow-lg'>
          {/* Simple header */}
          <div className='border-b border-gray-100 px-3 py-2'>
            <div className='text-sm font-medium text-gray-900'>
              {getUserDisplayName(user)}
            </div>
            <div className='text-xs text-gray-500'>{user.email}</div>
          </div>

          {/* Clean menu items */}
          <div className='py-1'>
            <button
              onClick={() => handleNavigation('/protected/settings')}
              className='flex w-full cursor-pointer items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
            >
              <Settings className='mr-3 size-4 text-gray-500' />
              <span>Settings</span>
            </button>

            <button
              onClick={() => handleNavigation('/newsletter-preferences')}
              className='flex w-full cursor-pointer items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
            >
              <Mail className='mr-3 size-4 text-gray-500' />
              <span>Newsletter Settings</span>
            </button>

            <button
              onClick={() => handleNavigation('/protected/site-admin')}
              className='flex w-full cursor-pointer items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
            >
              <Shield className='mr-3 size-4 text-gray-500' />
              <span>Site Admin</span>
            </button>

            <button
              onClick={() => handleNavigation('/protected/content-studio')}
              className='flex w-full cursor-pointer items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
            >
              <PenTool className='mr-3 size-4 text-gray-500' />
              <span>Content Studio</span>
            </button>

            <button
              onClick={() => handleNavigation('/protected/private-tools')}
              className='flex w-full cursor-pointer items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
            >
              <Wrench className='mr-3 size-4 text-gray-500' />
              <span>Private Tools</span>
            </button>
          </div>

          {/* Logout */}
          <div className='border-t border-gray-100'>
            <button
              onClick={handleLogout}
              className='flex w-full cursor-pointer items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50'
            >
              <LogOut className='mr-3 size-4 text-red-500' />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
