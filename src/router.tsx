import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import AppLayout from './layout/AppLayout'
import MarkdownPage from './pages/MarkdownPage'
import NotFound from './pages/NotFound'

// Root route
const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFound,
})

// Define all routes
const routes = {
  index: createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <MarkdownPage file="about" />
  }),
  
  about: createRoute({
    getParentRoute: () => rootRoute,
    path: '/about',
    component: () => <MarkdownPage file="about" />
  }),
  
  strategy: createRoute({
    getParentRoute: () => rootRoute,
    path: '/strategy',
    component: () => <MarkdownPage file="strategy" />
  }),
  
  leadership: createRoute({
    getParentRoute: () => rootRoute,
    path: '/leadership',
    component: () => <MarkdownPage file="leadership" />
  }),
  
  devops: createRoute({
    getParentRoute: () => rootRoute,
    path: '/devops',
    component: () => <MarkdownPage file="devops" />
  }),
  
  saas: createRoute({
    getParentRoute: () => rootRoute,
    path: '/saas',
    component: () => <MarkdownPage file="saas" />
  }),
  
  talent: createRoute({
    getParentRoute: () => rootRoute,
    path: '/talent',
    component: () => <MarkdownPage file="talent" />
  }),
  
  culture: createRoute({
    getParentRoute: () => rootRoute,
    path: '/culture',
    component: () => <MarkdownPage file="culture" />
  }),
  
  vision: createRoute({
    getParentRoute: () => rootRoute,
    path: '/vision',
    component: () => <MarkdownPage file="vision" />
  }),
  
  analytics: createRoute({
    getParentRoute: () => rootRoute,
    path: '/analytics',
    component: () => <MarkdownPage file="analytics" />
  }),
  
  projectAnalysis: createRoute({
    getParentRoute: () => rootRoute,
    path: '/analytics/project-analysis',
    component: () => <MarkdownPage file="project-analysis" />
  })
}

// Create route tree
const routeTree = rootRoute.addChildren([
  routes.index,
  routes.about,
  routes.leadership,
  routes.vision,
  routes.strategy,
  routes.culture,
  routes.talent,
  routes.devops,
  routes.saas,
  routes.analytics,
  routes.projectAnalysis,
])

// Create router instance
const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFound,
})

// Export router for use in other files
export { router }

// Main router component
function AppRouter() {
  return <RouterProvider router={router} />
}

// Default export for consistency
export default AppRouter