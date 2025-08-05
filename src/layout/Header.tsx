import { Briefcase, ChevronRight, Menu } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import Search from '../components/Search'
import { navigationPages } from '../config/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'

export default function Header() {
  const location = useLocation()
  const currentPath = location.pathname

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const pathSegments = currentPath.split('/').filter(Boolean)
    const breadcrumbs = [{ title: 'Home', path: '/' }]
    
    pathSegments.forEach((_, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/')
      const page = navigationPages.find(p => p.path === path || p.children?.some(c => c.path === path))
      
      if (page) {
        if (page.path === path) {
          breadcrumbs.push({ title: page.title, path })
        } else {
          const child = page.children?.find(c => c.path === path)
          if (child) {
            breadcrumbs.push({ title: page.title, path: page.path })
            breadcrumbs.push({ title: child.title, path })
          }
        }
      }
    })
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="sticky top-0 z-40 bg-teal-600 shadow-md border-b border-teal-500">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        {/* Mobile Layout: Stack vertically */}
        <div className="sm:hidden">
          {/* Top row: Hamburger menu + Logo/Title */}
          <div className="flex items-center gap-3 mb-3">
            <SidebarTrigger className="inline-flex items-center justify-center w-10 h-10 text-white hover:text-teal-100 hover:bg-teal-700/20 rounded-md transition-colors [&>svg]:!w-6 [&>svg]:!h-6 [&>svg]:!text-white">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <Briefcase className="h-5 w-5 text-white flex-shrink-0" />
            <h1 className="text-lg font-bold text-white truncate">
              Roger Lee Cormier Portfolio
            </h1>
          </div>

          {/* Search box - Mobile (full width under logo) */}
          <div className="w-full">
            <Search />
          </div>
        </div>

        {/* Desktop Layout: Side by side */}
        <div className="hidden sm:flex items-center justify-between gap-3 mb-3">
          {/* Left side: Sidebar toggle + Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <SidebarTrigger className="inline-flex items-center justify-center w-8 h-8 text-white hover:text-teal-100 hover:bg-teal-700/20 rounded-md transition-colors [&>svg]:!w-5 [&>svg]:!h-5 [&>svg]:!text-white">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">
              Roger Lee Cormier Portfolio
            </h1>
          </div>

          {/* Right-aligned Search - Desktop */}
          <div className="flex-shrink-0">
            <Search />
          </div>
        </div>

        {/* Breadcrumbs - Show on desktop */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-teal-100">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center gap-2">
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