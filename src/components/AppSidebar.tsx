import { Link } from '@tanstack/react-router'; // TanStack Router
import { navigationItems } from '../config/navigation';
import { TableOfContents } from './TableOfContents';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
      className='border-r border-hunter-700/40 bg-gradient-to-b from-hunter-950 to-hunter-900 backdrop-blur-md dark:border-hunter-600/50'
    >
      <SidebarContent className='gap-1 pt-16'>
        {/* Main Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 py-2 text-xs font-semibold uppercase tracking-wider text-hunter-300 dark:text-hunter-400'>
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
                      className='group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-hunter-100 transition-all duration-200 hover:border-l-2 hover:border-strategy-gold/50 hover:bg-strategy-gold/10 data-[active]:border-l-2 data-[active]:border-strategy-gold data-[active]:bg-strategy-gold/10 data-[active]:font-semibold dark:text-hunter-100 dark:hover:border-strategy-gold/50 dark:hover:bg-strategy-gold/10 dark:data-[active]:border-strategy-gold dark:data-[active]:bg-strategy-gold/10'
                    >
                      {item.icon && (
                        <item.icon className='size-4 shrink-0 text-hunter-400 transition-colors duration-200 group-hover:text-strategy-gold group-data-[active]:text-strategy-gold dark:text-hunter-400 dark:group-hover:text-strategy-gold dark:group-data-[active]:text-strategy-gold' />
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
