import { useState, useEffect } from 'react'

type TOCEntry = {
  title: string
  slug: string
}

const STICKY_HEADER_HEIGHT = 170 // Height of the sticky header in pixels

export function TableOfContents() {
  const [currentToc, setCurrentToc] = useState<TOCEntry[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // Listen for TOC updates from MarkdownPage
  useEffect(() => {
    const handleTocUpdate = (event: CustomEvent) => {
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

      let activeHeading: HTMLElement | null = null;
      let maxOffset = -Infinity;

      for (const heading of headings) {
        const offset = heading.getBoundingClientRect().top - STICKY_HEADER_HEIGHT;
        // Find the heading closest to but not above the sticky header
        if (offset <= 0 && offset > maxOffset) {
          maxOffset = offset;
          activeHeading = heading;
        }
      }

      if (activeHeading) {
        setActiveId(activeHeading.id);
      } else if (headings.length > 0) {
        // If none are above the header, highlight the first one
        setActiveId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentToc])

  if (currentToc.length === 0) return null

  return (
    <div className="border-t border-teal-200 mt-4 pt-4">
      <div className="px-4 mb-3">
        <h3 className="text-sm font-semibold text-teal-900">
          On This Page
        </h3>
      </div>
      <nav>
        <ul className="space-y-1 text-sm">
          {currentToc.map((entry) => (
            <li key={entry.slug}>
              <a
                href={`#${entry.slug}`}
                className={`block py-1 px-4 rounded-r transition-colors ${
                  activeId === entry.slug
                    ? 'bg-teal-200 text-teal-900 font-medium border-r-2 border-teal-600'
                    : 'text-teal-800 hover:text-teal-900 hover:bg-teal-100'
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