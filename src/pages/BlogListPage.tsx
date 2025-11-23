import NewsletterSignup from '@/components/NewsletterSignup';
import { ScrollToTop } from '@/components/ScrollToTop';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { H2, H3, P } from '@/components/ui/typography';
import {
  filterBlogPostsByTags,
  formatDate,
  getAllTags,
  loadAllBlogPosts,
  searchBlogPosts,
  type BlogPost,
} from '@/utils/blogUtils';
import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Filter,
  Search,
  Tag,
  User,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

export default function BlogListPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>([]);
  const [postsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);

  // Load blog posts
  useEffect(() => {
    try {
      setIsLoading(true);

      const posts = loadAllBlogPosts();

      setBlogPosts(posts);
      setFilteredPosts(posts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      setBlogPosts([]);
      setFilteredPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter posts based on search query and selected tags
  useEffect(() => {
    let filtered = blogPosts;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = searchBlogPosts(filtered, searchQuery);
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filterBlogPostsByTags(filtered, selectedTags);
    }

    setFilteredPosts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [blogPosts, searchQuery, selectedTags]);

  // Update displayed posts when filtered posts or current page changes
  useEffect(() => {
    const endIndex = currentPage * postsPerPage;
    setDisplayedPosts(filteredPosts.slice(0, endIndex));
  }, [filteredPosts, currentPage, postsPerPage]);

  // Get all unique tags from blog posts
  const allTags = getAllTags(blogPosts);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const closeTagFilter = () => {
    setIsTagFilterOpen(false);
  };

  // Intersection Observer for infinite scroll
  const loadingRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null) {
        const observer = new IntersectionObserver(
          entries => {
            const [entry] = entries;
            if (
              entry?.isIntersecting &&
              !isLoading &&
              !isLoadingMore &&
              displayedPosts.length < filteredPosts.length
            ) {
              setIsLoadingMore(true);
              // Small delay to show loading state
              setTimeout(() => {
                setCurrentPage(prev => prev + 1);
                setIsLoadingMore(false);
              }, 300);
            }
          },
          {
            rootMargin: '100px', // Trigger 100px before the element comes into view
            threshold: 0.1,
          }
        );
        observer.observe(node);
        return () => observer.disconnect();
      }
      return undefined;
    },
    [isLoading, isLoadingMore, displayedPosts.length, filteredPosts.length]
  );

  return (
    <div className='min-h-screen bg-hunter-950'>
      {/* Header with Glassmorphism Theme */}
      <div className='relative overflow-hidden border-b border-hunter-900/50 bg-hunter-950/40 backdrop-blur-xl dark:border-grey-800 dark:bg-hunter-950/30'>
        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Glassmorphism Theme */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-hunter-900/60 shadow-lg ring-1 ring-gold-500/20 backdrop-blur-md'>
                  <BookOpen className='size-7 text-gold-400' />
                </div>
                {/* Content indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-hunter-800/80 backdrop-blur-sm'>
                  <div className='size-2 rounded-full bg-gold-400'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-grey-700/60 backdrop-blur-sm'>
                  <div className='size-1.5 rounded-full bg-gold-300'></div>
                </div>
              </div>
              <div>
                <h1 className='text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl'>
                  <span className='text-gold-400'>Insights & Articles</span>
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gold-500/50'></div>
              </div>
            </div>

            {/* Description with Glassmorphism Theme */}
            <p className='mx-auto max-w-3xl text-lg leading-7 text-grey-300'>
              Thought leadership, technical insights, and strategic analysis on
              modern enterprise challenges and technology trends.
              <span className='font-medium text-gold-300'>
                {' '}
                Precision insights{' '}
              </span>
              with expert perspectives and actionable industry analysis.
            </p>

            {/* Quick Stats with Glassmorphism Theme */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-grey-400'>
                <div className='size-2 rounded-full bg-gold-500/60'></div>
                <span>Strategic Content</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-grey-400'>
                <div className='size-2 rounded-full bg-gold-500/60'></div>
                <span>Deep Analysis</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-grey-400'>
                <div className='size-2 rounded-full bg-gold-500/60'></div>
                <span>Expert Perspectives</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Search and Filters with Glassmorphism */}
        <div className='mb-8 rounded-lg border border-gold-500/20 bg-hunter-900/30 p-6 shadow-lg backdrop-blur-xl dark:border-gold-500/20 dark:bg-hunter-900/30'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <Search className='absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gold-400' />
              <Input
                placeholder='Search insights and articles...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='h-11 border-gold-500/20 bg-hunter-800/50 pl-12 text-white placeholder:text-grey-500 focus:border-gold-500/50 focus:ring-gold-500/20 dark:border-gold-500/20 dark:bg-hunter-800/50'
              />
            </div>
            <Button
              variant='outline'
              onClick={() => setIsTagFilterOpen(true)}
              className='flex h-11 items-center gap-2 border-gold-500/20 bg-hunter-800/30 px-6 text-gold-400 hover:border-gold-500/50 hover:bg-hunter-700/50 dark:border-gold-500/20 dark:bg-hunter-800/30'
            >
              <Filter className='size-4' />
              Topics {selectedTags.length > 0 && `(${selectedTags.length})`}
            </Button>
            {(searchQuery || selectedTags.length > 0) && (
              <Button
                variant='outline'
                onClick={clearFilters}
                className='flex h-11 items-center gap-2 border-gold-500/20 bg-hunter-800/30 px-6 text-gold-400 hover:border-gold-500/50 hover:bg-hunter-700/50 dark:border-gold-500/20 dark:bg-hunter-800/30'
              >
                <X className='size-4' />
                Clear
              </Button>
            )}
          </div>

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className='mt-4 border-t border-gold-500/20 pt-4 dark:border-gold-500/20'>
              <div className='mb-3 flex items-center gap-2'>
                <span className='text-sm font-medium text-gold-400 dark:text-gold-400'>
                  Active filters:
                </span>
              </div>
              <div className='flex flex-wrap gap-2'>
                {selectedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant='default'
                    className='cursor-pointer border-0 bg-gold-600/70 text-hunter-900 hover:bg-gold-500 dark:bg-gold-500 dark:text-hunter-950 dark:hover:bg-gold-400'
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className='mr-1 size-3' />
                    {tag}
                    <X className='ml-1 size-3' />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <p className='font-medium text-gold-400 dark:text-gold-400'>
              Showing {displayedPosts.length} of {filteredPosts.length} articles
            </p>
          </div>
        </div>

        {/* Tag Filter Dialog */}
        <Dialog open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
          <DialogContent className='z-[200] flex max-h-[85vh] max-w-2xl flex-col border-gold-500/20 bg-hunter-900/50 backdrop-blur-xl dark:border-gold-500/20 dark:bg-hunter-900/30'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-gold-400'>
                <Filter className='size-5' />
                Filter by Topics
              </DialogTitle>
              <DialogDescription className='text-grey-300'>
                Select topics to filter articles by specific themes and subjects
              </DialogDescription>
            </DialogHeader>

            <Separator className='bg-gold-500/20' />

            <div className='flex-1 overflow-y-auto p-6'>
              <div className='flex flex-wrap gap-2'>
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      selectedTags.includes(tag)
                        ? 'border-0 bg-gold-600/70 text-hunter-900 hover:bg-gold-500 dark:bg-gold-500 dark:text-hunter-950 dark:hover:bg-gold-400'
                        : 'border-gold-500/30 text-gold-400 hover:border-gold-500/60 hover:bg-hunter-800/50 dark:border-gold-500/30 dark:text-gold-400 dark:hover:bg-hunter-800/70'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className='mr-1 size-3' />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className='bg-gold-500/20' />

            <div className='flex items-center justify-between p-6'>
              <div className='text-sm text-grey-400 dark:text-grey-400'>
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''}{' '}
                selected
              </div>
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  className='border-gold-500/20 bg-hunter-800/30 text-gold-400 hover:border-gold-500/50 hover:bg-hunter-700/50 dark:border-gold-500/20 dark:bg-hunter-800/30'
                >
                  Clear All
                </Button>
                <Button
                  onClick={closeTagFilter}
                  className='border-0 bg-gold-600/70 text-hunter-900 hover:bg-gold-500 dark:bg-gold-500 dark:text-hunter-950 dark:hover:bg-gold-400'
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Blog Posts Grid */}
        {isLoading ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className='h-full border-gold-500/20 bg-hunter-900/30 dark:border-gold-500/20 dark:bg-hunter-900/30'
              >
                <CardHeader>
                  <Skeleton className='mb-2 h-6 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='mb-4 h-20 w-full' />
                  <div className='mb-4 flex gap-2'>
                    <Skeleton className='h-6 w-16' />
                    <Skeleton className='h-6 w-20' />
                  </div>
                  <div className='mb-4 flex gap-2'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-20' />
                  </div>
                  <Skeleton className='mb-4 h-4 w-32' />
                  <Skeleton className='h-10 w-full' />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className='border-gold-500/20 bg-hunter-900/30 py-16 text-center dark:border-gold-500/20 dark:bg-hunter-900/30'>
            <CardContent>
              <div className='mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-hunter-800/60 ring-1 ring-gold-500/20 backdrop-blur-md'>
                <BookOpen className='size-8 text-gold-400' />
              </div>
              <H3 className='mb-3 text-grey-100'>No articles found</H3>
              <P className='mx-auto max-w-md text-grey-400'>
                {searchQuery || selectedTags.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'No blog posts have been published yet'}
              </P>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* All Articles Grid */}
            <div className='mb-8'>
              <H2 className='mb-3 text-gold-400'>Articles</H2>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {displayedPosts.map(post => (
                  <BlogPostCard key={post.slug} post={post} />
                ))}
              </div>
            </div>

            {/* Loading indicator for infinite scroll */}
            {displayedPosts.length < filteredPosts.length && (
              <div ref={loadingRef} className='py-12 text-center'>
                <div className='inline-flex items-center gap-3 text-grey-400 dark:text-grey-400'>
                  <div className='size-6 animate-spin rounded-full border-b-2 border-gold-500'></div>
                  <span className='font-medium'>Loading more articles...</span>
                </div>
              </div>
            )}

            {/* End of articles indicator */}
            {displayedPosts.length === filteredPosts.length &&
              filteredPosts.length > 0 && (
                <div className='py-12 text-center'>
                  <div className='mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gold-500/20'>
                    <BookOpen className='size-6 text-gold-400' />
                  </div>
                  <p className='font-medium text-gold-400/60'>
                    You've reached the end of all articles
                  </p>
                </div>
              )}
          </>
        )}
      </div>

      {/* Newsletter Signup with Glassmorphism */}
      <div className='border-t border-gold-500/20 bg-hunter-900/20 backdrop-blur-xl'>
        <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
          <NewsletterSignup />
        </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}

// Blog Post Card Component with Blue Accent
interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  return (
    <Card className='group flex h-full flex-col overflow-hidden border-gold-500/20 bg-hunter-900/30 transition-all duration-200 hover:border-gold-500/40 hover:bg-hunter-800/40 hover:shadow-lg dark:border-gold-500/20 dark:bg-hunter-900/30'>
      {/* Gold top accent with glassmorphism */}
      <div className='h-1 bg-gold-500/60'></div>

      <CardHeader className='pb-4'>
        <CardTitle className='line-clamp-2 text-lg leading-tight text-white transition-colors group-hover:text-gold-400'>
          <Link to={`/blog/${post.slug}`} className='hover:no-underline'>
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className='line-clamp-3 leading-relaxed text-grey-300'>
          {post.description}
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-1 flex-col'>
        {/* Tags with Gold Accent */}
        {post.tags.length > 0 && (
          <div className='mb-5 flex flex-wrap gap-2'>
            {post.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge
                key={index}
                variant='secondary'
                className='h-auto border-gold-500/30 bg-gold-600/20 px-2 py-1 text-xs text-gold-300'
              >
                <Tag className='mr-1 size-3' />
                <span className='whitespace-nowrap'>{tag}</span>
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge
                variant='secondary'
                className='border-grey-600/30 bg-grey-700/50 text-xs text-grey-300'
              >
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Meta Info with Gold Accent */}
        <div className='mb-5 flex items-center justify-between text-sm text-grey-400'>
          <div className='flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-full bg-gold-500/20'>
              <Calendar className='size-3 text-gold-400' />
            </div>
            <span className='font-medium text-gold-300'>
              {formatDate(post.date)}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-full bg-grey-700/50'>
              <Clock className='size-3 text-grey-400' />
            </div>
            <span className='font-medium text-grey-300'>
              {post.readTime} min read
            </span>
          </div>
        </div>

        {/* Author with Gold Accent */}
        <div className='mb-6 flex items-center gap-2 text-sm text-grey-400'>
          <div className='flex size-6 items-center justify-center rounded-full bg-gold-500/20'>
            <User className='size-3 text-gold-400' />
          </div>
          <span className='font-medium text-gold-300'>{post.author}</span>
        </div>

        {/* Action Button with Gold Gradient */}
        <div className='mt-auto'>
          <Button
            className='w-full border-0 bg-gold-600/70 font-medium text-hunter-900 transition-all duration-200 hover:bg-gold-500 group-hover:scale-[1.01] dark:bg-gold-500 dark:text-hunter-950 dark:hover:bg-gold-400'
            asChild
          >
            <Link to={`/blog/${post.slug}`}>
              Read Article
              <ArrowRight className='ml-2 size-4 transition-transform group-hover:translate-x-1' />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
