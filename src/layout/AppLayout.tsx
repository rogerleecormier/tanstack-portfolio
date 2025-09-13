// src/layout/AppLayout.tsx
import {
  cachedContentService,
  type CachedContentItem,
} from '@/api/cachedContentService';
import SiteAssistant from '@/components/AIPortfolioAssistant';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Outlet } from '@tanstack/react-router';
import {
  Component,
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Footer from './Footer';
import Header from './Header';

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
        <div className='min-w-0 flex-1 p-4 sm:p-6 lg:p-8'>
          <div className='mx-auto w-full max-w-7xl'>
            <div className='py-12 text-center'>
              <h2 className='mb-2 text-xl font-semibold text-gray-900'>
                Something went wrong
              </h2>
              <p className='mb-4 text-gray-600'>
                We're sorry, but there was an error loading this content.
              </p>
              <button
                onClick={() => window.location.reload()}
                className='rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
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
    <div className='min-w-0 flex-1 p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto w-full max-w-7xl'>
        <div className='animate-pulse'>
          <div className='mb-4 h-8 w-1/4 rounded bg-gray-200'></div>
          <div className='mb-2 h-4 w-3/4 rounded bg-gray-200'></div>
          <div className='mb-2 h-4 w-1/2 rounded bg-gray-200'></div>
          <div className='h-4 w-2/3 rounded bg-gray-200'></div>
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
    ...(item.date && { date: item.date }),
    fileName: item.fileName,
    frontmatter: {}, // Will be populated if needed
  });

  // Memoized portfolio loading function
  const loadItems = useCallback(() => {
    try {
      setIsLoadingPortfolio(true);
      setPortfolioError(null);
      const cachedItems = cachedContentService.getContentByType('portfolio');
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
      requestIdleCallback(() => void loadItems());
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => void loadItems(), 0);
    }
  }, [loadItems]);

  return (
    <SidebarProvider defaultOpen={true}>
      <Header />
      <div className='flex min-h-screen bg-gray-50 pt-48 md:pt-44'>
        <AppSidebar />
        {/* Main content area - Header is now fixed at top */}
        <div className='min-w-0 flex-1'>
          <div className='flex min-h-screen flex-col'>
            <MainContentErrorBoundary>
              <Suspense fallback={<MainContentLoading />}>
                <main className='min-w-0 flex-1 p-4 sm:p-6 lg:p-8'>
                  {/* Consistent page width container for all pages */}
                  <div className='mx-auto w-full max-w-7xl'>
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
