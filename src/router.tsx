import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { createHashHistory } from '@tanstack/history'
import AppLayout from './layout/AppLayout'
import MarkdownPage from './pages/MarkdownPage'
import NotFound from './pages/NotFound'
import HealthBridgePage from './pages/HealthBridge'

console.count('[router] module evaluated');

// Root route
const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFound,
})

console.count('[router] createRootRoute called')

// Index route (About page at root)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '', // root path for About
  component: () => <MarkdownPage file="about" />
})

// Strategy route
const strategyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'strategy',
  component: () => <MarkdownPage file="strategy" />
})

// Leadership route
const leadershipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'leadership',
  component: () => <MarkdownPage file="leadership" />
})

// DevOps route
const devopsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'devops',
  component: () => <MarkdownPage file="devops" />
})

// SaaS route
const saasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'saas',
  component: () => <MarkdownPage file="saas" />
})

// Talent route
const talentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'talent',
  component: () => <MarkdownPage file="talent" />
})

// Analytics route
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'analytics',
  component: () => <MarkdownPage file="analytics" />
})

// Project Analysis route
const projectAnalysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'project-analysis',
  component: () => <MarkdownPage file="project-analysis" />
})

// Health Bridge Analysis route
const healthBridgeAnalysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'healthbridge-analysis',
  component: HealthBridgePage,
})

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,              // <-- include this for About at root
  strategyRoute,
  leadershipRoute,
  talentRoute,
  devopsRoute,
  saasRoute,
  analyticsRoute,
  projectAnalysisRoute,
  healthBridgeAnalysisRoute,
])

// Create router instance
export const router = createRouter({
  routeTree,
  history: createHashHistory(),     // ⬅️ hash routing for GitHub Pages
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFound,
})

console.count('[router] createRouter called');
