import { User, BarChart3, Briefcase, Users, Settings, Code, Target } from "lucide-react";
import { Link } from "@tanstack/react-router"; // TanStack Router

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

const navigationItems = [
  {
    title: "About",
    url: "", // root
    icon: User,
  },
  {
    title: "Analytics & Insights",
    url: "analytics",
    icon: BarChart3,
  },
  {
    title: "Strategy & Vision",
    url: "strategy",
    icon: Target,
  },
  {
    title: "Leadership & Culture",
    url: "leadership",
    icon: Users,
  },
  {
    title: "Talent & Org Design",
    url: "talent",
    icon: Briefcase,
  },
  {
    title: "DevOps & Automation",
    url: "devops",
    icon: Code,
  },
  {
    title: "ERP & SaaS Integration",
    url: "saas",
    icon: Settings,
  },
];

const projectItems = [
  {
    title: "Projects Analysis",
    url: "project-analysis",
    icon: BarChart3,
  },
  //{
  //  title: "HealthBridge Analysis",
  //  url: "healthbridge-analysis",
  //  icon: BarChart3,
  //},
  // Add more projects here as needed
];

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar className="border-r border-teal-200 bg-teal-50" collapsible="icon">
      <SidebarContent className="pt-4">
        {/* Portfolio Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-teal-900 font-semibold px-4 mb-2">
            Portfolio Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link
                      to={item.url === "" ? "/" : `/${item.url}`}
                      activeOptions={{ exact: item.url === "" }}
                      activeProps={{ className: "bg-teal-200 text-teal-900 font-medium" }}
                      inactiveProps={{ className: "text-teal-800 hover:bg-teal-100 hover:text-teal-900" }}
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
        {/* Projects Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-teal-900 font-semibold px-4 mb-2">
            Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {projectItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link
                      to={`/${item.url}`}
                      activeProps={{ className: "bg-teal-200 text-teal-900 font-medium" }}
                      inactiveProps={{ className: "text-teal-800 hover:bg-teal-100 hover:text-teal-900" }}
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
      </SidebarContent>
    </Sidebar>
  );
}