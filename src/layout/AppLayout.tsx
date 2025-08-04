// src/layout/AppLayout.tsx
import { Outlet } from '@tanstack/react-router'
import Header from './Header'
import Footer from './Footer'
import { AppSidebar } from '@/components/AppSidebar'
import { TableOfContents } from '../components/TableOfContents'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-gray-50">
        {/* Left Sidebar - Full height */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          {/* Header positioned to the right of sidebar */}
          <Header />
          
          <div className="flex flex-1">
            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-12 overflow-auto">
              <div className="w-full max-w-none">
                <Outlet />
              </div>
            </main>
            
            {/* Right Sidebar - Table of Contents */}
            <aside className="hidden xl:block w-96 flex-shrink-0 p-8 border-l border-gray-200 bg-white/50">
              <TableOfContents />
            </aside>
          </div>
          
          {/* Footer positioned to the right of sidebar */}
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}