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
        <AppSidebar />
        {/* Main content and TOC fill the full height */}
        <div className="flex flex-col flex-1 min-w-0 min-h-screen">
          <Header />
          <div className="flex flex-1 min-h-0">
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 xl:p-12">
              <div className="w-full max-w-none">
                <Outlet />
              </div>
            </main>
            <TableOfContents />
          </div>
        </div>
      </div>
      {/* Footer is now OUTSIDE the main flex column */}
      <Footer />
    </SidebarProvider>
  )
}