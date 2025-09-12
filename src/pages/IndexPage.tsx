import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

import { cachedContentService } from '@/api/cachedContentService';
import { Logo } from '@/components/Logo';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Briefcase,
  Database,
  Globe,
  MessageSquare,
  User,
  Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Types for blog, projects, and tools data
interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  category: string;
  url: string;
}

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  url: string;
}

interface ToolItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  url: string;
}

export default function IndexPage() {
  const navigate = useNavigate();
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);
  const [featuredWork, setFeaturedWork] = useState<(ProjectItem | ToolItem)[]>(
    []
  );

  // Update document title and meta tags
  useDocumentTitle({
    title: 'Roger Cormier - Digital Transformation & Technical Leadership',
    description:
      'Technical Project Manager specializing in ERP, SaaS integration, AI automation, and digital transformation. PMP-certified leader driving organizational excellence through strategic technology implementation.',
    keywords: [
      'Digital Transformation',
      'Technical Leadership',
      'ERP Integration',
      'AI Automation',
      'Project Management',
      'SaaS Integration',
      'NetSuite',
      'Ramp',
      'Cloudflare',
    ],
    type: 'website',
  });

  // Load recent blog posts and featured work (projects + tools)
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Wait for cached content service to be ready
        let retryCount = 0;
        const maxRetries = 5;

        while (!cachedContentService.isReady() && retryCount < maxRetries) {
          retryCount++;
          console.log(
            `🔄 Waiting for content service to be ready... (attempt ${retryCount}/${maxRetries})`
          );
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        if (!cachedContentService.isReady()) {
          console.warn('⚠️ Content service not ready after retries');
          return;
        }

        // Get all content from cached service
        const allContent = await cachedContentService.getAllContent();

        // Get recent blog posts (sorted by date, most recent first)
        const blogs = allContent.filter(item => item.contentType === 'blog');
        const sortedBlogs = blogs
          .filter(blog => blog.date) // Only include blogs with dates
          .sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 6) // Get 6 most recent
          .map(blog => ({
            id: blog.id,
            title: blog.title,
            description: blog.description,
            date: blog.date || new Date().toISOString().split('T')[0],
            tags: blog.tags,
            category: blog.category,
            url: blog.url,
          }));

        setRecentBlogs(sortedBlogs);

        // Get featured work from projects and portfolio items
        const projects = allContent.filter(
          item => item.contentType === 'project'
        );
        const portfolioItems = allContent.filter(
          item => item.contentType === 'portfolio'
        );

        // Create a HealthBridge project entry since it's a project, not a portfolio item
        const healthBridgeProject = {
          id: 'healthbridge-enhanced',
          title: 'HealthBridge Enhanced',
          description:
            'Health tracking and analytics platform with weight management, medication tracking, and predictive regression analysis for goal targeting.',
          tags: [
            'Health Analytics',
            'Weight Tracking',
            'Medication Management',
            'Regression Analysis',
            'Predictive Modeling',
            'Cloudflare Workers',
            'D1 Database',
          ],
          category: 'Health Technology',
          url: '/healthbridge-enhanced',
        };

        // Filter to get the most relevant portfolio items for featured work
        const workPortfolio = portfolioItems.filter(item =>
          ['ai-automation', 'analytics', 'capabilities', 'devops'].includes(
            item.id
          )
        );

        // Map projects and portfolio items to the expected format
        const mappedProjects = projects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          tags: project.tags,
          category: project.category,
          url: project.url,
        }));

        const mappedPortfolio = workPortfolio.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          tags: item.tags,
          category: item.category,
          url: item.url,
        }));

        // Combine projects, portfolio items, and add HealthBridge as a project
        const allWork = [
          ...mappedProjects,
          healthBridgeProject,
          ...mappedPortfolio,
        ];
        const featured = allWork.slice(0, 6); // Get up to 6 featured items

        setFeaturedWork(featured);
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };

    loadContent();
  }, []);

  const handleNavigation = (url: string) => {
    navigate({ to: url });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950'>
      {/* Hero Section - Compact with Targeting Theme */}
      <div className='relative overflow-hidden border-b border-teal-200 dark:border-teal-800'>
        <div className='absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10'></div>

        <div className='relative px-4 py-12 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Logo and Title with Enhanced Targeting Theme */}
            <div className='mb-6 flex items-center justify-center gap-6'>
              <div className='rounded-2xl border border-slate-600/50 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-4 shadow-xl backdrop-blur-sm dark:border-slate-500/50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800'>
                <Logo size='xl' showTargetingDots={true} />
              </div>
              <div>
                <h1
                  className='text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl'
                  style={{ fontWeight: 700 }}
                >
                  <span className='bg-gradient-to-r from-teal-800 to-blue-800 bg-clip-text text-transparent'>
                    Roger Lee Cormier
                  </span>
                </h1>
                <div className='mx-auto mt-3 h-1.5 w-32 rounded-full bg-gradient-to-r from-orange-500 via-teal-600 to-blue-600'></div>
              </div>
            </div>

            {/* Description with Enhanced Targeting Language */}
            <p className='mx-auto mb-8 max-w-3xl text-xl leading-8 text-gray-600 dark:text-gray-300'>
              Technical Project Manager specializing in
              <span className='font-medium text-orange-600 dark:text-orange-400'>
                {' '}
                targeting digital transformation{' '}
              </span>
              through ERP integration, AI automation, and strategic technology
              implementation. PMP-certified leader driving organizational
              excellence with
              <span className='font-medium text-teal-800 dark:text-teal-300'>
                {' '}
                laser-focused precision
              </span>
              .
            </p>

            {/* Quick Stats with Enhanced Targeting Theme */}
            <div className='mb-8 flex justify-center gap-8'>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2.5 rounded-full bg-teal-600 shadow-sm'></div>
                <span>ERP Integration</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2.5 rounded-full bg-blue-600 shadow-sm'></div>
                <span>AI Automation</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2.5 rounded-full bg-orange-500 shadow-sm'></div>
                <span>Precision Targeting</span>
              </div>
            </div>

            {/* CTA Buttons with Enhanced Targeting Theme */}
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Button
                onClick={() => handleNavigation('/portfolio')}
                className='border-0 bg-gradient-to-r from-teal-800 to-blue-800 px-8 py-3 text-lg text-white shadow-lg transition-all duration-300 hover:from-teal-900 hover:to-blue-900 hover:shadow-xl'
              >
                View Portfolio
                <ArrowRight className='ml-2 size-5' />
              </Button>
              <Button
                onClick={() => handleNavigation('/contact')}
                variant='outline'
                className='border-orange-600 px-8 py-3 text-lg text-orange-600 shadow-md transition-all duration-300 hover:bg-orange-50 hover:shadow-lg dark:hover:bg-orange-950'
              >
                Get in Touch
                <MessageSquare className='ml-2 size-5' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Core Expertise Section */}
      <div className='px-4 py-16 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-16 text-center'>
            <h2
              className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'
              style={{ fontWeight: 700 }}
            >
              Core Expertise
            </h2>
            <p className='mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300'>
              Specialized capabilities that drive digital transformation and
              operational excellence
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {/* ERP & SaaS Integration */}
            <Card className='group border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl dark:bg-gray-900/80 dark:hover:bg-gray-900'>
              <CardHeader className='pb-4'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600'>
                  <Database className='size-6 text-white' />
                </div>
                <CardTitle className='text-xl font-bold text-gray-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400'>
                  ERP & SaaS Integration
                </CardTitle>
                <CardDescription className='text-gray-600 dark:text-gray-300'>
                  NetSuite, Ramp, and enterprise system orchestration for
                  seamless operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='mb-4 flex flex-wrap gap-2'>
                  <Badge
                    variant='secondary'
                    className='bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                  >
                    NetSuite
                  </Badge>
                  <Badge
                    variant='secondary'
                    className='bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  >
                    Ramp
                  </Badge>
                  <Badge
                    variant='secondary'
                    className='bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                  >
                    API Integration
                  </Badge>
                </div>
                <Button
                  onClick={() => handleNavigation('/portfolio/analytics')}
                  variant='outline'
                  className='w-full border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950'
                >
                  Learn More
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            {/* AI & Automation */}
            <Card className='group border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl dark:bg-gray-900/80 dark:hover:bg-gray-900'>
              <CardHeader className='pb-4'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600'>
                  <Brain className='size-6 text-white' />
                </div>
                <CardTitle className='text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
                  AI & Automation
                </CardTitle>
                <CardDescription className='text-gray-600 dark:text-gray-300'>
                  Intelligent workflows, copilot integration, and autonomous
                  operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='mb-4 flex flex-wrap gap-2'>
                  <Badge
                    variant='secondary'
                    className='bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  >
                    AI Copilots
                  </Badge>
                  <Badge
                    variant='secondary'
                    className='bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                  >
                    Workflow Automation
                  </Badge>
                  <Badge
                    variant='secondary'
                    className='bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                  >
                    Cloudflare AI
                  </Badge>
                </div>
                <Button
                  onClick={() => handleNavigation('/portfolio/ai-automation')}
                  variant='outline'
                  className='w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950'
                >
                  Learn More
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            {/* Digital Transformation */}
            <Card className='group border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl dark:bg-gray-900/80 dark:hover:bg-gray-900'>
              <CardHeader className='pb-4'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600'>
                  <Globe className='size-6 text-white' />
                </div>
                <CardTitle className='text-xl font-bold text-gray-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400'>
                  Digital Transformation
                </CardTitle>
                <CardDescription className='text-gray-600 dark:text-gray-300'>
                  Strategic technology implementation and organizational change
                  management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='mb-4 flex flex-wrap gap-2'>
                  <Badge
                    variant='secondary'
                    className='bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                  >
                    Strategy
                  </Badge>
                  <Badge
                    variant='secondary'
                    className='bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                  >
                    Change Management
                  </Badge>
                  <Badge
                    variant='secondary'
                    className='bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  >
                    PMP Certified
                  </Badge>
                </div>
                <Button
                  onClick={() => handleNavigation('/portfolio/leadership')}
                  variant='outline'
                  className='w-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950'
                >
                  Learn More
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Featured Projects & Tools Carousel */}
      <div className='bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-16 dark:from-teal-950/50 dark:to-blue-950/50 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-12 text-center'>
            <h2
              className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'
              style={{ fontWeight: 700 }}
            >
              Featured Projects & Tools
            </h2>
            <p className='mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300'>
              Technical solutions, automation tools, and strategic projects
              including HealthBridge Enhanced and other digital transformation
              initiatives
            </p>
          </div>

          {featuredWork.length > 0 ? (
            <Carousel className='mx-auto w-full max-w-6xl'>
              <CarouselContent>
                {featuredWork.map(item => (
                  <CarouselItem
                    key={item.id}
                    className='md:basis-1/2 lg:basis-1/3'
                  >
                    <Card className='group flex h-full flex-col border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl dark:bg-gray-900/90 dark:hover:bg-gray-900'>
                      <CardHeader className='shrink-0 pb-4'>
                        <div className='mb-3 flex items-center justify-between'>
                          <Badge
                            variant='outline'
                            className='border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300'
                          >
                            {item.category}
                          </Badge>
                        </div>
                        <CardTitle className='text-lg font-bold text-gray-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400'>
                          {item.title}
                        </CardTitle>
                        <CardDescription className='text-sm text-gray-600 dark:text-gray-300'>
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='flex grow flex-col pt-0'>
                        <div className='mb-4 flex flex-wrap gap-1.5'>
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='bg-teal-50 text-xs text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          onClick={() => handleNavigation(item.url)}
                          className='mt-auto w-full border-0 bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:from-teal-700 hover:to-blue-700'
                        >
                          View Details
                          <ArrowRight className='ml-2 size-4' />
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <div className='py-12 text-center'>
              <p className='text-gray-500 dark:text-gray-400'>
                Loading featured work...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Blog Posts */}
      <div className='px-4 py-16 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-12 text-center'>
            <h2
              className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'
              style={{ fontWeight: 700 }}
            >
              Recent Insights
            </h2>
            <p className='mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300'>
              Latest thoughts on digital transformation, technical leadership,
              and operational excellence
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {recentBlogs.map(blog => (
              <Card
                key={blog.id}
                className='group flex h-full flex-col border border-slate-200/50 bg-slate-50/80 backdrop-blur-sm transition-all duration-300 hover:bg-slate-100/80 hover:shadow-xl dark:border-slate-700/50 dark:bg-slate-800/80 dark:hover:bg-slate-700/80'
              >
                <CardHeader className='shrink-0 pb-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <Badge
                      variant='outline'
                      className='border border-slate-400 bg-slate-100 text-slate-800 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-200'
                    >
                      {blog.category}
                    </Badge>
                    <span className='text-xs text-slate-500 dark:text-slate-400'>
                      {new Date(blog.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <CardTitle className='text-lg font-bold text-slate-900 transition-colors group-hover:text-slate-700 dark:text-slate-100 dark:group-hover:text-slate-200'>
                    {blog.title}
                  </CardTitle>
                  <CardDescription className='text-sm text-slate-600 dark:text-slate-300'>
                    {blog.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex grow flex-col pt-0'>
                  <div className='mb-4 flex flex-wrap gap-1.5'>
                    {blog.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className='border border-slate-300 bg-slate-200 text-xs text-slate-800 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-200'
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleNavigation(blog.url)}
                    variant='outline'
                    className='mt-auto w-full border-slate-600 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                  >
                    Read Article
                    <ArrowRight className='ml-2 size-4' />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className='mt-12 text-center'>
            <Button
              onClick={() => handleNavigation('/blog')}
              variant='outline'
              className='border-slate-600 px-8 py-3 text-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
            >
              View All Articles
              <BookOpen className='ml-2 size-5' />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Section */}
      <div className='bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-16 dark:from-teal-950/50 dark:to-blue-950/50 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-12 text-center'>
            <h2
              className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'
              style={{ fontWeight: 700 }}
            >
              Explore My Work
            </h2>
            <p className='mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300'>
              Navigate to different areas of expertise and experience
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <Card className='group border-0 bg-white/90 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl dark:bg-gray-900/90 dark:hover:bg-gray-900'>
              <CardHeader>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600'>
                  <Briefcase className='size-8 text-white' />
                </div>
                <CardTitle className='text-lg font-bold text-gray-900 dark:text-white'>
                  Portfolio
                </CardTitle>
                <CardDescription className='text-gray-600 dark:text-gray-300'>
                  Leadership & technical capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleNavigation('/portfolio')}
                  className='w-full border-0 bg-gradient-to-r from-teal-800 to-blue-800 text-white shadow-lg transition-all duration-200 hover:from-teal-900 hover:to-blue-900 hover:shadow-xl'
                >
                  Explore
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            <Card className='group border-0 bg-white/90 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl dark:bg-gray-900/90 dark:hover:bg-gray-900'>
              <CardHeader>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600'>
                  <BarChart3 className='size-8 text-white' />
                </div>
                <CardTitle className='text-lg font-bold text-gray-900 dark:text-white'>
                  Projects
                </CardTitle>
                <CardDescription className='text-gray-600 dark:text-gray-300'>
                  Case studies & analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleNavigation('/projects')}
                  className='w-full border-0 bg-gradient-to-r from-teal-800 to-blue-800 text-white shadow-lg transition-all duration-200 hover:from-teal-900 hover:to-blue-900 hover:shadow-xl'
                >
                  Explore
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            <Card className='group border-0 bg-white/90 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl dark:bg-gray-900/90 dark:hover:bg-gray-900'>
              <CardHeader>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600'>
                  <Wrench className='size-8 text-white' />
                </div>
                <CardTitle className='text-lg font-bold text-gray-900 dark:text-white'>
                  Tools
                </CardTitle>
                <CardDescription className='text-gray-600 dark:text-gray-300'>
                  Utilities & resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleNavigation('/tools')}
                  className='w-full border-0 bg-gradient-to-r from-teal-800 to-blue-800 text-white shadow-lg transition-all duration-200 hover:from-teal-900 hover:to-blue-900 hover:shadow-xl'
                >
                  Explore
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            <Card className='group border-0 bg-white/90 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl dark:bg-gray-900/90 dark:hover:bg-gray-900'>
              <CardHeader>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600'>
                  <MessageSquare className='size-8 text-white' />
                </div>
                <CardTitle className='text-lg font-bold text-gray-900 dark:text-white'>
                  Contact
                </CardTitle>
                <CardDescription className='text-gray-600 dark:text-gray-300'>
                  Let's connect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleNavigation('/contact')}
                  className='w-full border-0 bg-gradient-to-r from-teal-800 to-blue-800 text-white shadow-lg transition-all duration-200 hover:from-teal-900 hover:to-blue-900 hover:shadow-xl'
                >
                  Connect
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className='px-4 py-16 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <div className='rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 p-8 text-white'>
            <h2 className='mb-4 text-2xl font-bold' style={{ fontWeight: 700 }}>
              Ready to Transform Your Organization?
            </h2>
            <p className='mx-auto mb-6 max-w-2xl text-lg text-teal-100'>
              Let's discuss how strategic technology implementation, AI
              automation, and digital transformation can drive success in your
              organization.
            </p>
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Button
                onClick={() => handleNavigation('/contact')}
                variant='secondary'
                size='lg'
                className='border-0 bg-white px-8 py-3 text-teal-600 hover:bg-gray-100'
              >
                Start a Conversation
                <MessageSquare className='ml-2 size-5' />
              </Button>
              <Button
                onClick={() => handleNavigation('/about')}
                variant='outline'
                size='lg'
                className='border border-white/30 bg-white/20 px-8 py-3 text-white hover:border-white hover:bg-white hover:text-teal-600'
              >
                Learn More About Me
                <User className='ml-2 size-5' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
