// src/router.tsx
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

const routeTree = rootRoute.addChildren([indexRoute])
export const router = createRouter({ routeTree })

export function AppRouter() {
  return <RouterProvider router={router} />
}
