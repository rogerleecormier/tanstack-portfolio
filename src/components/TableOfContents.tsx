import { useState, useEffect } from 'react'

type TOCEntry = {
  title: string
  slug: string
}

const STICKY_HEADER_HEIGHT = 80 // Height of the sticky header in pixels

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

  // Track which heading is currently visible
  useEffect(() => {
    const handleScroll = () => {
      const headings = currentToc
        .map(entry => document.getElementById(entry.slug))
        .filter(Boolean) as HTMLElement[];

      let current: HTMLElement | null = null;
      for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        if (rect.top - STICKY_HEADER_HEIGHT <= 0) {
          current = heading;
        } else {
          break;
        }
      }

      if (current) {
        setActiveId(current.id);
      } else if (headings.length > 0) {
        setActiveId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentToc])

  if (currentToc.length === 0) return null

  return (
    <aside className="hidden xl:block w-96 min-w-[24rem] flex-shrink-0 p-8 border-l border-gray-200 bg-white/50">
      {currentToc.length === 0 ? (
        <div className="h-32" />
      ) : (
        <div
          className="fixed right-0 top-[100px] w-96 min-w-[24rem] max-h-[calc(100vh-96px)] overflow-y-auto p-8 border-l border-gray-200 bg-white/50"
          style={{ zIndex: 99 }}
        >
          <div className="z-10 bg-white/80 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              On This Page
            </h2>
          </div>
          <nav>
            <ul className="space-y-2 text-sm">
              {currentToc.map((entry) => (
                <li key={entry.slug}>
                  <a
                    href={`#${entry.slug}`}
                    className={`block py-1 px-2 rounded transition-colors ${
                      activeId === entry.slug
                        ? 'bg-teal-100 text-teal-800 font-medium'
                        : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                    }`}
                  >
                    {entry.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </aside>
  )
}