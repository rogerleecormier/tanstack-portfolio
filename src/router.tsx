import { createRouter as createRouterBase } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function createRouter() {
  return createRouterBase({
    routeTree,
    defaultPreload: 'intent',
  });
}

export const getRouter = createRouter;

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
