// src/layout/AppLayout.tsx
import { Outlet } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import SiteAssistant from '@/components/AIPortfolioAssistant';
import {
  cachedContentService,
  type CachedContentItem,
} from '@/api/cachedContentService';
import {
  useEffect,
  useState,
  useCallback,
  Suspense,
  Component,
  ReactNode,
} from 'react';

// PortfolioItem interface for SiteAssistant compatibility
interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  url: string;
  keywords: string[];
  content: string;
  date?: string;
  fileName: string;
  frontmatter: Record<string, unknown>;
}

// Error boundary component for the main content
class MainContentErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      'MainContentErrorBoundary caught an error:',
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex-1 min-w-0 p-4 sm:p-6 lg:p-8'>
          <div className='w-full max-w-7xl mx-auto'>
            <div className='text-center py-12'>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                Something went wrong
              </h2>
              <p className='text-gray-600 mb-4'>
                We're sorry, but there was an error loading this content.
              </p>
              <button
                onClick={() => window.location.reload()}
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component for the main content
function MainContentLoading() {
  return (
    <div className='flex-1 min-w-0 p-4 sm:p-6 lg:p-8'>
      <div className='w-full max-w-7xl mx-auto'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2 mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-2/3'></div>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  // Convert CachedContentItem to PortfolioItem format for SiteAssistant
  const convertToPortfolioItem = (item: CachedContentItem): PortfolioItem => ({
    id: item.id,
    title: item.title,
    description: item.description,
    tags: item.tags,
    category: item.category,
    url: item.url,
    keywords: item.keywords,
    content: item.content,
    date: item.date,
    fileName: item.fileName,
    frontmatter: {}, // Will be populated if needed
  });

  // Memoized portfolio loading function
  const loadItems = useCallback(async () => {
    try {
      setIsLoadingPortfolio(true);
      setPortfolioError(null);
      const cachedItems =
        await cachedContentService.getContentByType('portfolio');
      const items = cachedItems.map(convertToPortfolioItem);
      setPortfolioItems(items);
    } catch (error) {
      console.error('Error loading portfolio items for AI assistant:', error);
      setPortfolioError('Failed to load portfolio items');
    } finally {
      setIsLoadingPortfolio(false);
    }
  }, []);

  useEffect(() => {
    // Use requestIdleCallback for better performance in development
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadItems());
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(loadItems, 0);
    }
  }, [loadItems]);

  return (
    <SidebarProvider defaultOpen={true}>
      <Header />
      <div className='min-h-screen flex bg-gray-50 pt-48 md:pt-44'>
        <AppSidebar />
        {/* Main content area - Header is now fixed at top */}
        <div className='flex-1 min-w-0'>
          <div className='flex flex-col min-h-screen'>
            <MainContentErrorBoundary>
              <Suspense fallback={<MainContentLoading />}>
                <main className='flex-1 min-w-0 p-4 sm:p-6 lg:p-8'>
                  {/* Consistent page width container for all pages */}
                  <div className='w-full max-w-7xl mx-auto'>
                    <Outlet />
                  </div>
                </main>
              </Suspense>
            </MainContentErrorBoundary>
            <Footer />
          </div>
        </div>
      </div>

      {/* Site Assistant - Available on all pages */}
      <SiteAssistant
        portfolioItems={portfolioItems}
        isLoading={isLoadingPortfolio}
        error={portfolioError}
      />
    </SidebarProvider>
  );
}
