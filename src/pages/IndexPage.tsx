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
import { H2, H3, P, Lead } from '@/components/ui/typography-system';

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

    void loadContent();
  }, []);

  const handleNavigation = (url: string) => {
    void navigate({ to: url });
  };

  return (
    <div className='min-h-screen bg-hunter-950'>
      {/* Hero Section - Premium Design */}
      <div className='relative overflow-hidden border-b border-gold-500/20 bg-hunter-950/40 px-4 py-24 backdrop-blur-xl sm:px-6 lg:px-8'>
        <div className='relative mx-auto max-w-5xl'>
          {/* Logo and Title Stack */}
          <div className='mb-12 flex flex-col items-center gap-8'>
            <div className='shrink-0 rounded-2xl border border-gold-500/20 bg-hunter-900/60 p-4 ring-1 ring-gold-500/20 backdrop-blur-md'>
              <Logo size='xl' showTargetingDots={true} />
            </div>
            <div className='flex-1 text-center'>
              <h1 className='text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl'>
                Roger Lee Cormier
              </h1>
              <div className='mt-4 flex justify-center'>
                <div className='h-1.5 w-24 rounded-full bg-gold-500/40'></div>
              </div>
              <p className='mt-6 text-xl font-semibold uppercase tracking-wider text-gold-400'>
                Precision. Results. Delivered.
              </p>
            </div>
          </div>

          {/* Professional Identity */}
          <div className='mb-10'>
            <p className='mx-auto max-w-2xl text-lg leading-relaxed text-grey-200'>
              Digital transformation specialist driving organizational success
              through strategic technology implementation, enterprise system
              integration, and AI-powered automation.
            </p>
          </div>

          {/* Core Focus Areas */}
          <div className='mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div className='flex items-start gap-3 rounded-lg border border-gold-500/20 bg-hunter-900/30 p-4 backdrop-blur-md'>
              <div className='mt-1 size-2 shrink-0 rounded-full bg-gold-400'></div>
              <div>
                <p className='font-semibold text-gold-300'>
                  ERP & SaaS Integration
                </p>
                <p className='text-sm text-grey-400'>
                  NetSuite, Ramp, Cloudflare
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3 rounded-lg border border-gold-500/20 bg-hunter-900/30 p-4 backdrop-blur-md'>
              <div className='mt-1 size-2 shrink-0 rounded-full bg-gold-400'></div>
              <div>
                <p className='font-semibold text-gold-300'>AI & Automation</p>
                <p className='text-sm text-grey-400'>Workflow optimization</p>
              </div>
            </div>
            <div className='flex items-start gap-3 rounded-lg border border-gold-500/20 bg-hunter-900/30 p-4 backdrop-blur-md'>
              <div className='mt-1 size-2 shrink-0 rounded-full bg-gold-400'></div>
              <div>
                <p className='font-semibold text-gold-300'>
                  Project Leadership
                </p>
                <p className='text-sm text-grey-400'>PMP-certified delivery</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className='flex flex-col justify-center gap-4 sm:flex-row'>
            <Button
              onClick={() => handleNavigation('/portfolio')}
              className='btn-primary bg-gold-600 px-8 py-3 text-lg font-semibold text-hunter-950 shadow-lg transition-all duration-300 hover:bg-gold-500 hover:shadow-xl'
            >
              View Portfolio
              <ArrowRight className='ml-2 size-5' />
            </Button>
            <Button
              onClick={() => handleNavigation('/contact')}
              className='btn-accent border border-gold-500/30 bg-gold-500/10 px-8 py-3 text-lg font-semibold text-gold-400 shadow-md transition-all duration-300 hover:border-gold-500/50 hover:bg-gold-500/20 hover:shadow-lg'
            >
              Get in Touch
              <MessageSquare className='ml-2 size-5' />
            </Button>
          </div>
        </div>
      </div>

      {/* Core Expertise Section */}
      <div className='px-4 py-16 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-16 text-center'>
            <H2 className='!m-0 mb-4 text-white'>Core Expertise</H2>
            <P className='mx-auto max-w-3xl text-grey-400'>
              Specialized capabilities that drive digital transformation and
              operational excellence
            </P>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {/* ERP & SaaS Integration */}
            <Card className='group flex flex-col border border-gold-500/20 bg-hunter-900/30 backdrop-blur-xl transition-all duration-300 hover:border-gold-500/40 hover:bg-hunter-900/40 hover:shadow-lg'>
              <CardHeader className='pb-4'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-xl bg-hunter-900/60 ring-1 ring-gold-500/20'>
                  <Database className='size-6 text-gold-400' />
                </div>
                <H3 className='!m-0 mb-2 text-lg text-white transition-colors group-hover:text-gold-400'>
                  ERP & SaaS Integration
                </H3>
                <P className='!m-0 text-sm text-grey-400'>
                  NetSuite, Ramp, and enterprise system orchestration for
                  seamless operations
                </P>
              </CardHeader>
              <CardContent className='flex grow flex-col justify-between'>
                <div className='mb-4 flex flex-wrap gap-2'>
                  <Badge className='border-gold-500/30 bg-gold-500/20 text-gold-300'>
                    NetSuite
                  </Badge>
                  <Badge className='border-gold-500/30 bg-gold-500/20 text-gold-300'>
                    Ramp
                  </Badge>
                  <Badge className='border-gold-500/30 bg-gold-500/20 text-gold-300'>
                    API Integration
                  </Badge>
                </div>
                <Button
                  onClick={() => handleNavigation('/portfolio/analytics')}
                  className='w-full border border-gold-500/30 bg-transparent text-gold-400 hover:border-gold-500/50 hover:bg-gold-500/10'
                >
                  Learn More
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            {/* AI & Automation */}
            <Card className='group flex flex-col border border-gold-500/20 bg-hunter-900/30 backdrop-blur-xl transition-all duration-300 hover:border-gold-500/40 hover:bg-hunter-900/40 hover:shadow-lg'>
              <CardHeader className='pb-4'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-xl bg-hunter-900/60 ring-1 ring-gold-500/20'>
                  <Brain className='size-6 text-gold-400' />
                </div>
                <H3 className='!m-0 mb-2 text-lg text-white transition-colors group-hover:text-gold-400'>
                  AI & Automation
                </H3>
                <P className='!m-0 text-sm text-grey-400'>
                  Intelligent workflows, copilot integration, and autonomous
                  operations
                </P>
              </CardHeader>
              <CardContent className='flex grow flex-col justify-between'>
                <div className='mb-4 flex flex-wrap gap-2'>
                  <Badge className='border-gold-500/30 bg-gold-500/20 text-gold-300'>
                    AI Copilots
                  </Badge>
                  <Badge className='border-gold-500/30 bg-gold-500/20 text-gold-300'>
                    Workflow Automation
                  </Badge>
                  <Badge className='border-gold-500/30 bg-gold-500/20 text-gold-300'>
                    Cloudflare AI
                  </Badge>
                </div>
                <Button
                  onClick={() => handleNavigation('/portfolio/ai-automation')}
                  className='w-full border border-gold-500/30 bg-transparent text-gold-400 hover:border-gold-500/50 hover:bg-gold-500/10'
                >
                  Learn More
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            {/* Digital Transformation */}
            <Card className='group flex flex-col border border-gold-500/20 bg-hunter-900/30 backdrop-blur-xl transition-all duration-300 hover:border-gold-500/40 hover:bg-hunter-900/40 hover:shadow-lg'>
              <CardHeader className='pb-4'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-xl bg-hunter-900/60 ring-1 ring-gold-500/20'>
                  <Globe className='size-6 text-gold-400' />
                </div>
                <CardTitle className='text-xl font-bold text-white transition-colors group-hover:text-gold-400'>
                  Digital Transformation
                </CardTitle>
                <CardDescription className='text-grey-300'>
                  Strategic technology implementation and organizational change
                  management
                </CardDescription>
              </CardHeader>
              <CardContent className='flex grow flex-col justify-between'>
                <div className='mb-4 flex flex-wrap gap-2'>
                  <Badge className='border-gold-500/30 bg-gold-500/20 text-gold-300'>
                    Strategy
                  </Badge>
                  <Badge className='border-gold-500/30 bg-gold-500/20 text-gold-300'>
                    Change Management
                  </Badge>
                  <Badge className='border-gold-500/30 bg-gold-500/20 text-gold-300'>
                    PMP Certified
                  </Badge>
                </div>
                <Button
                  onClick={() => handleNavigation('/portfolio/leadership')}
                  className='w-full border border-gold-500/30 bg-transparent text-gold-400 hover:border-gold-500/50 hover:bg-gold-500/10'
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
      <div className='border-y border-gold-500/20 bg-hunter-950 px-4 py-16 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-12 text-center'>
            <H2 className='!m-0 mb-4 text-white'>Featured Projects & Tools</H2>
            <P className='mx-auto max-w-3xl text-grey-400'>
              Technical solutions, automation tools, and strategic projects
              including HealthBridge Enhanced and other digital transformation
              initiatives
            </P>
          </div>

          {featuredWork.length > 0 ? (
            <Carousel className='mx-auto w-full max-w-6xl'>
              <CarouselContent>
                {featuredWork.map(item => (
                  <CarouselItem
                    key={item.id}
                    className='md:basis-1/2 lg:basis-1/3'
                  >
                    <Card className='group flex h-full flex-col border border-gold-500/20 bg-hunter-900/30 backdrop-blur-xl transition-all duration-300 hover:border-gold-500/40 hover:bg-hunter-900/40 hover:shadow-lg'>
                      <CardHeader className='shrink-0 pb-4'>
                        <div className='mb-3 flex items-center justify-between'>
                          <Badge className='border-gold-500/30 bg-gold-500/20 text-gold-300'>
                            {item.category}
                          </Badge>
                        </div>
                        <H3 className='!m-0 mb-2 text-lg text-white transition-colors group-hover:text-gold-400'>
                          {item.title}
                        </H3>
                        <P className='!m-0 text-sm text-grey-400'>
                          {item.description}
                        </P>
                      </CardHeader>
                      <CardContent className='flex grow flex-col pt-0'>
                        <div className='mb-4 flex flex-wrap gap-1.5'>
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              className='border-gold-600/40 bg-gold-600/15 text-xs text-gold-300'
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          onClick={() => handleNavigation(item.url)}
                          className='mt-auto w-full bg-gradient-to-r from-hunter-600 to-hunter-500 text-white hover:from-hunter-500 hover:to-hunter-400'
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
              <P className='text-slate-500'>Loading featured work...</P>
            </div>
          )}
        </div>
      </div>

      {/* Recent Blog Posts */}
      <div className='px-4 py-16 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-12 text-center'>
            <H2 className='!m-0 mb-4 text-white'>Recent Insights</H2>
            <P className='mx-auto max-w-3xl text-grey-400'>
              Latest thoughts on digital transformation, technical leadership,
              and operational excellence
            </P>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {recentBlogs.map(blog => (
              <Card
                key={blog.id}
                className='group flex h-full flex-col border border-gold-500/20 bg-hunter-900/30 backdrop-blur-xl transition-all duration-300 hover:border-gold-500/40 hover:bg-hunter-900/40 hover:shadow-lg'
              >
                <CardHeader className='shrink-0 pb-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <Badge className='border-gold-500/30 bg-gold-500/20 text-gold-300'>
                      {blog.category}
                    </Badge>
                    <span className='text-xs text-grey-400'>
                      {blog.date
                        ? new Date(blog.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'No date'}
                    </span>
                  </div>
                  <H3 className='!m-0 mb-2 text-lg text-white transition-colors group-hover:text-gold-400'>
                    {blog.title}
                  </H3>
                  <P className='!m-0 text-sm text-grey-400'>
                    {blog.description}
                  </P>
                </CardHeader>
                <CardContent className='flex grow flex-col pt-0'>
                  <div className='mb-4 flex flex-wrap gap-1.5'>
                    {blog.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        className='border-gold-600/40 bg-gold-600/15 text-xs text-gold-300'
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleNavigation(blog.url)}
                    className='mt-auto w-full border border-gold-500/30 bg-transparent text-gold-400 hover:border-gold-500/50 hover:bg-gold-500/10'
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
              className='border border-gold-500/50 bg-gold-600/15 px-8 py-3 text-lg font-semibold text-gold-400 transition-all duration-300 hover:border-gold-500 hover:bg-gold-600/25 hover:shadow-lg'
            >
              View All Articles
              <BookOpen className='ml-2 size-5' />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Section */}
      <div className='border-y border-gold-500/20 bg-gradient-to-br from-hunter-900/50 via-hunter-900/30 to-hunter-950 px-4 py-16 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-12 text-center'>
            <H2 className='!m-0 mb-4 text-white'>Explore My Work</H2>
            <P className='mx-auto max-w-3xl text-grey-400'>
              Navigate to different areas of expertise and experience
            </P>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <Card className='group border border-gold-500/20 bg-hunter-900/30 text-center backdrop-blur-xl transition-all duration-300 hover:border-gold-500/40 hover:bg-hunter-900/40 hover:shadow-lg'>
              <CardHeader>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-600 to-gold-500'>
                  <Briefcase className='size-8 text-white' />
                </div>
                <H3 className='!m-0 text-lg text-white'>Portfolio</H3>
                <P className='!m-0 text-sm text-grey-400'>
                  Leadership & technical capabilities
                </P>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleNavigation('/portfolio')}
                  className='w-full bg-gradient-to-r from-gold-600 to-gold-500 text-white hover:from-gold-500 hover:to-gold-400'
                >
                  Explore
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            <Card className='group border border-gold-500/20 bg-hunter-900/30 text-center backdrop-blur-xl transition-all duration-300 hover:border-gold-500/40 hover:bg-hunter-900/40 hover:shadow-lg'>
              <CardHeader>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500 to-gold-400'>
                  <BarChart3 className='size-8 text-white' />
                </div>
                <H3 className='!m-0 text-lg text-white'>Projects</H3>
                <P className='!m-0 text-sm text-grey-400'>
                  Case studies & analysis
                </P>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleNavigation('/projects')}
                  className='w-full bg-gradient-to-r from-gold-600 to-gold-500 text-white hover:from-gold-500 hover:to-gold-400'
                >
                  Explore
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            <Card className='group border border-gold-500/20 bg-hunter-900/30 text-center backdrop-blur-xl transition-all duration-300 hover:border-gold-500/40 hover:bg-hunter-900/40 hover:shadow-lg'>
              <CardHeader>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-600 to-gold-500'>
                  <Wrench className='size-8 text-white' />
                </div>
                <H3 className='!m-0 text-lg text-white'>Tools</H3>
                <P className='!m-0 text-sm text-grey-400'>
                  Utilities & resources
                </P>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleNavigation('/tools')}
                  className='w-full bg-gradient-to-r from-gold-600 to-gold-500 text-white hover:from-gold-500 hover:to-gold-400'
                >
                  Explore
                  <ArrowRight className='ml-2 size-4' />
                </Button>
              </CardContent>
            </Card>

            <Card className='group border border-gold-500/20 bg-hunter-900/30 text-center backdrop-blur-xl transition-all duration-300 hover:border-gold-500/40 hover:bg-hunter-900/40 hover:shadow-lg'>
              <CardHeader>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-600 to-gold-500'>
                  <MessageSquare className='size-8 text-white' />
                </div>
                <H3 className='!m-0 text-lg text-white'>Contact</H3>
                <P className='!m-0 text-sm text-grey-400'>Let's connect</P>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleNavigation('/contact')}
                  className='w-full bg-gradient-to-r from-gold-600 to-gold-500 text-white hover:from-gold-500 hover:to-gold-400'
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
      <div className='border-y border-gold-500/20 bg-gradient-to-r from-hunter-900/20 to-gold-600/20 px-4 py-16 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <div className='rounded-2xl border border-gold-500/30 bg-gradient-to-br from-hunter-900/60 via-hunter-900/40 to-hunter-950/60 p-8 backdrop-blur-xl'>
            <H2 className='!m-0 mb-4 text-white'>
              Ready to Transform Your Organization?
            </H2>
            <Lead className='!m-0 mx-auto mb-6 max-w-2xl text-grey-300'>
              Let's discuss how strategic technology implementation, AI
              automation, and digital transformation can drive success in your
              organization.
            </Lead>
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Button
                onClick={() => handleNavigation('/contact')}
                className='bg-gradient-to-r from-gold-600 to-gold-500 px-8 py-3 text-lg font-semibold text-white hover:from-gold-500 hover:to-gold-400'
              >
                Start a Conversation
                <MessageSquare className='ml-2 size-5' />
              </Button>
              <Button
                onClick={() => handleNavigation('/about')}
                className='border border-gold-500/50 bg-gold-500/10 px-8 py-3 text-lg font-semibold text-gold-400 hover:border-gold-500 hover:bg-gold-500/20'
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
