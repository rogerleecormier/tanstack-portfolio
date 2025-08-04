import { ChevronRight, User, BarChart3, Briefcase, Users, Settings, Code, Target } from "lucide-react"
import { Link, useLocation } from "@tanstack/react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const navigationItems = [
  {
    title: "About",
    url: "/about",
    icon: User,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    items: [
      {
        title: "Analytics Overview",
        url: "/analytics",
      },
      {
        title: "Project Analysis",
        url: "/project-analysis",
      },
    ],
  },
  {
    title: "DevOps & Automation",
    url: "/devops",
    icon: Code,
  },
  {
    title: "ERP & SaaS Integration",
    url: "/saas",
    icon: Settings,
  },
  {
    title: "Leadership",
    url: "/leadership",
    icon: Users,
  },
  {
    title: "Strategy",
    url: "/strategy",
    icon: Target,
  },
  {
    title: "Culture & Values",
    url: "/culture",
    icon: Briefcase,
  },
  {
    title: "Talent Development",
    url: "/talent",
    icon: Users,
  },
  {
    title: "Vision",
    url: "/vision",
    icon: Target,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const currentPath = location.pathname

  const isCurrentPage = (url: string) => currentPath === url

  const isActiveSection = (item: any) => {
    if (isCurrentPage(item.url)) return true
    if (item.items) {
      return item.items.some((subItem: any) => isCurrentPage(subItem.url))
    }
    return false
  }

  return (
    <Sidebar className="border-r border-teal-200 bg-teal-50 w-64">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-teal-900 font-semibold px-4 mb-2">
            Portfolio Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <Collapsible 
                  key={item.title} 
                  asChild 
                  defaultOpen={isActiveSection(item)}
                >
                  <SidebarMenuItem>
                    {item.items ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            tooltip={item.title}
                            className="text-teal-800 hover:bg-teal-100 hover:text-teal-900 data-[state=open]:bg-teal-100"
                          >
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton 
                                  asChild
                                  className={`text-teal-700 hover:bg-teal-100 hover:text-teal-900 ${
                                    isCurrentPage(subItem.url) ? 'bg-teal-200 text-teal-900 font-medium' : ''
                                  }`}
                                >
                                  <Link to={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : (
                      <SidebarMenuButton 
                        asChild 
                        tooltip={item.title}
                        className={`text-teal-800 hover:bg-teal-100 hover:text-teal-900 ${
                          isCurrentPage(item.url) ? 'bg-teal-200 text-teal-900 font-medium' : ''
                        }`}
                      >
                        <Link to={item.url}>
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}