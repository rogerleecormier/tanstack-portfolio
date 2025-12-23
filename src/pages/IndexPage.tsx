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
import { HeroSection } from '@/components/sections/HeroSection';
import { SectionHeader } from '@/components/sections/SectionHeader';
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
  date?: string;
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

  // Helper to normalize URLs from cache (fixes /project/ -> /projects/ mismatch)
  const normalizeUrl = (url: string, contentType: string) => {
    // If URL is missing or empty, construct from contentType and id
    if (!url || url === '') {
      return '';
    }
    // Fix singular/plural route mismatch for projects
    if (contentType === 'project' && url.startsWith('/project/')) {
      return url.replace('/project/', '/projects/');
    }
    // Ensure blog URLs use /blog/ prefix
    if (contentType === 'blog' && !url.startsWith('/blog/')) {
      return `/blog/${url.split('/').pop()}`;
    }
    return url;
  };

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
        const allContent = cachedContentService.getAllContent();

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
            ...(blog.date && { date: blog.date }),
            tags: blog.tags,
            category: blog.category,
            url: normalizeUrl(blog.url, blog.contentType) || `/blog/${blog.id}`,
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
          url: '/projects/healthbridge-enhanced',
        };

        // Filter to get the most relevant portfolio items for featured work
        const workPortfolio = portfolioItems.filter(item =>
          ['ai-automation', 'analytics', 'capabilities', 'devops'].includes(
            item.id
          )
        );

        // Map projects and portfolio items to the expected format with normalized URLs
        const mappedProjects = projects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          tags: project.tags,
          category: project.category,
          url: normalizeUrl(project.url, project.contentType) || `/projects/${project.id}`,
        }));

        const mappedPortfolio = workPortfolio.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          tags: item.tags,
          category: item.category,
          url: normalizeUrl(item.url, item.contentType) || `/portfolio/${item.id}`,
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

    void loadContent();
  }, []);

  const handleNavigation = (url: string) => {
    void navigate({ to: url });
  };

  return (
    <div className='min-h-screen bg-surface-base'>
      {/* Hero Section - Precision Strategy Design */}
      <div className='px-4 py-12 md:px-8'>
        <div className='mx-auto max-w-7xl'>
          <HeroSection
            profile={{
              name: 'Roger Lee Cormier',
              role: 'Technical Strategist',
              image: '/images/IMG_1242.JPG',
            }}
            title='Building Enterprise Solutions with Precision'
            subtitle='Technical Strategist'
            description='Technical strategist and digital innovator specializing in scalable architecture, digital transformation, and strategic technology implementation. Helping organizations achieve measurable business impact through precision execution.'
            stats={[
              { number: '15+', label: 'Years Experience' },
              { number: '150+', label: 'Projects Shipped' },
              { number: '∞', label: 'Learning' },
            ]}
            ctas={[
              { label: 'View Work', href: '/portfolio', variant: 'primary' },
              { label: 'Learn More', variant: 'secondary' },
            ]}
          />
        </div>
      </div>

      {/* Featured Work Section */}
      <div className='px-4 py-16 md:px-8'>
        <div className='mx-auto max-w-7xl'>
          <SectionHeader
            title='Featured Work'
            subtitle='Selected projects demonstrating technical expertise and strategic impact'
          />

          {featuredWork.length > 0 ? (
            <Carousel className='mx-auto w-full'>
              <CarouselContent>
                {featuredWork.map(item => (
                  <CarouselItem
                    key={item.id}
                    className='md:basis-1/2 lg:basis-1/3'
                  >
                    <Card className='group flex h-full flex-col border border-border-subtle bg-surface-elevated transition-all duration-300 hover:border-strategy-gold hover:shadow-lg'>
                      <CardHeader className='shrink-0 pb-4'>
                        <div className='mb-3 flex items-center justify-between'>
                          <Badge className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'>
                            {item.category}
                          </Badge>
                        </div>
                        <CardTitle className='mb-2 text-lg text-text-foreground transition-colors group-hover:text-strategy-gold'>
                          {item.title}
                        </CardTitle>
                        <CardDescription className='text-sm text-text-secondary'>
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='flex grow flex-col pt-0'>
                        <div className='mb-4 flex flex-wrap gap-1.5'>
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              className='border-strategy-gold/20 bg-strategy-gold/10 text-xs text-strategy-gold'
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          onClick={() => handleNavigation(item.url)}
                          className='mt-auto w-full bg-strategy-gold text-precision-charcoal hover:brightness-110'
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
              <p className='text-text-muted'>Loading featured work...</p>
            </div>
          )}
        </div>
      </div>

      {/* Core Expertise Section */}
      <div className='px-4 py-16 md:px-8'>
        <div className='mx-auto max-w-7xl'>
          <SectionHeader
            title='Core Expertise'
            subtitle='Specialized capabilities that drive digital transformation and operational excellence'
          />

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {/* ERP & SaaS Integration */}
            <Card className='group flex flex-col border border-border-subtle bg-surface-elevated transition-all duration-300 hover:border-strategy-gold hover:shadow-lg'>
              <CardHeader className='pb-4'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-lg bg-strategy-gold/10 ring-1 ring-strategy-gold/20'>
                  <Database className='size-6 text-strategy-gold' />
                </div>
                <CardTitle className='mb-2 text-lg text-text-foreground transition-colors group-hover:text-strategy-gold'>
                  ERP & SaaS Integration
                </CardTitle>
                <CardDescription className='text-sm text-text-secondary'>
                  NetSuite, Ramp, and enterprise system orchestration for
                  seamless operations
                </CardDescription>
              </CardHeader>
              <CardContent className='flex grow flex-col justify-between'>
                <div className='mb-4 flex flex-wrap gap-2'>
                  <Badge className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'>
                    NetSuite
                  </Badge>
                  <Badge className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'>
                    Ramp
                  </Badge>
                  <Badge className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'>
                    API Integration
                  </Badge>
                </div>
                <Button
                  onClick={() => handleNavigation('/portfolio/analytics')}
                  className='w-full border border-strategy-gold/30 bg-transparent text-strategy-gold hover:border-strategy-gold/50 hover:bg-strategy-gold/10'
                >
                  Learn More
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            {/* AI & Automation */}
            <Card className='group flex flex-col border border-border-subtle bg-surface-elevated transition-all duration-300 hover:border-strategy-gold hover:shadow-lg'>
              <CardHeader className='pb-4'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-lg bg-strategy-gold/10 ring-1 ring-strategy-gold/20'>
                  <Brain className='size-6 text-strategy-gold' />
                </div>
                <CardTitle className='mb-2 text-lg text-text-foreground transition-colors group-hover:text-strategy-gold'>
                  AI & Automation
                </CardTitle>
                <CardDescription className='text-sm text-text-secondary'>
                  Intelligent workflows, copilot integration, and autonomous
                  operations
                </CardDescription>
              </CardHeader>
              <CardContent className='flex grow flex-col justify-between'>
                <div className='mb-4 flex flex-wrap gap-2'>
                  <Badge className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'>
                    AI Copilots
                  </Badge>
                  <Badge className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'>
                    Workflow Automation
                  </Badge>
                  <Badge className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'>
                    Cloudflare AI
                  </Badge>
                </div>
                <Button
                  onClick={() => handleNavigation('/portfolio/ai-automation')}
                  className='w-full border border-strategy-gold/30 bg-transparent text-strategy-gold hover:border-strategy-gold/50 hover:bg-strategy-gold/10'
                >
                  Learn More
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            {/* Digital Transformation */}
            <Card className='group flex flex-col border border-border-subtle bg-surface-elevated transition-all duration-300 hover:border-strategy-gold hover:shadow-lg'>
              <CardHeader className='pb-4'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-lg bg-strategy-gold/10 ring-1 ring-strategy-gold/20'>
                  <Globe className='size-6 text-strategy-gold' />
                </div>
                <CardTitle className='mb-2 text-lg text-text-foreground transition-colors group-hover:text-strategy-gold'>
                  Digital Transformation
                </CardTitle>
                <CardDescription className='text-sm text-text-secondary'>
                  Strategic technology implementation and organizational change
                  management
                </CardDescription>
              </CardHeader>
              <CardContent className='flex grow flex-col justify-between'>
                <div className='mb-4 flex flex-wrap gap-2'>
                  <Badge className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'>
                    Strategy
                  </Badge>
                  <Badge className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'>
                    Change Management
                  </Badge>
                  <Badge className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'>
                    PMP Certified
                  </Badge>
                </div>
                <Button
                  onClick={() => handleNavigation('/portfolio/leadership')}
                  className='w-full border border-strategy-gold/30 bg-transparent text-strategy-gold hover:border-strategy-gold/50 hover:bg-strategy-gold/10'
                >
                  Learn More
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Blog Posts */}
      <div className='px-4 py-16 md:px-8'>
        <div className='mx-auto max-w-7xl'>
          <SectionHeader
            title='Recent Insights'
            subtitle='Latest thoughts on digital transformation, technical leadership, and operational excellence'
          />

          <div className='mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {recentBlogs.map(blog => (
              <Card
                key={blog.id}
                className='group flex h-full flex-col border border-border-subtle bg-surface-elevated transition-all duration-300 hover:border-strategy-gold hover:shadow-lg'
              >
                <CardHeader className='shrink-0 pb-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <Badge className='border-strategy-gold/30 bg-strategy-gold/15 text-strategy-gold'>
                      {blog.category}
                    </Badge>
                    <span className='text-xs text-text-tertiary'>
                      {blog.date
                        ? new Date(blog.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'No date'}
                    </span>
                  </div>
                  <CardTitle className='mb-2 text-lg text-text-foreground transition-colors group-hover:text-strategy-gold'>
                    {blog.title}
                  </CardTitle>
                  <CardDescription className='text-sm text-text-secondary'>
                    {blog.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex grow flex-col pt-0'>
                  <div className='mb-4 flex flex-wrap gap-1.5'>
                    {blog.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        className='border-strategy-gold/20 bg-strategy-gold/10 text-xs text-strategy-gold'
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleNavigation(blog.url)}
                    className='mt-auto w-full border border-strategy-gold/30 bg-transparent text-strategy-gold hover:border-strategy-gold/50 hover:bg-strategy-gold/10'
                  >
                    Read Article
                    <ArrowRight className='ml-2 size-4' />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className='text-center'>
            <Button
              onClick={() => handleNavigation('/blog')}
              className='border border-strategy-gold/50 bg-strategy-gold/15 px-8 py-3 text-lg font-semibold text-strategy-gold transition-all duration-300 hover:border-strategy-gold hover:bg-strategy-gold/25'
            >
              View All Articles
              <BookOpen className='ml-2 size-5' />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Section */}
      <div className='border-t border-border-subtle bg-surface-elevated px-4 py-16 md:px-8'>
        <div className='mx-auto max-w-7xl'>
          <SectionHeader title='Explore My Work' divider={false} />

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <Card className='group border border-border-subtle bg-surface-base text-center transition-all duration-300 hover:border-strategy-gold hover:shadow-lg'>
              <CardHeader>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-lg bg-strategy-gold/10'>
                  <Briefcase className='size-8 text-strategy-gold' />
                </div>
                <CardTitle className='text-lg text-text-foreground'>
                  Portfolio
                </CardTitle>
                <CardDescription className='text-sm text-text-secondary'>
                  Leadership & technical capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleNavigation('/portfolio')}
                  className='w-full bg-strategy-gold text-precision-charcoal hover:brightness-110'
                >
                  Explore
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            <Card className='group border border-border-subtle bg-surface-base text-center transition-all duration-300 hover:border-strategy-gold hover:shadow-lg'>
              <CardHeader>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-lg bg-strategy-gold/10'>
                  <BarChart3 className='size-8 text-strategy-gold' />
                </div>
                <CardTitle className='text-lg text-text-foreground'>
                  Projects
                </CardTitle>
                <CardDescription className='text-sm text-text-secondary'>
                  Case studies & analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleNavigation('/projects')}
                  className='w-full bg-strategy-gold text-precision-charcoal hover:brightness-110'
                >
                  Explore
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            <Card className='group border border-border-subtle bg-surface-base text-center transition-all duration-300 hover:border-strategy-gold hover:shadow-lg'>
              <CardHeader>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-lg bg-strategy-gold/10'>
                  <Wrench className='size-8 text-strategy-gold' />
                </div>
                <CardTitle className='text-lg text-text-foreground'>
                  Tools
                </CardTitle>
                <CardDescription className='text-sm text-text-secondary'>
                  Utilities & resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleNavigation('/tools')}
                  className='w-full bg-strategy-gold text-precision-charcoal hover:brightness-110'
                >
                  Explore
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            <Card className='group border border-border-subtle bg-surface-base text-center transition-all duration-300 hover:border-strategy-gold hover:shadow-lg'>
              <CardHeader>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-lg bg-strategy-gold/10'>
                  <MessageSquare className='size-8 text-strategy-gold' />
                </div>
                <CardTitle className='text-lg text-text-foreground'>
                  Contact
                </CardTitle>
                <CardDescription className='text-sm text-text-secondary'>
                  Let's connect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleNavigation('/contact')}
                  className='w-full bg-strategy-gold text-precision-charcoal hover:brightness-110'
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
      <div className='border-t border-border-subtle px-4 py-16 md:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <div className='rounded-lg border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-base p-12'>
            <h2 className='mb-4 text-3xl font-bold text-text-foreground md:text-4xl'>
              Ready to Transform Your Organization?
            </h2>
            <p className='mx-auto mb-8 max-w-2xl text-lg text-text-secondary'>
              Let's discuss how strategic technology implementation, AI
              automation, and digital transformation can drive success in your
              organization.
            </p>
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Button
                onClick={() => handleNavigation('/contact')}
                className='bg-strategy-gold px-8 py-3 text-lg font-semibold text-precision-charcoal hover:brightness-110'
              >
                Start a Conversation
                <MessageSquare className='ml-2 size-5' />
              </Button>
              <Button
                onClick={() => handleNavigation('/portfolio')}
                className='border border-strategy-gold/50 bg-strategy-gold/10 px-8 py-3 text-lg font-semibold text-strategy-gold hover:border-strategy-gold hover:bg-strategy-gold/20'
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
