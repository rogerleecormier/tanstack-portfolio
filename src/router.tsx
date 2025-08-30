/**
 * Router Configuration for Portfolio Site
 * 
 * Portfolio pages are now dynamically loaded from the API worker
 * No need to manually add new portfolio pages to the router
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
import ProjectsListPage from './pages/ProjectsListPage'
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
import ContentCreationPage from './pages/ContentCreationPage'
import ToolsListPage from './pages/ToolsListPage'

import { ProtectedPage } from './components/ProtectedPage'
import { CloudflareStatusChecker } from './components/CloudflareStatusChecker'
import { ProtectedRoute } from './components/ProtectedRoute'

// Root route
const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFound,
})

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

// Projects list route
const projectsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'projects',
  component: () => <ProjectsListPage />
})

// Blog post route
const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'blog/$slug',
  component: BlogPostWrapper
})

// Portfolio items route - dynamically handles all portfolio pages
const portfolioItemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'portfolio/$slug',
  component: () => {
    // Get the slug from the URL
    const slug = window.location.pathname.split('/').pop() || ''
    
    // The PortfolioPage component will now handle loading content from the API worker
    // No need to validate slugs here - the component will handle 404s gracefully
    return <PortfolioPage file={`portfolio/${slug}`} />
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
      'project-analysis',
      'healthbridge-analysis'
    ]
    
    // Check if this is a valid project page
    if (projectPages.includes(slug)) {
      return <ProjectsPage file={`projects/${slug}`} />
    }
    
    // If not found, return 404
    return <NotFound />
  }
})



// Health Bridge Analysis route - moved under projects path
const healthBridgeAnalysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'projects/healthbridge-analysis',
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

// Content Creation route (Protected)
const contentCreationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'content-creation',
  component: () => (
    <ProtectedRoute>
      <ContentCreationPage />
    </ProtectedRoute>
  ),
})



// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  portfolioRoute,
  portfolioItemRoute,
  projectsListRoute,
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
  contentCreationRoute,

])

// Create router instance
export const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFound,
})

