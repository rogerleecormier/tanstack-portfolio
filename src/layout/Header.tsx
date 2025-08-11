import { Briefcase, ChevronRight } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import Search from '../components/Search'
import { navigationPages } from '@/config/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'

export default function Header() {
  const location = useLocation()
  const currentPath = location.pathname

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const breadcrumbs = [{ title: 'Home', path: '/' }]
    
    // Handle root path
    if (currentPath === '/') {
      return breadcrumbs
    }
    
    // Find the matching page or child page
    for (const page of navigationPages) {
      // Check if current path matches a top-level page
      if (page.path === currentPath) {
        breadcrumbs.push({ title: page.title, path: page.path })
        break
      }
      
      // Check if current path matches a child page
      if (page.children) {
        const childPage = page.children.find(child => child.path === currentPath)
        if (childPage) {
          // Only add the parent if it's not the same as the child
          if (page.path !== childPage.path) {
            breadcrumbs.push({ title: page.title, path: page.path })
          }
          breadcrumbs.push({ title: childPage.title, path: childPage.path })
          break
        }
      }
    }
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="sticky top-0 z-[100] bg-teal-600 shadow-md border-b border-teal-500">
      <div className="py-3 sm:py-4">
        {/* Mobile Layout: Stack vertically */}
        <div className="sm:hidden">
          {/* Top row: Hamburger, Logo/Title */}
          <div className="flex items-center gap-3 mb-3 px-4 sm:px-6">
            {/* Hamburger Menu Button - Fixed dimensions */}
            <div className="w-5 h-5 flex-shrink-0">
              <SidebarTrigger className="w-full h-full p-1 text-white hover:bg-teal-700 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu h-8 w-8" aria-hidden="true">
                  <path d="M4 12h16"></path>
                  <path d="M4 18h16"></path>
                  <path d="M4 6h16"></path>
                </svg>
                <span className="sr-only">Toggle navigation menu</span>
                <span className="sr-only">Toggle Sidebar</span>
              </SidebarTrigger>
            </div>
            
            <Briefcase className="h-5 w-5 text-white flex-shrink-0" />
            <h1 className="text-lg font-bold text-white truncate">
              Roger Lee Cormier Portfolio
            </h1>
          </div>

          {/* Search box - Mobile - Fixed container */}
          <div className="w-full h-10 flex-shrink-0 px-4 sm:px-6">
            <Search />
          </div>
        </div>

        {/* Desktop Layout: Side by side */}
        <div className="hidden sm:flex items-center justify-between gap-3 mb-3 pr-4">
          {/* Left side: Hamburger, Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 pl-3">
            {/* Hamburger Menu Button - Fixed dimensions */}
            <div className="w-12 h-12 flex-shrink-0">
              <SidebarTrigger className="w-full h-full p-1 text-white hover:bg-teal-700 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu h-8 w-8" aria-hidden="true">
                  <path d="M4 12h16"></path>
                  <path d="M4 18h16"></path>
                  <path d="M4 6h16"></path>
                </svg>
                <span className="sr-only">Toggle navigation menu</span>
                <span className="sr-only">Toggle Sidebar</span>
              </SidebarTrigger>
            </div>
            
            <Briefcase className="h-6 w-6 text-white flex-shrink-0" />
            <h1 className="text-xl font-bold text-white truncate">
              Roger Lee Cormier Portfolio
            </h1>
          </div>

          {/* Right-aligned Search - Desktop - Fixed container */}
          <div className="h-10 sm:w-48 md:w-56 lg:w-64 flex-shrink-0">
            <Search />
          </div>
        </div>

        {/* Breadcrumbs - Show on desktop - Fixed height */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-teal-100 h-6 px-6">
          {breadcrumbs.map((crumb, index) => (
            <div key={`breadcrumb-${index}-${crumb.path}`} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-3 w-3" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-white font-medium">{crumb.title}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-white transition-colors"
                >
                  {crumb.title}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}