import { useParams } from '@tanstack/react-router';
import PortfolioPage from '../pages/PortfolioPage';
import ProjectsPage from '../pages/ProjectsPage';

// Wrapper components for dynamic routes
export function PortfolioPageWrapper() {
  const params: unknown = useParams({ from: '/portfolio/$slug' });
  const slug =
    params &&
    typeof params === 'object' &&
    'slug' in params &&
    typeof (params as { slug: unknown }).slug === 'string'
      ? (params as { slug: string }).slug
      : '';
  return <PortfolioPage file={`portfolio/${slug}`} />;
}

export function ProjectsPageWrapper() {
  const params: unknown = useParams({ from: '/projects/$slug' });
  const slug =
    params &&
    typeof params === 'object' &&
    'slug' in params &&
    typeof (params as { slug: unknown }).slug === 'string'
      ? (params as { slug: string }).slug
      : '';
  return <ProjectsPage file={`projects/${slug}`} />;
}

// Error boundary component for the root route
export function RootErrorBoundary() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <h1 className='mb-4 text-2xl font-bold text-gray-900'>
          Something went wrong
        </h1>
        <p className='mb-4 text-gray-600'>
          We're sorry, but something unexpected happened.
        </p>
        <button
          onClick={() => window.location.reload()}
          className='rounded bg-strategy-gold px-4 py-2 text-white transition-colors hover:bg-strategy-gold-dark'
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
