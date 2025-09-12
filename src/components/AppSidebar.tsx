import { Link } from '@tanstack/react-router'; // TanStack Router
import { navigationItems } from '../config/navigation';
import { TableOfContents } from './TableOfContents';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar
      collapsible='icon'
      className='border-r border-slate-200/50 bg-gradient-to-b from-slate-50/98 to-slate-100/95 backdrop-blur-md dark:border-slate-700/50 dark:bg-gradient-to-b dark:from-slate-900/98 dark:to-slate-800/95'
    >
      <SidebarContent className='pt-16 gap-1'>
        {/* Main Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='space-y-0.5 px-2'>
              {navigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link
                      to={item.url === '' ? '/' : `/${item.url}`}
                      activeOptions={{ exact: item.url === '' }}
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                      className='group flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all duration-200 hover:bg-teal-100/90 hover:text-teal-900 hover:border-l-2 hover:border-teal-400 hover:shadow-sm hover:shadow-teal-100/30 dark:hover:bg-teal-800/40 dark:hover:text-teal-100 dark:hover:border-teal-500 dark:hover:shadow-teal-900/20 data-[active]:bg-gradient-to-r data-[active]:from-teal-50 data-[active]:to-blue-50 data-[active]:text-slate-900 data-[active]:font-semibold data-[active]:border-l-3 data-[active]:border-teal-600 dark:data-[active]:from-teal-900/30 dark:data-[active]:to-blue-900/30 dark:data-[active]:text-slate-100 rounded-lg'
                    >
                      {item.icon && (
                        <item.icon className='h-4 w-4 flex-shrink-0 text-slate-600 dark:text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 data-[active]:text-teal-600 dark:data-[active]:text-teal-400 transition-colors duration-200' />
                      )}
                      <span className='truncate'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Table of Contents - Only show when there's content */}
        <TableOfContents />
      </SidebarContent>
    </Sidebar>
  );
}
