/**
 * About Page - Refactored
 *
 * Modern React component-based design featuring:
 * - Hero section with profile
 * - Compressed career timeline
 * - Core expertise grid
 * - Impact/values sections
 * - Contact CTA
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { TimelineCompact } from '@/components/TimelineCompact';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNavigate } from '@tanstack/react-router';
import {
  Brain,
  Briefcase,
  Database,
  Globe,
  Heart,
  MessageSquare,
  Shield,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect } from 'react';

export default function AboutPage() {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // SEO metadata
  useDocumentTitle({
    title: 'About Roger Lee Cormier - Technical Project Manager',
    description:
      'PMP-certified Technical Project Manager specializing in digital transformation, AI automation, and enterprise integration. U.S. Army veteran delivering precision-targeted technology solutions.',
    keywords: [
      'Roger Lee Cormier',
      'Technical Project Manager',
      'PMP Certified',
      'Digital Transformation',
      'AI Automation',
      'Military Veteran',
      'NetSuite',
      'ERP Integration',
    ],
    type: 'profile',
    author: 'Roger Lee Cormier',
  });

  const handleNavigation = (path: string) => {
    void navigate({ to: path });
  };

  return (
    <div className='min-h-screen bg-surface-base'>
      {/* Hero Section */}
      <div className='px-4 py-12 md:px-8'>
        <div className='mx-auto max-w-7xl'>
          <section className='relative overflow-hidden rounded-lg border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-base p-8 md:p-16'>
            {/* Background gradient */}
            <div className='bg-gradient-radial pointer-events-none absolute -right-1/2 -top-1/2 h-96 w-96 from-strategy-gold/10 to-transparent' />

            <div className='relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-5'>
              {/* Profile */}
              <div className='flex flex-col items-center text-center lg:col-span-2'>
                <div className='mb-6 flex size-40 items-center justify-center overflow-hidden rounded-full border-4 border-strategy-gold bg-strategy-gold/10 shadow-lg shadow-strategy-gold/20'>
                  <img
                    src='/images/IMG_1242.JPG'
                    alt='Roger Lee Cormier'
                    className='size-full object-cover'
                  />
                </div>
                <h1 className='mb-2 text-2xl font-bold text-text-foreground'>
                  Roger Lee Cormier
                </h1>
                <p className='text-sm font-semibold uppercase tracking-widest text-strategy-gold'>
                  Technical Project Manager
                </p>

                {/* Badges */}
                <div className='mt-4 flex flex-wrap justify-center gap-2'>
                  {['PMP Certified', 'U.S. Army Veteran', '15+ Years'].map((badge) => (
                    <Badge
                      key={badge}
                      className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className='lg:col-span-3'>
                <p className='mb-3 text-sm font-semibold uppercase tracking-widest text-strategy-gold'>
                  Targeting Digital Transformation with Precision
                </p>

                <h2 className='mb-6 text-3xl font-bold leading-tight text-text-foreground md:text-4xl'>
                  Building Enterprise Solutions with Military Precision
                </h2>

                <p className='mb-8 max-w-2xl text-lg leading-relaxed text-text-secondary'>
                  I bridge the gap between high-level business strategy and complex technical
                  execution. With over 15 years of progressive leadership as a PMP-certified
                  Technical Project Manager and U.S. Army veteran, I specialize in leading
                  digital transformation, governing enterprise-scale SaaS platforms, and
                  optimizing the full DevOps lifecycle.
                </p>

                {/* Stats */}
                <div className='mb-8 grid grid-cols-2 gap-4 md:grid-cols-3'>
                  {[
                    { number: '15+', label: 'Years Experience' },
                    { number: '150+', label: 'Projects Delivered' },
                    { number: '7', label: 'Years Military' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className='rounded-lg border border-border-subtle bg-strategy-gold/5 p-4 text-center'
                    >
                      <div className='text-3xl font-bold text-strategy-gold'>{stat.number}</div>
                      <div className='mt-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary'>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className='flex flex-col gap-4 sm:flex-row'>
                  <Button
                    onClick={() => handleNavigation('/contact')}
                    className='bg-strategy-gold text-precision-charcoal hover:brightness-110'
                  >
                    Get in Touch
                  </Button>
                  <Button
                    onClick={() => handleNavigation('/portfolio')}
                    variant='outline'
                    className='border-strategy-gold text-strategy-gold hover:bg-strategy-gold/10'
                  >
                    View Portfolio
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Timeline Section */}
      <div className='px-4 md:px-8'>
        <div className='mx-auto max-w-7xl'>
          <TimelineCompact />
        </div>
      </div>

      {/* Core Expertise Section */}
      <div className='px-4 py-16 md:px-8'>
        <div className='mx-auto max-w-7xl'>
          <SectionHeader
            title='Core Expertise'
            subtitle="My technical expertise spans the full spectrum of digital transformation—from strategic planning through hands-on implementation."
          />

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {/* DevOps & Cloud */}
            <Card className='group border border-border-subtle bg-surface-elevated transition-all duration-300 hover:border-strategy-gold hover:shadow-lg'>
              <CardHeader className='pb-4'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-lg bg-strategy-gold/10 ring-1 ring-strategy-gold/20'>
                  <Database className='size-6 text-strategy-gold' />
                </div>
                <CardTitle className='text-lg text-text-foreground transition-colors group-hover:text-strategy-gold'>
                  Enterprise DevOps & Cloud
                </CardTitle>
                <CardDescription>
                  CI/CD pipeline governance, serverless architecture, GitHub Actions & Azure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='mb-4 flex flex-wrap gap-2'>
                  {['CI/CD', 'Serverless', 'GitHub Actions'].map((tag) => (
                    <Badge
                      key={tag}
                      className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className='text-sm text-text-secondary'>
                  Leading the design and implementation of mature DevOps practices that drive
                  development velocity and operational stability.
                </p>
              </CardContent>
            </Card>

            {/* SaaS Integration */}
            <Card className='group border border-border-subtle bg-surface-elevated transition-all duration-300 hover:border-strategy-gold hover:shadow-lg'>
              <CardHeader className='pb-4'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-lg bg-strategy-gold/10 ring-1 ring-strategy-gold/20'>
                  <Globe className='size-6 text-strategy-gold' />
                </div>
                <CardTitle className='text-lg text-text-foreground transition-colors group-hover:text-strategy-gold'>
                  SaaS Platform Integration
                </CardTitle>
                <CardDescription>
                  NetSuite, Ramp, API-first integration strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='mb-4 flex flex-wrap gap-2'>
                  {['NetSuite', 'Ramp', 'API Integration'].map((tag) => (
                    <Badge
                      key={tag}
                      className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className='text-sm text-text-secondary'>
                  Architecting enterprise ecosystems with financial workflow automation and
                  real-time visibility across multi-entity operations.
                </p>
              </CardContent>
            </Card>

            {/* AI Automation */}
            <Card className='group border border-border-subtle bg-surface-elevated transition-all duration-300 hover:border-strategy-gold hover:shadow-lg'>
              <CardHeader className='pb-4'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-lg bg-strategy-gold/10 ring-1 ring-strategy-gold/20'>
                  <Brain className='size-6 text-strategy-gold' />
                </div>
                <CardTitle className='text-lg text-text-foreground transition-colors group-hover:text-strategy-gold'>
                  AI-Augmented Workflows
                </CardTitle>
                <CardDescription>
                  Generative AI, automated reporting, intelligent triage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='mb-4 flex flex-wrap gap-2'>
                  {['Gen AI', 'Automation', '40% Overhead Cut'].map((tag) => (
                    <Badge
                      key={tag}
                      className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className='text-sm text-text-secondary'>
                  Championing emerging technologies, leveraging AI to automate reporting,
                  backlog triage, and documentation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Military Foundation Section */}
      <div className='border-t border-border-subtle bg-surface-elevated px-4 py-16 md:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
            <div>
              <p className='mb-3 text-sm font-semibold uppercase tracking-widest text-strategy-gold'>
                Professional Foundation
              </p>
              <h2 className='mb-6 text-3xl font-bold text-text-foreground md:text-4xl'>
                Military to Technology Leadership
              </h2>
              <p className='mb-6 text-lg leading-relaxed text-text-secondary'>
                My career foundation was forged through U.S. Army service, where mission-critical
                reliability wasn't optional—it was mandatory. The discipline, strategic thinking,
                and zero-failure mindset developed in military communications now drive my approach
                to enterprise technology delivery.
              </p>
              <p className='mb-8 text-text-secondary'>
                Deployed to Operation New Dawn (Iraq drawdown), I managed satellite & RF
                communications in high-stakes environments. Led teams under pressure, coordinated
                complex multi-stakeholder operations, and learned that precision and accountability
                translate directly to enterprise technology success.
              </p>

              <div className='flex flex-wrap gap-2'>
                {[
                  'Operation New Dawn',
                  'Signal Corps',
                  'NOC Command',
                  '$35M+ Equipment',
                ].map((badge) => (
                  <Badge key={badge} className='bg-slate-600/20 text-slate-400'>
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              {[
                { icon: Shield, title: 'Mission Focus', desc: 'Zero-failure mindset' },
                { icon: Target, title: 'Precision', desc: 'Exacting standards' },
                { icon: Users, title: 'Leadership', desc: 'Team-first approach' },
                { icon: Zap, title: 'Execution', desc: 'Results-driven' },
              ].map((item) => (
                <Card
                  key={item.title}
                  className='border border-border-subtle bg-surface-base text-center'
                >
                  <CardContent className='pt-6'>
                    <div className='mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-slate-500/10'>
                      <item.icon className='size-6 text-slate-400' />
                    </div>
                    <h3 className='font-semibold text-text-foreground'>{item.title}</h3>
                    <p className='text-sm text-text-secondary'>{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className='px-4 py-16 md:px-8'>
        <div className='mx-auto max-w-7xl'>
          <SectionHeader
            title='Leadership Values'
            subtitle='Principles forged through military service and reinforced through years of professional experience'
          />

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            <Card className='border border-border-subtle bg-surface-elevated'>
              <CardHeader>
                <div className='mb-4 flex size-12 items-center justify-center rounded-lg bg-strategy-gold/10'>
                  <Heart className='size-6 text-strategy-gold' />
                </div>
                <CardTitle className='text-text-foreground'>Integrity & Mission Focus</CardTitle>
                <CardDescription>
                  Ethical technology decisions with unwavering commitment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-text-secondary'>
                  Technology decisions have real consequences. I prioritize ethical solutions that
                  serve genuine business needs. Like military operations, successful projects
                  require clear objectives, disciplined execution, and unwavering commitment to
                  the mission.
                </p>
              </CardContent>
            </Card>

            <Card className='border border-border-subtle bg-surface-elevated'>
              <CardHeader>
                <div className='mb-4 flex size-12 items-center justify-center rounded-lg bg-strategy-gold/10'>
                  <Users className='size-6 text-strategy-gold' />
                </div>
                <CardTitle className='text-text-foreground'>People-Centric Excellence</CardTitle>
                <CardDescription>
                  Leading with empathy while maintaining high standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-text-secondary'>
                  The best technology means nothing without adoption. I lead teams with empathy
                  while maintaining high standards. Precision execution demands meticulous attention
                  to detail—whether targeting communications or enterprise integration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='border-t border-border-subtle px-4 py-16 md:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <div className='rounded-lg border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-base p-12'>
            <h2 className='mb-4 text-3xl font-bold text-text-foreground md:text-4xl'>
              Ready to Transform Your Organization?
            </h2>
            <p className='mx-auto mb-8 max-w-2xl text-lg text-text-secondary'>
              Whether you need enterprise integration expertise, AI automation strategy, or
              digital transformation leadership—I'm here to deliver precision-targeted results.
            </p>
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Button
                onClick={() => handleNavigation('/contact')}
                className='bg-strategy-gold px-8 py-3 text-lg font-semibold text-precision-charcoal hover:brightness-110'
              >
                Start a Conversation
                <MessageSquare className='ml-2 size-5' />
              </Button>
              <Button
                onClick={() => handleNavigation('/portfolio')}
                className='border border-strategy-gold/50 bg-strategy-gold/10 px-8 py-3 text-lg font-semibold text-strategy-gold hover:border-strategy-gold hover:bg-strategy-gold/20'
              >
                View Portfolio
                <Briefcase className='ml-2 size-5' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
