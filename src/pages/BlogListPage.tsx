import React, { useState, useEffect, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollToTop } from '@/components/ScrollToTop'
import { H1, H2, H3, P } from '@/components/ui/typography'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  BookOpen,
  Filter,
  X,
  ArrowRight
} from 'lucide-react'
import NewsletterSignup from '@/components/NewsletterSignup'
import {
  loadAllBlogPosts,
  searchBlogPosts,
  filterBlogPostsByTags,
  getAllTags,
  formatDate,
  type BlogPost
} from '@/utils/blogUtils'

export default function BlogListPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>([])
  const [postsPerPage] = useState(6)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false)

  // Load blog posts
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        setIsLoading(true)

        const posts = await loadAllBlogPosts()

        setBlogPosts(posts)
        setFilteredPosts(posts)
      } catch (error) {
        console.error('Error loading blog posts:', error)
        setBlogPosts([])
        setFilteredPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadBlogPosts()
  }, [])

  // Filter posts based on search query and selected tags
  useEffect(() => {
    let filtered = blogPosts

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = searchBlogPosts(filtered, searchQuery)
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filterBlogPostsByTags(filtered, selectedTags)
    }

    setFilteredPosts(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [blogPosts, searchQuery, selectedTags])

  // Update displayed posts when filtered posts or current page changes
  useEffect(() => {
    const endIndex = currentPage * postsPerPage
    setDisplayedPosts(filteredPosts.slice(0, endIndex))
  }, [filteredPosts, currentPage, postsPerPage])

  // Get all unique tags from blog posts
  const allTags = getAllTags(blogPosts)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
  }

  const closeTagFilter = () => {
    setIsTagFilterOpen(false)
  }

  // Intersection Observer for infinite scroll
  const loadingRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry.isIntersecting && !isLoading && !isLoadingMore && displayedPosts.length < filteredPosts.length) {
            setIsLoadingMore(true)
            // Small delay to show loading state
            setTimeout(() => {
              setCurrentPage(prev => prev + 1)
              setIsLoadingMore(false)
            }, 300)
          }
        },
        {
          rootMargin: '100px', // Trigger 100px before the element comes into view
          threshold: 0.1
        }
      )
      observer.observe(node)
      return () => observer.disconnect()
    }
  }, [isLoading, isLoadingMore, displayedPosts.length, filteredPosts.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950">
      {/* Header with Targeting Theme - More Compact */}
      <div className="relative overflow-hidden border-b border-teal-200 dark:border-teal-800">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10"></div>
        
        <div className="relative px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Icon and Title with Targeting Theme */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                {/* Targeting indicator dots */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <H1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl" style={{fontWeight: 700}}>
                  <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    Insights & Articles
                  </span>
                </H1>
                <div className="h-1 w-20 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto mt-2 rounded-full"></div>
              </div>
            </div>
            
            {/* Description with Targeting Language */}
            <P className="text-lg leading-7 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Strategic insights, technical deep-dives, and leadership perspectives on enterprise technology transformation. 
              <span className="font-medium text-teal-700 dark:text-teal-300"> Target your knowledge </span>
              with expertly curated content and on-point analysis.
            </P>
            
            {/* Quick Stats with Targeting Theme */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span>Strategic Targeting</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Precision Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>On-Point Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters with Blue Accent */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search insights and articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-11 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsTagFilterOpen(true)}
              className="flex items-center gap-2 h-11 px-6 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >
              <Filter className="w-4 h-4" />
              Topics {selectedTags.length > 0 && `(${selectedTags.length})`}
            </Button>
            {(searchQuery || selectedTags.length > 0) && (
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                className="flex items-center gap-2 h-11 px-6 border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0"
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Showing {displayedPosts.length} of {filteredPosts.length} articles
            </p>
          </div>
        </div>

        {/* Tag Filter Dialog */}
        <Dialog open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col z-[200]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Filter by Topics
              </DialogTitle>
              <DialogDescription>
                Select topics to filter articles by specific themes and subjects
              </DialogDescription>
            </DialogHeader>
            
            <Separator />
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      selectedTags.includes(tag) 
                        ? 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0' 
                        : 'hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/20 border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="border-gray-200 dark:border-gray-700"
                >
                  Clear All
                </Button>
                <Button 
                  onClick={closeTagFilter}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Blog Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-full border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-32 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="text-center py-16 border-gray-200 dark:border-gray-700">
            <CardContent>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <H3 className="mb-3 text-gray-800 dark:text-gray-200">
                No articles found
              </H3>
              <P className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {searchQuery || selectedTags.length > 0 
                  ? 'Try adjusting your search or filters'
                  : 'No blog posts have been published yet'
                }
              </P>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* All Articles Grid */}
            <div className="mb-8">
              <H2 className="mb-3 text-gray-800 dark:text-gray-200">
                Articles
              </H2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPosts.map((post) => (
                  <BlogPostCard key={post.slug} post={post} />
                ))}
              </div>
            </div>

            {/* Loading indicator for infinite scroll */}
            {displayedPosts.length < filteredPosts.length && (
              <div ref={loadingRef} className="text-center py-12">
                <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="font-medium">Loading more articles...</span>
                </div>
              </div>
            )}

            {/* End of articles indicator */}
            {displayedPosts.length === filteredPosts.length && filteredPosts.length > 0 && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  You've reached the end of all articles
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Newsletter Signup with Blue Accent */}
      <div className="bg-gradient-to-b from-blue-50/30 via-gray-50 to-gray-50 dark:from-blue-950/20 dark:via-gray-950 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <NewsletterSignup />
        </div>
      </div>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}

// Blog Post Card Component with Blue Accent
interface BlogPostCardProps {
  post: BlogPost
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200 group border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Blue-to-teal top accent */}
      <div className="h-1 bg-gradient-to-r from-blue-600 to-teal-600"></div>
      
      <CardHeader className="pb-4">
        <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
          <Link to={`/blog/${post.slug}`} className="hover:no-underline">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3 text-gray-600 dark:text-gray-400 leading-relaxed">
          {post.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Tags with Blue Accent */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-1 h-auto bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
              >
                <Tag className="h-3 w-3 mr-1" />
                <span className="whitespace-nowrap">{tag}</span>
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Meta Info with Blue Accent */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">{formatDate(post.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Clock className="w-3 h-3 text-gray-500" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">{post.readTime} min read</span>
          </div>
        </div>

        {/* Author with Blue Accent */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-blue-700 dark:text-blue-300 font-medium">{post.author}</span>
        </div>

        {/* Action Button with Blue-to-teal Gradient */}
        <div className="mt-auto">
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0 transition-all duration-200 group-hover:scale-[1.01] font-medium"
            asChild
          >
            <Link to={`/blog/${post.slug}`}>
              Read Article
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
