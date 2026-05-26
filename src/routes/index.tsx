import { createFileRoute } from '@tanstack/react-router';
import { projectsData } from '../data/projects';
import { ArrowDown, Briefcase, Zap, Code } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="space-y-24 pb-24">
      {/* Section 1: Hero */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_60%)] pointer-events-none" />
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 uppercase tracking-wider animate-pulse">
          Enterprise Technology Strategist & TPM
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
          Bridging Business Strategy with <span className="text-indigo-400 bg-clip-text">Technical Execution</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Leading ERP modernizations, orchestrating PMO compliance frameworks, and architecting AI-augmented automated workflows.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a href="#journey" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20">
            Begin the Journey <ArrowDown className="w-4 h-4" />
          </a>
          <a href="/Senior_TPM.pdf" download className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-800 bg-slate-900/60 font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
            Download Resume
          </a>
        </div>
      </section>

      {/* Section 2: The Journey Scroll */}
      <section id="journey" className="max-w-4xl mx-auto px-4 scroll-mt-24">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-16">
          The Strategic Roadmap
        </h2>
        <div className="relative border-l border-slate-800 ml-4 md:ml-12 space-y-16">
          {/* Step 1: Strategic Vision */}
          <div className="relative pl-8 md:pl-16">
            <span className="absolute -left-5 top-0 flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border-2 border-indigo-500">
              <Code className="w-5 h-5 text-indigo-400" />
            </span>
            <h3 className="text-xl font-bold text-white mb-2">1. Strategic Vision</h3>
            <p className="text-slate-400 leading-relaxed">
              Driving multi-entity ERP and AP SaaS platform deployments (NetSuite, Vena, Ramp). Standardizing data patterns to coordinate operations for 150+ education organizations.
            </p>
          </div>
          {/* Step 2: PMO Governance */}
          <div className="relative pl-8 md:pl-16">
            <span className="absolute -left-5 top-0 flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border-2 border-indigo-500">
              <Briefcase className="w-5 h-5 text-indigo-400" />
            </span>
            <h3 className="text-xl font-bold text-white mb-2">2. Operations & Governance</h3>
            <p className="text-slate-400 leading-relaxed">
              Establishing intake pipelines, milestone mapping, and RACI matrices using Smartsheet and Asana to coordinate distributed U.S. and offshore development teams.
            </p>
          </div>
          {/* Step 3: AI & Automation */}
          <div className="relative pl-8 md:pl-16">
            <span className="absolute -left-5 top-0 flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border-2 border-indigo-500">
              <Zap className="w-5 h-5 text-indigo-400" />
            </span>
            <h3 className="text-xl font-bold text-white mb-2">3. Process Automation</h3>
            <p className="text-slate-400 leading-relaxed">
              Reclaiming over 100 manual hours monthly. Integrating Date-triggered AI updating agents with Claude, ChatGPT, and custom Python scripts to streamline PMO triage and document creation.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Metrics Proof */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
          Measurable Outcomes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-4xl font-extrabold text-indigo-400 mb-2">100+ Hours</p>
            <p className="text-sm font-semibold text-slate-300 mb-1">Monthly Time Reclaimed</p>
            <p className="text-xs text-slate-500">Replaced manual PMO status reporting with AI consolidated agents.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-4xl font-extrabold text-indigo-400 mb-2">25 TB</p>
            <p className="text-sm font-semibold text-slate-300 mb-1">Enterprise Content Migrated</p>
            <p className="text-xs text-slate-500">Box to SharePoint migration with custom mappings for 300+ clients.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-4xl font-extrabold text-indigo-400 mb-2">300%</p>
            <p className="text-sm font-semibold text-slate-300 mb-1">Deployment Speed Increase</p>
            <p className="text-xs text-slate-500">Automated QA and POS rollouts via custom python/shell scripting.</p>
          </div>
        </div>
      </section>

      {/* Section 4: Personal Deployments */}
      <section className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
          Active Product Suite
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-10 text-sm">
          Three independent edge-native tools built to streamline workflows, finances, and search agents.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projectsData.map((project, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-left transition-all duration-300 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{project.title}</h3>
                <p className="text-xs text-indigo-400 font-medium mb-3">{project.tagline}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{project.description}</p>
              </div>
              <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white text-xs font-semibold transition-all">
                Launch {project.title}
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
