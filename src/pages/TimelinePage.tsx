/**
 * Timeline Page
 *
 * Dedicated page displaying the full career timeline
 */

import { ScrollToTop } from '@/components/ScrollToTop';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { TimelineVertical } from '@/components/TimelineVertical';
import { Button } from '@/components/ui/button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, User } from 'lucide-react';

export default function TimelinePage() {
  const navigate = useNavigate();

  useDocumentTitle({
    title: 'Career Timeline - Roger Lee Cormier',
    description:
      'Explore 15+ years of progressive technical leadership: U.S. Army Signal Corps veteran, enterprise integration specialist, and PMP-certified Technical Project Manager.',
    keywords: [
      'Career Timeline',
      'Roger Lee Cormier',
      'Technical Project Manager',
      'U.S. Army Veteran',
      'PMP Certified',
      'Enterprise Technology',
      'Digital Transformation',
    ],
    type: 'profile',
  });

  return (
    <div className='min-h-screen bg-surface-base'>
      {/* Hero Section */}
      <div className='px-4 py-12 md:px-8'>
        <div className='mx-auto max-w-5xl'>
          {/* Back Navigation */}
          <Button
            variant='ghost'
            onClick={() => void navigate({ to: '/about' })}
            className='mb-8 text-text-secondary hover:text-strategy-gold'
          >
            <ArrowLeft className='mr-2 size-4' />
            Back to About
          </Button>

          {/* Header */}
          <div className='mb-12 rounded-lg border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-base p-8 md:p-12'>
            <div className='text-center'>
              <p className='mb-3 text-sm font-semibold uppercase tracking-widest text-strategy-gold'>
                15+ Years of Technical Leadership
              </p>
              <h1 className='mb-4 text-4xl font-bold text-text-foreground md:text-5xl'>
                My Professional Journey
              </h1>
              <p className='mx-auto max-w-2xl text-lg text-text-secondary'>
                From military communications specialist to enterprise technology strategist—a career
                built on precision execution, continuous learning, and driving organizational
                transformation.
              </p>
            </div>

            {/* Stats Row */}
            <div className='mt-8 grid grid-cols-2 gap-4 md:grid-cols-4'>
              {[
                { number: '15+', label: 'Years Experience' },
                { number: '7', label: 'Years Military' },
                { number: '150+', label: 'Projects Delivered' },
                { number: '3', label: 'Degrees Earned' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className='rounded-lg border border-border-subtle bg-strategy-gold/5 p-4 text-center'
                >
                  <div className='text-2xl font-bold text-strategy-gold md:text-3xl'>
                    {stat.number}
                  </div>
                  <div className='mt-1 text-xs font-semibold uppercase tracking-widest text-text-tertiary'>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className='px-4 pb-16 md:px-8'>
        <div className='mx-auto max-w-5xl'>
          <SectionHeader
            title='Career Milestones'
            subtitle='Key positions, achievements, and credentials that define my professional path'
          />

          <TimelineVertical />
        </div>
      </div>

      {/* CTA Section */}
      <div className='border-t border-border-subtle px-4 py-16 md:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <div className='rounded-lg border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-base p-12'>
            <h2 className='mb-4 text-3xl font-bold text-text-foreground'>
              Ready to Learn More?
            </h2>
            <p className='mx-auto mb-8 max-w-2xl text-lg text-text-secondary'>
              Explore my portfolio to see how I've applied these skills to drive real-world
              business outcomes.
            </p>
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Button
                onClick={() => void navigate({ to: '/about' })}
                className='bg-strategy-gold px-8 py-3 text-lg font-semibold text-precision-charcoal hover:brightness-110'
              >
                View About Page
                <User className='ml-2 size-5' />
              </Button>
              <Button
                onClick={() => void navigate({ to: '/portfolio' })}
                className='border border-strategy-gold/50 bg-strategy-gold/10 px-8 py-3 text-lg font-semibold text-strategy-gold hover:border-strategy-gold hover:bg-strategy-gold/20'
              >
                Explore Portfolio
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
