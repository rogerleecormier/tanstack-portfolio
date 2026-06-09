import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { resumeData } from '../data/resume';
import { Award, GraduationCap, Database, Globe, Brain } from 'lucide-react';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className='mx-auto max-w-6xl space-y-16 px-4 py-16'>
      {/* Intro Section */}
      <div className='space-y-4'>
        <h1 className='text-3xl font-extrabold tracking-tight text-white md:text-4xl'>
          Roger Lee Cormier
        </h1>
        <p className='max-w-2xl text-sm leading-relaxed text-slate-400'>
          AI Technical Architect and Strategic Project Leader. Full-stack
          engineer designing autonomous agents, edge-native systems, and
          multi-platform SaaS integrations. PMP-certified with 15+ years driving
          enterprise transformation through strategic execution, governance
          discipline, and technical excellence across distributed teams.
        </p>
      </div>

      {/* Key Metrics / Stats */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
        {[
          { number: '15+', label: 'Years Experience' },
          { number: '150+', label: 'Projects Delivered' },
          { number: '7 Years', label: 'Military Service' },
        ].map(stat => (
          <div
            key={stat.label}
            className='rounded-xl border border-slate-800 bg-slate-900/30 p-5 text-center'
          >
            <div className='text-3xl font-black text-indigo-400'>
              {stat.number}
            </div>
            <div className='mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500'>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Core Expertise Section */}
      <div className='space-y-6'>
        <div>
          <h2 className='text-xl font-bold text-white md:text-2xl'>
            Core Expertise
          </h2>
          <p className='text-xs text-slate-400'>
            Technical architecture meets strategic execution: agentic AI design,
            edge-native infrastructure, PMO governance, and enterprise SaaS
            orchestration.
          </p>
        </div>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {/* Card 1: AI Agentic */}
          <div className='space-y-4 rounded-xl border border-slate-800 bg-slate-900/20 p-6 transition-colors hover:border-indigo-500/30'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10'>
                <Brain className='h-5 w-5 text-indigo-400' />
              </div>
              <h3 className='text-sm font-bold text-white'>
                Agentic AI & LLM Orchestration
              </h3>
            </div>
            <p className='text-xs leading-normal text-slate-400'>
              Autonomous agents, Graph RAG, MCP integration, semantic search,
              prompt engineering, and LLM inference orchestration across Claude,
              ChatGPT, Gemini, and edge models.
            </p>
            <div className='flex flex-wrap gap-1.5'>
              {['MCP', 'Graph RAG', 'Vectorize'].map(tag => (
                <span
                  key={tag}
                  className='rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[9px] font-semibold text-slate-400'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Edge Native */}
          <div className='space-y-4 rounded-xl border border-slate-800 bg-slate-900/20 p-6 transition-colors hover:border-indigo-500/30'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10'>
                <Database className='h-5 w-5 text-indigo-400' />
              </div>
              <h3 className='text-sm font-bold text-white'>
                Edge-Native Infrastructure
              </h3>
            </div>
            <p className='text-xs leading-normal text-slate-400'>
              Cloudflare ecosystem (Workers, Pages, D1, R2, Vectorize), modern
              full-stack (React 19, TanStack), TypeScript, serverless CI/CD, and
              global performance optimization.
            </p>
            <div className='flex flex-wrap gap-1.5'>
              {['Cloudflare', 'D1', 'Serverless'].map(tag => (
                <span
                  key={tag}
                  className='rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[9px] font-semibold text-slate-400'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3: Enterprise SaaS */}
          <div className='space-y-4 rounded-xl border border-slate-800 bg-slate-900/20 p-6 transition-colors hover:border-indigo-500/30'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10'>
                <Globe className='h-5 w-5 text-indigo-400' />
              </div>
              <h3 className='text-sm font-bold text-white'>
                Enterprise SaaS & Platform Integration
              </h3>
            </div>
            <p className='text-xs leading-normal text-slate-400'>
              Multi-platform API architecture, NetSuite ERP, Ramp, Vena, Box,
              SharePoint, HubSpot. API-first governance, secure integration
              patterns, and compliance-ready automation.
            </p>
            <div className='flex flex-wrap gap-1.5'>
              {['NetSuite', 'Ramp', 'API Design'].map(tag => (
                <span
                  key={tag}
                  className='rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[9px] font-semibold text-slate-400'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 4: Strategic Leadership & PMO */}
          <div className='space-y-4 rounded-xl border border-slate-800 bg-slate-900/20 p-6 transition-colors hover:border-indigo-500/30'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10'>
                <Award className='h-5 w-5 text-indigo-400' />
              </div>
              <h3 className='text-sm font-bold text-white'>
                Strategic Leadership & PMO Governance
              </h3>
            </div>
            <p className='text-xs leading-normal text-slate-400'>
              Enterprise roadmap planning, PMO governance frameworks, RACI
              matrices, risk management, distributed team orchestration, and
              stakeholder alignment. AI-augmented planning and execution.
            </p>
            <div className='flex flex-wrap gap-1.5'>
              {['PMO', 'Leadership', 'Governance'].map(tag => (
                <span
                  key={tag}
                  className='rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[9px] font-semibold text-slate-400'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className='grid grid-cols-1 gap-12 border-t border-slate-900 pt-12 lg:grid-cols-3'>
        {/* Left Column: History & Accordions */}
        <div className='space-y-10 lg:col-span-2'>
          <div>
            <h2 className='mb-4 text-2xl font-bold text-white'>
              Professional Journey
            </h2>
            <p className='text-sm leading-relaxed text-slate-400'>
              Detailed career progression, roles, accomplishments, and skills
              gained across military and commercial sectors.
            </p>
          </div>

          <div className='space-y-4'>
            {resumeData.experience.map((job, idx) => (
              <div
                key={idx}
                className='overflow-hidden rounded-lg border border-slate-800 bg-slate-900/20'
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className='flex w-full items-center justify-between px-6 py-4 text-left font-bold text-white transition-colors hover:bg-slate-800/30'
                >
                  <div>
                    <p className='text-sm font-semibold text-indigo-400'>
                      {job.role}
                    </p>
                    <p className='text-xs font-medium text-slate-400'>
                      {job.company}
                    </p>
                  </div>
                  <span className='text-xs font-medium text-slate-500'>
                    {job.period}
                  </span>
                </button>
                {openIndex === idx && (
                  <div className='space-y-3 border-t border-slate-900 px-6 pb-6 pt-2 text-xs text-slate-400'>
                    {job.points.map((pt, pIdx) => (
                      <p key={pIdx} className='relative pl-4 leading-relaxed'>
                        <span className='absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500' />
                        {pt}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className='space-y-8'>
          {/* Education Block */}
          <div className='space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6'>
            <h2 className='flex items-center gap-2 text-lg font-bold text-white'>
              <GraduationCap className='h-5 w-5 text-indigo-400' /> Education
            </h2>
            <div className='space-y-4 text-xs'>
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className='space-y-1'>
                  <p className='font-bold leading-tight text-white'>
                    {edu.degree}
                  </p>
                  <p className='font-semibold text-slate-400'>{edu.school}</p>
                  <p className='font-medium text-slate-500'>{edu.year}</p>
                  {edu.details && (
                    <p className='text-[10px] italic text-indigo-400/80'>
                      {edu.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Block */}
          <div className='space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6'>
            <h2 className='flex items-center gap-2 text-lg font-bold text-white'>
              <Award className='h-5 w-5 text-indigo-400' /> Credentials
            </h2>
            <div className='space-y-2 text-xs font-medium text-slate-300'>
              {resumeData.certifications.map((cert, idx) => (
                <p key={idx} className='flex items-center gap-2'>
                  <span className='h-1.5 w-1.5 rounded-full bg-indigo-500' />
                  {cert}
                </p>
              ))}
            </div>
          </div>

          {/* Download Action Card */}
          <div className='space-y-4 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-indigo-950/40 p-6 text-center transition-colors hover:border-indigo-500/50'>
            <p className='text-sm font-semibold text-white'>Need a PDF Copy?</p>
            <p className='text-xs leading-normal text-slate-400'>
              Download the fully tailored Senior Technical Project Manager (PMP)
              resume.
            </p>
            <a
              href='/Senior_TPM.pdf'
              download
              className='block w-full rounded-lg bg-indigo-600 py-2.5 text-center text-xs font-bold text-white transition-colors hover:bg-indigo-500'
            >
              Download Senior TPM Resume
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
