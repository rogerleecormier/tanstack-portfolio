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
import { H1, H2, H3, P } from '@/components/ui/typography';
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950'>
      {/* Header with Targeting Theme - More Compact */}
      <div className='relative overflow-hidden border-b border-teal-200 dark:border-teal-800'>
        <div className='absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10'></div>

        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Targeting Theme */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-lg'>
                  <BookOpen className='size-7 text-white' />
                </div>
                {/* Targeting indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
                  <div className='size-2 rounded-full bg-white'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500'>
                  <div className='size-1.5 rounded-full bg-white'></div>
                </div>
              </div>
              <div>
                <H1
                  className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl'
                  style={{ fontWeight: 700 }}
                >
                  <span className='bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent'>
                    Insights & Articles
                  </span>
                </H1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-teal-500 to-blue-500'></div>
              </div>
            </div>

            {/* Description with Targeting Language */}
            <P className='mx-auto max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-300'>
              Strategic insights, technical deep-dives, and leadership
              perspectives on enterprise technology transformation.
              <span className='font-medium text-teal-700 dark:text-teal-300'>
                {' '}
                Target your knowledge{' '}
              </span>
              with expertly curated content and on-point analysis.
            </P>

            {/* Quick Stats with Targeting Theme */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-teal-500'></div>
                <span>Strategic Targeting</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-blue-500'></div>
                <span>Precision Analysis</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-purple-500'></div>
                <span>On-Point Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Search and Filters with Blue Accent */}
        <div className='mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <Search className='absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400' />
              <Input
                placeholder='Search insights and articles...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='h-11 border-gray-200 pl-12 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700'
              />
            </div>
            <Button
              variant='outline'
              onClick={() => setIsTagFilterOpen(true)}
              className='flex h-11 items-center gap-2 border-gray-200 px-6 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-950/20'
            >
              <Filter className='size-4' />
              Topics {selectedTags.length > 0 && `(${selectedTags.length})`}
            </Button>
            {(searchQuery || selectedTags.length > 0) && (
              <Button
                variant='outline'
                onClick={clearFilters}
                className='flex h-11 items-center gap-2 border-gray-200 px-6 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
              >
                <X className='size-4' />
                Clear
              </Button>
            )}
          </div>

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className='mt-4 border-t border-gray-200 pt-4 dark:border-gray-700'>
              <div className='mb-3 flex items-center gap-2'>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Active filters:
                </span>
              </div>
              <div className='flex flex-wrap gap-2'>
                {selectedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant='default'
                    className='cursor-pointer border-0 bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700'
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
            <p className='font-medium text-gray-600 dark:text-gray-400'>
              Showing {displayedPosts.length} of {filteredPosts.length} articles
            </p>
          </div>
        </div>

        {/* Tag Filter Dialog */}
        <Dialog open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
          <DialogContent className='z-[200] flex max-h-[85vh] max-w-2xl flex-col'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Filter className='size-5 text-blue-600' />
                Filter by Topics
              </DialogTitle>
              <DialogDescription>
                Select topics to filter articles by specific themes and subjects
              </DialogDescription>
            </DialogHeader>

            <Separator />

            <div className='flex-1 overflow-y-auto p-6'>
              <div className='flex flex-wrap gap-2'>
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      selectedTags.includes(tag)
                        ? 'border-0 bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-950/20'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className='mr-1 size-3' />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className='flex items-center justify-between p-6'>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''}{' '}
                selected
              </div>
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  className='border-gray-200 dark:border-gray-700'
                >
                  Clear All
                </Button>
                <Button
                  onClick={closeTagFilter}
                  className='border-0 bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700'
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
                className='h-full border-gray-200 dark:border-gray-700'
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
          <Card className='border-gray-200 py-16 text-center dark:border-gray-700'>
            <CardContent>
              <div className='mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50'>
                <BookOpen className='size-8 text-blue-600 dark:text-blue-400' />
              </div>
              <H3 className='mb-3 text-gray-800 dark:text-gray-200'>
                No articles found
              </H3>
              <P className='mx-auto max-w-md text-gray-500 dark:text-gray-400'>
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
              <H2 className='mb-3 text-gray-800 dark:text-gray-200'>
                Articles
              </H2>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {displayedPosts.map(post => (
                  <BlogPostCard key={post.slug} post={post} />
                ))}
              </div>
            </div>

            {/* Loading indicator for infinite scroll */}
            {displayedPosts.length < filteredPosts.length && (
              <div ref={loadingRef} className='py-12 text-center'>
                <div className='inline-flex items-center gap-3 text-gray-500 dark:text-gray-400'>
                  <div className='size-6 animate-spin rounded-full border-b-2 border-blue-600'></div>
                  <span className='font-medium'>Loading more articles...</span>
                </div>
              </div>
            )}

            {/* End of articles indicator */}
            {displayedPosts.length === filteredPosts.length &&
              filteredPosts.length > 0 && (
                <div className='py-12 text-center'>
                  <div className='mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50'>
                    <BookOpen className='size-6 text-blue-600 dark:text-blue-400' />
                  </div>
                  <p className='font-medium text-gray-500 dark:text-gray-400'>
                    You've reached the end of all articles
                  </p>
                </div>
              )}
          </>
        )}
      </div>

      {/* Newsletter Signup with Blue Accent */}
      <div className='border-t border-gray-200 bg-gradient-to-b from-blue-50/30 via-gray-50 to-gray-50 dark:border-gray-800 dark:from-blue-950/20 dark:via-gray-950 dark:to-gray-950'>
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
    <Card className='group flex h-full flex-col overflow-hidden border-gray-200 bg-white transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900'>
      {/* Blue-to-teal top accent */}
      <div className='h-1 bg-gradient-to-r from-blue-600 to-teal-600'></div>

      <CardHeader className='pb-4'>
        <CardTitle className='line-clamp-2 text-lg leading-tight transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300'>
          <Link to={`/blog/${post.slug}`} className='hover:no-underline'>
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className='line-clamp-3 leading-relaxed text-gray-600 dark:text-gray-400'>
          {post.description}
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-1 flex-col'>
        {/* Tags with Blue Accent */}
        {post.tags.length > 0 && (
          <div className='mb-5 flex flex-wrap gap-2'>
            {post.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge
                key={index}
                variant='secondary'
                className='h-auto border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300'
              >
                <Tag className='mr-1 size-3' />
                <span className='whitespace-nowrap'>{tag}</span>
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge
                variant='secondary'
                className='border-gray-200 bg-gray-100 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
              >
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Meta Info with Blue Accent */}
        <div className='mb-5 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400'>
          <div className='flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50'>
              <Calendar className='size-3 text-blue-600 dark:text-blue-400' />
            </div>
            <span className='font-medium text-blue-700 dark:text-blue-300'>
              {formatDate(post.date)}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
              <Clock className='size-3 text-gray-500' />
            </div>
            <span className='font-medium text-gray-700 dark:text-gray-300'>
              {post.readTime} min read
            </span>
          </div>
        </div>

        {/* Author with Blue Accent */}
        <div className='mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
          <div className='flex size-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50'>
            <User className='size-3 text-blue-600 dark:text-blue-400' />
          </div>
          <span className='font-medium text-blue-700 dark:text-blue-300'>
            {post.author}
          </span>
        </div>

        {/* Action Button with Blue-to-teal Gradient */}
        <div className='mt-auto'>
          <Button
            className='w-full border-0 bg-gradient-to-r from-blue-600 to-teal-600 font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-teal-700 group-hover:scale-[1.01]'
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
