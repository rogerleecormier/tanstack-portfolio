import { useState, useEffect } from 'react'

type TOCEntry = {
  title: string
  slug: string
}

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
      const headings = currentToc.map(entry => 
        document.getElementById(entry.slug)
      ).filter(Boolean)

      const visibleHeading = headings.find(heading => {
        if (!heading) return false
        const rect = heading.getBoundingClientRect()
        // Adjust for sticky header height (approximately 80px)
        return rect.top >= 80 && rect.top <= 200
      })

      if (visibleHeading) {
        setActiveId(visibleHeading.id)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentToc])

  if (currentToc.length === 0) return null

  return (
    <div className="fixed top-36 right-8 z-40 w-80 h-fit max-h-[calc(100vh-10rem)] overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          On This Page
        </h2>
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
    </div>
  )
}