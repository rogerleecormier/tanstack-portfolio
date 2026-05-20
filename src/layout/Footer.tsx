import { Link } from '@tanstack/react-router';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t border-border-subtle bg-surface-deep'>
      <div className='mx-auto max-w-6xl px-6 py-12'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {/* Brand */}
          <div className='space-y-3'>
            <Link to='/' className='flex items-center gap-2'>
              <img src='/header-logo.svg' alt='Logo' className='h-7 w-7' />
              <span className='text-sm font-bold text-text-foreground'>Roger Lee Cormier</span>
            </Link>
            <p className='text-xs leading-relaxed text-text-secondary max-w-xs'>
              Technical Project Manager. Veteran. Builder.
              Turning complex systems into measurable outcomes.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h3 className='mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary'>
              Navigation
            </h3>
            <div className='space-y-2'>
              {[
                { href: '/about', label: 'About' },
                { href: '/work', label: 'Work' },
                { href: '/tools', label: 'Tools' },
                { href: '/contact', label: 'Contact' },
              ].map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className='block text-xs text-text-secondary hover:text-strategy-gold transition-colors'
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className='mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary'>
              Connect
            </h3>
            <div className='flex gap-4'>
              <a
                href='https://github.com/rogerleecormier'
                target='_blank'
                rel='noopener noreferrer'
                className='p-2 rounded-md text-text-secondary hover:text-strategy-gold hover:bg-strategy-gold/10 transition-all'
                aria-label='GitHub'
              >
                <Github className='h-4 w-4' />
              </a>
              <a
                href='https://linkedin.com/in/rogerleecormier'
                target='_blank'
                rel='noopener noreferrer'
                className='p-2 rounded-md text-text-secondary hover:text-strategy-gold hover:bg-strategy-gold/10 transition-all'
                aria-label='LinkedIn'
              >
                <Linkedin className='h-4 w-4' />
              </a>
              <Link
                to='/contact'
                className='p-2 rounded-md text-text-secondary hover:text-strategy-gold hover:bg-strategy-gold/10 transition-all'
                aria-label='Contact'
              >
                <Mail className='h-4 w-4' />
              </Link>
            </div>
          </div>
        </div>

        <div className='mt-10 pt-6 border-t border-border-subtle/50 flex flex-col sm:flex-row justify-between items-center gap-2'>
          <p className='text-xs text-text-tertiary'>
            © {currentYear} Roger Lee Cormier. All rights reserved.
          </p>
          <Link to='/privacy' className='text-xs text-text-tertiary hover:text-strategy-gold transition-colors'>
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
