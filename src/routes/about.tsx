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
    <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Left Column: History & Accordions */}
      <div className="lg:col-span-2 space-y-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-4">
            Professional Journey
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Veteran signals operator, SaaS system architect, and project manager with a proven record of leading large-scale tech implementations.
          </p>
        </div>

        <div className="space-y-4">
          {resumeData.experience.map((job, idx) => (
            <div key={idx} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/20">
              <button onClick={() => toggleAccordion(idx)} className="w-full flex items-center justify-between px-6 py-4 text-left font-bold text-white hover:bg-slate-800/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-indigo-400">{job.role}</p>
                  <p className="text-xs text-slate-400 font-medium">{job.company}</p>
                </div>
                <span className="text-xs text-slate-500 font-medium">{job.period}</span>
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-900 text-xs text-slate-400 space-y-3">
                  {job.points.map((pt, pIdx) => (
                    <p key={pIdx} className="leading-relaxed relative pl-4">
                      <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
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
      <div className="space-y-8">
        {/* Education Block */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" /> Education
          </h2>
          <div className="space-y-4 text-xs">
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="space-y-1">
                <p className="font-bold text-white leading-tight">{edu.degree}</p>
                <p className="text-slate-400 font-semibold">{edu.school}</p>
                <p className="text-slate-500 font-medium">{edu.year}</p>
                {edu.details && <p className="text-[10px] text-indigo-400/80 italic">{edu.details}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Certifications Block */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" /> Credentials
          </h2>
          <div className="space-y-2 text-xs text-slate-300 font-medium">
            {resumeData.certifications.map((cert, idx) => (
              <p key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {cert}
              </p>
            ))}
          </div>
        </div>

        {/* Download Action Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center space-y-4 transition-colors">
          <p className="text-sm font-semibold text-white">Need a PDF Copy?</p>
          <p className="text-xs text-slate-400 leading-normal">
            Download the fully tailored Senior Technical Project Manager (PMP) resume.
          </p>
          <a href="/Senior_TPM.pdf" download className="block w-full text-center py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors">
            Download Senior TPM Resume
          </a>
        </div>
      </div>
    </div>
  );
}
