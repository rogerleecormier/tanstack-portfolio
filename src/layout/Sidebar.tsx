import { Link } from '@tanstack/react-router'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

// Define the types
type TOCEntry = {
  title: string
  slug: string
}

type SubpageEntry = {
  title: string
  path: string
  children?: SubpageEntry[]
}

type SidebarProps = {
  currentToc: TOCEntry[]
  subpages: SubpageEntry[]
  currentPath?: string
}

export default function Sidebar({ currentToc, subpages, currentPath }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['/analytics']))

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedItems(newExpanded)
  }

  const renderNavItem = (page: SubpageEntry, level: number = 0) => {
    const isCurrentPage = currentPath === page.path
    const hasChildren = page.children && page.children.length > 0
    const isExpanded = expandedItems.has(page.path)
    const isChildActive = page.children?.some(child => currentPath === child.path)

    return (
      <div key={page.path} className="mb-2">
        <div className="flex items-center">
          <Link
            to={page.path}
            className={`flex-1 py-1 px-2 rounded transition-colors ${
              isCurrentPage || isChildActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
            style={{ marginLeft: `${level * 12}px` }}
          >
            {page.title}
          </Link>
          
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(page.path)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
            </button>
          )}
        </div>

        {/* Show TOC for current page */}
        {isCurrentPage && currentToc?.length > 0 && (
          <div className="ml-4 mt-2 border-l border-gray-200 pl-3">
            <ul className="space-y-1">
              {currentToc.map((entry: TOCEntry) => (
                <li key={entry.slug}>
                  <a
                    href={`#${entry.slug}`}
                    className="text-xs text-gray-600 hover:text-blue-600 block py-1"
                  >
                    {entry.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {page.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 pr-6 border-r text-sm hidden md:block sticky top-36 max-h-[calc(100vh-8rem)] overflow-y-auto">
      {/* Subpages Section */}
      {subpages?.length > 0 && (
        <>
          <nav className="mb-6">
            {subpages.map(page => renderNavItem(page))}
          </nav>
        </>
      )}

      {/* Standalone TOC (if no subpages but has TOC) */}
      {subpages?.length === 0 && currentToc?.length > 0 && (
        <>
          <h2 className="text-gray-600 font-semibold mb-3 text-xs uppercase tracking-wide">
            On this page
          </h2>
          <ul className="space-y-1">
            {currentToc.map((entry: TOCEntry) => (
              <li key={entry.slug}>
                <a
                  href={`#${entry.slug}`}
                  className="text-gray-700 hover:text-blue-600 block py-1"
                >
                  {entry.title}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  )
}