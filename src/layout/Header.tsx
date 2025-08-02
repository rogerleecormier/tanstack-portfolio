import { Briefcase } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import Search from '../components/Search'

export default function Header() {
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
        <nav className="flex flex-wrap gap-4 sm:gap-6 justify-start">
          <Link
            to="/about"
            className="text-teal-100 hover:text-white transition-colors text-sm sm:text-base"
            activeProps={{ className: 'text-white font-semibold' }}
          >
            About
          </Link>
          <Link
            to="/projects"
            className="text-teal-100 hover:text-white transition-colors text-sm sm:text-base"
            activeProps={{ className: 'text-white font-semibold' }}
          >
            Projects
          </Link>
        </nav>
      </div>
    </header>
  )
}