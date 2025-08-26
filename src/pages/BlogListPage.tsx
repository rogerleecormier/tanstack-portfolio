import React, { useState, useEffect, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  BookOpen,
  Filter,
  X
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
      setIsLoading(true)
      try {
        const posts = await loadAllBlogPosts()
        setBlogPosts(posts)
        setFilteredPosts(posts)
      } catch (error) {
        console.error('Error loading blog posts:', error)
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
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Blog
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Insights, tutorials, and thoughts on technology, leadership, and software development
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsTagFilterOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
          </Button>
          {(searchQuery || selectedTags.length > 0) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  className="cursor-pointer hover:bg-teal-700"
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

      {/* Tag Filter Modal */}
      {isTagFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter by Tags
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeTagFilter}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button onClick={closeTagFilter}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No articles found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || selectedTags.length > 0 
                ? 'Try adjusting your search or filters'
                : 'No blog posts have been published yet'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* All Articles Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>

                     {/* Loading indicator for infinite scroll */}
           {displayedPosts.length < filteredPosts.length && (
             <div ref={loadingRef} className="text-center py-8">
               <div className="inline-flex items-center gap-2 text-gray-500">
                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                 <span>Loading more articles...</span>
               </div>
             </div>
           )}

          {/* End of articles indicator */}
          {displayedPosts.length === filteredPosts.length && filteredPosts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                You've reached the end of all articles
              </p>
            </div>
          )}
        </>
      )}

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  )
}

// Blog Post Card Component
interface BlogPostCardProps {
  post: BlogPost
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 group">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-teal-600 transition-colors">
          <Link to={`/blog/${post.slug}`} className="hover:no-underline">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {post.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => {
              const colors = [
                'bg-teal-100 text-teal-800 border-teal-200',
                'bg-blue-100 text-blue-800 border-blue-200',
                'bg-purple-100 text-purple-800 border-purple-200'
              ];
              return (
                <Badge key={tag} variant="secondary" className={`text-xs ${colors[index % colors.length]}`}>
                  {tag}
                </Badge>
              );
            })}
            {post.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{post.readTime} min read</span>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <User className="w-4 h-4" />
          <span>{post.author}</span>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <Button 
            variant="outline" 
            className="w-full group-hover:bg-teal-50 group-hover:border-teal-300 group-hover:text-teal-700 transition-colors" 
            asChild
          >
            <Link to={`/blog/${post.slug}`}>
              Read Article
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
