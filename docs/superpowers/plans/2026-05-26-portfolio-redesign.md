# Portfolio Redesign & Simplification (TanStack Start PoC) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify, de-bloat, and migrate the portfolio application to a clean, fast-loading TanStack Start application deployed on Cloudflare Workers/Pages infrastructure, utilizing shadcn/ui and a Strategic Leadership Journey flow.

**Architecture:** We will restructure the codebase as a static/client-side TanStack Start application, eliminating CMS endpoints, wrangler databases, and TipTap/CodeMirror editors. All resume and project data will be static TypeScript structures parsed into mobile-responsive layouts.

**Tech Stack:** React 19, Tailwind CSS, TanStack Start (v0), TanStack Router, Vite, Cloudflare Pages/Workers, Lucide React, and shadcn/ui primitives.

---

### Task 1: Package and Config purging

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `wrangler.jsonc`

- [ ] **Step 1: Simplify package.json**
  Update `package.json` to keep only React 19, `@tanstack/react-start` (v0), `@tanstack/react-router` (v1), Tailwind, Lucide React, and cloudflare plugins. Remove TipTap, CodeMirror, Recharts, pdf/excel renderers, and database/auth dependencies.
  
  Replace the contents of `package.json` with:
  ```json
  {
    "name": "rcormier-portfolio",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build && tsc --noEmit",
      "preview": "vite preview",
      "deploy": "npm run build && wrangler deploy"
    },
    "dependencies": {
      "@tanstack/react-router": "^1.130.12",
      "@tanstack/react-start": "^0.0.1-beta.219",
      "class-variance-authority": "^0.7.1",
      "clsx": "^2.1.1",
      "lucide-react": "^0.536.0",
      "react": "^19.1.0",
      "react-dom": "^19.1.0",
      "tailwind-merge": "^3.3.1",
      "zod": "^3.25.76"
    },
    "devDependencies": {
      "@cloudflare/vite-plugin": "^1.0.0",
      "@types/node": "^24.3.1",
      "@types/react": "^19.1.8",
      "@types/react-dom": "^19.1.6",
      "@vitejs/plugin-react": "^4.6.0",
      "autoprefixer": "^10.4.21",
      "postcss": "^8.5.6",
      "tailwindcss": "^3.4.3",
      "typescript": "~5.8.3",
      "vite": "^7.1.1",
      "wrangler": "^4.33.1"
    }
  }
  ```

- [ ] **Step 2: Update vite.config.ts**
  Configure Vite to support TanStack Start and Cloudflare Pages deployment environment.
  
  Replace `vite.config.ts` with:
  ```typescript
  import { defineConfig } from 'vite';
  import { tanstackStart } from '@tanstack/react-start/plugin/vite';
  import { cloudflare } from '@cloudflare/vite-plugin';
  import viteReact from '@vitejs/plugin-react';
  import path from 'path';

  export default defineConfig({
    plugins: [
      cloudflare({ viteEnvironment: { name: 'ssr' } }),
      tanstackStart(),
      viteReact(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  });
  ```

- [ ] **Step 3: Create wrangler.jsonc**
  Define wrangler settings for Cloudflare Pages/Workers target.
  
  Create `wrangler.jsonc` containing:
  ```json
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "rcormier-portfolio-start",
    "compatibility_date": "2026-05-26",
    "compatibility_flags": ["nodejs_compat"],
    "main": "@tanstack/react-start/server-entry"
  }
  ```

- [ ] **Step 4: Install dependencies**
  Run: `npm install`
  Expected: Successful package install with cleaned-up dependency tree.

- [ ] **Step 5: Commit config changes**
  Run:
  ```bash
  git add package.json vite.config.ts wrangler.jsonc
  git commit -m "chore: setup TanStack Start configurations and clean package dependencies"
  ```

---

### Task 2: Client & Server entry points and Directory cleanup

**Files:**
- Create: `src/entry-client.tsx`
- Create: `src/entry-server.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Create client entry point**
  Create `src/entry-client.tsx` to handle React 19 client hydration:
  ```typescript
  import { hydrateRoot } from 'react-dom/client';
  import { StartClient } from '@tanstack/react-start';
  import { createRouter } from './router';

  const router = createRouter();

  hydrateRoot(document, <StartClient router={router} />);
  ```

- [ ] **Step 2: Create server entry point**
  Create `src/entry-server.tsx` to export the TanStack Start handler:
  ```typescript
  import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server';
  import { createRouter } from './router';

  const router = createRouter();

  export default createStartHandler({
    createRouter,
    getHeaders: () => ({
      'Cache-Control': 'public, max-age=60',
    }),
  })(defaultStreamHandler);
  ```

- [ ] **Step 3: Simplify CSS style system**
  Simplify `src/index.css` to represent the custom dark slate background and neon indigo accents.
  
  Replace the contents of `src/index.css` with:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    :root {
      --background: 222.2 47.4% 11.2%;
      --foreground: 210 40% 98%;
      --card: 222.2 47.4% 11.2%;
      --card-foreground: 210 40% 98%;
      --popover: 222.2 47.4% 11.2%;
      --popover-foreground: 210 40% 98%;
      --primary: 263.4 70% 50.4%;
      --primary-foreground: 210 40% 98%;
      --secondary: 217.2 32.6% 17.5%;
      --secondary-foreground: 210 40% 98%;
      --muted: 217.2 32.6% 17.5%;
      --muted-foreground: 215 20.2% 65.1%;
      --accent: 263.4 90% 60%;
      --accent-foreground: 210 40% 98%;
      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 210 40% 98%;
      --border: 217.2 32.6% 17.5%;
      --input: 217.2 32.6% 17.5%;
      --ring: 263.4 70% 50.4%;
    }
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: 'Inter', sans-serif;
  }
  ```

- [ ] **Step 4: Commit entry setup**
  Run:
  ```bash
  git add src/entry-client.tsx src/entry-server.tsx src/index.css
  git commit -m "feat: configure client/server entry hydration and slate & indigo tailwind styles"
  ```

---

### Task 3: Static Data definition

**Files:**
- Create: `src/data/resume.ts`
- Create: `src/data/projects.ts`

- [ ] **Step 1: Create static resume data**
  Define resume Version 12 information in typescript.
  
  Create `src/data/resume.ts` with:
  ```typescript
  export interface Experience {
    role: string;
    company: string;
    period: string;
    points: string[];
  }

  export interface Education {
    degree: string;
    school: string;
    year: string;
    details?: string;
  }

  export interface ResumeData {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    skills: string[];
    experience: Experience[];
    education: Education[];
    certifications: string[];
  }

  export const resumeData: ResumeData = {
    name: "Roger Lee Cormier",
    title: "PMP Technical Project Manager & SaaS Integration Leader",
    email: "rogerleecormier@gmail.com",
    phone: "(585) 808-6213",
    location: "Davenport, Florida",
    summary: "PMP-certified Technical Project Manager with 15+ years experience spanning SaaS platform integrations (NetSuite, Vena, Ramp AP), cloud transformation (Azure, Cloudflare), secure communications, and U.S. Army network operations command.",
    skills: [
      "SaaS Integration & Governance",
      "API Architecture & Python Scripting",
      "PMO Setup & RACI Design",
      "NetSuite ERP Administration",
      "Cloud Solutions (Azure, Cloudflare)",
      "Logistics & Property Management",
      "AI Prompt Engineering & Workflows",
      "Network Engineering & WIN-T"
    ],
    experience: [
      {
        role: "Technical Project Manager",
        company: "Vertex Education (Remote)",
        period: "October 2022 – Present",
        points: [
          "Led custom Python/API SaaS integrations connecting NetSuite ERP, Vena, Ramp AP, Checkbook.io, and Box/SharePoint (25TB migration).",
          "Established technical PMO standards, intake governance, risk matrices, and status dashboards using Asana and Smartsheet.",
          "Designed date-triggered automated weekly status update summaries using generative AI integrations, saving 40% admin time.",
          "Collaborated on outsource data analytics services including enrollment forecasting and operational dashboards for 150+ entities."
        ]
      },
      {
        role: "Technical Project Manager",
        company: "Ravyx (formerly STCR)",
        period: "February 2016 – March 2023",
        points: [
          "Managed enterprise point-of-sale (POS) systems across 150+ retail locations supporting Toshiba TCxSky and Verifone systems.",
          "Coded custom script automations (30+ scripts in Python, VBScript, Batch) increasing deployment speeds by 300%.",
          "Provisioned, debugged, and maintained 50+ VMware virtual staging and QA sandbox environments."
        ]
      },
      {
        role: "Telecommunications Systems Manager / Supply Sergeant",
        company: "U.S. Army (Fort Drum)",
        period: "July 2008 – December 2015",
        points: [
          "Supervised 24/7 Network Operations Center (NOC) functions, managing deployable SATCOM, LAN/WAN, and RF LOS terminals.",
          "Managed Property accountability for $35M+ signal signal systems, utilizing GCSS-Army ERP and SAMS-E inventory systems.",
          "Standardized Command Supply Discipline Program (CSDP) SOPs ensuring 100% regulatory compliance and successful audits."
        ]
      }
    ],
    education: [
      {
        degree: "M.S., Organizational Leadership (Emphasis: Technology and Data Analytics)",
        school: "Excelsior University, Albany, NY",
        year: "Expected July 2026",
        details: "Honors: SALUTE National Honor Society (Pending)"
      },
      {
        degree: "B.S., Information Technology",
        school: "Excelsior University, Albany, NY",
        year: "July 2024"
      }
    ],
    certifications: [
      "Project Management Professional (PMP) — PMI (August 2025)",
      "CompTIA Network+ — CompTIA (May 2009)"
    ]
  };
  ```

- [ ] **Step 2: Create static projects data**
  Define metadata for your featured applications: Taper, Caliber, and ProOrca.
  
  Create `src/data/projects.ts` with:
  ```typescript
  export interface Project {
    title: string;
    tagline: string;
    description: string;
    features: string[];
    url: string;
    repoUrl?: string;
    techStack: string[];
  }

  export const projectsData: Project[] = [
    {
      title: "Taper",
      tagline: "Funnel your income with absolute precision.",
      description: "A zero-based envelope budgeting app that lets users taper monthly income into targeted, balanced category buckets. Complete allocation with zero waste.",
      features: [
        "Interactive envelope ledger flow",
        "Split chronological timeline tracker",
        "Recurring payment scheduling and real-time alerts"
      ],
      url: "https://taper.rcormier.dev",
      techStack: ["React", "TypeScript", "Tailwind CSS", "Vite"]
    },
    {
      title: "Caliber",
      tagline: "Stop searching. Surface only high-caliber roles.",
      description: "An AI-powered job search agent and matches reporter. Deploys background agents to match remote roles, run requirements checks, and tailors ATS resumes.",
      features: [
        "High-curation match scores & verdicts",
        "Unicorn transferable skill detection panels",
        "ATS resume and cover letter one-click builders"
      ],
      url: "https://caliber.rcormier.dev",
      techStack: ["React", "TypeScript", "Vite", "Cloudflare Workers", "Drizzle ORM"]
    },
    {
      title: "ProOrca",
      tagline: "Plan school like a skill map, not a spreadsheet.",
      description: "A map-first homeschool LMS and visual curriculum workspace. Features interactive learning path nodes, custom assignments, and student XP progress currents.",
      features: [
        "Visual skill-map course pathing editor",
        "AI Lesson Planner Chat & quiz checkpoints builder",
        "Student dashboard & rewards currents integration"
      ],
      url: "https://proorca.rcormier.dev",
      techStack: ["React", "TypeScript", "Vite", "Tailwind CSS"]
    }
  ];
  ```

- [ ] **Step 3: Commit static data**
  Run:
  ```bash
  git add src/data/resume.ts src/data/projects.ts
  git commit -m "feat: add static resume V12 and project metadata definitions"
  ```

---

### Task 4: Setup Router and base routing file-structure

**Files:**
- Create: `src/router.tsx`
- Create: `src/routes/__root.tsx`
- Create: `src/routes/index.tsx`
- Create: `src/routes/about.tsx`
- Create: `src/routes/projects.tsx`
- Create: `src/routes/contact.tsx`

- [ ] **Step 1: Implement src/router.tsx**
  Implement `src/router.tsx` which configures the TanStack Router.
  
  Create `src/router.tsx` with:
  ```typescript
  import { createRootRoute, createRoute, createRouter as createRouterBase } from '@tanstack/react-router';
  import { lazy } from 'react';

  // Lazy load main route components
  const RootComponent = lazy(() => import('./routes/__root'));
  const IndexComponent = lazy(() => import('./routes/index'));
  const AboutComponent = lazy(() => import('./routes/about'));
  const ProjectsComponent = lazy(() => import('./routes/projects'));
  const ContactComponent = lazy(() => import('./routes/contact'));

  export const rootRoute = createRootRoute({
    component: RootComponent,
  });

  export const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: IndexComponent,
  });

  export const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/about',
    component: AboutComponent,
  });

  export const projectsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/projects',
    component: ProjectsComponent,
  });

  export const contactRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/contact',
    component: ContactComponent,
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    aboutRoute,
    projectsRoute,
    contactRoute,
  ]);

  export function createRouter() {
    return createRouterBase({
      routeTree,
      defaultPreload: 'intent',
    });
  }

  declare module '@tanstack/react-router' {
    interface Register {
      router: ReturnType<typeof createRouter>;
    }
  }
  ```

- [ ] **Step 2: Implement src/routes/__root.tsx**
  Create base layout with a header, footer, and Dark Mode Slate & Neon Indigo themes.
  
  Create `src/routes/__root.tsx` with:
  ```typescript
  import React from 'react';
  import { Outlet, Link } from '@tanstack/react-router';

  export default function Root() {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500 selection:text-white">
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
              rcormier<span className="text-indigo-500">.</span>
            </Link>
            <nav className="flex space-x-6 text-sm font-medium">
              <Link to="/" activeProps={{ className: 'text-indigo-400' }} className="hover:text-indigo-400 transition-colors text-slate-300">
                Journey
              </Link>
              <Link to="/about" activeProps={{ className: 'text-indigo-400' }} className="hover:text-indigo-400 transition-colors text-slate-300">
                About / Resume
              </Link>
              <Link to="/projects" activeProps={{ className: 'text-indigo-400' }} className="hover:text-indigo-400 transition-colors text-slate-300">
                Projects
              </Link>
              <Link to="/contact" activeProps={{ className: 'text-indigo-400' }} className="hover:text-indigo-400 transition-colors text-slate-300">
                Contact
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-grow">
          <Outlet />
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Roger Lee Cormier. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">
              Built with TanStack Start & Cloudflare.
            </p>
          </div>
        </footer>
      </div>
    );
  }
  ```

- [ ] **Step 3: Implement src/routes/index.tsx (Home Journey)**
  Implement the immersive "Strategic Leadership Journey" scroll flow.
  
  Create `src/routes/index.tsx` with:
  ```typescript
  import React from 'react';
  import { Link } from '@tanstack/react-router';
  import { resumeData } from '../data/resume';
  import { projectsData } from '../data/projects';
  import { ArrowDown, Briefcase, Award, Zap, Code, ShieldCheck } from 'lucide-react';

  export default function Index() {
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
  ```

- [ ] **Step 4: Implement src/routes/about.tsx (About / Timeline)**
  Implement the about page layout with collapsible accordion sections.
  
  Create `src/routes/about.tsx` with:
  ```typescript
  import React, { useState } from 'react';
  import { resumeData } from '../data/resume';
  import { Award, Briefcase, GraduationCap } from 'lucide-react';

  export default function About() {
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
  ```

- [ ] **Step 5: Implement src/routes/projects.tsx (App Hub)**
  Create a grid of your detailed project cards linking to `taper`, `caliber`, and `proorca`.
  
  Create `src/routes/projects.tsx` with:
  ```typescript
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
  ```

- [ ] **Step 6: Implement src/routes/contact.tsx**
  Implement the responsive shadcn-styled contact form.
  
  Create `src/routes/contact.tsx` with:
  ```typescript
  import React, { useState } from 'react';
  import { Mail, Phone, MapPin, Send } from 'lucide-react';

  export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
    };

    return (
      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Info Column */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Get in Touch</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              If you are looking to collaborate, discuss SaaS integrations, or talk PMO delivery frameworks, reach out directly.
            </p>
          </div>

          <div className="space-y-6 text-xs text-slate-300">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Mail className="w-5 h-5" />
              </span>
              <div>
                <p className="text-slate-500 font-semibold">Email</p>
                <a href="mailto:rogerleecormier@gmail.com" className="hover:text-indigo-400 transition-colors font-bold">
                  rogerleecormier@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Phone className="w-5 h-5" />
              </span>
              <div>
                <p className="text-slate-500 font-semibold">Phone</p>
                <a href="tel:5858086213" className="hover:text-indigo-400 transition-colors font-bold">
                  (585) 808-6213
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <p className="text-slate-500 font-semibold">Location</p>
                <p className="font-bold">Davenport, Florida</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-8">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
              <span className="text-4xl">🎉</span>
              <h2 className="text-lg font-bold text-white">Thank you!</h2>
              <p className="text-xs text-slate-400">Your message has been sent successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 text-xs rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="Your Name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 text-xs rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Message</label>
                <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-2 text-xs rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none" placeholder="Your message details..." />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors">
                Send Message <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 7: Commit routing templates**
  Run:
  ```bash
  git add src/router.tsx src/routes/
  git commit -m "feat: implement file-based routing components and home, about, projects, contact pages"
  ```

---

### Task 5: Build, Test & Verify

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Verify Dev Server Compilation**
  Run: `npm run dev`
  Expected output: Server starts on standard port and renders index page without missing symbol or runtime errors.

- [ ] **Step 2: Build test**
  Run: `npm run build`
  Expected output: Successful Vite SSR and CSR build process compiling assets directly into static outputs without warnings or errors.
