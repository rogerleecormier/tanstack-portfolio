import { fadeUpSlow as fadeUp, stagger } from '@/lib/animations';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BarChart3,
  Brain,
  Briefcase,
  ChevronDown,
  ExternalLink,
  Globe,
  Server,
  Shield,
  Zap,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';

function Section({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const stats = [
  { value: '35%', label: 'Month-end close reduction' },
  { value: '25TB', label: 'Data migrated (300+ users)' },
  { value: '150+', label: 'Retail locations deployed' },
  { value: '100%', label: 'Mission comms uptime (Iraq)' },
];

const journey = [
  {
    icon: Shield,
    era: '2008 – 2015',
    chapter: 'Signal Corps',
    headline: 'Built for mission-critical',
    body: 'U.S. Army Signal Corps. Deployed to Operation New Dawn, Iraq. Engineered SATCOM, WAN, and RF networks at Camp Victory and Al Asad Air Base — zero downtime in a combat environment.',
    tags: ['Operation New Dawn', 'SATCOM', 'NOC Operations', 'E-5 NCO'],
  },
  {
    icon: Server,
    era: '2016 – 2023',
    chapter: 'Enterprise Tech',
    headline: 'Scale across 150+ locations',
    body: 'Technical PM at Ravyx managing POS and payment architecture across 150+ retail locations. Built 30+ automation scripts, cut deployment time by 300%, and drove a 45% lift in self-checkout adoption.',
    tags: ['POS Systems', 'PCI Compliance', 'VMware', 'Automation'],
  },
  {
    icon: Briefcase,
    era: '2022 – Present',
    chapter: 'Digital Transformation',
    headline: 'Turn complexity into outcomes',
    body: 'Technical PM at Vertex Education, leading SaaS delivery, API integrations, and AI-augmented PMO across 150+ K-12 subsidiaries. Reduced month-end close by 35% with Ramp-NetSuite modernization.',
    tags: ['NetSuite', 'Ramp', 'SharePoint', 'AI Automation'],
  },
  {
    icon: Brain,
    era: 'Now',
    chapter: 'AI Era',
    headline: 'Build what didn\'t exist yesterday',
    body: 'Vibe coding with Cloudflare Workers AI. Building agentic tools, autonomous PM workflows, and portfolio apps on the edge. The best PM/Engineer hybrid you\'ll find.',
    tags: ['Cloudflare AI', 'Agentic Tools', 'Edge Computing', 'PMP®'],
  },
];

const expertise = [
  {
    icon: Globe,
    title: 'ERP & SaaS Integration',
    description: 'NetSuite AP modernization, Ramp automation, and multi-system API orchestration that removes friction from finance and ops.',
    tools: ['NetSuite', 'Ramp', 'REST APIs', 'Webhooks'],
  },
  {
    icon: Brain,
    title: 'AI & Automation',
    description: 'Cloudflare Workers AI, Asana AI, and agentic workflows that eliminate repetitive work and surface actionable intelligence.',
    tools: ['Cloudflare AI', 'Asana AI', 'Workflow Automation', 'LLM Integration'],
  },
  {
    icon: BarChart3,
    title: 'Data & Analytics',
    description: 'Operational dashboards, risk detection models, and forecasting tools that turn raw data into leadership-ready decisions.',
    tools: ['Smartsheet', 'Power BI', 'Custom Dashboards', 'Excel Automation'],
  },
  {
    icon: Zap,
    title: 'Migration & Transformation',
    description: '25TB Box → SharePoint with zero disruption. POS rollouts across 150+ locations. Enterprise migrations done right.',
    tools: ['SharePoint', 'Box', 'Change Management', 'PMP Methodology'],
  },
];

const tools = [
  {
    name: 'Spearyx',
    tagline: 'AI-powered project intelligence',
    description: 'Intelligent project tracking with agentic insights, risk detection, and automated status reporting for technical PMs.',
    status: 'live' as const,
    href: 'https://github.com/rogerleecormier/spearyx',
    tags: ['AI', 'Project Management', 'Agentic'],
  },
  {
    name: 'ProOrca',
    tagline: 'Procurement orchestration',
    description: 'Streamline vendor management, RFP workflows, and procurement analytics in one opinionated workspace.',
    status: 'live' as const,
    href: 'https://github.com/rogerleecormier/proorca',
    tags: ['Procurement', 'Vendor Management', 'Analytics'],
  },
  {
    name: 'RACI Builder',
    tagline: 'Role clarity in minutes',
    description: 'Build, edit, and export RACI matrices with Mermaid diagram output. No more messy spreadsheets.',
    status: 'live' as const,
    href: '/tools',
    tags: ['PM Tools', 'Collaboration', 'Export'],
  },
  {
    name: 'Priority Matrix',
    tagline: 'Eisenhower meets modern UX',
    description: 'Drag-and-drop task prioritization with urgency/importance quadrants and XLSX export.',
    status: 'live' as const,
    href: '/tools',
    tags: ['Productivity', 'Task Management'],
  },
];

export default function IndexPage() {
  return (
    <div className='min-h-screen bg-surface-base text-text-foreground overflow-x-hidden'>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className='relative min-h-screen flex items-center pt-20'>
        {/* Subtle radial glow */}
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <div className='w-[800px] h-[600px] rounded-full bg-strategy-gold/5 blur-[120px]' />
        </div>

        <div className='relative mx-auto max-w-6xl px-6 py-24'>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className='inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-strategy-gold/30 bg-strategy-gold/10'>
              <Award className='h-3.5 w-3.5 text-strategy-gold' />
              <span className='text-xs font-semibold text-strategy-gold tracking-wide'>PMP® · U.S. Army Veteran · Builder</span>
            </div>

            <h1 className='text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6'>
              <span className='text-text-foreground'>From </span>
              <span className='text-strategy-gold'>Signal Corps</span>
              <br />
              <span className='text-text-foreground'>to </span>
              <span className='text-strategy-gold'>Silicon</span>
              <span className='text-text-foreground'>.</span>
            </h1>

            <p className='max-w-2xl text-lg sm:text-xl text-text-secondary leading-relaxed mb-10'>
              I'm <strong className='text-text-foreground'>Roger Lee Cormier</strong> — Technical Project Manager, Army veteran, and AI builder.
              I specialize in turning complex enterprise systems into measurable outcomes.
              15+ years. Three sectors. Zero downtime.
            </p>

            <div className='flex flex-wrap gap-4'>
              <Link
                to='/work'
                className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-strategy-gold text-precision-charcoal font-semibold text-sm hover:brightness-110 transition-all duration-200 shadow-lg shadow-strategy-gold/20'
              >
                See My Work <ArrowRight className='h-4 w-4' />
              </Link>
              <Link
                to='/contact'
                className='inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border-subtle text-text-secondary font-semibold text-sm hover:border-strategy-gold hover:text-text-foreground transition-all duration-200'
              >
                Let's Talk
              </Link>
            </div>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className='absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-tertiary'
          >
            <span className='text-[10px] uppercase tracking-[0.2em]'>Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <ChevronDown className='h-4 w-4' />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── IMPACT STATS ──────────────────────────────────────── */}
      <Section className='border-y border-border-subtle bg-surface-elevated'>
        <div className='mx-auto max-w-6xl px-6 py-16'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            {stats.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className='text-center'>
                <div className='text-4xl font-bold text-strategy-gold mb-1'>{s.value}</div>
                <div className='text-xs text-text-secondary'>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── THE JOURNEY ───────────────────────────────────────── */}
      <Section className='py-24'>
        <div className='mx-auto max-w-6xl px-6'>
          <motion.div variants={fadeUp} className='mb-16'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-strategy-gold mb-3'>The Journey</p>
            <h2 className='text-3xl sm:text-4xl font-bold text-text-foreground'>
              Three chapters. One through-line.
            </h2>
            <p className='mt-4 max-w-2xl text-text-secondary'>
              Discipline from the Army. Breadth from enterprise tech. Precision from digital transformation.
              Every chapter compounds on the last.
            </p>
          </motion.div>

          <div className='relative'>
            {/* Vertical line */}
            <div className='absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border-subtle md:-translate-x-px hidden sm:block' />

            <div className='space-y-12'>
              {journey.map((item, i) => {
                const Icon = item.icon;
                const isRight = i % 2 === 1;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className={`relative flex gap-6 md:gap-0 ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'}`}
                  >
                    {/* Timeline dot */}
                    <div className='absolute left-6 md:left-1/2 top-6 -translate-x-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated border border-strategy-gold/40 shadow-lg'>
                      <Icon className='h-4 w-4 text-strategy-gold' />
                    </div>

                    {/* Content card */}
                    <div className={`w-full md:w-[46%] ${isRight ? 'md:mr-[8%]' : 'md:ml-[8%]'} pl-14 sm:pl-0`}>
                      <div className='rounded-xl border border-border-subtle bg-surface-elevated p-6 hover:border-strategy-gold/40 transition-colors duration-300'>
                        <div className='flex items-center gap-3 mb-3'>
                          <span className='text-xs font-bold uppercase tracking-[0.15em] text-strategy-gold px-2 py-0.5 rounded bg-strategy-gold/10 border border-strategy-gold/20'>
                            {item.era}
                          </span>
                          <span className='text-sm font-semibold text-text-foreground'>{item.chapter}</span>
                        </div>
                        <h3 className='text-lg font-bold text-text-foreground mb-2'>{item.headline}</h3>
                        <p className='text-sm text-text-secondary leading-relaxed mb-4'>{item.body}</p>
                        <div className='flex flex-wrap gap-1.5'>
                          {item.tags.map(tag => (
                            <span key={tag} className='text-[11px] px-2 py-0.5 rounded-full bg-surface-base border border-border-subtle text-text-tertiary'>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div variants={fadeUp} className='mt-12 text-center'>
            <Link
              to='/about'
              className='inline-flex items-center gap-2 text-sm font-medium text-strategy-gold hover:underline'
            >
              Read the full story <ArrowRight className='h-4 w-4' />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ── EXPERTISE ─────────────────────────────────────────── */}
      <Section className='py-24 bg-surface-elevated/50'>
        <div className='mx-auto max-w-6xl px-6'>
          <motion.div variants={fadeUp} className='mb-12'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-strategy-gold mb-3'>What I Do</p>
            <h2 className='text-3xl sm:text-4xl font-bold text-text-foreground'>
              Where I create leverage.
            </h2>
          </motion.div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            {expertise.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className='group rounded-xl border border-border-subtle bg-surface-elevated p-6 hover:border-strategy-gold/50 transition-all duration-300'
                >
                  <div className='flex items-start gap-4'>
                    <div className='flex-shrink-0 h-10 w-10 rounded-lg bg-strategy-gold/10 border border-strategy-gold/20 flex items-center justify-center group-hover:bg-strategy-gold/20 transition-colors'>
                      <Icon className='h-5 w-5 text-strategy-gold' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-text-foreground mb-1.5'>{item.title}</h3>
                      <p className='text-sm text-text-secondary leading-relaxed mb-3'>{item.description}</p>
                      <div className='flex flex-wrap gap-1.5'>
                        {item.tools.map(tool => (
                          <span key={tool} className='text-[11px] px-2 py-0.5 rounded-full bg-surface-base border border-border-subtle text-text-tertiary'>
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div variants={fadeUp} className='mt-10 text-center'>
            <Link
              to='/work'
              className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-strategy-gold text-precision-charcoal font-semibold text-sm hover:brightness-110 transition-all duration-200'
            >
              View Case Studies <ArrowRight className='h-4 w-4' />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ── TOOLS ─────────────────────────────────────────────── */}
      <Section className='py-24'>
        <div className='mx-auto max-w-6xl px-6'>
          <motion.div variants={fadeUp} className='mb-12'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-strategy-gold mb-3'>What I Build</p>
            <h2 className='text-3xl sm:text-4xl font-bold text-text-foreground'>
              Tools, not just decks.
            </h2>
            <p className='mt-4 max-w-2xl text-text-secondary'>
              Every tool I build solves a real problem I ran into at work.
              They live in their own repos — production apps, not portfolio toys.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            {tools.map((tool, i) => (
              <motion.a
                key={i}
                variants={fadeUp}
                href={tool.href}
                target={tool.href.startsWith('http') ? '_blank' : undefined}
                rel={tool.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className='group block rounded-xl border border-border-subtle bg-surface-elevated p-6 hover:border-strategy-gold/50 transition-all duration-300'
              >
                <div className='flex items-start justify-between mb-3'>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='font-bold text-text-foreground group-hover:text-strategy-gold transition-colors'>
                        {tool.name}
                      </h3>
                      {tool.status === 'live' && (
                        <span className='inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-strategy-emerald/15 border border-strategy-emerald/30 text-strategy-emerald'>
                          <span className='h-1.5 w-1.5 rounded-full bg-strategy-emerald' />
                          Live
                        </span>
                      )}
                    </div>
                    <p className='text-xs text-strategy-gold font-medium'>{tool.tagline}</p>
                  </div>
                  <ExternalLink className='h-4 w-4 text-text-tertiary group-hover:text-strategy-gold transition-colors flex-shrink-0' />
                </div>
                <p className='text-sm text-text-secondary leading-relaxed mb-4'>{tool.description}</p>
                <div className='flex flex-wrap gap-1.5'>
                  {tool.tags.map(tag => (
                    <span key={tag} className='text-[11px] px-2 py-0.5 rounded-full bg-surface-base border border-border-subtle text-text-tertiary'>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.a>
            ))}
          </div>

          <motion.div variants={fadeUp} className='mt-10 text-center'>
            <Link
              to='/tools'
              className='inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-strategy-gold transition-colors'
            >
              View all tools <ArrowRight className='h-4 w-4' />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <Section className='py-24 border-t border-border-subtle'>
        <div className='mx-auto max-w-3xl px-6 text-center'>
          <motion.div variants={fadeUp} className='space-y-6'>
            <h2 className='text-3xl sm:text-4xl font-bold text-text-foreground'>
              Ready to build something that matters?
            </h2>
            <p className='text-lg text-text-secondary leading-relaxed'>
              Whether you're modernizing a legacy system, integrating AI, or just need a PM who can read the code — let's talk.
            </p>
            <div className='flex flex-wrap justify-center gap-4'>
              <Link
                to='/contact'
                className='inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-strategy-gold text-precision-charcoal font-bold text-sm hover:brightness-110 transition-all duration-200 shadow-lg shadow-strategy-gold/20'
              >
                Start a Conversation
              </Link>
              <a
                href='https://linkedin.com/in/rogerleecormier'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-border-subtle text-text-secondary font-semibold text-sm hover:border-strategy-gold hover:text-text-foreground transition-all duration-200'
              >
                Connect on LinkedIn
              </a>
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
