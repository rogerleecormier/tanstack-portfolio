import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { resumeData } from '../data/resume';
import { Award, GraduationCap } from 'lucide-react';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className='mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 lg:grid-cols-3'>
      {/* Left Column: History & Accordions */}
      <div className='space-y-10 lg:col-span-2'>
        <div>
          <h1 className='mb-4 text-3xl font-extrabold tracking-tight text-white'>
            Professional Journey
          </h1>
          <p className='text-sm leading-relaxed text-slate-400'>
            Veteran signals operator, SaaS system architect, and project manager
            with a proven record of leading large-scale tech implementations.
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
  );
}
