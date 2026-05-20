import { fadeUp, stagger } from '@/lib/animations';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';

type Status = 'live' | 'beta' | 'planned';

interface Tool {
  name: string;
  tagline: string;
  description: string;
  status: Status;
  href: string;
  github?: string;
  tags: string[];
  category: string;
  builtWith: string[];
}

const tools: Tool[] = [
  {
    name: 'Spearyx',
    tagline: 'AI-powered project intelligence platform',
    description: 'A project management companion for technical PMs. Spearyx surfaces risk early, generates status updates from commit history, and answers "what\'s blocking us?" before you have to ask. Built with Cloudflare Workers AI and a TanStack-powered frontend.',
    status: 'live',
    href: 'https://github.com/rogerleecormier/spearyx',
    github: 'https://github.com/rogerleecormier/spearyx',
    tags: ['AI', 'Project Management', 'Risk Detection', 'Agentic Workflows'],
    category: 'Project Intelligence',
    builtWith: ['Cloudflare Workers AI', 'TanStack Router', 'React 19', 'D1'],
  },
  {
    name: 'ProOrca',
    tagline: 'Procurement orchestration for ops teams',
    description: 'Structured procurement workflow without the enterprise bloat. ProOrca tracks vendor relationships, automates RFP scoring, and keeps procurement decisions auditable. Built for the ops leader who\'s tired of managing contracts in spreadsheets.',
    status: 'live',
    href: 'https://github.com/rogerleecormier/proorca',
    github: 'https://github.com/rogerleecormier/proorca',
    tags: ['Procurement', 'Vendor Management', 'Workflow Automation', 'Analytics'],
    category: 'Operations',
    builtWith: ['React 19', 'TanStack Router', 'Cloudflare D1', 'Recharts'],
  },
  {
    name: 'RACI Builder',
    tagline: 'Role clarity in under 5 minutes',
    description: 'Build, edit, and export RACI matrices with drag-and-drop simplicity. Outputs clean Mermaid diagrams and exportable formats. No more RACI debates in the wrong doc at the wrong time.',
    status: 'live',
    href: 'https://github.com/rogerleecormier/raci-builder',
    github: 'https://github.com/rogerleecormier/raci-builder',
    tags: ['PM Tools', 'RACI', 'Diagrams', 'Export'],
    category: 'PM Toolkit',
    builtWith: ['React', 'Mermaid', 'ExcelJS', 'TailwindCSS'],
  },
  {
    name: 'Priority Matrix',
    tagline: 'Eisenhower meets modern UX',
    description: 'Drag tasks into urgency/importance quadrants. Export your matrix to XLSX for leadership decks. Simple, fast, and opinionated — just like a good PM should be.',
    status: 'live',
    href: 'https://github.com/rogerleecormier/priority-matrix',
    github: 'https://github.com/rogerleecormier/priority-matrix',
    tags: ['Productivity', 'Task Management', 'Prioritization', 'Export'],
    category: 'PM Toolkit',
    builtWith: ['React', 'DnD Kit', 'ExcelJS', 'TailwindCSS'],
  },
  {
    name: 'Gantt Chart Builder',
    tagline: 'Timeline planning without the enterprise tax',
    description: 'Build visual project timelines from a simple task list. Export as PNG or XLSX. Designed for PMs who need a clean deliverable without opening a $50/seat tool.',
    status: 'beta',
    href: 'https://github.com/rogerleecormier/gantt-builder',
    github: 'https://github.com/rogerleecormier/gantt-builder',
    tags: ['Gantt', 'Timeline', 'Planning', 'Export'],
    category: 'PM Toolkit',
    builtWith: ['React', 'Recharts', 'ExcelJS', 'TailwindCSS'],
  },
  {
    name: 'Risk Assessment Tool',
    tagline: 'Surface risk before it surfaces you',
    description: 'Score risks by likelihood and impact, visualize them on a heat matrix, and export your risk register with one click. Built for the PM who refuses to be surprised.',
    status: 'beta',
    href: 'https://github.com/rogerleecormier/risk-assessment',
    github: 'https://github.com/rogerleecormier/risk-assessment',
    tags: ['Risk Management', 'Matrix', 'Analytics', 'Export'],
    category: 'PM Toolkit',
    builtWith: ['React', 'Recharts', 'ExcelJS', 'TailwindCSS'],
  },
];

const statusConfig: Record<Status, { label: string; dot: string; badge: string }> = {
  live: {
    label: 'Live',
    dot: 'bg-strategy-emerald',
    badge: 'bg-strategy-emerald/15 border-strategy-emerald/30 text-strategy-emerald',
  },
  beta: {
    label: 'Beta',
    dot: 'bg-strategy-gold',
    badge: 'bg-strategy-gold/15 border-strategy-gold/30 text-strategy-gold',
  },
  planned: {
    label: 'Planned',
    dot: 'bg-text-tertiary',
    badge: 'bg-surface-base border-border-subtle text-text-tertiary',
  },
};

export default function ToolsPage() {
  const categories = [...new Set(tools.map(t => t.category))];

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
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-strategy-gold mb-3'>Tools & Apps</p>
            <h1 className='text-4xl sm:text-5xl font-bold text-text-foreground mb-4'>
              Built to solve real problems.
            </h1>
            <p className='max-w-2xl text-lg text-text-secondary leading-relaxed'>
              Every tool here came from a real frustration I had at work.
              They each live in their own repository — independent apps, not embeds.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tools by category */}
      <div className='mx-auto max-w-6xl px-6 pb-24 space-y-16'>
        {categories.map(category => {
          const categoryTools = tools.filter(t => t.category === category);
          return (
            <motion.div
              key={category}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, amount: 0.05 }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className='mb-6'>
                <h2 className='text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary mb-1'>{category}</h2>
                <div className='h-px bg-border-subtle mt-2' />
              </motion.div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
                {categoryTools.map(tool => {
                  const sc = statusConfig[tool.status];
                  return (
                    <motion.div
                      key={tool.name}
                      variants={fadeUp}
                      className='group rounded-2xl border border-border-subtle bg-surface-elevated overflow-hidden hover:border-strategy-gold/40 transition-all duration-300'
                    >
                      <div className='p-6'>
                        {/* Header */}
                        <div className='flex items-start justify-between gap-3 mb-4'>
                          <div>
                            <div className='flex items-center gap-2 mb-1'>
                              <h3 className='text-lg font-bold text-text-foreground group-hover:text-strategy-gold transition-colors'>
                                {tool.name}
                              </h3>
                              <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-semibold ${sc.badge}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                                {sc.label}
                              </span>
                            </div>
                            <p className='text-xs text-strategy-gold font-medium'>{tool.tagline}</p>
                          </div>
                          <div className='flex gap-2'>
                            {tool.github && (
                              <a
                                href={tool.github}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='p-1.5 rounded-lg text-text-tertiary hover:text-strategy-gold hover:bg-strategy-gold/10 transition-all'
                                aria-label='GitHub'
                                onClick={e => e.stopPropagation()}
                              >
                                <Github className='h-4 w-4' />
                              </a>
                            )}
                            <a
                              href={tool.href}
                              target={tool.href.startsWith('http') ? '_blank' : undefined}
                              rel={tool.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className='p-1.5 rounded-lg text-text-tertiary hover:text-strategy-gold hover:bg-strategy-gold/10 transition-all'
                              aria-label='Open'
                            >
                              <ExternalLink className='h-4 w-4' />
                            </a>
                          </div>
                        </div>

                        <p className='text-sm text-text-secondary leading-relaxed mb-4'>{tool.description}</p>

                        {/* Built with */}
                        <div className='mb-3'>
                          <span className='text-[10px] font-bold uppercase tracking-[0.15em] text-text-tertiary'>Built with: </span>
                          <span className='text-[11px] text-text-tertiary'>{tool.builtWith.join(' · ')}</span>
                        </div>

                        {/* Tags */}
                        <div className='flex flex-wrap gap-1.5'>
                          {tool.tags.map(tag => (
                            <span key={tag} className='text-[11px] px-2 py-0.5 rounded-full bg-surface-base border border-border-subtle text-text-tertiary'>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* CTA strip */}
                      <a
                        href={tool.href}
                        target={tool.href.startsWith('http') ? '_blank' : undefined}
                        rel={tool.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className='flex items-center justify-between px-6 py-3 bg-surface-base border-t border-border-subtle text-xs font-semibold text-text-secondary group-hover:text-strategy-gold group-hover:bg-strategy-gold/5 transition-all duration-300'
                      >
                        <span>View repository</span>
                        <ExternalLink className='h-3.5 w-3.5' />
                      </a>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
