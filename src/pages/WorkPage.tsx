import { fadeUp, stagger } from '@/lib/animations';
import { motion } from 'framer-motion';
import { ArrowUpRight, BarChart3, Brain, Database, Globe, Shield, Zap } from 'lucide-react';
import { useState } from 'react';

type Category = 'All' | 'Digital Transformation' | 'AI & Automation' | 'Infrastructure' | 'Analytics';

interface CaseStudy {
  id: string;
  category: Category;
  era: string;
  org: string;
  title: string;
  problem: string;
  approach: string;
  outcome: string;
  metrics: { value: string; label: string }[];
  tags: string[];
  icon: React.ElementType;
}

const caseStudies: CaseStudy[] = [
  {
    id: 'ramp-netsuite',
    category: 'Digital Transformation',
    era: '2023',
    org: 'Vertex Education',
    title: 'Ramp–NetSuite AP Modernization',
    problem: 'Month-end close took 5+ days due to manual invoice matching across 150+ subsidiaries. AP teams were drowning in spreadsheets.',
    approach: 'Designed a bi-directional Ramp–NetSuite integration via REST APIs with automated GL coding, approval routing, and real-time reconciliation dashboards. Led a 3-month phased rollout with zero disruption.',
    outcome: 'Reduced month-end close cycle by 35%. Eliminated ~60 manual hours per month. AP team now operates at twice the volume with the same headcount.',
    metrics: [
      { value: '35%', label: 'Faster close cycle' },
      { value: '60+', label: 'Manual hours saved/month' },
      { value: '150+', label: 'Subsidiaries integrated' },
    ],
    tags: ['NetSuite', 'Ramp', 'REST API', 'AP Automation', 'Finance Ops'],
    icon: Database,
  },
  {
    id: 'box-sharepoint',
    category: 'Digital Transformation',
    era: '2023',
    org: 'Vertex Education',
    title: 'Box → SharePoint Migration',
    problem: '25TB of unstructured content across Box with inconsistent permissions, redundant files, and no governance. Users had no standard way to find or share documents.',
    approach: 'Built a phased migration plan using SharePoint governance framework: content audit, permission mapping, metadata tagging, and department-by-department cutover. Created training materials and ran user-adoption workshops.',
    outcome: 'Zero data loss. 300+ users migrated and operational within 3 months. Reduced licensing costs and consolidated under M365 ecosystem.',
    metrics: [
      { value: '25TB', label: 'Data migrated' },
      { value: '300+', label: 'Users transitioned' },
      { value: '0', label: 'Data loss incidents' },
    ],
    tags: ['SharePoint', 'Box', 'M365', 'Governance', 'Change Management'],
    icon: Globe,
  },
  {
    id: 'asana-ai-pmo',
    category: 'AI & Automation',
    era: '2024',
    org: 'Vertex Education',
    title: 'AI-Augmented PMO with Asana',
    problem: 'Status reporting was consuming 3–4 hours weekly per PM. Risk was surfaced too late, and executives lacked real-time visibility.',
    approach: 'Implemented Asana AI for automated status summaries, risk flagging, and cross-portfolio health scoring. Built custom Cloudflare Workers to push status digests into Slack and Teams. Created AI-generated weekly exec briefings.',
    outcome: '100+ manual hours reclaimed monthly across the PMO. Risk detection improved with proactive AI flags replacing reactive escalations.',
    metrics: [
      { value: '100+', label: 'Hours reclaimed/month' },
      { value: '4hrs→20min', label: 'Weekly reporting time' },
      { value: 'Proactive', label: 'Risk detection' },
    ],
    tags: ['Asana AI', 'PMO', 'Cloudflare Workers', 'Slack', 'Automation'],
    icon: Brain,
  },
  {
    id: 'pos-rollout',
    category: 'Infrastructure',
    era: '2016–2023',
    org: 'Ravyx (STCR)',
    title: 'Enterprise POS Architecture (150+ Locations)',
    problem: 'Retail chains needed rapid POS rollouts and payment terminal upgrades with minimal store downtime and full PCI compliance.',
    approach: 'Designed and deployed Toshiba TCxSky/4690 POS environments and Verifone/Ingenico payment integrations. Built 30+ automation scripts reducing provisioning time by 300%. Managed 50+ VMware environments for parallel QA validation.',
    outcome: 'Deployed across 150+ retail locations. Self-checkout adoption up 45%. PCI compliance maintained across all deployments.',
    metrics: [
      { value: '150+', label: 'Locations deployed' },
      { value: '300%', label: 'Faster deployments' },
      { value: '45%', label: 'Self-checkout adoption lift' },
    ],
    tags: ['Toshiba TCxSky', 'Verifone', 'PCI', 'VMware', 'Automation'],
    icon: Zap,
  },
  {
    id: 'iraq-comms',
    category: 'Infrastructure',
    era: '2011',
    org: 'U.S. Army – Operation New Dawn',
    title: 'Combat Zone Network Operations',
    problem: 'Mission-critical communications infrastructure at Camp Victory and Al Asad Air Base required 24/7 uptime in a hostile combat environment.',
    approach: 'Engineered and maintained SATCOM, WAN, and RF LOS networks. Supervised NOC operations with immediate failover protocols. Managed tactical satellite terminals, HCLOS links, and encrypted voice/data systems.',
    outcome: '100% mission uptime across entire Iraq deployment. Joint Service Commendation Medal. Joint Meritorious Unit Award.',
    metrics: [
      { value: '100%', label: 'Mission uptime' },
      { value: '24/7', label: 'NOC operations' },
      { value: '2', label: 'Commendations earned' },
    ],
    tags: ['SATCOM', 'WAN', 'NOC', 'Signal Corps', 'Combat Operations'],
    icon: Shield,
  },
  {
    id: 'asset-tracking',
    category: 'Analytics',
    era: '2012–2015',
    org: 'U.S. Army – Fort Drum',
    title: 'Asset Management System ($35M Portfolio)',
    problem: 'Unit had poor visibility into $35M+ of telecommunications and IT assets. Manual tracking created liability and readiness gaps.',
    approach: 'Implemented a structured asset tracking and lifecycle management system. Created inventory protocols, annual inventories, and readiness reporting dashboards. Trained 800+ personnel on deployment procedures.',
    outcome: 'Asset visibility improved by 50%. Commendation Medal for performance. Army Achievement Medal for leadership.',
    metrics: [
      { value: '$35M+', label: 'Assets under management' },
      { value: '50%', label: 'Visibility improvement' },
      { value: '800+', label: 'Personnel trained' },
    ],
    tags: ['Asset Management', 'Inventory', 'Leadership', 'Readiness'],
    icon: BarChart3,
  },
];

const categories: Category[] = ['All', 'Digital Transformation', 'AI & Automation', 'Infrastructure', 'Analytics'];

export default function WorkPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filtered =
    activeCategory === 'All'
      ? caseStudies
      : caseStudies.filter(c => c.category === activeCategory);

  return (
    <div className='min-h-screen bg-surface-base text-text-foreground'>
      {/* Header */}
      <div className='pt-32 pb-16 px-6'>
        <div className='mx-auto max-w-6xl'>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-strategy-gold mb-3'>Case Studies</p>
            <h1 className='text-4xl sm:text-5xl font-bold text-text-foreground mb-4'>
              Work that moved the needle.
            </h1>
            <p className='max-w-2xl text-lg text-text-secondary leading-relaxed'>
              Real projects. Real numbers. No fluff. Each case study below is a problem
              I was handed, the approach I took, and the outcome I delivered.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className='sticky top-20 z-30 bg-surface-base/95 backdrop-blur-md border-y border-border-subtle'>
        <div className='mx-auto max-w-6xl px-6'>
          <div className='flex gap-1 py-3 overflow-x-auto no-scrollbar'>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-strategy-gold text-precision-charcoal shadow-md'
                    : 'text-text-secondary hover:text-text-foreground hover:bg-surface-elevated'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Case studies */}
      <motion.div
        key={activeCategory}
        initial='hidden'
        animate='visible'
        variants={stagger}
        className='mx-auto max-w-6xl px-6 py-16 space-y-8'
      >
        {filtered.map(study => {
          const Icon = study.icon;
          return (
            <motion.article
              key={study.id}
              variants={fadeUp}
              className='rounded-2xl border border-border-subtle bg-surface-elevated overflow-hidden hover:border-strategy-gold/30 transition-all duration-300 group'
            >
              <div className='p-8'>
                {/* Header */}
                <div className='flex items-start justify-between gap-4 mb-6'>
                  <div className='flex items-start gap-4'>
                    <div className='flex-shrink-0 h-12 w-12 rounded-xl bg-strategy-gold/10 border border-strategy-gold/20 flex items-center justify-center group-hover:bg-strategy-gold/20 transition-colors'>
                      <Icon className='h-6 w-6 text-strategy-gold' />
                    </div>
                    <div>
                      <div className='flex flex-wrap items-center gap-2 mb-1'>
                        <span className='text-xs font-semibold text-strategy-gold px-2 py-0.5 rounded bg-strategy-gold/10 border border-strategy-gold/20'>
                          {study.category}
                        </span>
                        <span className='text-xs text-text-tertiary'>{study.era}</span>
                        <span className='text-xs text-text-tertiary'>·</span>
                        <span className='text-xs text-text-tertiary'>{study.org}</span>
                      </div>
                      <h2 className='text-xl font-bold text-text-foreground'>{study.title}</h2>
                    </div>
                  </div>
                  <ArrowUpRight className='h-5 w-5 text-text-tertiary group-hover:text-strategy-gold transition-colors flex-shrink-0 hidden sm:block' />
                </div>

                {/* Content grid */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                  <div>
                    <h3 className='text-[11px] font-bold uppercase tracking-[0.15em] text-text-tertiary mb-2'>The Problem</h3>
                    <p className='text-sm text-text-secondary leading-relaxed'>{study.problem}</p>
                  </div>
                  <div>
                    <h3 className='text-[11px] font-bold uppercase tracking-[0.15em] text-text-tertiary mb-2'>The Approach</h3>
                    <p className='text-sm text-text-secondary leading-relaxed'>{study.approach}</p>
                  </div>
                  <div>
                    <h3 className='text-[11px] font-bold uppercase tracking-[0.15em] text-text-tertiary mb-2'>The Outcome</h3>
                    <p className='text-sm text-text-secondary leading-relaxed'>{study.outcome}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className='flex flex-wrap gap-4 mb-5 p-4 rounded-xl bg-surface-base border border-border-subtle'>
                  {study.metrics.map((m, i) => (
                    <div key={i} className='flex items-baseline gap-2'>
                      <span className='text-xl font-bold text-strategy-gold'>{m.value}</span>
                      <span className='text-xs text-text-tertiary'>{m.label}</span>
                      {i < study.metrics.length - 1 && (
                        <span className='text-border-subtle ml-2'>|</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className='flex flex-wrap gap-1.5'>
                  {study.tags.map(tag => (
                    <span key={tag} className='text-[11px] px-2 py-0.5 rounded-full bg-surface-base border border-border-subtle text-text-tertiary'>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  );
}
