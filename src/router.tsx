import { createBrowserHistory } from '@tanstack/history';
import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { lazy } from 'react';
import AppLayout from './layout/AppLayout';
import IndexPage from './pages/IndexPage';
import NotFound from './pages/NotFound';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const WorkPage = lazy(() => import('./pages/WorkPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));

function RootErrorBoundary() {
  return (
    <div className='min-h-screen bg-surface-base flex items-center justify-center px-6'>
      <div className='text-center'>
        <h2 className='text-xl font-semibold text-text-foreground mb-2'>Something went wrong</h2>
        <p className='text-text-secondary mb-4'>An unexpected error occurred.</p>
        <button
          onClick={() => window.location.reload()}
          className='px-4 py-2 rounded-lg bg-strategy-gold text-precision-charcoal text-sm font-semibold hover:brightness-110 transition-all'
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFound,
  errorComponent: RootErrorBoundary,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'about',
  component: AboutPage,
});

const workRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'work',
  component: WorkPage,
});

const toolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'tools',
  component: ToolsPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'contact',
  component: ContactPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'privacy',
  component: PrivacyPage,
});

const timelineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'timeline',
  component: TimelinePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  workRoute,
  toolsRoute,
  contactRoute,
  privacyRoute,
  timelineRoute,
]);

export const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFound,
});
