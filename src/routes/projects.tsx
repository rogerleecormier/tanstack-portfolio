import React from 'react';
import { projectsData } from '../data/projects';
import { ExternalLink, CheckCircle } from 'lucide-react';

export default function Projects() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Independent Applications Showcase
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Edge-native and serverless web tools built to automate key workflows, budgeting allocation, and curated AI matchmaking agents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projectsData.map((project, idx) => (
          <div key={idx} className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-colors flex flex-col justify-between">
            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{project.title}</h2>
                <p className="text-xs text-indigo-400 font-semibold">{project.tagline}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {project.description}
              </p>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Key Features</p>
                {project.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-400">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 pb-6 pt-4 border-t border-slate-900/60 bg-slate-900/20 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech, tIdx) => (
                  <span key={tIdx} className="px-2 py-0.5 rounded-full text-[9px] bg-slate-800 text-slate-400 font-semibold">
                    {tech}
                  </span>
                ))}
              </div>
              <a href={project.url} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors">
                Launch Application <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
