import { Route, RootRoute } from '@tanstack/react-router';
import LoginPage from '../components/LoginPage';
import ProtectedPage from '../components/ProtectedPage';
import useAuth from '../hooks/useAuth';

// Wrapper for protected route
function ProtectedPageWrapper() {
  const { user } = useAuth();
  return user ? <ProtectedPage /> : <LoginPage />;
}

// Define your routes using TanStack Router
const rootRoute = new RootRoute();

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

const protectedRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/protected',
  component: ProtectedPageWrapper,
});

const routeTree = rootRoute.addChildren([loginRoute, protectedRoute]);

export { routeTree, rootRoute };