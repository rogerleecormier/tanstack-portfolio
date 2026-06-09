import { createFileRoute } from '@tanstack/react-router';
import { projectsData } from '../data/projects';
import { ExternalLink, CheckCircle } from 'lucide-react';

export const Route = createFileRoute('/projects')({
  component: Projects,
});

function Projects() {
  return (
    <div className='mx-auto max-w-6xl space-y-12 px-4 py-16'>
      <div className='mx-auto max-w-2xl space-y-4 text-center'>
        <h1 className='text-3xl font-extrabold tracking-tight text-white'>
          Edge-Native Application Portfolio
        </h1>
        <p className='text-sm leading-relaxed text-slate-400'>
          Four production applications demonstrating agentic AI, semantic search,
          financial modeling, and modern edge-native architecture at scale.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2'>
        {projectsData.map((project, idx) => (
          <div
            key={idx}
            className='flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30 transition-colors hover:border-indigo-500/50'
          >
            <div className='space-y-5 p-6'>
              <div>
                <h2 className='mb-1 text-xl font-bold text-white'>
                  {project.title}
                </h2>
                <p className='text-xs font-semibold text-indigo-400'>
                  {project.tagline}
                </p>
              </div>
              <p className='text-xs leading-relaxed text-slate-400'>
                {project.description}
              </p>
              <div className='space-y-2'>
                <p className='text-[10px] font-bold uppercase tracking-wider text-slate-300'>
                  Key Features
                </p>
                {project.features.map((feature, fIdx) => (
                  <div
                    key={fIdx}
                    className='flex items-start gap-2 text-xs text-slate-400'
                  >
                    <CheckCircle className='mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500' />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='space-y-3 border-t border-slate-900/60 bg-slate-900/20 px-6 pb-6 pt-4'>
              <div className='flex flex-wrap gap-1.5'>
                {project.techStack.map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className='rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-semibold text-slate-400'
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <a
                href={project.url}
                target='_blank'
                rel='noreferrer'
                className='inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-indigo-500'
              >
                Launch Application <ExternalLink className='h-3.5 w-3.5' />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
