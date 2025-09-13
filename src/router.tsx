/**
 * Router Configuration for Portfolio Site
 *
 * Portfolio pages are now dynamically loaded from the API worker
 * No need to manually add new portfolio pages to the router
 */

import { createBrowserHistory } from '@tanstack/history';
import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import AppLayout from './layout/AppLayout';

// Core pages - loaded immediately
import { lazy } from 'react';
import AboutPage from './pages/AboutPage';
import BlogListPage from './pages/BlogListPage';
import IndexPage from './pages/IndexPage';
import NotFound from './pages/NotFound';
import PortfolioListPage from './pages/PortfolioListPage';
import ProjectsListPage from './pages/ProjectsListPage';

// Dynamic imports for heavier components - loaded on demand
const ToolsListPage = lazy(() => import('./pages/ToolsListPage'));
const RACIBuilderPage = lazy(() => import('./pages/RACIBuilderPage'));
const PriorityMatrixPage = lazy(() => import('./pages/PriorityMatrixPage'));
const GanttChartBuilderPage = lazy(
  () => import('./pages/GanttChartBuilderPage')
);
const RiskAssessmentPage = lazy(() => import('./pages/RiskAssessmentPage'));
const HealthBridgeEnhanced = lazy(() => import('./pages/HealthBridgeEnhanced'));
const Settings = lazy(() => import('./pages/Settings'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const BlogPostWrapper = lazy(() => import('./components/BlogPostWrapper'));
const NewsletterPreferencesPage = lazy(
  () => import('./pages/NewsletterPreferencesPage')
);
const SiteAdminPage = lazy(() =>
  import('./pages/SiteAdminPage').then(m => ({ default: m.SiteAdminPage }))
);
const CloudflareStatusChecker = lazy(() =>
  import('./components/CloudflareStatusChecker').then(m => ({
    default: m.CloudflareStatusChecker,
  }))
);
const CreationStudioPage = lazy(() => import('./pages/CreationStudioPage'));
const MarkdownOnlyPage = lazy(() =>
  import('./pages/MarkdownOnlyPage').then(m => ({
    default: m.MarkdownOnlyPage,
  }))
);
const PrivateToolsPage = lazy(() => import('./pages/PrivateToolsPage'));

import {
  PortfolioPageWrapper,
  ProjectsPageWrapper,
  RootErrorBoundary,
} from './components/RouteWrappers';

// Root route
const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFound,
  errorComponent: RootErrorBoundary,
});

// Index route (Home page at root)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/', // root path for Home
  component: IndexPage,
});

// About route
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'about',
  component: AboutPage,
});

// Blog list route
const blogListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'blog',
  component: BlogListPage,
});

// Portfolio route
const portfolioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'portfolio',
  component: PortfolioListPage,
});

// Projects list route
const projectsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'projects',
  component: ProjectsListPage,
});

// Blog post route
const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'blog/$slug',
  component: BlogPostWrapper,
});

// Portfolio items route - dynamically handles all portfolio pages
const portfolioItemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'portfolio/$slug',
  component: PortfolioPageWrapper,
});

// Projects route - handles all project pages under /projects/*
const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'projects/$slug',
  component: ProjectsPageWrapper,
});

// Enhanced HealthBridge route - PUBLIC
const healthBridgeEnhancedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'tools/healthbridge-enhanced',
  component: HealthBridgeEnhanced,
});

// Settings route - PROTECTED
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected/settings',
  component: Settings,
});

// Protected routes - all under /protected/* namespace
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected',
  component: () => {
    // Get the original page the user was trying to access
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo =
      urlParams.get('returnTo') ?? urlParams.get('redirect_url') ?? '/';

    // Redirect back to the original page, now authenticated
    window.location.href = returnTo;
    return null;
  },
});

// Site Admin route - PROTECTED
const siteAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected/site-admin',
  component: SiteAdminPage,
});

// Contact route
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'contact',
  component: ContactPage,
});

// Privacy route
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'privacy',
  component: PrivacyPage,
});

// Cloudflare status checker route
const cloudflareStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'cloudflare-status',
  component: CloudflareStatusChecker,
});

// Newsletter preferences route
const newsletterPreferencesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'newsletter-preferences',
  component: NewsletterPreferencesPage,
});

// Content Studio route - PROTECTED
const contentStudioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected/content-studio',
  component: CreationStudioPage,
});

// Private Tools route - PROTECTED
const privateToolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected/private-tools',
  component: PrivateToolsPage,
});

// Markdown Editor route (under tools)
const markdownOnlyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'tools/markdown',
  component: MarkdownOnlyPage,
});

// Tools list route
const toolsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'tools',
  component: ToolsListPage,
});

// RACI Builder route under tools
const raciBuilderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'tools/raci-builder',
  component: RACIBuilderPage,
});

// Priority Matrix route under tools
const priorityMatrixRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'tools/priority-matrix',
  component: PriorityMatrixPage,
});

// Gantt Chart Builder route under tools
const ganttChartBuilderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'tools/gantt-chart',
  component: GanttChartBuilderPage,
});

// Risk Assessment route under tools
const riskAssessmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'tools/risk-assessment',
  component: RiskAssessmentPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  portfolioRoute,
  portfolioItemRoute,
  projectsListRoute,
  projectsRoute,
  healthBridgeEnhancedRoute,
  settingsRoute,
  blogListRoute,
  blogPostRoute,
  contactRoute,
  privacyRoute,
  protectedRoute,
  siteAdminRoute,
  cloudflareStatusRoute,
  newsletterPreferencesRoute,
  contentStudioRoute,
  privateToolsRoute,
  markdownOnlyRoute,
  toolsListRoute,
  raciBuilderRoute,
  priorityMatrixRoute,
  ganttChartBuilderRoute,
  riskAssessmentRoute,
]);

// Create router instance
export const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFound,
});
