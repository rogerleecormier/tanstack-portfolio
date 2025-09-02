// Navigation config for TanStack Router and AppSidebar

import { User, BarChart3, Mail, FileText, Briefcase, Users, Settings, Code, Target, Wrench } from "lucide-react";

export const navigationItems = [
  {
    title: "About",
    url: "", // root route
    icon: User,
  },
  {
    title: "Portfolio",
    url: "portfolio",
    icon: Briefcase,
  },
  {
    title: "Blog",
    url: "blog",
    icon: FileText,
  },
  {
    title: "Projects",
    url: "projects",
    icon: BarChart3,
  },
  {
    title: "Tools",
    url: "tools",
    icon: Wrench,
  },
  {
    title: "Contact",
    url: "contact",
    icon: Mail,
  },
];

export const portfolioItems = [
  {
    title: "Analytics & Insights",
    url: "portfolio/analytics",
    icon: BarChart3,
  },
  {
    title: "Strategy & Vision",
    url: "portfolio/strategy",
    icon: Target,
  },
  {
    title: "Leadership & Culture",
    url: "portfolio/leadership",
    icon: Users,
  },
  {
    title: "Talent & Org Design",
    url: "portfolio/talent",
    icon: User,
  },
  {
    title: "DevOps & Automation",
    url: "portfolio/devops",
    icon: Code,
  },
  {
    title: "ERP & SaaS Integration",
    url: "portfolio/saas",
    icon: Settings,
  },
];

// Protected routes that only show when authenticated
export const protectedProjectItems = [
  {
    title: "Site Administration",
    url: "protected/site-admin",
    icon: Settings,
    requiresAuth: true,
  },
  {
    title: "Content Studio",
    url: "protected/content-studio",
    icon: FileText,
    requiresAuth: true,
  },
  {
    title: "HealthBridge Enhanced",
    url: "protected/healthbridge-enhanced",
    icon: Target,
    requiresAuth: true,
  },
  {
    title: "Settings",
    url: "protected/settings",
    icon: Settings,
    requiresAuth: true,
  },
];