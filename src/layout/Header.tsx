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
      <div className='fixed inset-x-0 top-0 z-50 border-b border-hunter-600/30 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 shadow-glass backdrop-blur-md dark:border-hunter-500/30'>
        {/* Main Header Row */}
        <div className='flex items-center justify-between px-4 py-3'>
          {/* Left Section: Hamburger + Logo + Name */}
          <div className='flex items-center gap-4'>
            {/* Hamburger Menu */}
            <SidebarTrigger className='flex size-10 items-center justify-center rounded-lg border border-gold-500/40 bg-gold-600/15 text-gold-400 transition-all duration-200 hover:border-gold-500/70 hover:bg-gold-600/25 hover:text-gold-300 dark:text-gold-400 dark:hover:text-gold-300'>
              <Menu className='size-5' />
              <span className='sr-only'>Toggle navigation menu</span>
            </SidebarTrigger>

            {/* Enhanced Logo with targeting theme */}
            <Logo size='md' showTargetingDots={true} />

            {/* Name and Tagline Container */}
            <div className='hidden md:block'>
              {/* Name with enhanced styling */}
              <h1 className='header-name text-xl font-bold text-white'>
                Roger Lee Cormier
              </h1>
              {/* Enhanced tagline with targeting theme */}
              <p className='text-xs font-semibold uppercase tracking-wider text-gold-400'>
                Precision. Results. Delivered.
              </p>
            </div>
          </div>

          {/* Right Section: Search + Login/Logout */}
          <div className='flex shrink-0 items-center gap-4'>
            {/* Search Bar - Right justified on desktop */}
            <div className='hidden lg:block'>
              <RedesignedSearch />
            </div>

            {/* Login/Profile Section */}
            <div className='flex shrink-0 items-center gap-3'>
              {isAuthenticated && user ? (
                <ProfileDropdown user={user} />
              ) : (
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={handleLoginClick}
                  disabled={isLoading}
                  className='btn-accent rounded-lg border-0 text-xs font-medium'
                >
                  {isLoading ? 'Loading...' : 'Login'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar Row (Mobile) */}
        <div className='border-t border-hunter-600/20 bg-slate-900/40 px-4 py-3 backdrop-blur-sm lg:hidden'>
          <RedesignedSearch />
        </div>

        {/* Breadcrumbs Row - Updated styling */}
        <div className='flex h-12 items-center border-t border-hunter-600/20 bg-slate-950/60 px-4 backdrop-blur-sm dark:border-hunter-500/20'>
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
