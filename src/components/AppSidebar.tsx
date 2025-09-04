import { Link } from "@tanstack/react-router"; // TanStack Router
import { useAuth } from "../hooks/useAuth";
import { navigationItems, protectedProjectItems } from "../config/navigation";
import { TableOfContents } from "./TableOfContents";
import { Separator } from "@/components/ui/separator";

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
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { isAuthenticated } = useAuth();

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-teal-200/60 bg-gradient-to-b from-teal-50/95 via-blue-50/95 to-teal-50/95 backdrop-blur-sm dark:border-teal-800/60 dark:from-teal-950/95 dark:via-blue-950/95 dark:to-teal-950/95"
    >
      <SidebarContent className="pt-16 gap-0.5">
        {/* Main Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-0.5 text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide">
            NAV
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link
                      to={item.url === "" ? "/" : `/${item.url}`}
                      activeOptions={{ exact: item.url === "" }}
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                      className="group flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-150 hover:bg-teal-50 hover:text-teal-800 dark:hover:bg-teal-900/30 dark:hover:text-teal-200 data-[active]:bg-teal-100 data-[active]:text-teal-900 data-[active]:font-semibold data-[active]:border-l-2 data-[active]:border-teal-500 dark:data-[active]:bg-teal-800/40 dark:data-[active]:text-teal-100 rounded-sm"
                    >
                      {item.icon && (
                        <item.icon className="h-3.5 w-3.5 flex-shrink-0 text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-150" />
                      )}
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Administration Group - Only show when authenticated */}
        {isAuthenticated && (
          <>
            <Separator className="mx-2 bg-teal-200/40 dark:bg-teal-800/40" />
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                ADMIN
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0 px-0.5">
                {protectedProjectItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link
                        to={`/${item.url}`}
                        onClick={() => {
                          if (isMobile) setOpenMobile(false);
                        }}
                        className="group flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-150 hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-blue-900/30 dark:hover:text-blue-200 data-[active]:bg-blue-100 data-[active]:text-blue-900 data-[active]:font-semibold data-[active]:border-l-2 data-[active]:border-blue-500 dark:data-[active]:bg-blue-800/40 dark:data-[active]:text-blue-100 rounded-sm"
                      >
                        {item.icon && (
                          <item.icon className="h-3.5 w-3.5 flex-shrink-0 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-150" />
                        )}
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Table of Contents - Only show when there's content */}
        <TableOfContents />
      </SidebarContent>
    </Sidebar>
  );
}