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
    title: 'Locker',
    tagline: 'Secure AI memory vault with MCP integration.',
    description:
      'Self-hosted MCP server for persistent AI memory. Architected on Cloudflare edge (Workers, D1, Vectorize) with AES-256-GCM envelope encryption, Graph RAG ingestion, cosine similarity ranking, and DLP scanning for multi-tenant organizational isolation.',
    features: [
      'MCP JSON-RPC tools for LLM memory operations',
      'Autonomous bulk ingestion with Llama 3.3 70B Graph RAG extraction',
      'Cosine similarity ranking via bge-m3 embeddings (Vectorize)',
      'AES-256-GCM encryption, TOTP 2FA, audit logging',
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
  {
    title: 'Caliber',
    tagline: 'Agentic job search platform with AI matching.',
    description:
      'Intelligent background agents autonomously scrape, sync, and analyze multi-source ATS platforms (Lever, Greenhouse, LinkedIn). Integrates resume scoring, dynamic tailoring, and real-time application status tracking with browser automation and provider failover.',
    features: [
      'Autonomous background agents for multi-source aggregation',
      'AI-powered resume scoring and dynamic tailoring',
      'Real-time provider status tracking with retry logic',
      'External application links and status tracking from Discovery to Prepped',
    ],
    url: 'https://caliber.rcormier.dev',
    techStack: [
      'React 19',
      'TanStack Start',
      'Cloudflare D1',
      'Drizzle ORM',
      'Better Auth',
    ],
  },
  {
    title: 'ProOrca',
    tagline: 'Edge-native LMS with AI curriculum generation.',
    description:
      'Modern homeschool learning platform leveraging Cloudflare Workers AI (LLAMA 3.1 70B, Flux) for curriculum generation, image synthesis, and interactive video enrichment. Implements mastery-based learning, graph-based skill mapping, and parent-as-primary identity model.',
    features: [
      'AI-powered curriculum generation and lesson planning',
      'Interactive video assignments with transcript enrichment',
      'Graph-based skill mapping and mastery tracking',
      'Multi-role session impersonation and family-level data isolation',
    ],
    url: 'https://proorca.rcormier.dev',
    techStack: [
      'React 19',
      'TanStack Start',
      'Cloudflare Workers',
      'D1',
      'Better Auth',
    ],
  },
  {
    title: 'Taper',
    tagline: 'Zero-based budgeting with forward-looking financial planning.',
    description:
      'Full-stack zero-based envelope budgeting application. Allocates every dollar of monthly income to defined purposes. Features dashboard analytics, configurable bill windows, receipt uploads, credit tracking, and automated daily cron processing with 17-table Drizzle schema.',
    features: [
      'Income allocation to zero unallocated balance',
      'Recurring bill modeling and override tracking',
      'Receipt uploads and per-occurrence logging',
      'Real-time category budget bars and upcoming bill alerts',
    ],
    url: 'https://taper.rcormier.dev',
    techStack: [
      'React 19',
      'TanStack Start',
      'Cloudflare Workers',
      'D1',
      'Recharts',
    ],
  },
];
