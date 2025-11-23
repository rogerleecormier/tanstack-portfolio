import { Logo } from '@/components/Logo';
import NewsletterSignup from '@/components/NewsletterSignup';
import { H4, P } from '@/components/ui/typography';
import { Mail } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className='relative border-t border-hunter-700/30 bg-hunter-950/90 backdrop-blur-sm'>
      <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Newsletter Section - Prominent */}
        <div className='py-12'>
          <div className='rounded-lg border border-gold-500/40 bg-gradient-to-r from-gold-600/15 via-hunter-950/60 to-hunter-700/15 p-6 sm:p-8'>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8'>
              <div>
                <H4 className='!mt-0 mb-2 text-base font-semibold text-white'>
                  Strategic Insights Delivered
                </H4>
                              <p className='!mt-0 text-sm text-grey-300'>
                  Exclusive insights on digital transformation, technology
                  leadership, and execution excellence.
                </P>
              </div>
              <NewsletterSignup
                variant='compact'
                title=''
                description=''
                className='!mt-0 !border-t-0 !pt-0'
              />
            </div>
          </div>
        </div>

        {/* Main Footer - Clean & Simple */}
        <div className='border-t border-hunter-700/30 py-8'>
          <div className='grid grid-cols-2 gap-8 sm:grid-cols-4'>
            {/* Brand */}
            <div className='col-span-2 sm:col-span-1'>
              <div className='mb-3 flex items-center gap-2'>
                <Logo size='sm' showTargetingDots={true} />
                <div>
                  <p className='text-sm font-bold text-white'>
                    Roger Lee Cormier
                  </p>
                  <p className='text-xs font-medium uppercase text-gold-400'>
                    Precision. Results. Delivered.
                  </p>
                </div>
              </div>
              <p className='text-xs text-grey-400'>
                Strategic execution. Measurable outcomes.
              </p>
            </div>

            {/* Pages */}
            <div>
              <p className='mb-3 text-xs font-semibold uppercase tracking-wider text-grey-300'>
                Pages
              </p>
              <div className='space-y-2'>
                {[
                  { href: '/portfolio', label: 'Portfolio' },
                  { href: '/blog', label: 'Blog' },
                  { href: '/projects', label: 'Projects' },
                ].map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    className='block text-xs text-grey-400 transition-colors hover:text-gold-300'
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <p className='mb-3 text-xs font-semibold uppercase tracking-wider text-grey-300'>
                Resources
              </p>
              <div className='space-y-2'>
                {[
                  { href: '/tools', label: 'Tools' },
                  { href: '/about', label: 'About' },
                  { href: '/contact', label: 'Contact' },
                ].map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    className='block text-xs text-grey-400 transition-colors hover:text-gold-300'
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className='mb-3 text-xs font-semibold uppercase tracking-wider text-grey-300'>
                Connect
              </p>
              <div className='space-y-2'>
                <a
                  href='https://linkedin.com/in/rogerleecormier'
                  className='flex items-center gap-1.5 text-xs text-grey-400 transition-colors hover:text-gold-300'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <FaLinkedin size={12} />
                  LinkedIn
                </a>
                <a
                  href='https://github.com/rogerleecormier'
                  className='flex items-center gap-1.5 text-xs text-grey-400 transition-colors hover:text-gold-300'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <FaGithub size={12} />
                  GitHub
                </a>
                <a
                  href='mailto:roger@rcormier.dev'
                  className='flex items-center gap-1.5 text-xs text-grey-400 transition-colors hover:text-gold-300'
                >
                  <Mail size={12} />
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Minimal */}
        <div className='flex items-center justify-between border-t border-gold-500/20 py-4 text-xs text-grey-500'>
          <span>© 2025 Roger Lee Cormier</span>
          <a href='/privacy' className='transition-colors hover:text-gold-400'>
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
