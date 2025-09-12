import { MapPin, Mail, ExternalLink, Heart, ArrowUpRight } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { H3, H4, P } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Logo } from '@/components/Logo';

export default function Footer() {
  return (
    <footer className='bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-600/30 relative min-h-[28rem]'>
      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12'>
          {/* Brand Section */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Enhanced Logo and Name with Targeting Theme */}
            <div className='flex items-center gap-4'>
              <Logo size='lg' showTargetingDots={true} />
              <div>
                <H3 className='text-white !mt-0 bg-gradient-to-r from-teal-300 to-blue-300 bg-clip-text text-transparent text-2xl'>
                  Roger Lee Cormier
                </H3>
                <p className='text-orange-200 text-sm font-medium'>
                  Targeting Digital Transformation
                </p>
              </div>
            </div>

            <P className='text-slate-300 !mt-0 text-base leading-relaxed'>
              PMP-certified Technical Project Manager specializing in digital
              transformation, AI automation, and strategic technology
              implementation. Military veteran with a passion for leading with
              integrity and purpose.
            </P>

            <div className='flex flex-col gap-3 text-sm'>
              <div className='flex items-center gap-3 text-slate-300 hover:text-teal-300 transition-colors'>
                <MapPin className='h-4 w-4 text-teal-400' />
                <span>Wellsville, NY</span>
              </div>

              <div className='flex items-center gap-3 text-slate-300 hover:text-teal-300 transition-colors'>
                <Mail className='h-4 w-4 text-teal-400' />
                <a
                  href='mailto:roger@rcormier.dev'
                  className='hover:text-teal-300 transition-colors'
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
            <H4 className='text-white !mt-0 text-sm font-semibold'>
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
                  className='block text-sm text-slate-300 hover:text-teal-300 transition-colors group'
                >
                  <span className='group-hover:translate-x-1 transition-transform duration-200 inline-block'>
                    {link.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section - Clean design */}
        <div className='mb-8 p-8 bg-slate-800/50 rounded-2xl border border-slate-600/30 backdrop-blur-sm min-h-[12rem]'>
          <div className='text-center mb-6'>
            <H4 className='text-white !mt-0 text-lg font-semibold mb-2'>
              Stay Updated with Strategic Insights
            </H4>
            <P className='text-slate-300 !mt-0 text-sm max-w-2xl mx-auto'>
              Get exclusive insights on technology leadership, digital
              transformation, and strategic thinking delivered to your inbox.
            </P>
          </div>

          <NewsletterSignup
            variant='compact'
            title=''
            description=''
            className='!mt-0 !pt-0 !border-t-0'
          />

          {/* Newsletter Preferences Link */}
          <div className='mt-4 text-center'>
            <a
              href='/newsletter-preferences'
              className='inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors hover:underline underline-offset-2'
            >
              Manage newsletter preferences
              <ArrowUpRight className='h-3 w-3' />
            </a>
          </div>
        </div>

        {/* Connect Section - Enhanced with teal accents */}
        <div className='mb-6'>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <a
              href='https://linkedin.com/in/rogerleecormier'
              className='group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300'
              aria-label='LinkedIn'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaLinkedin
                size={16}
                className='text-slate-300 group-hover:text-white transition-colors'
              />
              <span className='text-sm text-slate-200 group-hover:text-white font-medium transition-colors'>
                LinkedIn
              </span>
              <ExternalLink className='h-3 w-3 text-slate-400 group-hover:text-slate-300 transition-colors' />
            </a>

            <a
              href='https://github.com/rogerleecormier'
              className='group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300'
              aria-label='GitHub'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaGithub
                size={16}
                className='text-slate-300 group-hover:text-white transition-colors'
              />
              <span className='text-sm text-slate-200 group-hover:text-white font-medium transition-colors'>
                GitHub
              </span>
              <ExternalLink className='h-3 w-3 text-slate-400 group-hover:text-slate-300 transition-colors' />
            </a>
          </div>
        </div>

        {/* Separator with refined accent */}
        <Separator className='bg-gradient-to-r from-transparent via-slate-600/30 to-transparent mb-6' />

        {/* Bottom Section - Enhanced with teal accents */}
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 text-sm'>
          {/* Copyright and Tech Stack */}
          <div className='flex flex-col sm:flex-row items-center gap-2 text-slate-400'>
            <span>© 2025 Roger Lee Cormier Portfolio</span>
            <span className='hidden sm:inline text-slate-500'>•</span>
            <span className='flex items-center gap-2'>
              Built with <Heart className='h-3 w-3 text-red-400' /> using
              <div className='flex gap-1'>
                <Badge
                  variant='outline'
                  className='text-xs border-slate-500/50 text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 transition-colors'
                >
                  React
                </Badge>
                <Badge
                  variant='outline'
                  className='text-xs border-slate-500/50 text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 transition-colors'
                >
                  TypeScript
                </Badge>
                <Badge
                  variant='outline'
                  className='text-xs border-slate-500/50 text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 transition-colors'
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
              className='text-slate-400 hover:text-slate-300 transition-colors'
            >
              Privacy Policy
            </a>
            <a
              href='/contact'
              className='text-slate-400 hover:text-slate-300 transition-colors'
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
