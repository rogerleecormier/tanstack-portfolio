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
      className='border-r border-slate-200/50 bg-gradient-to-b from-slate-50/95 to-slate-100/95 backdrop-blur-md dark:border-slate-700/50 dark:bg-gradient-to-b dark:from-slate-900/95 dark:to-slate-800/95'
    >
      <SidebarContent className='gap-1 pt-16'>
        {/* Main Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400'>
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
                      className='group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-l-2 hover:border-gold-500/50 hover:bg-gold-500/10 data-[active]:border-l-2 data-[active]:border-gold-500 data-[active]:bg-gold-500/10 data-[active]:font-semibold dark:text-white dark:hover:border-gold-500/50 dark:hover:bg-gold-500/10 dark:data-[active]:border-gold-500 dark:data-[active]:bg-gold-500/10'
                    >
                      {item.icon && (
                        <item.icon className='size-4 shrink-0 text-slate-400 transition-colors duration-200 group-hover:text-gold-400 group-data-[active]:text-gold-400 dark:text-slate-400 dark:group-hover:text-gold-400 dark:group-data-[active]:text-gold-400' />
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
