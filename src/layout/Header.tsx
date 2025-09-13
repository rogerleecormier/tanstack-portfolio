import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';
import React, { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import { LoginPage } from '../components/LoginPage';
import { Logo } from '../components/Logo';
import ProfileDropdown from '../components/ProfileDropdown';
import RedesignedSearch from '../components/RedesignedSearch';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLoginClick = () => setShowLogin(true);
  const handleCloseLogin = () => setShowLogin(false);

  return (
    <>
      {/* Fixed Header - Always visible */}
      <div className='fixed inset-x-0 top-0 z-50 border-b border-teal-200 bg-white shadow-sm dark:border-teal-800'>
        {/* Main Header Row */}
        <div className='brand-gradient-signature flex items-center justify-between px-4 py-3'>
          {/* Left Section: Hamburger + Logo + Name */}
          <div className='flex items-center gap-3'>
            {/* Hamburger Menu */}
            <SidebarTrigger className='flex size-10 items-center justify-center rounded-xl p-2 text-white transition-all duration-200 hover:bg-white/20'>
              <Menu className='size-5' />
              <span className='sr-only'>Toggle navigation menu</span>
            </SidebarTrigger>

            {/* Enhanced Logo with targeting theme */}
            <Logo size='md' showTargetingDots={true} />

            {/* Name and Tagline Container */}
            <div className='block'>
              {/* Name with enhanced styling */}
              <h1 className='header-name bg-gradient-to-r from-teal-300 to-blue-300 bg-clip-text text-2xl font-semibold text-transparent'>
                Roger Lee Cormier
              </h1>
              {/* Enhanced tagline with targeting theme */}
              <p className='header-tagline text-sm font-medium text-orange-200'>
                Targeting Digital Transformation
              </p>
            </div>
          </div>

          {/* Right Section: Search + Login/Logout */}
          <div className='flex shrink-0 flex-col items-end gap-2'>
            {/* Search Bar - Right justified on desktop */}
            <div className='hidden md:block'>
              <RedesignedSearch />
            </div>

            {/* Login/Profile Section */}
            <div className='flex shrink-0 items-center gap-2'>
              {isAuthenticated && user ? (
                <ProfileDropdown user={user} />
              ) : (
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={handleLoginClick}
                  disabled={isLoading}
                  className='rounded-lg border-0 bg-white/90 text-teal-700 hover:bg-white'
                >
                  {isLoading ? 'Loading...' : 'Login'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar Row (Mobile) */}
        <div className='border-b border-teal-100 bg-white px-4 py-3 dark:border-teal-800 md:hidden'>
          <RedesignedSearch />
        </div>

        {/* Breadcrumbs Row - Updated styling */}
        <div className='flex h-12 items-center border-b border-teal-600 bg-teal-700 px-4 dark:border-teal-800'>
          <div className='w-full'>
            <Breadcrumbs />
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Login to Your Account</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your account and manage your
              content.
            </DialogDescription>
          </DialogHeader>
          <LoginPage onClose={handleCloseLogin} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
