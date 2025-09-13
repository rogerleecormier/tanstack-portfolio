import { cachedContentService } from '@/api/cachedContentService';
import { useLocation, useNavigate } from '@tanstack/react-router';
import {
  Briefcase,
  ChevronRight,
  FileText,
  FolderOpen,
  Home,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const Breadcrumbs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);

  // Get current path from router location
  const currentPath = location.pathname;

  // Get page title from cached content when path changes
  useEffect(() => {
    const getPageTitle = () => {
      if (currentPath === '/') {
        setPageTitle('Home');
        setIsLoadingTitle(false);
        return;
      }

      const pathParts = currentPath.split('/').filter(Boolean);
      if (pathParts.length === 0) {
        setPageTitle('Home');
        setIsLoadingTitle(false);
        return;
      }

      const contentType = pathParts[0]; // portfolio, blog, projects, etc.
      const slug = pathParts[1]; // the specific page slug

      if (!slug) {
        // Main section pages - set title immediately to prevent layout shift
        const sectionNames: Record<string, string> = {
          portfolio: 'Portfolio',
          blog: 'Blog',
          projects: 'Projects',
          contact: 'Contact',
          about: 'About',
        };
        const sectionTitle =
          (contentType && sectionNames[contentType]) ??
          (contentType
            ? contentType.charAt(0).toUpperCase() + contentType.slice(1)
            : 'Page');
        setPageTitle(sectionTitle);
        setIsLoadingTitle(false);
        return;
      }

      setIsLoadingTitle(true);
      try {
        // Try to get the page title from cached content
        const allContent = cachedContentService.getAllContent();
        const pageContent = allContent.find(item => {
          // Match by URL path
          if (item.url === currentPath) return true;
          // Match by slug in URL
          if (item.url.includes(slug)) return true;
          return false;
        });

        if (pageContent) {
          setPageTitle(pageContent.title);
        } else {
          // Fallback to slug with proper capitalization
          setPageTitle(
            slug
              .split('-')
              .map(word => {
                if (word.toLowerCase() === 'ai') return 'AI';
                return (
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                );
              })
              .join(' ')
          );
        }
      } catch {
        // Fallback to slug with proper capitalization
        setPageTitle(
          slug
            .split('-')
            .map(word => {
              if (word.toLowerCase() === 'ai') return 'AI';
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ')
        );
      } finally {
        setIsLoadingTitle(false);
      }
    };

    void getPageTitle();
  }, [currentPath]);

  const generateBreadcrumbs = () => {
    const pathnames = currentPath.split('/').filter(Boolean);

    if (pathnames.length === 0) {
      return [{ name: 'Home', path: '/', current: true, icon: Home }];
    }

    const breadcrumbs = [
      { name: 'Home', path: '/', current: false, icon: Home },
    ];

    if (pathnames.length === 1) {
      // Main section page
      const sectionName = pathnames[0];
      let icon = FolderOpen;
      if (sectionName === 'portfolio') icon = Briefcase;
      else if (sectionName === 'blog') icon = FileText;
      else if (sectionName === 'projects') icon = FolderOpen;
      else if (sectionName === 'contact') icon = FileText;
      else if (sectionName === 'about') icon = Home;

      breadcrumbs.push({
        name: sectionName
          ? sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
          : 'Section',
        path: `/${sectionName ?? ''}`,
        current: true,
        icon,
      });
    } else if (pathnames.length >= 2) {
      // Add section breadcrumb
      const sectionName = pathnames[0];
      let sectionIcon = FolderOpen;
      if (sectionName === 'portfolio') sectionIcon = Briefcase;
      else if (sectionName === 'blog') sectionIcon = FileText;
      else if (sectionName === 'projects') sectionIcon = FolderOpen;
      else if (sectionName === 'contact') sectionIcon = FileText;
      else if (sectionName === 'about') sectionIcon = Home;

      breadcrumbs.push({
        name: sectionName
          ? sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
          : 'Section',
        path: `/${sectionName ?? ''}`,
        current: false,
        icon: sectionIcon,
      });

      // Add page breadcrumb
      breadcrumbs.push({
        name: isLoadingTitle ? 'Loading...' : (pageTitle ?? 'Page'),
        path: currentPath,
        current: true,
        icon: FolderOpen,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleNavigation = (path: string) => {
    void navigate({ to: path });
  };

  return (
    <nav className='flex h-8 min-w-0 items-center space-x-1 text-sm text-white/80'>
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className='flex shrink-0 items-center'>
          {index > 0 && <ChevronRight className='mx-1 size-4 shrink-0' />}
          {breadcrumb.current ? (
            <span className='flex shrink-0 items-center gap-1 px-2 py-1 font-medium text-white'>
              <breadcrumb.icon className='size-4 shrink-0' />
              <span className='min-w-0 truncate'>{breadcrumb.name}</span>
            </span>
          ) : (
            <button
              onClick={() => handleNavigation(breadcrumb.path)}
              className='flex shrink-0 items-center gap-1 rounded px-2 py-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white'
            >
              <breadcrumb.icon className='size-4 shrink-0' />
              <span className='min-w-0 truncate'>{breadcrumb.name}</span>
            </button>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
