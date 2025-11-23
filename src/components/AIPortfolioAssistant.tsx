import { cachedContentService } from '@/api/cachedContentService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PortfolioItem } from '@/utils/portfolioLoader';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Code,
  Globe,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface Recommendation {
  type: 'solution' | 'insight' | 'trend' | 'blog' | 'portfolio';
  title: string;
  description: string;
  relatedItems: string[];
  confidence: number;
  icon: React.ComponentType<{ className?: string }>;
  category?: string;
}

interface ContentRecommendation {
  type: 'content';
  title: string;
  description: string;
  url: string;
  contentType: 'blog' | 'portfolio' | 'project' | 'page';
  confidence: number;
  icon: React.ComponentType<{ className?: string }>;
  category?: string;
}

interface SiteAssistantProps {
  portfolioItems: PortfolioItem[];
  isLoading?: boolean;
  error?: string | null;
}

export default function SiteAssistant({ portfolioItems }: SiteAssistantProps) {
  const [userQuery, setUserQuery] = useState('');
  const [recommendations, setRecommendations] = useState<
    (Recommendation | ContentRecommendation)[]
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  // Get content recommendations from cached content service
  const getContentRecommendations = useCallback(
    (query: string): ContentRecommendation[] => {
      try {
        // Use the cached content service for recommendations
        const response = cachedContentService.getRecommendations({
          query: query,
          contentType: 'all', // Get cross-content type recommendations
          maxResults: 3,
          tags: [],
        });

        if (
          response.success &&
          response.results &&
          response.results.length > 0
        ) {
          return response.results.map(item => ({
            type: 'content' as const,
            title: item.title,
            description: item.description,
            url: item.url,
            contentType: item.contentType,
            confidence: (item.relevanceScore ?? 0) / 100, // Convert percentage to decimal
            icon: BookOpen,
            category:
              item.contentType.charAt(0).toUpperCase() +
              item.contentType.slice(1),
          }));
        }

        return [];
      } catch (error) {
        console.error('Error getting content recommendations:', error);
        return [];
      }
    },
    []
  );

  // Enhanced insights based on comprehensive site knowledge
  const generateInsights = (query: string): Recommendation[] => {
    const insights: Recommendation[] = [];
    const lowerQuery = query.toLowerCase();

    // Portfolio Solutions insights
    if (
      lowerQuery.includes('devops') ||
      lowerQuery.includes('automation') ||
      lowerQuery.includes('cloud') ||
      lowerQuery.includes('ci/cd')
    ) {
      insights.push({
        type: 'solution',
        title: 'DevOps & Automation Solutions',
        description:
          'I can help you with DevOps transformation, CI/CD pipelines, Azure Functions, and GitHub Actions automation.',
        relatedItems: ['devops', 'ai-automation'],
        confidence: 0.95,
        icon: Code,
        category: 'Technology',
      });
    }

    if (
      lowerQuery.includes('leadership') ||
      lowerQuery.includes('team') ||
      lowerQuery.includes('culture') ||
      lowerQuery.includes('management')
    ) {
      insights.push({
        type: 'solution',
        title: 'Leadership & Team Development',
        description:
          'Expertise in cross-functional team management, organizational development, and leadership principles.',
        relatedItems: ['leadership', 'talent', 'culture'],
        confidence: 0.92,
        icon: Users,
        category: 'Leadership',
      });
    }

    if (
      lowerQuery.includes('strategy') ||
      lowerQuery.includes('planning') ||
      lowerQuery.includes('transformation') ||
      lowerQuery.includes('consulting')
    ) {
      insights.push({
        type: 'solution',
        title: 'Strategic Planning & Digital Transformation',
        description:
          'Comprehensive strategy consulting with focus on process modernization and measurable business outcomes.',
        relatedItems: ['strategy', 'governance-pmo'],
        confidence: 0.9,
        icon: Target,
        category: 'Strategy',
      });
    }

    if (
      lowerQuery.includes('analytics') ||
      lowerQuery.includes('data') ||
      lowerQuery.includes('insights') ||
      lowerQuery.includes('dashboard')
    ) {
      insights.push({
        type: 'solution',
        title: 'Data-Driven Decision Making',
        description:
          'Analytics solutions for delivery risk identification and cross-functional coordination through dashboards.',
        relatedItems: ['analytics', 'ai-automation'],
        confidence: 0.88,
        icon: BarChart3,
        category: 'Analytics',
      });
    }

    // Blog Post Insights
    if (
      lowerQuery.includes('blog') ||
      lowerQuery.includes('article') ||
      lowerQuery.includes('read') ||
      lowerQuery.includes('content')
    ) {
      insights.push({
        type: 'blog',
        title: 'DevOps Automation Blog Series',
        description:
          'I have detailed blog posts about getting started with DevOps automation, including practical implementation guides.',
        relatedItems: ['blog'],
        confidence: 0.85,
        icon: BookOpen,
        category: 'Content',
      });
    }

    if (
      lowerQuery.includes('ai') ||
      lowerQuery.includes('artificial intelligence') ||
      lowerQuery.includes('machine learning') ||
      lowerQuery.includes('automation')
    ) {
      insights.push({
        type: 'trend',
        title: 'Enhanced Operations with Automation',
        description:
          'Automation is transforming how we approach operations and decision-making. Check out our automation solutions and related blog content.',
        relatedItems: ['ai-automation', 'analytics', 'blog'],
        confidence: 0.93,
        icon: Brain,
        category: 'Technology',
      });
    }

    if (
      lowerQuery.includes('risk') ||
      lowerQuery.includes('compliance') ||
      lowerQuery.includes('governance') ||
      lowerQuery.includes('audit')
    ) {
      insights.push({
        type: 'solution',
        title: 'Risk Management & Compliance',
        description:
          'Our approach embeds controls directly into workflows for automatic audit evidence and compliance management.',
        relatedItems: ['risk-compliance', 'governance-pmo'],
        confidence: 0.87,
        icon: TrendingUp,
        category: 'Compliance',
      });
    }

    if (
      lowerQuery.includes('project') ||
      lowerQuery.includes('method') ||
      lowerQuery.includes('analysis') ||
      lowerQuery.includes('methodology') ||
      lowerQuery.includes('budget') ||
      lowerQuery.includes('complexity')
    ) {
      insights.push({
        type: 'solution',
        title: 'Project Method Analysis & Budget Planning',
        description:
          'Comprehensive project methodology analysis including budget tiers, complexity assessment, and delivery risk evaluation.',
        relatedItems: ['project-analysis'],
        confidence: 0.89,
        icon: BarChart3,
        category: 'Project Management',
      });
    }

    // Site Navigation Insights
    if (
      lowerQuery.includes('contact') ||
      lowerQuery.includes('reach') ||
      lowerQuery.includes('get in touch') ||
      lowerQuery.includes('hire')
    ) {
      insights.push({
        type: 'insight',
        title: 'Get in Touch',
        description:
          'Ready to discuss your project? I offer comprehensive consulting across strategy, technology, and leadership.',
        relatedItems: ['contact'],
        confidence: 0.95,
        icon: MessageSquare,
        category: 'Contact',
      });
    }

    if (
      lowerQuery.includes('about') ||
      lowerQuery.includes('who') ||
      lowerQuery.includes('background') ||
      lowerQuery.includes('experience')
    ) {
      insights.push({
        type: 'insight',
        title: 'About My Background',
        description:
          'I bring military leadership experience, technical expertise, and proven results in organizational transformation.',
        relatedItems: ['about'],
        confidence: 0.9,
        icon: Globe,
        category: 'About',
      });
    }

    // If no specific matches, provide contextual recommendations
    if (insights.length === 0) {
      insights.push({
        type: 'insight',
        title: 'Comprehensive Solution Portfolio',
        description:
          'I offer solutions across strategy, technology, leadership, and operations. What specific challenge are you looking to solve?',
        relatedItems: ['strategy', 'leadership', 'devops', 'analytics'],
        confidence: 0.75,
        icon: Lightbulb,
        category: 'General',
      });
    }

    return insights;
  };

  const handleQuerySubmit = async () => {
    if (!userQuery.trim()) return;

    setIsAnalyzing(true);

    try {
      // Get both static insights and content recommendations
      const [insights, contentRecs] = await Promise.all([
        Promise.resolve(generateInsights(userQuery)),
        getContentRecommendations(userQuery),
      ]);

      // Combine insights and content recommendations
      const allRecommendations = [...insights, ...contentRecs];
      setRecommendations(allRecommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      // Fallback to just insights
      const insights = generateInsights(userQuery);
      setRecommendations(insights);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleItemSelect = (
    itemSlug: string,
    recommendation?: Recommendation | ContentRecommendation
  ) => {
    // Handle content recommendations
    if (recommendation && recommendation.type === 'content') {
      const contentRec = recommendation;
      window.location.href = contentRec.url;
      return;
    }

    // Handle static recommendations
    if (itemSlug === 'blog') {
      window.location.href = '/blog';
    } else if (itemSlug === 'contact') {
      window.location.href = '/contact';
    } else if (itemSlug === 'about') {
      window.location.href = '/';
    } else {
      // Check if this is a project item
      if (itemSlug === 'project-analysis') {
        window.location.href = '/projects/project-analysis';
        return;
      }

      // Check if this is a portfolio item
      const item = portfolioItems.find(i => i.fileName === itemSlug);
      if (item) {
        // Navigate directly to portfolio URLs
        window.location.href = `/portfolio/${itemSlug}`;
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'solution':
        return 'border-hunter-600/40 bg-hunter-600/15 text-hunter-300';
      case 'blog':
        return 'border-gold-600/40 bg-gold-600/15 text-gold-300';
      case 'trend':
        return 'border-purple-600/40 bg-purple-600/15 text-purple-300';
      case 'insight':
        return 'border-slate-600/40 bg-slate-600/15 text-slate-300';
      case 'content':
        return 'border-hunter-600/40 bg-hunter-600/15 text-hunter-300';
      default:
        return 'border-hunter-600/40 bg-hunter-600/15 text-hunter-300';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9)
      return 'border-hunter-600/40 bg-hunter-600/15 text-hunter-300';
    if (confidence >= 0.75)
      return 'border-gold-600/40 bg-gold-600/15 text-gold-300';
    return 'border-slate-600/40 bg-slate-600/15 text-slate-300';
  };

  if (!showAssistant) {
    return (
      <Button
        onClick={() => setShowAssistant(true)}
        className='fixed bottom-6 right-6 z-50 size-14 rounded-full bg-gradient-to-r from-hunter-500 to-hunter-600 shadow-lg hover:from-hunter-600 hover:to-hunter-700'
      >
        <Brain className='size-6 text-white' />
      </Button>
    );
  }

  return (
    <div className='fixed bottom-6 right-6 z-50 max-h-[600px] w-96 overflow-hidden'>
      <Card className='border-hunter-600/20 bg-slate-900/95 shadow-2xl backdrop-blur-md'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Brain className='size-5 text-hunter-400' />
              <CardTitle className='text-lg text-white'>
                Site Assistant
              </CardTitle>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowAssistant(false)}
              className='size-8 p-0 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            >
              <X className='size-4' />
            </Button>
          </div>
          <CardDescription className='text-slate-400'>
            Ask me about solutions, blog posts, or get personalized
            recommendations
          </CardDescription>
        </CardHeader>

        <CardContent className='max-h-[400px] space-y-4 overflow-y-auto'>
          {/* Query Input */}
          <div className='space-y-2'>
            <Textarea
              placeholder='What can I help you with today?'
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
              className='min-h-[80px] resize-none border-hunter-600/30 bg-slate-800 text-white placeholder:text-slate-500 focus:border-hunter-600/60'
            />
            <Button
              onClick={() => void handleQuerySubmit()}
              disabled={isAnalyzing || !userQuery.trim()}
              className='w-full bg-gradient-to-r from-hunter-600 to-hunter-500 text-white hover:from-hunter-500 hover:to-hunter-400'
            >
              {isAnalyzing ? (
                <>
                  <div className='mr-2 size-4 animate-spin rounded-full border-b-2 border-white'></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className='mr-2 size-4' />
                  Get Insights
                </>
              )}
            </Button>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-slate-300'>
                Recommendations
              </h4>
              {recommendations.map((rec, index) => {
                const IconComponent = rec.icon;
                return (
                  <div
                    key={index}
                    className={`rounded-lg border bg-slate-800/50 p-3 ${getTypeColor(rec.type)}`}
                  >
                    <div className='flex items-start gap-3'>
                      <IconComponent className='mt-0.5 size-5 text-hunter-400' />
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center gap-2'>
                          <h5 className='text-sm font-medium text-white'>
                            {rec.title}
                          </h5>
                          <Badge
                            className={`text-xs ${getConfidenceColor(rec.confidence)}`}
                          >
                            {Math.round(rec.confidence * 100)}% match
                          </Badge>
                          <Badge
                            className={`text-xs ${getTypeColor(rec.type)}`}
                          >
                            {rec.type}
                          </Badge>
                        </div>
                        <p className='mb-3 text-xs text-slate-400'>
                          {rec.description}
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {rec.type === 'content' ? (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleItemSelect('', rec)}
                              className='h-6 border-hunter-600/40 px-2 text-xs text-hunter-400 hover:border-hunter-600/60 hover:bg-hunter-600/10'
                            >
                              {rec.contentType === 'blog'
                                ? 'Read Article'
                                : rec.contentType === 'portfolio'
                                  ? 'View Portfolio'
                                  : rec.contentType === 'project'
                                    ? 'View Project'
                                    : 'View Content'}
                              <ArrowRight className='ml-1 size-3' />
                            </Button>
                          ) : (
                            rec.relatedItems.map(itemSlug => (
                              <Button
                                key={itemSlug}
                                variant='outline'
                                size='sm'
                                onClick={() => handleItemSelect(itemSlug)}
                                className='h-6 border-hunter-600/40 px-2 text-xs text-hunter-400 hover:border-hunter-600/60 hover:bg-hunter-600/10'
                              >
                                {itemSlug === 'blog'
                                  ? 'Read Blog'
                                  : itemSlug === 'contact'
                                    ? 'Contact Me'
                                    : itemSlug === 'about'
                                      ? 'About Me'
                                      : itemSlug
                                          .replace('-', ' ')
                                          .replace(/\b\w/g, l =>
                                            l.toUpperCase()
                                          )}
                                <ArrowRight className='ml-1 size-3' />
                              </Button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className='border-t border-slate-700 pt-2'>
            <h4 className='mb-2 text-sm font-medium text-slate-300'>
              Quick Actions
            </h4>
            <div className='grid grid-cols-2 gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setUserQuery('I need help with DevOps and automation')
                }
                className='h-8 border-slate-700 text-xs text-slate-300 hover:border-slate-600 hover:bg-slate-800'
              >
                DevOps Help
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setUserQuery('Show me your blog posts about automation')
                }
                className='h-8 border-slate-700 text-xs text-slate-300 hover:border-slate-600 hover:bg-slate-800'
              >
                Read Blog
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setUserQuery('Tell me about your leadership experience')
                }
                className='h-8 border-slate-700 text-xs text-slate-300 hover:border-slate-600 hover:bg-slate-800'
              >
                Leadership
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setUserQuery('How can I contact you?')}
                className='h-8 border-slate-700 text-xs text-slate-300 hover:border-slate-600 hover:bg-slate-800'
              >
                Contact
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
