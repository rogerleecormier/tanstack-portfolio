import { Link } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/work', label: 'Work' },
  { href: '/tools', label: 'Tools' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-border-subtle bg-surface-deep/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className='mx-auto max-w-6xl px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Brand */}
          <Link to='/' className='flex items-center gap-2.5 group'>
            <img src='/header-logo.svg' alt='Logo' className='h-8 w-8' />
            <div>
              <span className='block text-sm font-bold text-text-foreground leading-tight'>
                Roger Lee Cormier
              </span>
              <span className='block text-[10px] font-semibold uppercase tracking-[0.2em] text-strategy-gold leading-tight'>
                Technical Strategist
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className='hidden md:flex items-center gap-8'>
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className='text-sm font-medium text-text-secondary transition-colors hover:text-text-foreground'
                activeProps={{ className: 'text-strategy-gold font-semibold' }}
                activeOptions={{ exact: link.href === '/' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className='md:hidden p-2 text-text-secondary hover:text-text-foreground transition-colors'
            onClick={() => setMobileOpen(o => !o)}
            aria-label='Toggle menu'
          >
            {mobileOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className='md:hidden border-t border-border-subtle bg-surface-deep/98 backdrop-blur-md'>
          <nav className='flex flex-col px-6 py-4 gap-1'>
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className='py-3 text-sm font-medium text-text-secondary hover:text-text-foreground transition-colors border-b border-border-subtle/50 last:border-0'
                activeProps={{ className: 'text-strategy-gold font-semibold' }}
                activeOptions={{ exact: link.href === '/' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
