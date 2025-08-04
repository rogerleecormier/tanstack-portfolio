import { useState, useEffect } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from './ui/input'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { performSearch } from '../utils/searchIndex'
import type { SearchResult } from '../types/search'

export default function Search() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Handle search with async support
  useEffect(() => {
    const searchAsync = async () => {
      if (query.length >= 2) {
        setIsSearching(true)
        try {
          const searchResults = await performSearch(query)
          setResults(searchResults)
        } catch (error) {
          console.error('Search error:', error)
          setResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setResults([])
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchAsync, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  // Navigate to selected result
  const navigateToResult = (url: string) => {
    router.navigate({ to: url })
    setOpen(false)
    setQuery('')
    setResults([])
  }

  // Calculate relevance percentage
  const getRelevancePercentage = (score?: number): number => {
    if (!score) return 0
    // Fuse.js scores are between 0 (perfect match) and 1 (no match)
    // Convert to percentage where lower score = higher relevance
    return Math.round((1 - score) * 100)
  }

  // Get relevance color based on percentage
  const getRelevanceColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-100 text-green-800'
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800'
    if (percentage >= 40) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  // Get match context from content
  const getMatchContext = (content: string, searchTerm: string): string => {
    const lowerContent = content.toLowerCase()
    const lowerSearch = searchTerm.toLowerCase()
    const index = lowerContent.indexOf(lowerSearch)
    
    if (index === -1) return content.slice(0, 150)
    
    const start = Math.max(0, index - 75)
    const end = Math.min(content.length, index + searchTerm.length + 75)
    let context = content.slice(start, end)
    
    if (start > 0) context = '...' + context
    if (end < content.length) context = context + '...'
    
    return context
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-auto lg:w-64 min-w-[200px] border-teal-300 hover:bg-teal-50 hover:text-teal-900 dark:border-teal-600 dark:hover:bg-teal-950 dark:hover:text-teal-100"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <span className="sm:hidden">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0">
          <VisuallyHidden>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>Search through documentation, pages, and content</DialogDescription>
          </VisuallyHidden>
          
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b">
            <SearchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation, pages, and content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>
          
          {/* Results */}
          <div className="max-h-[500px] overflow-y-auto">
            {query.length < 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Start typing to search through your pages...
              </div>
            )}
            
            {isSearching && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <SearchIcon className="h-4 w-4 animate-spin mx-auto mb-2" />
                Searching...
              </div>
            )}
            
            {query.length >= 2 && !isSearching && results.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            )}
            
            {results.length > 0 && !isSearching && (
              <div className="p-3">
                <div className="text-xs text-muted-foreground px-2 py-1 mb-3 flex items-center justify-between">
                  <span>{results.length} pages found</span>
                  <span>Sorted by relevance</span>
                </div>
                {results.slice(0, 8).map((result, index) => {
                  const relevancePercentage = getRelevancePercentage(result.score)
                  const relevanceColor = getRelevanceColor(relevancePercentage)
                  const matchContext = getMatchContext(result.item.content, query)
                  
                  return (
                    <div
                      key={result.item.id || index}
                      onClick={() => navigateToResult(result.item.url)}
                      className="flex flex-col gap-2 p-4 mb-2 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                    >
                      {/* Header with frontmatter title and relevance */}
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-base truncate flex-1">
                          {result.item.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${relevanceColor}`}>
                            {relevancePercentage}% match
                          </span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {result.item.section}
                          </span>
                        </div>
                      </div>
                      
                      {/* Frontmatter description */}
                      {result.item.description && (
                        <p className="text-sm text-muted-foreground font-medium">
                          {result.item.description}
                        </p>
                      )}
                      
                      {/* Content preview with context */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {matchContext}
                      </p>
                      
                      {/* Matched headings */}
                      {result.item.headings && result.item.headings.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs text-muted-foreground mr-2">Topics:</span>
                          {result.item.headings.slice(0, 4).map((heading, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {heading}
                            </span>
                          ))}
                          {result.item.headings.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{result.item.headings.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}