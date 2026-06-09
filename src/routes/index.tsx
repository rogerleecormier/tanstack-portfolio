import { createFileRoute } from '@tanstack/react-router';
import { projectsData } from '../data/projects';
import {
  ArrowDown,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Cloud,
  Users,
  TrendingUp,
} from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className='space-y-24 pb-24'>
      {/* Section 1: Hero */}
      <section className='relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center px-4 text-center'>
        <div className='animate-float-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_60%)]' />
        <div className='avatar-glow-container animate-fade-in-up mb-8'>
          <div className='flex size-44 items-center justify-center overflow-hidden rounded-full border-4 border-indigo-500/20 bg-slate-900 shadow-2xl shadow-indigo-500/10'>
            <img
              src='/images/profile.png'
              alt='Roger Lee Cormier'
              className='size-full object-cover'
            />
          </div>
        </div>
        <span className='animate-fade-in-up animation-delay-100 mb-6 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400'>
          AI Agentic Engineer & Enterprise Architect
        </span>
        <h1 className='animate-fade-in-up animation-delay-200 mb-6 text-4xl font-black tracking-tight text-white md:text-6xl'>
          Agentic AI, Enterprise Transformation &{' '}
          <span className='bg-clip-text text-indigo-400'>
            Edge-Native Systems
          </span>
        </h1>
        <p className='animate-fade-in-up animation-delay-300 mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl'>
          Architecting autonomous agents, orchestrating multi-platform SaaS integrations,
          and building edge-native applications powered by AI.
        </p>
        <div className='animate-fade-in-up animation-delay-400 flex flex-col items-center gap-4 sm:flex-row'>
          <a
            href='#journey'
            className='group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-500'
          >
            Begin the Journey{' '}
            <ArrowDown className='h-4 w-4 transition-transform group-hover:translate-y-1' />
          </a>
          <a
            href='/Senior_TPM.pdf'
            download
            className='inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-6 py-3 font-semibold text-slate-300 transition-colors hover:bg-slate-800'
          >
            Download Resume
          </a>
        </div>
      </section>

      {/* Section 2: The Journey Scroll */}
      <section
        id='journey'
        className='scroll-reveal mx-auto max-w-4xl scroll-mt-24 px-4'
      >
        <h2 className='mb-16 text-center text-2xl font-bold text-white md:text-3xl'>
          The Strategic Roadmap
        </h2>
        <div className='relative ml-4 space-y-16 md:ml-12'>
          {/* Static Background Connection Line */}
          <div className='absolute bottom-0 left-0 top-0 w-[2px] bg-slate-800' />
          {/* Active Filling Connection Line */}
          <div className='timeline-fill absolute bottom-0 left-0 top-0 w-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500' />

          {/* Step 1: AI Architecture & Agent Design */}
          <div className='scroll-reveal group relative pl-8 transition-all duration-300 hover:translate-x-1 md:pl-16'>
            <span className='absolute -left-5 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-500 bg-slate-900 transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/10'>
              <Cpu className='h-5 w-5 text-indigo-400 transition-transform group-hover:rotate-6' />
            </span>
            <h3 className='mb-2 text-xl font-bold text-white transition-colors group-hover:text-indigo-400'>
              1. Agentic AI Architecture & Design
            </h3>
            <p className='leading-relaxed text-slate-400'>
              Architecting autonomous background agents, designing Graph RAG
              pipelines, and engineering MCP integrations. Building intelligent
              systems that reason, plan, and execute across SaaS platforms.
            </p>
          </div>

          {/* Step 2: Enterprise SaaS Integration Strategy */}
          <div className='scroll-reveal group relative pl-8 transition-all duration-300 hover:translate-x-1 md:pl-16'>
            <span className='absolute -left-5 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-500 bg-slate-900 transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/10'>
              <Cloud className='h-5 w-5 text-indigo-400 transition-transform group-hover:-rotate-6' />
            </span>
            <h3 className='mb-2 text-xl font-bold text-white transition-colors group-hover:text-indigo-400'>
              2. Enterprise SaaS & Platform Integration
            </h3>
            <p className='leading-relaxed text-slate-400'>
              Architecting multi-platform API ecosystems connecting ERP (NetSuite, Vena),
              spend management (Ramp), and content systems (Box, SharePoint). Building
              scalable, audit-ready integration patterns with governance frameworks.
            </p>
          </div>

          {/* Step 3: PMO Governance & Execution Framework */}
          <div className='scroll-reveal group relative pl-8 transition-all duration-300 hover:translate-x-1 md:pl-16'>
            <span className='absolute -left-5 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-500 bg-slate-900 transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/10'>
              <ShieldCheck className='h-5 w-5 text-indigo-400 transition-transform group-hover:scale-110' />
            </span>
            <h3 className='mb-2 text-xl font-bold text-white transition-colors group-hover:text-indigo-400'>
              3. PMO Governance & Execution
            </h3>
            <p className='leading-relaxed text-slate-400'>
              Institutionalizing PMO discipline with RACI matrices, intake
              governance, risk frameworks, and automated dashboards. Coordinating
              distributed teams across time zones with structured handoffs.
            </p>
          </div>

          {/* Step 4: Edge-Native & Serverless Architecture */}
          <div className='scroll-reveal group relative pl-8 transition-all duration-300 hover:translate-x-1 md:pl-16'>
            <span className='absolute -left-5 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-500 bg-slate-900 transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/10'>
              <Cpu className='h-5 w-5 text-indigo-400 transition-transform group-hover:-rotate-12' />
            </span>
            <h3 className='mb-2 text-xl font-bold text-white transition-colors group-hover:text-indigo-400'>
              4. Edge-Native & Serverless Architecture
            </h3>
            <p className='leading-relaxed text-slate-400'>
              Building modern full-stack applications on Cloudflare Workers,
              D1, and Vectorize. Deploying intelligent APIs, vector databases,
              and autonomous agents at the edge for global performance and resilience.
            </p>
          </div>

          {/* Step 5: AI-Augmented Automation & Process Optimization */}
          <div className='scroll-reveal group relative pl-8 transition-all duration-300 hover:translate-x-1 md:pl-16'>
            <span className='absolute -left-5 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-500 bg-slate-900 transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/10'>
              <Users className='h-5 w-5 text-indigo-400 transition-transform group-hover:scale-110' />
            </span>
            <h3 className='mb-2 text-xl font-bold text-white transition-colors group-hover:text-indigo-400'>
              5. AI-Augmented Automation & Change Management
            </h3>
            <p className='leading-relaxed text-slate-400'>
              Deploying generative AI agents to automate status reporting, PMO
              triage, and workflow optimization. Reclaiming 100+ manual hours monthly
              while driving adoption through UI/UX excellence and champion networks.
            </p>
          </div>

          {/* Step 6: Observability, Scaling & Evolution */}
          <div className='scroll-reveal group relative pl-8 transition-all duration-300 hover:translate-x-1 md:pl-16'>
            <span className='absolute -left-5 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-500 bg-slate-900 transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/10'>
              <TrendingUp className='h-5 w-5 text-indigo-400 transition-transform group-hover:translate-x-0.5' />
            </span>
            <h3 className='mb-2 text-xl font-bold text-white transition-colors group-hover:text-indigo-400'>
              6. Observability, Metrics & Evolution
            </h3>
            <p className='leading-relaxed text-slate-400'>
              Establishing performance baselines, KPI dashboards, and quarterly
              review cadences. Managing continuous evolution through CI/CD pipelines
              and robust monitoring to sustain long-term operational excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Metrics Proof */}
      <section className='scroll-reveal mx-auto max-w-6xl px-4'>
        <h2 className='mb-12 text-center text-2xl font-bold text-white md:text-3xl'>
          Measurable Outcomes
        </h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div className='card-hover-effect rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center'>
            <p className='mb-2 text-4xl font-extrabold text-indigo-400'>
              100+ Hours
            </p>
            <p className='mb-1 text-sm font-semibold text-slate-300'>
              Monthly Time Reclaimed
            </p>
            <p className='text-xs text-slate-500'>
              Replaced manual PMO status reporting with AI consolidated agents.
            </p>
          </div>
          <div className='card-hover-effect rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center'>
            <p className='mb-2 text-4xl font-extrabold text-indigo-400'>
              35% Cut
            </p>
            <p className='mb-1 text-sm font-semibold text-slate-300'>
              Month-End Close Cycle
            </p>
            <p className='text-xs text-slate-500'>
              Automated AP workflows across NetSuite ERP, Vena, and Ramp AP
              integrations.
            </p>
          </div>
          <div className='card-hover-effect rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center'>
            <p className='mb-2 text-4xl font-extrabold text-indigo-400'>300%</p>
            <p className='mb-1 text-sm font-semibold text-slate-300'>
              Deployment Speed Increase
            </p>
            <p className='text-xs text-slate-500'>
              Automated QA and POS rollouts via custom python/shell scripting.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Personal Deployments */}
      <section className='scroll-reveal mx-auto max-w-6xl px-4 text-center'>
        <h2 className='mb-6 text-2xl font-bold text-white md:text-3xl'>
          Edge-Native Product Suite
        </h2>
        <p className='mx-auto mb-10 max-w-xl text-sm text-slate-400'>
          Four independent applications demonstrating agentic AI, semantic search,
          financial modeling, and modern edge architecture.
        </p>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'>
          {projectsData.map((project, idx) => (
            <div
              key={idx}
              className='card-hover-effect group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-left'
            >
              <div>
                <h3 className='mb-1 text-lg font-bold text-white transition-colors group-hover:text-indigo-400'>
                  {project.title}
                </h3>
                <p className='mb-3 text-xs font-medium text-indigo-400'>
                  {project.tagline}
                </p>
                <p className='mb-4 text-xs leading-relaxed text-slate-400'>
                  {project.description}
                </p>
              </div>
              <a
                href={project.url}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center justify-center rounded-lg bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-400 transition-all hover:bg-indigo-500 hover:text-white'
              >
                Launch {project.title}
                <ArrowUpRight className='ml-1 h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
