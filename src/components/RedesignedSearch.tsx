import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Clock, Tag, ExternalLink, FileText, Briefcase, BookOpen, Sparkles, X, Command, Target } from 'lucide-react'
import { cachedContentService, type CachedContentItem } from '@/api/cachedContentService'
import { cn } from '@/lib/utils'

interface SearchResult {
  item: CachedContentItem
  relevanceScore: number
}

const RedesignedSearch: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch {
        setRecentSearches([])
      }
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return
    
    setRecentSearches(prev => {
      const filtered = prev.filter(term => term !== searchTerm)
      const updated = [searchTerm, ...filtered].slice(0, 5)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Perform semantic search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await cachedContentService.getRecommendations({
        query: searchQuery,
        contentType: 'all',
        maxResults: 8,
        tags: searchQuery.split(' ').filter(word => word.length > 2)
      })

      if (response.success && response.results) {
        const searchResults: SearchResult[] = response.results.map(item => ({
          item,
          relevanceScore: item.relevanceScore || 0
        }))

        searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
        setResults(searchResults)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query)
      }, 300)
    } else {
      setResults([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, performSearch])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setOpen(true)
        setTimeout(() => searchInputRef.current?.focus(), 100)
      }
      
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
        setResults([])
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      )
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (event.key === 'Enter' && selectedIndex >= 0) {
      event.preventDefault()
      handleResultSelect(results[selectedIndex])
    }
  }

  // Handle result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    saveRecentSearch(query)
    setOpen(false)
    setQuery('')
    setResults([])
    setSelectedIndex(-1)
    
    try {
      window.location.href = result.item.url
    } catch (error) {
      console.warn('Navigation failed:', error)
      window.open(result.item.url, '_blank')
    }
  }, [query, saveRecentSearch])

  // Get content type icon and color
  const getContentTypeInfo = (contentType: string) => {
    switch (contentType) {
      case 'portfolio':
        return { icon: Briefcase, color: 'bg-teal-100 text-teal-800 border-teal-200' }
      case 'blog':
        return { icon: BookOpen, color: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'project':
        return { icon: FileText, color: 'bg-purple-100 text-purple-800 border-purple-200' }
      default:
        return { icon: FileText, color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
  }

  // Format relevance score
  const formatRelevanceScore = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'text-green-600 bg-green-50' }
    if (score >= 75) return { text: 'Very Good', color: 'text-blue-600 bg-blue-50' }
    if (score >= 60) return { text: 'Good', color: 'text-yellow-600 bg-yellow-50' }
    if (score >= 40) return { text: 'Fair', color: 'text-orange-600 bg-orange-50' }
    return { text: 'Basic', color: 'text-gray-600 bg-gray-50' }
  }

  // Clear search
  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSelectedIndex(-1)
    searchInputRef.current?.focus()
  }

  // Handle dialog open change
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setQuery('')
      setResults([])
      setSelectedIndex(-1)
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
  }

  return (
    <>
      {/* Search Trigger Button */}
      <div className="relative w-full max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search portfolio, blog, projects..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            className="pl-10 pr-20 h-10 bg-white/95 backdrop-blur-sm border-teal-200 text-gray-700 placeholder:text-teal-500 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            readOnly
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-gray-100 px-2 font-mono text-xs font-medium text-gray-600">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 border-0 shadow-2xl flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50 flex-shrink-0">
            <DialogTitle className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  {/* Targeting indicator dots */}
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <span className="text-lg font-semibold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Targeted Search</span>
                  <p className="text-xs text-teal-600 font-medium">Roger Lee Cormier Portfolio</p>
                </div>
              </div>
              <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-teal-100 to-blue-100 text-teal-700 border-teal-300">
                <Sparkles className="h-3 w-3 mr-1" />
                Semantic Search
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col flex-1 min-h-0">
            {/* Search Input */}
            <div className="px-6 py-4 border-b border-teal-200 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-500" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Target your search across portfolio, blog, and projects..."
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="pl-10 pr-20 h-10 bg-white border-teal-200 text-gray-700 placeholder:text-teal-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-base"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-16 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
                <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-gray-100 px-2 font-mono text-xs font-medium text-gray-600">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
            
            {/* Search Results - Scrollable Container */}
            <div className="flex-1 overflow-y-auto min-h-0 search-results-container">
              {!query && recentSearches.length > 0 && (
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    Recent Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((searchTerm, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(searchTerm)
                          performSearch(searchTerm)
                        }}
                        className="px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      >
                        {searchTerm}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {query && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      Search Results
                      {results.length > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                          {results.length} found
                        </Badge>
                      )}
                    </h3>
                    {isSearching && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                        Searching...
                      </div>
                    )}
                  </div>
                  
                  {results.length > 0 ? (
                    <div className="space-y-4">
                      {results.map((result, index) => {
                        const contentTypeInfo = getContentTypeInfo(result.item.contentType)
                        const relevanceInfo = formatRelevanceScore(result.relevanceScore)
                        const IconComponent = contentTypeInfo.icon
                        const isSelected = index === selectedIndex
                        
                        return (
                          <div
                            key={index}
                            className={cn(
                              "group p-5 rounded-xl border cursor-pointer transition-all duration-200",
                              isSelected 
                                ? "border-teal-400 bg-gradient-to-r from-teal-50 to-blue-50 shadow-lg ring-2 ring-teal-300" 
                                : "border-teal-200 hover:border-teal-300 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-blue-50/50 hover:shadow-md"
                            )}
                            onClick={() => handleResultSelect(result)}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-1">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  contentTypeInfo.color
                                )}>
                                  <IconComponent className="h-5 w-5 text-current" />
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                  <h4 className="font-semibold text-gray-900 line-clamp-1 group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-200 text-lg">
                                    {result.item.title}
                                  </h4>
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs px-3 py-1 ${contentTypeInfo.color}`}
                                  >
                                    {result.item.contentType}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs px-3 py-1 ${relevanceInfo.color}`}
                                  >
                                    {relevanceInfo.text}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                                  {result.item.description}
                                </p>
                                
                                {result.item.tags && result.item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {[...new Set(result.item.tags)].slice(0, 4).map((tag, tagIndex) => (
                                      <Badge 
                                        key={tagIndex}
                                        variant="secondary"
                                        className="text-xs px-1.5 py-0.5 h-auto"
                                      >
                                        <Tag className="h-3 w-3 mr-1" />
                                        <span className="whitespace-nowrap">{tag}</span>
                                      </Badge>
                                    ))}
                                    {result.item.tags.length > 4 && (
                                      <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
                                        +{result.item.tags.length - 4}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="font-medium">Relevance: {result.relevanceScore}%</span>
                                    {result.item.category && (
                                      <>
                                        <span>•</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{result.item.category}</span>
                                      </>
                                    )}
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : query && !isSearching ? (
                    <div className="text-center py-12">
                      <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-700 mb-3">
                        No results found for "{query}"
                      </h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Try different keywords, check your spelling, or browse recent searches below
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-2">
                  <Command className="h-3 w-3" />
                  Powered by Fuse.js fuzzy search
                </span>
                <div className="flex items-center gap-4">
                  <span>↑↓ Navigate</span>
                  <span>Enter Select</span>
                  <span>Esc Close</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RedesignedSearch
