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
import ProjectsListPage from './pages/ProjectsListPage'
import NotFound from './pages/NotFound'
// import HealthBridge from './pages/HealthBridge' // DISABLED - old app being taken offline
import HealthBridgeEnhanced from './pages/HealthBridgeEnhanced'
import Settings from './pages/Settings'
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


import { SiteAdminPage } from './pages/SiteAdminPage'
import { CloudflareStatusChecker } from './components/CloudflareStatusChecker'

import { PortfolioPageWrapper, ProjectsPageWrapper, RootErrorBoundary } from './components/RouteWrappers'



// Root route
const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFound,
  errorComponent: RootErrorBoundary,
})

// Index route (About page at root)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/', // root path for About
  component: AboutPage
})

// Blog list route
const blogListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'blog',
  component: BlogListPage
})

// Portfolio route
const portfolioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'portfolio',
  component: PortfolioListPage
})

// Projects list route
const projectsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'projects',
  component: ProjectsListPage
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
  component: PortfolioPageWrapper
})

// Projects route - handles all project pages under /projects/*
const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'projects/$slug',
  component: ProjectsPageWrapper
})



// Health Bridge Analysis route - DISABLED (old app being taken offline)
// const healthBridgeAnalysisRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: 'projects/healthbridge-analysis',
//   component: HealthBridge
// })

// Enhanced HealthBridge route - PUBLIC
const healthBridgeEnhancedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'projects/healthbridge-enhanced',
  component: HealthBridgeEnhanced
})

// Settings route - PROTECTED
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected/settings',
  component: Settings
})

// Protected routes - all under /protected/* namespace
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected',
  component: SiteAdminPage
})

// Site Admin route - PROTECTED
const siteAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected/site-admin',
  component: SiteAdminPage
})

// Content Studio route - PROTECTED
const contentStudioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected/content-studio',
  component: ContentCreationPage
})

// Contact route
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'contact',
  component: ContactPage
})

// Privacy route
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'privacy',
  component: PrivacyPage
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
  projectsListRoute,
  projectsRoute,
  // healthBridgeAnalysisRoute, // DISABLED - old app being taken offline
  healthBridgeEnhancedRoute,
  settingsRoute,
  blogListRoute,
  blogPostRoute,
  contactRoute,
  privacyRoute,
  protectedRoute,
  siteAdminRoute,
  contentStudioRoute,
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

