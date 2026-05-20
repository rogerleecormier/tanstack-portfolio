import { fadeUp, stagger } from '@/lib/animations';
import { motion } from 'framer-motion';
import { Award, Briefcase, GraduationCap, Shield } from 'lucide-react';
import { Link } from '@tanstack/react-router';

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const certifications = [
  { label: 'Project Management Professional (PMP®)', org: 'Project Management Institute', year: '2025' },
  { label: 'Network+ Certification', org: 'CompTIA', year: '2009' },
];

const education = [
  {
    degree: 'M.S. Organizational Leadership',
    school: 'Excelsior University',
    detail: 'Technology & Data Analytics emphasis · SALUTE Honor Society · In Progress',
    year: '2024–Present',
  },
  {
    degree: 'B.S. Information Technology',
    school: 'Excelsior University',
    detail: 'Completed while serving in active duty and civilian tech roles',
    year: '2012–2024',
  },
  {
    degree: 'A.A.S. Technical Studies',
    school: 'Excelsior College',
    detail: 'Computer Technologies concentration',
    year: '2009–2011',
  },
];

const timeline = [
  {
    period: 'Oct 2022 – Present',
    role: 'Technical Project Manager',
    org: 'Vertex Education',
    type: 'career' as const,
    bullets: [
      'Lead SaaS platform delivery and API integration architecture for 150+ K-12 subsidiaries',
      'Ramp–NetSuite AP modernization: 35% reduction in month-end close cycle',
      'Box → SharePoint migration: 25TB, 300+ users, zero data loss',
      'Asana AI-augmented PMO: 100+ manual hours reclaimed monthly',
      'Cloudflare Workers AI integration for autonomous status reporting',
    ],
  },
  {
    period: 'Jan 2016 – May 2023',
    role: 'Technical PM / Integrations Specialist',
    org: 'Ravyx (formerly STCR)',
    type: 'career' as const,
    bullets: [
      'Directed POS and payment system architecture across 150+ retail locations',
      'Toshiba TCxSky/4690, Verifone/Ingenico, PCI-compliant payment integrations',
      '30+ automation scripts — deployment time reduced by 300%',
      '50+ VMware environments managed for QA validation',
      '45% increase in self-checkout adoption through UX optimization',
    ],
  },
  {
    period: 'Jan 2012 – Dec 2015',
    role: 'Telecom Systems Manager / Logistics Manager',
    org: 'U.S. Army – Fort Drum, NY',
    type: 'military' as const,
    bullets: [
      'Led 24/7 NOC operations as NCOIC (E-5 Sergeant)',
      'Supply Sergeant: governed $35M+ in telecommunications and IT assets',
      'Implemented asset tracking system — 50% improvement in visibility',
      'Trained 800+ personnel on deployment readiness procedures',
      'Army Commendation Medal · Army Achievement Medal',
    ],
  },
  {
    period: 'Jan 2011 – Dec 2011',
    role: 'Telecom Systems Manager',
    org: 'U.S. Army – Operation New Dawn, Iraq',
    type: 'military' as const,
    bullets: [
      'Deployed to Camp Victory and Al Asad Air Base, Iraq',
      'Engineered SATCOM, WAN, and RF LOS networks in combat conditions',
      '100% mission-critical communications uptime across full deployment',
      'Supervised 24/7 NOC operations with immediate failover protocols',
      'Joint Service Commendation Medal · Joint Meritorious Unit Award',
    ],
  },
  {
    period: 'Jul 2008 – Jan 2011',
    role: 'Telecom Systems Operator',
    org: 'U.S. Army – Fort Bragg, NC',
    type: 'military' as const,
    bullets: [
      '25Q MOS: Multichannel Transmission Systems Operator-Maintainer',
      'Operated STT satellite terminals, HCLOS, Harris radios, Promina multiplexers',
      'Configured WIN-T infrastructure for encrypted tactical communications',
      '18th Airborne Corps · Good Conduct Medal',
    ],
  },
];

const skills = [
  { category: 'Project Management', items: ['PMP® Methodology', 'Agile / Scrum', 'Stakeholder Management', 'Risk Management', 'Change Management', 'PMO Operations'] },
  { category: 'Technical', items: ['REST API Integration', 'Cloudflare Workers / AI', 'NetSuite', 'SharePoint / M365', 'VMware', 'SQL / D1'] },
  { category: 'AI & Automation', items: ['Cloudflare Workers AI', 'Asana AI', 'Agentic Workflows', 'LLM Integration', 'Workflow Automation', 'Prompt Engineering'] },
  { category: 'Leadership', items: ['Cross-functional Teams', 'Executive Communication', 'Vendor Management', 'Budget Oversight', 'Military NCO Leadership', 'Mentoring'] },
];

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-surface-base text-text-foreground'>
      {/* Hero */}
      <div className='pt-32 pb-16 px-6 border-b border-border-subtle'>
        <div className='mx-auto max-w-6xl'>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'
          >
            <div>
              <p className='text-xs font-bold uppercase tracking-[0.2em] text-strategy-gold mb-3'>About</p>
              <h1 className='text-4xl sm:text-5xl font-bold text-text-foreground mb-6 leading-tight'>
                I bridge the gap between strategy and execution.
              </h1>
              <p className='text-lg text-text-secondary leading-relaxed mb-6'>
                I'm Roger Lee Cormier — PMP®-certified Technical Project Manager, U.S. Army veteran,
                and builder of enterprise systems that actually work. I specialize in digital transformation,
                AI integration, and making complex organizations move faster.
              </p>
              <p className='text-text-secondary leading-relaxed'>
                My career spans three distinct chapters: Signal Corps communications under combat conditions,
                enterprise POS infrastructure across 150+ retail locations, and leading AI-augmented
                digital transformation in K-12 education. Each chapter made me a sharper problem-solver
                and a more effective leader.
              </p>
            </div>
            <div className='relative'>
              <div className='aspect-[4/5] max-w-sm mx-auto rounded-2xl overflow-hidden border border-border-subtle'>
                <img
                  src='/images/IMG_1242.JPG'
                  alt='Roger Lee Cormier'
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='absolute -bottom-4 right-4 bg-surface-elevated border border-strategy-gold/30 rounded-xl px-4 py-3 shadow-lg'>
                <div className='flex items-center gap-2'>
                  <Award className='h-5 w-5 text-strategy-gold' />
                  <div>
                    <div className='text-xs font-bold text-text-foreground'>PMP® Certified</div>
                    <div className='text-[10px] text-text-tertiary'>PMI · 2025</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Career Timeline */}
      <Section className='py-20 px-6'>
        <div className='mx-auto max-w-6xl'>
          <motion.div variants={fadeUp} className='mb-12'>
            <div className='flex items-center gap-3 mb-2'>
              <Briefcase className='h-5 w-5 text-strategy-gold' />
              <h2 className='text-2xl font-bold text-text-foreground'>Career & Service</h2>
            </div>
            <div className='h-px bg-border-subtle mt-3' />
          </motion.div>

          <div className='space-y-8'>
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className='relative pl-8 border-l-2 border-border-subtle hover:border-strategy-gold/50 transition-colors duration-300'
              >
                <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${
                  item.type === 'military'
                    ? 'border-text-tertiary bg-surface-base'
                    : 'border-strategy-gold bg-surface-base'
                }`} />

                <div className='flex flex-wrap items-center gap-2 mb-1'>
                  <span className='text-xs font-bold text-text-tertiary'>{item.period}</span>
                  {item.type === 'military' && (
                    <span className='inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle text-text-tertiary'>
                      <Shield className='h-2.5 w-2.5' /> Military
                    </span>
                  )}
                </div>
                <h3 className='text-base font-bold text-text-foreground mb-0.5'>{item.role}</h3>
                <p className='text-sm font-medium text-strategy-gold mb-3'>{item.org}</p>
                <ul className='space-y-1.5'>
                  {item.bullets.map((b, j) => (
                    <li key={j} className='flex items-start gap-2 text-sm text-text-secondary'>
                      <span className='mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-strategy-gold/50' />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Skills */}
      <Section className='py-20 px-6 bg-surface-elevated/30 border-y border-border-subtle'>
        <div className='mx-auto max-w-6xl'>
          <motion.div variants={fadeUp} className='mb-12'>
            <h2 className='text-2xl font-bold text-text-foreground mb-1'>Core Capabilities</h2>
            <div className='h-px bg-border-subtle mt-3' />
          </motion.div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {skills.map((group, i) => (
              <motion.div key={i} variants={fadeUp}>
                <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-strategy-gold mb-3'>{group.category}</h3>
                <div className='flex flex-wrap gap-1.5'>
                  {group.items.map(skill => (
                    <span key={skill} className='text-xs px-2.5 py-1 rounded-lg bg-surface-base border border-border-subtle text-text-secondary hover:border-strategy-gold/40 hover:text-text-foreground transition-colors cursor-default'>
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Education & Certifications */}
      <Section className='py-20 px-6'>
        <div className='mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16'>
          <div>
            <motion.div variants={fadeUp} className='mb-8'>
              <div className='flex items-center gap-3 mb-2'>
                <GraduationCap className='h-5 w-5 text-strategy-gold' />
                <h2 className='text-2xl font-bold text-text-foreground'>Education</h2>
              </div>
              <div className='h-px bg-border-subtle mt-3' />
            </motion.div>
            <div className='space-y-6'>
              {education.map((edu, i) => (
                <motion.div key={i} variants={fadeUp} className='pl-6 border-l-2 border-border-subtle'>
                  <div className='text-xs font-bold text-text-tertiary mb-1'>{edu.year}</div>
                  <div className='font-semibold text-text-foreground'>{edu.degree}</div>
                  <div className='text-sm text-strategy-gold font-medium mb-1'>{edu.school}</div>
                  <div className='text-xs text-text-secondary'>{edu.detail}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <motion.div variants={fadeUp} className='mb-8'>
              <div className='flex items-center gap-3 mb-2'>
                <Award className='h-5 w-5 text-strategy-gold' />
                <h2 className='text-2xl font-bold text-text-foreground'>Certifications</h2>
              </div>
              <div className='h-px bg-border-subtle mt-3' />
            </motion.div>
            <div className='space-y-4'>
              {certifications.map((cert, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className='flex items-start gap-4 p-4 rounded-xl border border-border-subtle bg-surface-elevated hover:border-strategy-gold/30 transition-colors'
                >
                  <div className='flex-shrink-0 h-10 w-10 rounded-lg bg-strategy-gold/10 border border-strategy-gold/20 flex items-center justify-center'>
                    <Award className='h-5 w-5 text-strategy-gold' />
                  </div>
                  <div>
                    <div className='font-semibold text-text-foreground text-sm'>{cert.label}</div>
                    <div className='text-xs text-text-secondary mt-0.5'>{cert.org} · {cert.year}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className='py-16 px-6 border-t border-border-subtle'>
        <div className='mx-auto max-w-6xl'>
          <motion.div variants={fadeUp} className='flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-border-subtle bg-surface-elevated p-8'>
            <div>
              <h2 className='text-xl font-bold text-text-foreground mb-1'>Ready to work together?</h2>
              <p className='text-sm text-text-secondary'>I'm open to TPM roles, consulting engagements, and interesting collaborations.</p>
            </div>
            <div className='flex gap-3 flex-shrink-0'>
              <Link
                to='/contact'
                className='px-5 py-2.5 rounded-lg bg-strategy-gold text-precision-charcoal font-semibold text-sm hover:brightness-110 transition-all'
              >
                Get in Touch
              </Link>
              <Link
                to='/work'
                className='px-5 py-2.5 rounded-lg border border-border-subtle text-text-secondary font-semibold text-sm hover:border-strategy-gold hover:text-text-foreground transition-all'
              >
                View Work
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
