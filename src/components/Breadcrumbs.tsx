import React, { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronRight, Home, Briefcase, FileText, FolderOpen } from 'lucide-react'
import { cachedContentService } from '@/api/cachedContentService'

const Breadcrumbs: React.FC = () => {
  const navigate = useNavigate()
  const [currentPath, setCurrentPath] = useState('/')
  const [pageTitle, setPageTitle] = useState<string | null>(null)
  
  useEffect(() => {
    // Update current path when component mounts
    const updatePath = () => {
      setCurrentPath(window.location.pathname)
    }
    
    updatePath()
    
    // Listen for all navigation events
    const handlePopState = () => updatePath()
    
    // Override pushState and replaceState to catch programmatic navigation
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args)
      setTimeout(updatePath, 0)
    }
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args)
      setTimeout(updatePath, 0)
    }
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
      // Restore original methods
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [])
  
  // Also update when the component re-renders (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.location.pathname !== currentPath) {
        setCurrentPath(window.location.pathname)
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [currentPath])
  
  // Get page title from cached content when path changes
  useEffect(() => {
    const getPageTitle = async () => {
      if (currentPath === '/') {
        setPageTitle('Home')
        return
      }
      
      const pathParts = currentPath.split('/').filter(Boolean)
      if (pathParts.length === 0) {
        setPageTitle('Home')
        return
      }
      
      const contentType = pathParts[0] // portfolio, blog, projects, etc.
      const slug = pathParts[1] // the specific page slug
      
      if (!slug) {
        // Main section pages
        const sectionNames: Record<string, string> = {
          'portfolio': 'Portfolio',
          'blog': 'Blog',
          'projects': 'Projects',
          'contact': 'Contact',
          'about': 'About'
        }
        setPageTitle(sectionNames[contentType] || contentType.charAt(0).toUpperCase() + contentType.slice(1))
        return
      }
      
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
        name: pageTitle || 'Page',
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
    setCurrentPath(path)
  }
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-white/80">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          {breadcrumb.current ? (
            <span className="flex items-center gap-1 text-white font-medium">
              <breadcrumb.icon className="h-4 w-4" />
              {breadcrumb.name}
            </span>
          ) : (
            <button
              onClick={() => handleNavigation(breadcrumb.path)}
              className="flex items-center gap-1 hover:text-white transition-colors text-white/70 hover:bg-white/10 px-2 py-1 rounded"
            >
              <breadcrumb.icon className="h-4 w-4" />
              {breadcrumb.name}
            </button>
          )}
        </div>
      ))}
    </nav>
  )
}

export default Breadcrumbs
