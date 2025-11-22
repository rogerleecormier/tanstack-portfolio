import { useSidebar } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';

type TOCEntry = {
  title: string;
  slug: string;
};

const STICKY_HEADER_HEIGHT = 170; // Height of the sticky header in pixels

export function TableOfContents() {
  const [currentToc, setCurrentToc] = useState<TOCEntry[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const { state } = useSidebar();

  // Listen for TOC updates from MarkdownPage
  useEffect(() => {
    const handleTocUpdate = (event: CustomEvent) => {
      console.log('TOC received toc-updated event:', event.detail);
      setCurrentToc(
        ((event.detail as Record<string, unknown>)?.toc as TOCEntry[]) || []
      );
    };

    window.addEventListener('toc-updated', handleTocUpdate as EventListener);

    return () => {
      window.removeEventListener(
        'toc-updated',
        handleTocUpdate as EventListener
      );
    };
  }, []);

  // Listen for blog TOC updates from BlogPage
  useEffect(() => {
    const handleBlogTocUpdate = (event: CustomEvent) => {
      console.log('TOC received blog-toc-updated event:', event.detail);
      setCurrentToc(
        ((event.detail as Record<string, unknown>)?.toc as TOCEntry[]) || []
      );
    };

    window.addEventListener(
      'blog-toc-updated',
      handleBlogTocUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        'blog-toc-updated',
        handleBlogTocUpdate as EventListener
      );
    };
  }, []);

  // Track which heading is currently visible
  useEffect(() => {
    const handleScroll = () => {
      const headings = currentToc
        .map(entry => document.getElementById(entry.slug))
        .filter(Boolean) as HTMLElement[];

      if (headings.length === 0) return;

      let activeHeading: HTMLElement | null = null;
      let minDistance = Infinity;

      for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        const distanceFromTop = Math.abs(rect.top - STICKY_HEADER_HEIGHT);

        // If heading is in viewport and closest to the target position
        if (
          rect.top <= STICKY_HEADER_HEIGHT + 100 &&
          distanceFromTop < minDistance
        ) {
          minDistance = distanceFromTop;
          activeHeading = heading;
        }
      }

      // If no heading is close to the target position, find the first visible one
      if (!activeHeading) {
        for (const heading of headings) {
          const rect = heading.getBoundingClientRect();
          if (
            rect.top >= STICKY_HEADER_HEIGHT &&
            rect.top <= window.innerHeight
          ) {
            activeHeading = heading;
            break;
          }
        }
      }

      // Fallback to first heading if none are visible
      if (!activeHeading && headings.length > 0) {
        const firstHeading = headings[0];
        if (firstHeading) {
          activeHeading = firstHeading;
        }
      }

      if (activeHeading) {
        setActiveId(activeHeading.id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Run on mount with multiple attempts to ensure DOM is ready
    setTimeout(handleScroll, 100);
    setTimeout(handleScroll, 300);
    setTimeout(handleScroll, 500);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentToc]);

  // Debug: Log the current state
  console.log(
    'TOC Component: state =',
    state,
    'currentToc.length =',
    currentToc.length
  );

  // Don't render TOC when sidebar is collapsed or when there's no content
  if (state === 'collapsed' || currentToc.length === 0) {
    console.log(
      'TOC Component: Not rendering because state =',
      state,
      'or currentToc.length =',
      currentToc.length
    );
    return null;
  }

  return (
    <div className='mt-2 border-t border-slate-200/50 pt-3 dark:border-slate-700/50'>
      <div className='mb-2 px-3'>
        <h3 className='text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400'>
          Table of Contents
        </h3>
      </div>
      <nav>
        <ul className='space-y-0.5 px-2'>
          {currentToc.map(entry => (
            <li key={entry.slug}>
              <a
                href={`#${entry.slug}`}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  activeId === entry.slug
                    ? 'bg-gold-600/12 dark:bg-gold-600/12 border-l-2 border-gold-500 font-semibold text-white dark:border-gold-400 dark:text-white'
                    : 'hover:bg-gold-600/12 dark:hover:bg-gold-600/12 text-white dark:text-white'
                }`}
                onClick={e => {
                  e.preventDefault();
                  const el = document.getElementById(entry.slug);
                  if (el) {
                    window.scrollTo({
                      top:
                        el.getBoundingClientRect().top +
                        window.scrollY -
                        STICKY_HEADER_HEIGHT,
                      behavior: 'smooth',
                    });
                  }
                }}
              >
                {entry.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
