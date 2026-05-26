import { createFileRoute } from '@tanstack/react-router';
import { projectsData } from '../data/projects';
import { ArrowDown, Briefcase, Zap, Code } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className='space-y-24 pb-24'>
      {/* Section 1: Hero */}
      <section className='relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center px-4 text-center'>
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_60%)]' />
        <div className='mb-8 flex size-32 items-center justify-center overflow-hidden rounded-full border-4 border-indigo-500/20 bg-slate-900 shadow-2xl shadow-indigo-500/10'>
          <img
            src='/images/IMG_1242.JPG'
            alt='Roger Lee Cormier'
            className='size-full object-cover'
          />
        </div>
        <span className='mb-6 animate-pulse rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400'>
          Enterprise Technology Strategist
        </span>
        <h1 className='mb-6 text-4xl font-black tracking-tight text-white md:text-6xl'>
          Bridging Business Strategy with{' '}
          <span className='bg-clip-text text-indigo-400'>
            Technical Execution
          </span>
        </h1>
        <p className='mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl'>
          Leading ERP modernizations, orchestrating PMO compliance frameworks,
          and architecting AI-augmented automated workflows.
        </p>
        <div className='flex flex-col items-center gap-4 sm:flex-row'>
          <a
            href='#journey'
            className='inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-500'
          >
            Begin the Journey <ArrowDown className='h-4 w-4' />
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
      <section id='journey' className='mx-auto max-w-4xl scroll-mt-24 px-4'>
        <h2 className='mb-16 text-center text-2xl font-bold text-white md:text-3xl'>
          The Strategic Roadmap
        </h2>
        <div className='relative ml-4 space-y-16 border-l border-slate-800 md:ml-12'>
          {/* Step 1: Strategic Vision */}
          <div className='relative pl-8 md:pl-16'>
            <span className='absolute -left-5 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-500 bg-slate-900'>
              <Code className='h-5 w-5 text-indigo-400' />
            </span>
            <h3 className='mb-2 text-xl font-bold text-white'>
              1. Strategic Vision
            </h3>
            <p className='leading-relaxed text-slate-400'>
              Driving multi-entity ERP and AP SaaS platform deployments
              (NetSuite, Vena, Ramp). Standardizing data patterns to coordinate
              operations for 150+ education organizations.
            </p>
          </div>
          {/* Step 2: PMO Governance */}
          <div className='relative pl-8 md:pl-16'>
            <span className='absolute -left-5 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-500 bg-slate-900'>
              <Briefcase className='h-5 w-5 text-indigo-400' />
            </span>
            <h3 className='mb-2 text-xl font-bold text-white'>
              2. Operations & Governance
            </h3>
            <p className='leading-relaxed text-slate-400'>
              Establishing intake pipelines, milestone mapping, and RACI
              matrices using Smartsheet and Asana to coordinate distributed U.S.
              and offshore development teams.
            </p>
          </div>
          {/* Step 3: AI & Automation */}
          <div className='relative pl-8 md:pl-16'>
            <span className='absolute -left-5 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-500 bg-slate-900'>
              <Zap className='h-5 w-5 text-indigo-400' />
            </span>
            <h3 className='mb-2 text-xl font-bold text-white'>
              3. Process Automation
            </h3>
            <p className='leading-relaxed text-slate-400'>
              Reclaiming over 100 manual hours monthly. Integrating
              Date-triggered AI updating agents with Claude, ChatGPT, and custom
              Python scripts to streamline PMO triage and document creation.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Metrics Proof */}
      <section className='mx-auto max-w-6xl px-4'>
        <h2 className='mb-12 text-center text-2xl font-bold text-white md:text-3xl'>
          Measurable Outcomes
        </h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div className='rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center'>
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
          <div className='rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center'>
            <p className='mb-2 text-4xl font-extrabold text-indigo-400'>
              25 TB
            </p>
            <p className='mb-1 text-sm font-semibold text-slate-300'>
              Enterprise Content Migrated
            </p>
            <p className='text-xs text-slate-500'>
              Box to SharePoint migration with custom mappings for 300+ clients.
            </p>
          </div>
          <div className='rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center'>
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
      <section className='mx-auto max-w-6xl px-4 text-center'>
        <h2 className='mb-6 text-2xl font-bold text-white md:text-3xl'>
          Active Product Suite
        </h2>
        <p className='mx-auto mb-10 max-w-xl text-sm text-slate-400'>
          Three independent edge-native tools built to streamline workflows,
          finances, and search agents.
        </p>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {projectsData.map((project, idx) => (
            <div
              key={idx}
              className='flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-left transition-all duration-300 hover:border-indigo-500/50'
            >
              <div>
                <h3 className='mb-1 text-lg font-bold text-white'>
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
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
