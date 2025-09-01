import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Briefcase, Tag, Search, X, Filter, ChevronDown, Sparkles, TrendingUp, Users, Zap, Shield } from 'lucide-react'
import { loadPortfolioItems, type PortfolioItem } from '@/utils/r2PortfolioLoader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { H1, H3, P } from '@/components/ui/typography'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { logger } from '@/utils/logger'

// Helper function to safely parse tags
function parseTagsSafely(tags: unknown): string[] {
  if (!tags) return [];
  
  // If tags is already an array, process each item
  if (Array.isArray(tags)) {
    const allTags: string[] = [];
    
    for (const item of tags) {
      if (typeof item === 'string') {
        // Check if this string looks like JSON
        if (item.trim().startsWith('[') && item.trim().endsWith(']')) {
          try {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) {
              allTags.push(...parsed.filter((tag): tag is string => typeof tag === 'string'));
            }
          } catch {
            // If parsing fails, treat as a single tag
            allTags.push(item);
          }
        } else {
          // Regular string tag
          allTags.push(item);
        }
      }
    }
    
    return allTags;
  }
  
  // If tags is a string, try to parse it
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed.filter((tag): tag is string => typeof tag === 'string');
      }
    } catch {
      // If parsing fails, split by comma and clean up
      return tags.split(',').map((tag: string) => 
        tag.trim().replace(/^\[|\]$/g, '').replace(/"/g, '')
      );
    }
  }
  
  return [];
}

// Portfolio search functionality
class PortfolioSearch {
  private items: PortfolioItem[]

  constructor(items: PortfolioItem[]) {
    this.items = items
  }

  search(query: string, category: string, tags: string[]): PortfolioItem[] {
    let results = this.items

    // Filter by category
    if (category && category !== 'all') {
      results = results.filter(item => item.category === category)
    }

    // Filter by tags
    if (tags.length > 0) {
      results = results.filter(item => 
        tags.some(tag => item.tags.includes(tag))
      )
    }

    // Filter by search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      results = results.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm)) ||
        item.category.toLowerCase().includes(searchTerm)
      )
    }

    return results
  }

  getCategories(): string[] {
    return [...new Set(this.items.map(item => item.category))].sort()
  }

  getTags(): string[] {
    const allTags = this.items.flatMap(item => item.tags)
    return [...new Set(allTags)].sort()
  }
}

// Category configuration with icons and colors
const categoryConfig = {
  'Strategy & Consulting': {
    icon: Sparkles,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  'Leadership & Culture': {
    icon: Users,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  'Technology & Operations': {
    icon: Zap,
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-950/20',
    borderColor: 'border-teal-200 dark:border-teal-800'
  },
  'AI & Automation': {
    icon: Sparkles,
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    borderColor: 'border-violet-200 dark:border-violet-800'
  },
  'Data & Analytics': {
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  'Risk & Compliance': {
    icon: Shield,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800'
  }
}

export default function PortfolioListPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>([])
  const [portfolioSearch, setPortfolioSearch] = useState<PortfolioSearch | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  // Load portfolio items on component mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true)
        logger.debug('🚀 Starting to load portfolio items...')
        const items = await loadPortfolioItems()
        logger.debug('✨ Portfolio items loaded:', items)
        logger.debug(`📊 Discovered ${items.length} portfolio items:`, items.map(item => item.id))
        setPortfolioItems(items)
        
        // Initialize search
        const search = new PortfolioSearch(items)
        setPortfolioSearch(search)
        setFilteredItems(items)
      } catch (error) {
        logger.error('❌ Error loading portfolio items:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadItems()
  }, [])

  // Update filtered results when search criteria change
  useEffect(() => {
    if (portfolioSearch) {
      const results = portfolioSearch.search(searchQuery, selectedCategory, selectedTags)
      setFilteredItems(results)
    }
  }, [searchQuery, selectedCategory, selectedTags, portfolioSearch])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedTags([])
  }

  const closeTagFilter = () => {
    setIsTagFilterOpen(false)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-teal-950/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-16 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>
          
          {/* Search Skeleton */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-teal-950/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            {/* Icon and Title */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <H1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Portfolio & Expertise
                </H1>
                <div className="h-1 w-24 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto mt-2 rounded-full"></div>
              </div>
            </div>
            
            {/* Description */}
            <P className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Strategic technology leadership, enterprise modernization, and operational excellence across complex business environments
            </P>
            
            {/* Stats */}
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{portfolioItems.length}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Portfolio Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{portfolioSearch?.getCategories().length || 0}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{portfolioSearch?.getTags().length || 0}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Topics</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-800/20">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search portfolio and expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white/50 dark:bg-slate-800/50 border-0 shadow-sm focus:ring-2 focus:ring-teal-500/20 rounded-xl"
                />
              </div>
              
              {/* Category Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 bg-white/50 dark:bg-slate-800/50 border-0 shadow-sm hover:bg-white/70 dark:hover:bg-slate-800/70 rounded-xl">
                    <span className="mr-2">{selectedCategory === 'all' ? 'All Categories' : selectedCategory}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full sm:w-64 max-h-60 overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-0 shadow-xl rounded-xl">
                  <DropdownMenuItem 
                    onClick={() => setSelectedCategory('all')}
                    className="hover:bg-teal-50 dark:hover:bg-teal-950/20 rounded-lg mx-2 my-1"
                  >
                    All Categories
                  </DropdownMenuItem>
                  {portfolioSearch?.getCategories().map(category => (
                    <DropdownMenuItem 
                      key={category} 
                      onClick={() => setSelectedCategory(category)}
                      className="hover:bg-teal-50 dark:hover:bg-teal-950/20 rounded-lg mx-2 my-1"
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Tags Filter Button */}
              <Button 
                variant="outline" 
                onClick={() => setIsTagFilterOpen(true)}
                className="h-12 px-6 bg-white/50 dark:bg-slate-800/50 border-0 shadow-sm hover:bg-white/70 dark:hover:bg-slate-800/70 rounded-xl"
              >
                <Filter className="w-4 h-4 mr-2" />
                Tags {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
              
              {/* Clear Filters */}
              {(searchQuery || selectedCategory !== 'all' || selectedTags.length > 0) && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters} 
                  className="h-12 px-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-xl"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active filters:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 cursor-pointer text-white border-0 shadow-sm"
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
        </div>

                 {/* Results Count */}
         <div className="max-w-4xl mx-auto mb-8">
           <div className="flex items-center justify-between">
             <p className="text-slate-600 dark:text-slate-300 font-medium">
               Showing {filteredItems.length} of {portfolioItems.length} items
             </p>
           </div>
         </div>

        {/* Portfolio Grid */}
        {filteredItems.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <Card className="text-center py-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent>
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-10 h-10 text-slate-400" />
                </div>
                <H3 className="mb-3 text-slate-700 dark:text-slate-300">
                  No portfolio items found
                </H3>
                <P className="text-slate-500 dark:text-slate-400 mb-6">
                  Try adjusting your search criteria or filters to find what you're looking for
                </P>
                <Button 
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white border-0 shadow-lg"
                >
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const categoryInfo = categoryConfig[item.category as keyof typeof categoryConfig] || {
                  icon: Briefcase,
                  color: 'from-slate-500 to-slate-600',
                  bgColor: 'bg-slate-50 dark:bg-slate-950/20',
                  borderColor: 'border-slate-200 dark:border-slate-800'
                }
                const CategoryIcon = categoryInfo.icon
                
                return (
                  <Card key={item.id} className="group h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      {/* Category Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge 
                          variant="secondary"
                          className={`${categoryInfo.bgColor} ${categoryInfo.borderColor} text-slate-700 dark:text-slate-300 border shadow-sm`}
                        >
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {item.category}
                        </Badge>
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronDown className="h-4 w-4 text-slate-500" />
                        </div>
                      </div>
                      
                      {/* Title */}
                      <CardTitle className="text-xl mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        <Link 
                          to={`/${item.url}`}
                          className="hover:underline decoration-2 underline-offset-4"
                        >
                          {item.title}
                        </Link>
                      </CardTitle>
                      
                      {/* Description */}
                      <CardDescription className="text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(() => {
                          const cleanTags = parseTagsSafely(item.tags).filter(tag => tag && tag.trim().length > 0);
                          return (
                            <>
                              {cleanTags.slice(0, 3).map((tag: string) => (
                                <Badge 
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs px-2 py-1 h-auto bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0"
                                >
                                  <Tag className="h-3 w-3 mr-1" />
                                  <span className="whitespace-nowrap">{tag}</span>
                                </Badge>
                              ))}
                              {cleanTags.length > 3 && (
                                <Badge variant="secondary" className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-0">
                                  +{cleanTags.length - 3}
                                </Badge>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      {/* View Details Link */}
                      <div className="flex items-center justify-between">
                        <Link 
                          to={`/${item.url}`}
                          className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                        >
                          View Details
                        </Link>
                        <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronDown className="h-3 w-3 text-white rotate-[-90deg]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Tag Filter Dialog */}
        <Dialog open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                Filter by Topics
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-300">
                Select topics to filter portfolio items by specific themes and subjects
              </DialogDescription>
            </DialogHeader>
            
            <Separator className="bg-slate-200 dark:bg-slate-700" />
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-3">
                {portfolioSearch?.getTags().map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'secondary' : 'outline'}
                    className={`cursor-pointer transition-all duration-200 text-sm px-3 py-2 ${
                      selectedTags.includes(tag) 
                        ? 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white border-0 shadow-lg' 
                        : 'bg-white/50 dark:bg-slate-800/50 hover:bg-teal-50 dark:hover:bg-teal-950/20 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className="h-3 w-3 mr-2" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator className="bg-slate-200 dark:bg-slate-700" />
            
            <div className="flex items-center justify-between p-6">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Clear All
                </Button>
                <Button 
                  onClick={closeTagFilter} 
                  className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white border-0 shadow-lg"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
