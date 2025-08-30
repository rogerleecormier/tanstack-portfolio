import { useState, useEffect, useMemo } from 'react'
import { Search as SearchIcon, Filter, Calendar, User, Tag, ExternalLink } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import Fuse from 'fuse.js'
import { markdownContentService, type MarkdownContentItem } from '@/api/markdownContentService'
import { logger } from '@/utils/logger'

export default function RedesignedSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MarkdownContentItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [allItems, setAllItems] = useState<MarkdownContentItem[]>([])
  const [selectedContentType, setSelectedContentType] = useState<'all' | 'blog' | 'portfolio' | 'project' | 'page'>('all')
  const router = useRouter()

  // Initialize Fuse.js search index
  const fuseIndex = useMemo(() => {
    if (allItems.length === 0) return null

    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'content', weight: 0.1 } // Full content for semantic search
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
      useExtendedSearch: true
    }

    return new Fuse(allItems, fuseOptions)
  }, [allItems])

  // Load all content items on component mount
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true)
      try {
        const items = await markdownContentService.getAllContentItems()
        setAllItems(items)
        logger.debug('Loaded content items:', items.length)
      } catch (error) {
        logger.error('Failed to load content:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadContent()
  }, [])

  // Handle search with Fuse.js
  useEffect(() => {
    if (!fuseIndex || query.length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    
    try {
      // Perform Fuse.js search
      const searchResults = fuseIndex.search(query)
      
      // Filter by content type if specified
      let filteredResults = searchResults
      if (selectedContentType !== 'all') {
        filteredResults = searchResults.filter(result => 
          result.item.contentType === selectedContentType
        )
      }

      // Convert to MarkdownContentItem array and limit results
      const items = filteredResults
        .slice(0, 12)
        .map(result => result.item)

      setResults(items)
      logger.debug('Search results:', items.length)
    } catch (error) {
      logger.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [query, fuseIndex, selectedContentType])

  // Navigate to selected result
  const navigateToResult = (url: string) => {
    router.navigate({ to: url.startsWith('/') ? url : `/${url}` })
    setOpen(false)
    setQuery('')
    setResults([])
  }

  // Get content type icon and color
  const getContentTypeInfo = (contentType: string) => {
    switch (contentType) {
      case 'blog':
        return { icon: '📝', color: 'bg-blue-100 text-blue-800', label: 'Blog Post' }
      case 'portfolio':
        return { icon: '💼', color: 'bg-teal-100 text-teal-800', label: 'Portfolio' }
      case 'project':
        return { icon: '🚀', color: 'bg-purple-100 text-purple-800', label: 'Project' }
      default:
        return { icon: '📄', color: 'bg-gray-100 text-gray-800', label: 'Page' }
    }
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return null
    }
  }

  return (
    <div className="w-full min-w-[192px] sm:w-48 md:w-56 lg:w-64 h-10 flex-shrink-0">
      <Button
        variant="outline"
        className="w-full h-10 justify-start text-sm text-muted-foreground border-teal-300 hover:bg-teal-50 hover:text-teal-900 dark:border-teal-600 dark:hover:bg-teal-950 dark:hover:text-teal-100 relative pr-16"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <span className="sm:hidden">Search</span>
        <span className="absolute right-1.5 inset-y-0 my-auto h-5 flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-0 lg:opacity-100 pointer-events-none select-none transition-opacity">
          <span className="text-xs">⌘</span>K
        </span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 z-[150]">
          <VisuallyHidden>
            <DialogTitle>Search Portfolio Content</DialogTitle>
            <DialogDescription>Search through blog posts, portfolio, and projects</DialogDescription>
          </VisuallyHidden>
          
          {/* Search Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-teal-50 to-blue-50">
            <div className="flex items-center gap-3 flex-1">
              <SearchIcon className="h-5 w-5 text-teal-600" />
              <Input
                placeholder="Search blog posts, portfolio, and projects..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-lg placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            
            {/* Content Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value as any)}
                className="text-sm border rounded-md px-2 py-1 bg-white"
              >
                <option value="all">All Content</option>
                <option value="blog">Blog Posts</option>
                <option value="portfolio">Portfolio</option>
                <option value="project">Projects</option>
                <option value="page">Pages</option>
              </select>
            </div>
          </div>
          
          {/* Results */}
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading && (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading content...</p>
              </div>
            )}
            
            {!isLoading && query.length < 2 && (
              <div className="py-12 text-center">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Your Portfolio</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Start typing to search through your blog posts, portfolio items, and project case studies. 
                  Search by title, description, tags, or content.
                </p>
              </div>
            )}
            
            {isSearching && (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-3"></div>
                <p className="text-sm text-muted-foreground">Searching...</p>
              </div>
            )}
            
            {!isLoading && query.length >= 2 && !isSearching && results.length === 0 && (
              <div className="py-12 text-center">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  No content matches "{query}". Try different keywords or check your spelling.
                </p>
              </div>
            )}
            
            {results.length > 0 && !isSearching && (
              <div className="p-4">
                <div className="text-xs text-muted-foreground px-2 py-1 mb-4 flex items-center justify-between">
                  <span>{results.length} results found</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    Powered by Fuse.js
                  </span>
                </div>
                
                <div className="grid gap-4">
                  {results.map((result) => {
                    const contentTypeInfo = getContentTypeInfo(result.contentType)
                    const formattedDate = formatDate(result.date)
                    
                    return (
                      <div
                        key={result.id}
                        onClick={() => navigateToResult(result.url)}
                        className="group p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md cursor-pointer transition-all duration-200 bg-white hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-blue-50/50"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                              {result.title}
                            </h3>
                            {result.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {result.description}
                              </p>
                            )}
                          </div>
                          
                          {/* Content Type Badge */}
                          <div className="flex items-center gap-2 ml-4">
                            <Badge className={`${contentTypeInfo.color} text-xs font-medium`}>
                              {contentTypeInfo.icon} {contentTypeInfo.label}
                            </Badge>
                            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        
                        {/* Metadata Row */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          {formattedDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formattedDate}
                            </div>
                          )}
                          {result.author && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {result.author}
                            </div>
                          )}
                          {result.category && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {result.category}
                            </div>
                          )}
                        </div>
                        
                        {/* Tags */}
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {result.tags.slice(0, 6).map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {result.tags.length > 6 && (
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                +{result.tags.length - 6} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
