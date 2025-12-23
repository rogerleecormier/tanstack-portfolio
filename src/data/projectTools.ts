/**
 * Shared project tools data
 * These are projects that are not stored in KV cache but have dedicated routes
 */

export interface ProjectTool {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  tags: string[];
  status: 'active' | 'beta' | 'coming-soon';
}

/**
 * Project tools that have dedicated routes (not from KV cache)
 * These are combined with KV cache projects for display
 */
export const projectTools: ProjectTool[] = [
  {
    id: 'healthbridge-enhanced',
    title: 'HealthBridge Enhanced',
    description:
      'Advanced weight loss tracking dashboard with projections and comprehensive health analytics. Features weight loss projections, trend analysis, and data visualization in pounds.',
    category: 'Health & Wellness',
    url: '/projects/healthbridge-enhanced',
    tags: ['Health Analytics', 'Weight Tracking', 'Predictive Modeling', 'Cloudflare Workers'],
    status: 'active',
  },
  {
    id: 'markdown-editor',
    title: 'Markdown Editor',
    description:
      'Advanced markdown editing platform with live preview, comprehensive formatting support, and integrated content management for seamless writing and publishing workflows.',
    category: 'Content Creation',
    url: '/projects/markdown',
    tags: ['Markdown', 'Live Preview', 'WYSIWYG', 'Content Management'],
    status: 'active',
  },
  {
    id: 'raci-builder',
    title: 'RACI Chart Builder',
    description:
      'Create professional RACI matrices to define roles and responsibilities for your projects. Generate interactive tables and exportable Mermaid diagrams.',
    category: 'Project Management',
    url: '/projects/raci-builder',
    tags: ['RACI', 'Project Management', 'Responsibility Matrix', 'Mermaid'],
    status: 'active',
  },
  {
    id: 'priority-matrix',
    title: 'Priority Matrix Generator',
    description:
      'Prioritize your tasks using the Eisenhower Matrix based on importance and urgency. Visualize quadrants and export to XLSX for offline use.',
    category: 'Project Management',
    url: '/projects/priority-matrix',
    tags: ['Eisenhower Matrix', 'Task Prioritization', 'XLSX Export'],
    status: 'active',
  },
  {
    id: 'gantt-chart',
    title: 'Gantt Chart Builder',
    description:
      'Build project timelines with task durations and dates. Visualize with interactive Gantt charts and export to XLSX. Ready for AI-optimized scheduling.',
    category: 'Project Management',
    url: '/projects/gantt-chart',
    tags: ['Gantt Chart', 'Timeline', 'Project Planning', 'XLSX Export'],
    status: 'coming-soon',
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment Tool',
    description:
      'Assess project risks with likelihood and impact scores. Generate matrix table with risk levels and export to XLSX. Ready for AI mitigation suggestions.',
    category: 'Project Management',
    url: '/projects/risk-assessment',
    tags: ['Risk Assessment', 'Risk Matrix', 'Project Management', 'XLSX Export'],
    status: 'coming-soon',
  },
];
