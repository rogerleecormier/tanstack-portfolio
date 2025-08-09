// src/layout/AppLayout.tsx
import { Outlet } from '@tanstack/react-router'
import Header from './Header'
import Footer from './Footer'
import { AppSidebar } from '@/components/AppSidebar'
import { TableOfContents } from '../components/TableOfContents'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function AppLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex bg-gray-50">
        {/* Left Sidebar - Responsive: overlay on mobile, fixed on desktop */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header - Sticky */}
          <Header />
          
          <div className="flex flex-1 min-w-0">
            {/* Main Content */}
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 xl:p-12">
              <div className="w-full max-w-none">
                <Outlet />
              </div>
            </main>
            <TableOfContents />
          </div>
          
          {/* Footer */}
          <footer className="flex-shrink-0 mt-auto">
            <Footer />
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}