// src/layout/AppLayout.tsx
import { Outlet } from '@tanstack/react-router'
import Header from './Header'
import Footer from './Footer'
import { AppSidebar } from '@/components/AppSidebar'
import { TableOfContents } from '../components/TableOfContents'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { useState, useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

export default function AppLayout() {
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const isMobile = useIsMobile()

  // Handle hydration to prevent layout shifts
  useEffect(() => {
    setIsHydrated(true)
    // Small delay to ensure all components are mounted and styled
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Determine default sidebar state: open on desktop, closed on mobile
  const defaultSidebarOpen = !isMobile

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        {/* Loading layout that matches the final layout structure */}
        <div className={`${defaultSidebarOpen ? 'w-64' : 'w-0'} transition-none bg-sidebar-background border-r border-sidebar-border`}>
          {/* Sidebar placeholder */}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header placeholder */}
          <div className="h-16 bg-teal-600 border-b border-teal-500"></div>
          {/* Main content placeholder */}
          <div className="flex flex-1">
            <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-12">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </main>
            {/* TOC placeholder */}
            <div className="hidden xl:block w-96 p-8 border-l border-gray-200 bg-white/50"></div>
          </div>
          {/* Footer placeholder */}
          <div className="h-16 bg-gray-100 border-t border-gray-200"></div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <div className="min-h-screen flex bg-gray-50 sidebar-layout">
        {/* Left Sidebar - Responsive: overlay on mobile, fixed on desktop */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          {/* Header positioned to the right of sidebar on desktop, full width on mobile */}
          <Header />
          
          <div className="flex flex-1">
            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-12 overflow-auto">
              <div className="w-full max-w-none">
                <Outlet />
              </div>
            </main>
            
            {/* Right Sidebar - Table of Contents - Hidden on mobile */}
            <aside className="hidden xl:block w-96 flex-shrink-0 p-8 border-l border-gray-200 bg-white/50">
              <TableOfContents />
            </aside>
          </div>
          
          {/* Footer */}
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}