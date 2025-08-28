// Navigation config for TanStack Router and AppSidebar

import { User, BarChart3, Mail, FileText, Briefcase, Users, Settings, Code, Target } from "lucide-react";

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

export const projectItems = [
  {
    title: "Project Method Analysis",
    url: "projects/project-analysis",
    icon: BarChart3,
  },
  {
    title: "HealthBridge Analysis",
    url: "healthbridge-analysis",
    icon: BarChart3,
  },
];

// Protected routes that only show when authenticated
export const protectedProjectItems = [
  {
    title: "Protected Content",
    url: "protected",
    icon: User,
    requiresAuth: true,
  },
];