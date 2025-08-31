import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { ChevronRight, Home, Briefcase, FileText, FolderOpen } from 'lucide-react'
import { cachedContentService } from '@/api/cachedContentService'

const Breadcrumbs: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [pageTitle, setPageTitle] = useState<string | null>(null)
  const [isLoadingTitle, setIsLoadingTitle] = useState(false)
  
  // Get current path from router location
  const currentPath = location.pathname
  
  // Get page title from cached content when path changes
  useEffect(() => {
    const getPageTitle = async () => {
      if (currentPath === '/') {
        setPageTitle('Home')
        setIsLoadingTitle(false)
        return
      }
      
      const pathParts = currentPath.split('/').filter(Boolean)
      if (pathParts.length === 0) {
        setPageTitle('Home')
        setIsLoadingTitle(false)
        return
      }
      
      const contentType = pathParts[0] // portfolio, blog, projects, etc.
      const slug = pathParts[1] // the specific page slug
      
      if (!slug) {
        // Main section pages - set title immediately to prevent layout shift
        const sectionNames: Record<string, string> = {
          'portfolio': 'Portfolio',
          'blog': 'Blog',
          'projects': 'Projects',
          'contact': 'Contact',
          'about': 'About'
        }
        const sectionTitle = sectionNames[contentType] || contentType.charAt(0).toUpperCase() + contentType.slice(1)
        setPageTitle(sectionTitle)
        setIsLoadingTitle(false)
        return
      }
      
      setIsLoadingTitle(true)
      try {
        // Try to get the page title from cached content
        const allContent = await cachedContentService.getAllContent()
        const pageContent = allContent.find(item => {
          // Match by URL path
          if (item.url === currentPath) return true
          // Match by slug in URL
          if (item.url.includes(slug)) return true
          return false
        })
        
        if (pageContent) {
          setPageTitle(pageContent.title)
        } else {
          // Fallback to slug with proper capitalization
          setPageTitle(slug
            .split('-')
            .map(word => {
              if (word.toLowerCase() === 'ai') return 'AI'
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            })
            .join(' ')
          )
        }
      } catch {
        // Fallback to slug with proper capitalization
        setPageTitle(slug
          .split('-')
          .map(word => {
            if (word.toLowerCase() === 'ai') return 'AI'
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          })
          .join(' ')
        )
      } finally {
        setIsLoadingTitle(false)
      }
    }
    
    getPageTitle()
  }, [currentPath])
  
  const generateBreadcrumbs = () => {
    const pathnames = currentPath.split('/').filter(Boolean)
    
    if (pathnames.length === 0) {
      return [{ name: 'Home', path: '/', current: true, icon: Home }]
    }
    
    const breadcrumbs = [{ name: 'Home', path: '/', current: false, icon: Home }]
    
    if (pathnames.length === 1) {
      // Main section page
      const sectionName = pathnames[0]
      let icon = FolderOpen
      if (sectionName === 'portfolio') icon = Briefcase
      else if (sectionName === 'blog') icon = FileText
      else if (sectionName === 'projects') icon = FolderOpen
      else if (sectionName === 'contact') icon = FileText
      else if (sectionName === 'about') icon = Home
      
      breadcrumbs.push({
        name: sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
        path: `/${sectionName}`,
        current: true,
        icon
      })
    } else if (pathnames.length >= 2) {
      // Add section breadcrumb
      const sectionName = pathnames[0]
      let sectionIcon = FolderOpen
      if (sectionName === 'portfolio') sectionIcon = Briefcase
      else if (sectionName === 'blog') sectionIcon = FileText
      else if (sectionName === 'projects') sectionIcon = FolderOpen
      else if (sectionName === 'contact') sectionIcon = FileText
      else if (sectionName === 'about') sectionIcon = Home
      
      breadcrumbs.push({
        name: sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
        path: `/${sectionName}`,
        current: false,
        icon: sectionIcon
      })
      
             // Add page breadcrumb
       breadcrumbs.push({
         name: isLoadingTitle ? 'Loading...' : (pageTitle || 'Page'),
         path: currentPath,
         current: true,
         icon: FolderOpen
       })
    }
    
    return breadcrumbs
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  const handleNavigation = (path: string) => {
    navigate({ to: path })
  }
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-white/80 h-8 min-w-0">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center flex-shrink-0">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />}
          {breadcrumb.current ? (
            <span className="flex items-center gap-1 text-white font-medium flex-shrink-0 px-2 py-1">
              <breadcrumb.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate min-w-0">{breadcrumb.name}</span>
            </span>
          ) : (
            <button
              onClick={() => handleNavigation(breadcrumb.path)}
              className="flex items-center gap-1 hover:text-white transition-colors text-white/70 hover:bg-white/10 px-2 py-1 rounded flex-shrink-0"
            >
              <breadcrumb.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate min-w-0">{breadcrumb.name}</span>
            </button>
          )}
        </div>
      ))}
    </nav>
  )
}

export default Breadcrumbs
