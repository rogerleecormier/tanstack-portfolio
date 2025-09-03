import { Link } from "@tanstack/react-router"; // TanStack Router
import { useAuth } from "../hooks/useAuth";
import { navigationItems, protectedProjectItems } from "../config/navigation";
import { TableOfContents } from "./TableOfContents";

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
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-20 gap-0">
        {/* Main Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-teal-900 font-semibold px-4 mb-2">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link
                      to={item.url === "" ? "/" : `/${item.url}`}
                      activeOptions={{ exact: item.url === "" }}
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        


        {/* Administration Group - Only show when authenticated */}
        {isAuthenticated && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-teal-900 font-semibold px-4 mb-2">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0">
                {protectedProjectItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link
                        to={`/${item.url}`}
                        onClick={() => {
                          if (isMobile) setOpenMobile(false);
                        }}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Table of Contents - Only show when there's content */}
        <TableOfContents />
      </SidebarContent>
    </Sidebar>
  );
}