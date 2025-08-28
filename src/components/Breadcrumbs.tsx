import React from 'react';
import { useMatches, Link } from '@tanstack/react-router';

// Converts 'project-analysis' or 'my_awesome_page' to 'Project Analysis' or 'My Awesome Page'
function formatLabel(str: string) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

const Breadcrumbs: React.FC = () => {
  const matches = useMatches();

  // Get the current pathname and split it into segments
  const currentPath = window.location.pathname;
  const pathSegments = currentPath.split('/').filter(Boolean);

  const crumbs = pathSegments.map((segment, idx) => {
    const path = '/' + pathSegments.slice(0, idx + 1).join('/');
    const isLast = idx === pathSegments.length - 1;
    
    // Handle special cases for better labels
    let name = formatLabel(segment);
    if (segment === 'blog') name = 'Blog';
    if (segment === 'portfolio') name = 'Portfolio';
    if (segment === 'projects') name = 'Projects';
    
    return {
      name,
      path,
      isLast,
    };
  });

  const homeCrumb = { name: 'Home', path: '/', isLast: crumbs.length === 0 };

  return (
    <nav aria-label="Breadcrumb" className="mb-2">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-teal-100">
        <li>
          <Link to={homeCrumb.path} className="hover:underline font-semibold">
            {homeCrumb.name}
          </Link>
        </li>
        {crumbs.map(crumb => (
          <React.Fragment key={crumb.path}>
            <span className="mx-1 text-teal-300">/</span>
            <li>
              {crumb.isLast ? (
                <span className="font-semibold text-white">{crumb.name}</span>
              ) : (
                <Link to={crumb.path} className="hover:underline">
                  {crumb.name}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;