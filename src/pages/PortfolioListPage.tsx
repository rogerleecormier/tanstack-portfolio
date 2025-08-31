import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Briefcase, Tag, Search, X, Filter, ChevronDown } from 'lucide-react'
import { loadPortfolioItems, type PortfolioItem } from '@/utils/r2PortfolioLoader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { H1, H2, H3, P } from '@/components/ui/typography'
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

export default function PortfolioListPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>([])
  const [portfolioSearch, setPortfolioSearch] = useState<PortfolioSearch | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false)


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

  // Removed unused handleTagToggle function - using toggleTag instead

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

  const categoryColors = {
    'Strategy & Consulting': 'bg-purple-100 text-purple-800 dark:bg-purple-50 dark:text-purple-800',
    'Leadership & Culture': 'bg-green-100 text-green-800 dark:bg-green-50 dark:text-green-800',
    'Technology & Operations': 'brand-bg-primary text-teal-800 dark:bg-teal-50 dark:text-teal-800',
    'AI & Automation': 'bg-violet-100 text-violet-800 dark:bg-violet-50 dark:text-violet-800',
    'Data & Analytics': 'brand-bg-secondary text-blue-800 dark:bg-blue-50 dark:text-blue-800',
    'Risk & Compliance': 'bg-red-100 text-red-800 dark:bg-red-50 dark:text-red-800'
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
            {/* Header */}
      <div className="text-center mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-teal-600" />
            </div>
            <H1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Portfolio & Expertise
            </H1>
          </div>
          <P className="text-sm lg:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Strategic technology leadership, enterprise modernization, and operational excellence across complex business environments
          </P>
        </div>
      </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search portfolio and expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-48 justify-between">
                {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full sm:w-48 max-h-60 overflow-y-auto">
              <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                All Categories
              </DropdownMenuItem>
              {portfolioSearch?.getCategories().map(category => (
                <DropdownMenuItem 
                  key={category} 
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            onClick={() => setIsTagFilterOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
          </Button>
          
          {(searchQuery || selectedCategory !== 'all' || selectedTags.length > 0) && (
            <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto flex items-center gap-2">
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <Badge
                  key={tag}
                  variant="default"
                  className="bg-teal-600 hover:bg-teal-700 cursor-pointer"
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

             {/* Results Count */}
       <div className="mb-6">
         <div className="flex items-center justify-between">
           <p className="text-gray-600 dark:text-gray-300">
             Showing {filteredItems.length} of {portfolioItems.length} items
           </p>
         </div>
       </div>

      {/* Portfolio Grid */}
      {filteredItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                         <H3 className="mb-2">
               No portfolio items found
             </H3>
             <P className="text-gray-500 dark:text-gray-400 mb-4">
               Try adjusting your search criteria or filters
             </P>
            <Button onClick={clearFilters}>Clear all filters</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mb-8">
                     <H2 className="mb-6">
             Portfolio Items
           </H2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        <Link 
                          to={`/${item.url}`}
                          className="hover:text-teal-600 transition-colors"
                        >
                          {item.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="secondary"
                      className={`${(categoryColors as Record<string, string>)[item.category] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {item.category}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 pb-3">
                  {/* Tags - Reduced to 3 max */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(() => {
                      const cleanTags = parseTagsSafely(item.tags).filter(tag => tag && tag.trim().length > 0);
                      return (
                        <>
                          {cleanTags.slice(0, 3).map((tag: string) => (
                            <Badge 
                              key={tag}
                              variant="secondary"
                              className="text-xs px-1.5 py-0.5 h-auto"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              <span className="whitespace-nowrap">{tag}</span>
                            </Badge>
                          ))}
                          {cleanTags.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              +{cleanTags.length - 3}
                            </Badge>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* View Details Link */}
                  <div className="mt-2">
                    <Link 
                      to={`/${item.url}`}
                      className="text-teal-600 hover:text-teal-800 text-xs font-medium hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

             {/* Tag Filter Dialog */}
       <Dialog open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
         <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col z-[200]">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Filter className="h-5 w-5 text-teal-600" />
               Filter by Topics
             </DialogTitle>
             <DialogDescription>
               Select topics to filter portfolio items by specific themes and subjects
             </DialogDescription>
           </DialogHeader>
           
           <Separator />
           
           <div className="flex-1 overflow-y-auto p-6">
             <div className="flex flex-wrap gap-2">
               {portfolioSearch?.getTags().map((tag) => (
                 <Badge
                   key={tag}
                   variant={selectedTags.includes(tag) ? 'secondary' : 'outline'}
                   className={`cursor-pointer transition-colors ${
                     selectedTags.includes(tag) 
                       ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                       : 'hover:bg-teal-50 hover:border-teal-300 dark:hover:bg-teal-900/20'
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
             <div className="text-sm text-muted-foreground">
               {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
             </div>
             <div className="flex gap-2">
               <Button variant="outline" onClick={clearFilters}>
                 Clear All
               </Button>
               <Button onClick={closeTagFilter} className="bg-teal-600 hover:bg-teal-700">
                 Apply Filters
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
    </div>
  )
}
