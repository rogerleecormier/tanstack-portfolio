import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { TooltipProvider } from './components/ui/tooltip';
import './index.css';
import { router } from './router';

// Performance optimizations for React Refresh
if (import.meta.env.DEV) {
  // Reduce React Refresh overhead in development
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    // Filter out React Refresh warnings that can cause performance issues
    if (args[0]?.includes?.('React Refresh')) {
      return;
    }
    originalConsoleWarn(...args);
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimize query performance
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </TooltipProvider>
  </React.StrictMode>
);
