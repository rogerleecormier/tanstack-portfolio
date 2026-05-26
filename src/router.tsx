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
