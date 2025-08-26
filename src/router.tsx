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
import NewsletterPreferencesPage from './pages/NewsletterPreferencesPage'
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

// Dynamic portfolio route - handles all portfolio pages
const portfolioItemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$slug',
  component: () => {
    // Get the slug from the URL
    const slug = window.location.pathname.slice(1) // Remove leading slash
    
    // Map slug to portfolio file
    const fileMap: Record<string, string> = {
      'strategy': 'portfolio/strategy',
      'leadership': 'portfolio/leadership',
      'talent': 'portfolio/talent',
      'devops': 'portfolio/devops',
      'saas': 'portfolio/saas',
      'analytics': 'portfolio/analytics',
      'risk-compliance': 'portfolio/risk-compliance',
      'governance-pmo': 'portfolio/governance-pmo',
      'product-ux': 'portfolio/product-ux',
      'military-leadership': 'portfolio/military-leadership',
      'education-certifications': 'portfolio/education-certifications',
      'ai-automation': 'portfolio/ai-automation'
    }
    
    const file = fileMap[slug]
    if (file) {
      return <MarkdownPage file={file} />
    }
    
    // If not found, return 404
    return <NotFound />
  }
})

// Project Analysis route (moved to projects)
const projectAnalysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'project-analysis',
  component: () => <MarkdownPage file="projects/project-analysis" />
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

// Newsletter preferences route
const newsletterPreferencesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'newsletter-preferences',
  component: NewsletterPreferencesPage,
})

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  portfolioRoute,
  portfolioItemRoute,
  projectAnalysisRoute,
  healthBridgeAnalysisRoute,
  blogListRoute,
  blogPostRoute,
  contactRoute,
  privacyRoute,
  protectedRoute,
  cloudflareStatusRoute,
  newsletterPreferencesRoute,
])

// Create router instance
export const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFound,
})

console.count('[router] createRouter called');
