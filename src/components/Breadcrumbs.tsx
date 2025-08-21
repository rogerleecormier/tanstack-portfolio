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

  const crumbs = matches
    .filter(match => match.pathname !== '/')
    .map((match, idx) => ({
      name: formatLabel(match.pathname.replace('/', '') || 'Home'),
      path: match.pathname,
      isLast: idx === matches.length - 1,
    }));

  const homeCrumb = { name: 'Home', path: '/', isLast: crumbs.length === 0 };

  return (
    <nav aria-label="Breadcrumb" className="mb-2">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-teal-100">
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