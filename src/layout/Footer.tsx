import { Logo } from '@/components/Logo';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { H3, H4, P } from '@/components/ui/typography';
import { ArrowUpRight, ExternalLink, Heart, Mail, MapPin } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className='relative min-h-[28rem] border-t border-slate-600/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      <div className='relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
        {/* Main Footer Content */}
        <div className='mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {/* Brand Section */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Enhanced Logo and Name with Targeting Theme */}
            <div className='flex items-center gap-4'>
              <Logo size='lg' showTargetingDots={true} />
              <div>
                <H3 className='!mt-0 bg-gradient-to-r from-teal-300 to-blue-300 bg-clip-text text-2xl text-transparent'>
                  Roger Lee Cormier
                </H3>
                <p className='text-sm font-medium text-orange-200'>
                  Targeting Digital Transformation
                </p>
              </div>
            </div>

            <P className='!mt-0 text-base leading-relaxed text-slate-300'>
              PMP-certified Technical Project Manager specializing in digital
              transformation, AI automation, and strategic technology
              implementation. Military veteran with a passion for leading with
              integrity and purpose.
            </P>

            <div className='flex flex-col gap-3 text-sm'>
              <div className='flex items-center gap-3 text-slate-300 transition-colors hover:text-teal-300'>
                <MapPin className='size-4 text-teal-400' />
                <span>Wellsville, NY</span>
              </div>

              <div className='flex items-center gap-3 text-slate-300 transition-colors hover:text-teal-300'>
                <Mail className='size-4 text-teal-400' />
                <a
                  href='mailto:roger@rcormier.dev'
                  className='transition-colors hover:text-teal-300'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  roger@rcormier.dev
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className='space-y-3'>
            <H4 className='!mt-0 text-sm font-semibold text-white'>
              Quick Links
            </H4>
            <div className='space-y-2'>
              {[
                { href: '/portfolio', label: 'Portfolio' },
                { href: '/blog', label: 'Blog' },
                { href: '/projects', label: 'Projects' },
                { href: '/tools', label: 'Tools' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className='group block text-sm text-slate-300 transition-colors hover:text-teal-300'
                >
                  <span className='inline-block transition-transform duration-200 group-hover:translate-x-1'>
                    {link.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section - Clean design */}
        <div className='mb-8 min-h-48 rounded-2xl border border-slate-600/30 bg-slate-800/50 p-8 backdrop-blur-sm'>
          <div className='mb-6 text-center'>
            <H4 className='!mt-0 mb-2 text-lg font-semibold text-white'>
              Stay Updated with Strategic Insights
            </H4>
            <P className='mx-auto !mt-0 max-w-2xl text-sm text-slate-300'>
              Get exclusive insights on technology leadership, digital
              transformation, and strategic thinking delivered to your inbox.
            </P>
          </div>

          <NewsletterSignup
            variant='compact'
            title=''
            description=''
            className='!mt-0 !border-t-0 !pt-0'
          />

          {/* Newsletter Preferences Link */}
          <div className='mt-4 text-center'>
            <a
              href='/newsletter-preferences'
              className='inline-flex items-center gap-1 text-xs text-teal-400 underline-offset-2 transition-colors hover:text-teal-300 hover:underline'
            >
              Manage newsletter preferences
              <ArrowUpRight className='size-3' />
            </a>
          </div>
        </div>

        {/* Connect Section - Enhanced with teal accents */}
        <div className='mb-6'>
          <div className='flex flex-col justify-center gap-3 sm:flex-row'>
            <a
              href='https://linkedin.com/in/rogerleecormier'
              className='group flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-700/50 px-4 py-2 transition-all duration-300 hover:border-slate-500/50 hover:bg-slate-600/50'
              aria-label='LinkedIn'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaLinkedin
                size={16}
                className='text-slate-300 transition-colors group-hover:text-white'
              />
              <span className='text-sm font-medium text-slate-200 transition-colors group-hover:text-white'>
                LinkedIn
              </span>
              <ExternalLink className='size-3 text-slate-400 transition-colors group-hover:text-slate-300' />
            </a>

            <a
              href='https://github.com/rogerleecormier'
              className='group flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-700/50 px-4 py-2 transition-all duration-300 hover:border-slate-500/50 hover:bg-slate-600/50'
              aria-label='GitHub'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaGithub
                size={16}
                className='text-slate-300 transition-colors group-hover:text-white'
              />
              <span className='text-sm font-medium text-slate-200 transition-colors group-hover:text-white'>
                GitHub
              </span>
              <ExternalLink className='size-3 text-slate-400 transition-colors group-hover:text-slate-300' />
            </a>
          </div>
        </div>

        {/* Separator with refined accent */}
        <Separator className='mb-6 bg-gradient-to-r from-transparent via-slate-600/30 to-transparent' />

        {/* Bottom Section - Enhanced with teal accents */}
        <div className='flex flex-col items-center justify-between gap-4 text-sm sm:flex-row'>
          {/* Copyright and Tech Stack */}
          <div className='flex flex-col items-center gap-2 text-slate-400 sm:flex-row'>
            <span>© 2025 Roger Lee Cormier Portfolio</span>
            <span className='hidden text-slate-500 sm:inline'>•</span>
            <span className='flex items-center gap-2'>
              Built with <Heart className='size-3 text-red-400' /> using
              <div className='flex gap-1'>
                <Badge
                  variant='outline'
                  className='border-slate-500/50 bg-slate-700/50 text-xs text-slate-300 transition-colors hover:bg-slate-600/50'
                >
                  React
                </Badge>
                <Badge
                  variant='outline'
                  className='border-slate-500/50 bg-slate-700/50 text-xs text-slate-300 transition-colors hover:bg-slate-600/50'
                >
                  TypeScript
                </Badge>
                <Badge
                  variant='outline'
                  className='border-slate-500/50 bg-slate-700/50 text-xs text-slate-300 transition-colors hover:bg-slate-600/50'
                >
                  TanStack Router
                </Badge>
              </div>
            </span>
          </div>

          {/* Legal Links */}
          <div className='flex items-center gap-4'>
            <a
              href='/privacy'
              className='text-slate-400 transition-colors hover:text-slate-300'
            >
              Privacy Policy
            </a>
            <a
              href='/contact'
              className='text-slate-400 transition-colors hover:text-slate-300'
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
