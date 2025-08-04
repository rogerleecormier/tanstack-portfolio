import { Briefcase, ChevronDown } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import Search from '../components/Search'
import { navigationPages } from '../config/navigation'

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Function to check if a page has children
  const hasChildren = (page: any) => page.children && page.children.length > 0

  // Toggle dropdown
  const toggleDropdown = (path: string) => {
    setOpenDropdown(openDropdown === path ? null : path)
  }

  // Close dropdown when clicking outside

  return (
    <header className="bg-teal-600 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        {/* Top Row: Logo/Title and Search */}
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">
              Roger Lee Cormier Portfolio
            </h1>
          </div>

          {/* Right-aligned Search */}
          <div className="flex-shrink-0">
            <Search />
          </div>
        </div>

        {/* Bottom Row: Navigation Menu */}
        <nav className="flex flex-wrap gap-4 sm:gap-6 justify-start items-baseline">
          {navigationPages.map((page) => (
            <div key={page.path} className="relative">
              {hasChildren(page) ? (
                /* Dropdown Menu Item */
                <div
                  className="relative inline-block"
                  onMouseEnter={() => setOpenDropdown(page.path)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    onClick={() => toggleDropdown(page.path)}
                    className="flex items-center gap-1 text-teal-100 hover:text-white transition-colors text-xs sm:text-sm h-auto"
                  >
                    {page.title}
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {/* Dropdown Menu */}
                  {openDropdown === page.path && (
                    <div className="absolute top-full left-0 bg-white shadow-lg rounded-md border border-gray-200 min-w-48 z-50">
                      {/* Parent Page Link */}
                      <Link
                        to={page.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {page.title} Overview
                      </Link>
                      
                      {/* Child Pages */}
                      {page.children?.map((child: any) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 last:rounded-b-md"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Regular Menu Item */
                <Link
                  to={page.path}
                  className="text-teal-100 hover:text-white transition-colors text-xs sm:text-sm inline-block"
                  activeProps={{ className: 'text-white font-semibold' }}
                >
                  {page.title}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  )
}