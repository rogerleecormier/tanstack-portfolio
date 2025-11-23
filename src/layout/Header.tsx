import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';
import RedesignedSearch from '@/components/RedesignedSearch';
import { LoginPage } from '@/components/LoginPage';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/projects', label: 'Projects' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className='sticky top-0 z-50 border-b border-border-subtle bg-gradient-to-r from-surface-deep to-precision-charcoal backdrop-blur-md'>
      <div className='mx-auto max-w-7xl px-4 py-4 md:px-8'>
        <div className='flex items-center justify-between gap-4'>
          {/* Left Section: Hamburger + Logo + Brand */}
          <div className='flex items-center gap-3'>
            {/* Mobile Menu Trigger */}
            <SidebarTrigger className='flex lg:hidden' />

            {/* Logo & Brand */}
            <Link to='/' className='flex shrink-0 items-center gap-2'>
              <img
                src='/header-logo.svg'
                alt='Logo'
                className='h-8 w-8 md:h-10 md:w-10'
              />
              <div className='hidden sm:block'>
                <h1 className='text-base font-bold leading-tight text-text-foreground md:text-lg'>
                  Roger Lee Cormier
                </h1>
                <p className='text-xs font-semibold uppercase leading-tight tracking-widest text-strategy-gold'>
                  Technical Strategist
                </p>
              </div>
            </Link>
          </div>

          {/* Center Section: Desktop Navigation */}
          <nav className='hidden flex-1 items-center gap-6 lg:flex xl:gap-8'>
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className='text-sm font-medium text-text-secondary transition-colors hover:text-strategy-gold'
                activeProps={{
                  className:
                    'text-strategy-gold border-b-2 border-strategy-gold pb-1',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section: Search + Login + Logout */}
          <div className='flex items-center gap-2 md:gap-3'>
            {/* Search Component - responsive */}
            <div className='hidden max-w-sm flex-1 md:block'>
              <RedesignedSearch />
            </div>

            {/* Login/Logout Button */}
            {user ? (
              <Button
                onClick={() => logout()}
                variant='outline'
                size='sm'
                className='flex items-center gap-2 border-strategy-gold text-strategy-gold hover:bg-strategy-gold/10'
              >
                <LogOut className='h-4 w-4' />
                <span className='hidden sm:inline'>Logout</span>
              </Button>
            ) : (
              <Button
                onClick={() => setShowLoginModal(true)}
                size='sm'
                className='bg-strategy-gold text-precision-charcoal transition-all hover:brightness-110'
              >
                <span className='hidden sm:inline'>Login</span>
                <span className='sm:hidden'>Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <LoginPage onClose={() => setShowLoginModal(false)} />
        </div>
      )}
    </header>
  );
};

export default Header;
