import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';

// Simple title mapping for known routes - no dynamic imports
const routeTitleMap: Record<string, string> = {
  'portfolio': 'Portfolio',
  'blog': 'Blog',
  'tools': 'Tools',
  'markdown-editor': 'Markdown Editor',
  'contact': 'Contact',
  'about': 'About',
  
  // Portfolio pages with actual titles from markdown frontmatter
  'ai-automation': 'AI & Automation',
  'analytics': 'Analytics & Insights',
  'capabilities': 'Capabilities',
  'culture': 'Culture',
  'devops': 'DevOps & Automation',
  'education-certifications': 'Education & Certifications',
  'governance-pmo': 'Governance & PMO',
  'leadership': 'Leadership',
  'product-ux': 'Product & UX',
  'projects': 'Projects',
  'risk-compliance': 'Risk & Compliance',
  'saas': 'ERP & SaaS Integration',
  'strategy': 'Strategy & Vision',
  'talent': 'Talent & Org Design',
  
  // Blog posts with actual titles from markdown frontmatter
  'pmp-digital-transformation-leadership': 'Why I Pursued the PMP to Lead Digital Transformation, Automation, and System Integration Projects',
  'internal-ethos-high-performing-organizations': 'Internal Ethos: High-Performing Organizations',
  'military-leadership-be-know-do': 'Military Leadership: Be • Know • Do',
  'digital-transformation-strategy-governance': 'Digital Transformation Strategy & Governance',
  'asana-ai-status-reporting': 'Asana AI Status Reporting',
  'mkdocs-github-actions-portfolio': 'MkDocs GitHub Actions Portfolio',
  'power-automate-workflow-automation': 'Power Automate Workflow Automation',
  'serverless-ai-workflows-azure-functions': 'Serverless AI Workflows with Azure Functions',
  'pmp-agile-methodology-blend': 'PMP Agile Methodology Blend',
  'ramp-agents-ai-finance-operations': 'Ramp Agents AI Finance Operations'
};

// Converts 'project-analysis' or 'my_awesome_page' to 'Project Analysis' or 'My Awesome Page'
function formatLabel(str: string): string {
  // Check if we have a specific title mapping first
  if (routeTitleMap[str]) {
    return routeTitleMap[str];
  }
  
  // Fallback to formatting the slug
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const pathSegments = currentPath.split('/').filter(Boolean);

  const crumbs = pathSegments.map((segment, idx) => {
    const path = '/' + pathSegments.slice(0, idx + 1).join('/');
    const isLast = idx === pathSegments.length - 1;
    
    let name = formatLabel(segment);
    
    // Special handling for home
    if (idx === 0 && segment === '') {
      name = 'Home';
    }
    
    return {
      name,
      path,
      isLast
    };
  });

  // Add home crumb if not present
  if (crumbs.length === 0 || crumbs[0].name !== 'Home') {
    crumbs.unshift({
      name: 'Home',
      path: '/',
      isLast: false
    });
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-teal-50">
        {crumbs.map((crumb, idx) => (
          <li key={crumb.path} className="flex items-center">
            {idx > 0 && (
              <span className="mx-2 text-teal-200">/</span>
            )}
            {crumb.isLast ? (
              <span className="font-medium text-white">
                {crumb.name}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-teal-50 hover:text-white transition-colors"
              >
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;