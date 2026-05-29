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
    title: 'Taper',
    tagline: 'Funnel your income with absolute precision.',
    description:
      'A zero-based envelope budgeting app that lets users taper monthly income into targeted, balanced category buckets. Complete allocation with zero waste.',
    features: [
      'Interactive envelope ledger flow',
      'Split chronological timeline tracker',
      'Recurring payment scheduling and real-time alerts',
    ],
    url: 'https://taper.rcormier.dev',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  },
  {
    title: 'Caliber',
    tagline: 'Stop searching. Surface only high-caliber roles.',
    description:
      'An AI-powered job search agent and matches reporter. Deploys background agents to match remote roles, run requirements checks, and tailors ATS resumes.',
    features: [
      'High-curation match scores & verdicts',
      'Unicorn transferable skill detection panels',
      'ATS resume and cover letter one-click builders',
    ],
    url: 'https://caliber.rcormier.dev',
    techStack: [
      'React',
      'TypeScript',
      'Vite',
      'Cloudflare Workers',
      'Drizzle ORM',
    ],
  },
  {
    title: 'ProOrca',
    tagline: 'Plan school like a skill map, not a spreadsheet.',
    description:
      'A map-first homeschool LMS and visual curriculum workspace. Features interactive learning path nodes, custom assignments, and student XP progress currents.',
    features: [
      'Visual skill-map course pathing editor',
      'AI Lesson Planner Chat & quiz checkpoints builder',
      'Student dashboard & rewards currents integration',
    ],
    url: 'https://proorca.rcormier.dev',
    techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
  },
  {
    title: 'Locker',
    tagline: 'Secure memory vault for users and AI.',
    description:
      'A private memory management system with AES-256-GCM encryption. Stores facts semantically, exposes MCP tools for AI chatbots, and includes hybrid search via vector embeddings.',
    features: [
      'AES-256-GCM encryption at rest in Cloudflare D1',
      'MCP JSON-RPC integration for AI memory operations',
      'Hybrid semantic + metadata search via Vectorize',
      'Bulk export to JSON and Markdown',
    ],
    url: 'https://locker.rcormier.dev',
    techStack: [
      'TanStack Start',
      'TypeScript',
      'Cloudflare D1',
      'Vectorize',
      'AES-256',
    ],
  },
];
