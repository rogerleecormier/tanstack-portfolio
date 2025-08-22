// Navigation config for TanStack Router and AppSidebar

import { User, BarChart3, Briefcase, Users, Settings, Code, Target } from "lucide-react";

export const navigationItems = [
  {
    title: "About",
    url: "", // root route
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

export const projectItems = [
  {
    title: "Projects Analysis",
    url: "project-analysis",
    icon: BarChart3,
  },
  // HealthBridge Analysis is protected - will be shown conditionally
];

// Protected routes that only show when authenticated
export const protectedProjectItems = [
  {
    title: "HealthBridge Analysis",
    url: "healthbridge-analysis",
    icon: BarChart3,
    requiresAuth: true,
  },
  {
    title: "Protected Content",
    url: "protected",
    icon: User,
    requiresAuth: true,
  },
];