import { Link } from '@tanstack/react-router';
import NewsletterSignup from '@/components/NewsletterSignup';

export default function Footer() {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/projects', label: 'Projects' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t border-border-subtle bg-surface-elevated'>
      <div className='mx-auto max-w-7xl px-4 py-16 md:px-8'>
        {/* Footer Grid - 4 columns */}
        <div className='mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {/* Column 1: Brand & Tagline */}
          <div className='space-y-4'>
            <Link to='/' className='flex items-center gap-2'>
              <img
                src='/header-logo.svg'
                alt='Roger Lee Cormier Logo'
                className='h-8 w-8'
              />
              <div>
                <h2 className='text-sm font-bold leading-tight text-text-foreground'>
                  Roger Lee Cormier
                </h2>
                <p className='text-xs font-semibold uppercase tracking-widest text-strategy-gold'>
                  Technical Strategist
                </p>
              </div>
            </Link>
            <p className='text-xs leading-relaxed text-text-secondary'>
              Designing and building enterprise solutions with precision.
              Specializing in full-stack architecture, digital transformation,
              and technical leadership.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className='mb-4 text-xs font-bold uppercase tracking-widest text-text-foreground'>
              Navigation
            </h3>
            <div className='space-y-3'>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className='block text-xs text-text-secondary transition-colors hover:text-strategy-gold'
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Additional Links */}
          <div>
            <h3 className='mb-4 text-xs font-bold uppercase tracking-widest text-text-foreground'>
              Resources
            </h3>
            <div className='space-y-3'>
              <Link
                to='/privacy'
                className='block text-xs text-text-secondary transition-colors hover:text-strategy-gold'
              >
                Privacy Policy
              </Link>
              <a
                href='https://github.com/rogerleecormier'
                target='_blank'
                rel='noopener noreferrer'
                className='block text-xs text-text-secondary transition-colors hover:text-strategy-gold'
              >
                GitHub
              </a>
              <a
                href='https://linkedin.com/in/rogerleecormier'
                target='_blank'
                rel='noopener noreferrer'
                className='block text-xs text-text-secondary transition-colors hover:text-strategy-gold'
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Column 4: Newsletter Signup */}
          <div>
            <h3 className='mb-4 text-xs font-bold uppercase tracking-widest text-text-foreground'>
              Stay Updated
            </h3>
            <NewsletterSignup
              variant='inline'
              placeholder='your@email.com'
              buttonText='Subscribe'
              className='flex-col sm:flex-col'
            />
          </div>
        </div>

        {/* Divider */}
        <div className='mb-8 h-px bg-border-subtle' />

        {/* Copyright */}
        <div className='text-center'>
          <p className='text-xs text-text-tertiary'>
            © {currentYear} Roger Lee Cormier. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
