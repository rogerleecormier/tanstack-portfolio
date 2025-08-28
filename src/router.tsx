/**
 * Router Configuration for Portfolio Site
 * 
 * To add new portfolio pages:
 * 1. Add your .md file to src/content/portfolio/
 * 2. Add the slug (filename without .md) to the portfolioPages array below
 * 3. The route will automatically work at /your-slug
 */

import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { createBrowserHistory } from '@tanstack/history'
import AppLayout from './layout/AppLayout'
import PortfolioPage from './pages/PortfolioPage'
import ProjectsPage from './pages/ProjectsPage'
import NotFound from './pages/NotFound'
import HealthBridge from './pages/HealthBridge'
import ContactPage from './pages/ContactPage'
import PrivacyPage from './pages/PrivacyPage'
import BlogListPage from './pages/BlogListPage'
import BlogPostWrapper from './components/BlogPostWrapper'
import PortfolioListPage from './pages/PortfolioListPage'
import AboutPage from './pages/AboutPage'
import NewsletterPreferencesPage from './pages/NewsletterPreferencesPage'
import MarkdownEditorPage from './pages/MarkdownEditorPage'
import ToolsListPage from './pages/ToolsListPage'
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
  component: () => <AboutPage />
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
  component: () => <PortfolioListPage />
})

// Blog post route
const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'blog/$slug',
  component: BlogPostWrapper
})

// Portfolio items route - handles all portfolio pages under /portfolio/*
const portfolioItemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'portfolio/$slug',
  component: () => {
    // Get the slug from the URL
    const slug = window.location.pathname.split('/').pop() || ''
    
    // List of all portfolio pages - easy to maintain
    // To add a new portfolio page, just add the slug here (filename without .md extension)
    const portfolioPages = [
      'strategy',
      'leadership', 
      'culture',
      'talent',
      'devops',
      'saas',
      'analytics',
      'risk-compliance',
      'governance-pmo',
      'product-ux',
      'ai-automation',
      'education-certifications',
      'projects',
      'capabilities'
    ]
    
    // Check if this is a valid portfolio page
    if (portfolioPages.includes(slug)) {
      return <PortfolioPage file={`portfolio/${slug}`} />
    }
    
    // If not found, return 404
    return <NotFound />
  }
})

// Projects route - handles all project pages under /projects/*
const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'projects/$slug',
  component: () => {
    // Get the slug from the URL
    const slug = window.location.pathname.split('/').pop() || ''
    
    // List of all project pages - easy to maintain
    // To add a new project page, just add the slug here (filename without .md extension)
    const projectPages = [
      'project-analysis'
    ]
    
    // Check if this is a valid project page
    if (projectPages.includes(slug)) {
      return <ProjectsPage file={`projects/${slug}`} />
    }
    
    // If not found, return 404
    return <NotFound />
  }
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

// Tools list route
const toolsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'tools',
  component: ToolsListPage,
})

// Markdown Editor route
const markdownEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'markdown-editor',
  component: MarkdownEditorPage,
})

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  portfolioRoute,
  portfolioItemRoute,
  projectsRoute,
  healthBridgeAnalysisRoute,
  blogListRoute,
  blogPostRoute,
  contactRoute,
  privacyRoute,
  protectedRoute,
  cloudflareStatusRoute,
  newsletterPreferencesRoute,
  toolsListRoute,
  markdownEditorRoute,
])

// Create router instance
export const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFound,
})

console.count('[router] createRouter called');
