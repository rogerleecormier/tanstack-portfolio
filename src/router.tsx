import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { createBrowserHistory } from '@tanstack/history'
import AppLayout from './layout/AppLayout'
import MarkdownPage from './pages/MarkdownPage'
import NotFound from './pages/NotFound'
import HealthBridge from './pages/HealthBridge'
import ContactPage from './pages/ContactPage'
import PrivacyPage from './pages/PrivacyPage'
import BlogListPage from './pages/BlogListPage'
import BlogPostWrapper from './components/BlogPostWrapper'
import PortfolioPage from './pages/PortfolioPage'
import { ProtectedPage } from './components/ProtectedPage'
import { CloudflareStatusChecker } from './components/CloudflareStatusChecker'
import { ProtectedRoute } from './components/ProtectedRoute'

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
  path: '/', // root path for About
  component: () => <MarkdownPage file="portfolio/about" />
})

// Blog list route
const blogListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'blog',
  component: () => <BlogListPage />
})

// Portfolio route
const portfolioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'portfolio',
  component: () => <PortfolioPage />
})

// Blog post route
const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'blog/$slug',
  component: BlogPostWrapper
})

// Analytics route
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'analytics',
  component: () => <MarkdownPage file="portfolio/analytics" />
})

// Strategy route
const strategyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'strategy',
  component: () => <MarkdownPage file="portfolio/strategy" />
})

// Leadership route
const leadershipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'leadership',
  component: () => <MarkdownPage file="portfolio/leadership" />
})

// Talent route
const talentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'talent',
  component: () => <MarkdownPage file="portfolio/talent" />
})

// DevOps route
const devopsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'devops',
  component: () => <MarkdownPage file="portfolio/devops" />
})

// SaaS route
const saasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'saas',
  component: () => <MarkdownPage file="portfolio/saas" />
})

// Project Analysis route (moved to projects)
const projectAnalysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'project-analysis',
  component: () => <MarkdownPage file="projects/project-analysis" />
})

// Strategy & Consulting routes
const strategicPlanningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'strategic-planning',
  component: () => <MarkdownPage file="portfolio/strategic-planning" />
})

const digitalTransformationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'digital-transformation',
  component: () => <MarkdownPage file="portfolio/digital-transformation" />
})

const projectPortfolioManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'project-portfolio-management',
  component: () => <MarkdownPage file="projects/project-analysis" />
})

// Leadership & Culture routes
const teamLeadershipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'team-leadership',
  component: () => <MarkdownPage file="portfolio/team-leadership" />
})

// Technology & Operations routes
const erpSystemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'erp-systems',
  component: () => <MarkdownPage file="portfolio/erp-systems" />
})

// Data & Analytics routes
const dataAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'data-analytics',
  component: () => <MarkdownPage file="portfolio/data-analytics" />
})



// Health Bridge Analysis route
const healthBridgeAnalysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'healthbridge-analysis',
  component: () => <HealthBridge />
})

// Protected route - PROTECTED
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected',
  component: () => (
    <ProtectedRoute>
      <ProtectedPage />
    </ProtectedRoute>
  ),
})

// Contact route
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'contact',
  component: () => <ContactPage />
})

// Privacy route
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'privacy',
  component: () => <PrivacyPage />
})

// Cloudflare status checker route
const cloudflareStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'cloudflare-status',
  component: CloudflareStatusChecker,
})

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  portfolioRoute,
  analyticsRoute,
  strategyRoute,
  leadershipRoute,
  talentRoute,
  devopsRoute,
  saasRoute,
  projectAnalysisRoute,
  // New portfolio routes
  strategicPlanningRoute,
  digitalTransformationRoute,
  projectPortfolioManagementRoute,
  teamLeadershipRoute,
  erpSystemsRoute,
  dataAnalyticsRoute,
  blogListRoute,
  blogPostRoute,
  healthBridgeAnalysisRoute,
  contactRoute,
  privacyRoute,
  protectedRoute,
  cloudflareStatusRoute,
])

// Create router instance
export const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFound,
})

console.count('[router] createRouter called');
