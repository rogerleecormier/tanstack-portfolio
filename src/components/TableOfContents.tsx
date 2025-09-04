import { useState, useEffect } from 'react'
import { useSidebar } from '@/components/ui/sidebar'

type TOCEntry = {
  title: string
  slug: string
}

const STICKY_HEADER_HEIGHT = 170 // Height of the sticky header in pixels

export function TableOfContents() {
  const [currentToc, setCurrentToc] = useState<TOCEntry[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const { state } = useSidebar()

  // Listen for TOC updates from MarkdownPage
  useEffect(() => {
    const handleTocUpdate = (event: CustomEvent) => {
      console.log('TOC received toc-updated event:', event.detail)
      setCurrentToc(event.detail.toc || [])
    }

    window.addEventListener('toc-updated', handleTocUpdate as EventListener)
    
    return () => {
      window.removeEventListener('toc-updated', handleTocUpdate as EventListener)
    }
  }, [])

  // Listen for blog TOC updates from BlogPage
  useEffect(() => {
    const handleBlogTocUpdate = (event: CustomEvent) => {
      console.log('TOC received blog-toc-updated event:', event.detail)
      setCurrentToc(event.detail.toc || [])
    }

    window.addEventListener('blog-toc-updated', handleBlogTocUpdate as EventListener)
    
    return () => {
      window.removeEventListener('blog-toc-updated', handleBlogTocUpdate as EventListener)
    }
  }, [])

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
        if (rect.top <= STICKY_HEADER_HEIGHT + 100 && distanceFromTop < minDistance) {
          minDistance = distanceFromTop;
          activeHeading = heading;
        }
      }

      // If no heading is close to the target position, find the first visible one
      if (!activeHeading) {
        for (const heading of headings) {
          const rect = heading.getBoundingClientRect();
          if (rect.top >= STICKY_HEADER_HEIGHT && rect.top <= window.innerHeight) {
            activeHeading = heading;
            break;
          }
        }
      }

      // Fallback to first heading if none are visible
      if (!activeHeading && headings.length > 0) {
        activeHeading = headings[0];
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
  }, [currentToc])

  // Debug: Log the current state
  console.log('TOC Component: state =', state, 'currentToc.length =', currentToc.length)
  
  // Don't render TOC when sidebar is collapsed or when there's no content
  if (state === 'collapsed' || currentToc.length === 0) {
    console.log('TOC Component: Not rendering because state =', state, 'or currentToc.length =', currentToc.length)
    return null
  }

  return (
    <div className="border-t border-teal-200/40 dark:border-teal-800/40 mt-1 pt-1">
      <div className="px-2 mb-0.5">
        <h3 className="text-teal-600 dark:text-teal-400 font-medium text-xs uppercase tracking-wide">
          TOC
        </h3>
      </div>
      <nav>
        <ul className="space-y-0">
          {currentToc.map((entry) => (
            <li key={entry.slug}>
              <a
                href={`#${entry.slug}`}
                className={`block py-0.5 px-2 text-sm transition-all duration-150 rounded-sm ${
                  activeId === entry.slug
                    ? 'bg-teal-100 text-teal-900 font-semibold border-l-2 border-teal-500 dark:bg-teal-800/40 dark:text-teal-100'
                    : 'text-gray-600 dark:text-gray-400 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                }`}
                onClick={e => {
                  e.preventDefault();
                  const el = document.getElementById(entry.slug);
                  if (el) {
                    window.scrollTo({
                      top: el.getBoundingClientRect().top + window.scrollY - STICKY_HEADER_HEIGHT,
                      behavior: 'smooth'
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
  )
}