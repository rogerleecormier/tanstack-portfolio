import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import RedesignedSearch from '../components/RedesignedSearch';
import { LoginPage } from '../components/LoginPage';
import Breadcrumbs from '../components/Breadcrumbs';
import ProfileDropdown from '../components/ProfileDropdown';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';

const Header: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLoginClick = () => setShowLogin(true);
  const handleCloseLogin = () => setShowLogin(false);

  return (
    <>
      {/* Fixed Header - Always visible */}
      <div className='fixed top-0 left-0 right-0 z-50 bg-white border-b border-teal-200 dark:border-teal-800 shadow-sm'>
        {/* Main Header Row */}
        <div className='flex items-center justify-between px-4 py-3 brand-gradient-signature'>
          {/* Left Section: Hamburger + Logo + Name */}
          <div className='flex items-center gap-3'>
            {/* Hamburger Menu */}
            <SidebarTrigger className='w-10 h-10 p-2 text-white hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-200'>
              <Menu className='h-5 w-5' />
              <span className='sr-only'>Toggle navigation menu</span>
            </SidebarTrigger>

            {/* Enhanced Logo with targeting theme */}
            <Logo size='md' showTargetingDots={true} />

            {/* Name and Tagline Container */}
            <div className='block'>
              {/* Name with enhanced styling */}
              <h1 className='header-name text-2xl font-semibold text-white bg-gradient-to-r from-teal-300 to-blue-300 bg-clip-text text-transparent'>
                Roger Lee Cormier
              </h1>
              {/* Enhanced tagline with targeting theme */}
              <p className='header-tagline text-sm text-orange-200 font-medium'>
                Targeting Digital Transformation
              </p>
            </div>
          </div>

          {/* Right Section: Search + Login/Logout */}
          <div className='flex flex-col items-end gap-2 flex-shrink-0'>
            {/* Search Bar - Right justified on desktop */}
            <div className='hidden md:block'>
              <RedesignedSearch />
            </div>

            {/* Login/Profile Section */}
            <div className='flex items-center gap-2 flex-shrink-0'>
              {isAuthenticated && user ? (
                <ProfileDropdown user={user} />
              ) : (
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={handleLoginClick}
                  disabled={isLoading}
                  className='bg-white/90 text-teal-700 hover:bg-white border-0 rounded-lg'
                >
                  {isLoading ? 'Loading...' : 'Login'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar Row (Mobile) */}
        <div className='md:hidden px-4 py-3 bg-white border-b border-teal-100 dark:border-teal-800'>
          <RedesignedSearch />
        </div>

        {/* Breadcrumbs Row - Updated styling */}
        <div className='px-4 h-12 bg-teal-700 border-b border-teal-600 dark:border-teal-800 flex items-center'>
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
