// src/layout/AppLayout.tsx
import { Outlet } from '@tanstack/react-router'
import Header from './Header'
import Footer from './Footer'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import SiteAssistant from '@/components/AIPortfolioAssistant'
import { loadPortfolioItems } from '@/utils/portfolioUtils'
import { useEffect, useState } from 'react'
import { PortfolioItem } from '@/utils/portfolioUtils'

export default function AppLayout() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await loadPortfolioItems()
        setPortfolioItems(items)
      } catch (error) {
        console.error('Error loading portfolio items for AI assistant:', error)
      }
    }

    loadItems()
  }, [])

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex bg-gray-50">
        <AppSidebar />
        {/* Main content fills the full height */}
        <div className="flex flex-col flex-1 min-w-0 min-h-screen">
          <Header />
          <div className="flex flex-1 min-h-0">
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
              {/* Consistent page width container for all pages */}
              <div className="w-full max-w-7xl mx-auto">
                <Outlet />
              </div>
            </main>
          </div>
          {/* Footer is now INSIDE the main flex column, positioned between sidebar and right edge */}
          <Footer />
        </div>
      </div>
      
      {/* Site Assistant - Available on all pages */}
      <SiteAssistant 
        portfolioItems={portfolioItems}
      />
    </SidebarProvider>
  )
}