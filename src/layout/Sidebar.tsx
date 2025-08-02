import { Link } from '@tanstack/react-router'

// Define the types
type TOCEntry = {
  title: string
  slug: string
}

type SubpageEntry = {
  title: string
  path: string
}

type SidebarProps = {
  currentToc: TOCEntry[]
  subpages: SubpageEntry[]
  currentPath?: string
}

export default function Sidebar({ currentToc, subpages, currentPath }: SidebarProps) {
  return (
    <aside className="w-64 pr-6 border-r text-sm hidden md:block sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Subpages Section */}
      {subpages?.length > 0 && (
        <>
          <h2 className="text-gray-600 font-semibold mb-3 text-xs uppercase tracking-wide">
            Pages
          </h2>
          <nav className="mb-6">
            {subpages.map((page: SubpageEntry) => {
              const isCurrentPage = currentPath === page.path
              return (
                <div key={page.path} className="mb-2">
                  <Link
                    to={page.path}
                    className={`block py-1 px-2 rounded transition-colors ${
                      isCurrentPage
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {page.title}
                  </Link>
                  
                  {/* Show TOC for current page */}
                  {isCurrentPage && currentToc?.length > 0 && (
                    <div className="ml-4 mt-2 border-l border-gray-200 pl-3">
                      <h3 className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
                        On this page
                      </h3>
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
                </div>
              )
            })}
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