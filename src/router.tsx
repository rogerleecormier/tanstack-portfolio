import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
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

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: () => <MarkdownPage file="projects" />
})

// Sub-routes for about section
const aboutExperienceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about/experience',
  component: () => <MarkdownPage file="about/experience" />
})

const aboutSkillsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about/skills',
  component: () => <MarkdownPage file="about/skills" />
})

const aboutEducationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about/education',
  component: () => <MarkdownPage file="about/education" />
})

// Sub-routes for projects section
const projectsWebRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/web',
  component: () => <MarkdownPage file="projects/web" />
})

const projectsMobileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/mobile',
  component: () => <MarkdownPage file="projects/mobile" />
})

const projectsDataRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/data',
  component: () => <MarkdownPage file="projects/data" />
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  aboutExperienceRoute,
  aboutSkillsRoute,
  aboutEducationRoute,
  projectsRoute,
  projectsWebRoute,
  projectsMobileRoute,
  projectsDataRoute,
])

export const router = createRouter({ routeTree })

export function AppRouter() {
  return <RouterProvider router={router} />
}