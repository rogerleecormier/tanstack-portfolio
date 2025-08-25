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
    icon: User,
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
  {
    title: "Project Method Analysis",
    url: "project-analysis",
    icon: BarChart3,
  },
];

export const projectItems = [
  {
    title: "Project Method Analysis",
    url: "project-analysis",
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