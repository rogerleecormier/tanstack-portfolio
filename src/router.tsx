import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router'
import AppLayout from './layout/AppLayout'
import MarkdownPage from './pages/MarkdownPage'

const rootRoute = createRootRoute({
  component: AppLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <MarkdownPage file="about" />
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: () => <MarkdownPage file="about" />
})

const strategyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/strategy',
  component: () => <MarkdownPage file="strategy" />
})

const leadershipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leadership',
  component: () => <MarkdownPage file="leadership" />
})

const devopsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/devops',
  component: () => <MarkdownPage file="devops" />
})

const saasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/saas',
  component: () => <MarkdownPage file="saas" />
})

const talentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/talent',
  component: () => <MarkdownPage file="talent" />
})

const cultureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/culture',
  component: () => <MarkdownPage file="culture" />
})

// Create analytics layout route that can render children
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: () => <Outlet />  // This renders child routes
})

// Create index route for analytics (shows when visiting /analytics)
const analyticsIndexRoute = createRoute({
  getParentRoute: () => analyticsRoute,
  path: '/',
  component: () => <MarkdownPage file="analytics" />
})

// Create nested route for project analysis under analytics
const projectAnalysisRoute = createRoute({
  getParentRoute: () => analyticsRoute,
  path: '/project-analysis',
  component: () => <MarkdownPage file="project-analysis" />
})

const visionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vision',
  component: () => <MarkdownPage file="vision" />
})

// Update analytics route to include children
const analyticsRouteWithChildren = analyticsRoute.addChildren([
  analyticsIndexRoute,  // Add the index route
  projectAnalysisRoute
])

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  leadershipRoute,
  visionRoute,
  strategyRoute,
  cultureRoute,
  talentRoute,
  devopsRoute,
  saasRoute,
  analyticsRouteWithChildren,
])

export const router = createRouter({ routeTree })

export function AppRouter() {
  return <RouterProvider router={router} />
}