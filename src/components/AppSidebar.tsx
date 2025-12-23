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
      className='border-r border-strategy-gold-dark/40 bg-gradient-to-b from-surface-deep to-surface-deep backdrop-blur-md dark:border-strategy-gold/50'
    >
      <SidebarContent className='gap-1 pt-16'>
        {/* Main Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 py-2 text-xs font-semibold uppercase tracking-wider text-strategy-gold dark:text-strategy-gold'>
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
                      className='group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-elevated transition-all duration-200 hover:border-l-2 hover:border-surface-elevated0/50 hover:bg-surface-elevated0/10 data-[active]:border-l-2 data-[active]:border-surface-elevated0 data-[active]:bg-surface-elevated0/10 data-[active]:font-semibold dark:text-surface-elevated dark:hover:border-surface-elevated0/50 dark:hover:bg-surface-elevated0/10 dark:data-[active]:border-surface-elevated0 dark:data-[active]:bg-surface-elevated0/10'
                    >
                      {item.icon && (
                        <item.icon className='size-4 shrink-0 text-strategy-gold transition-colors duration-200 group-hover:text-strategy-gold group-data-[active]:text-strategy-gold dark:text-strategy-gold dark:group-hover:text-strategy-gold dark:group-data-[active]:text-strategy-gold' />
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
