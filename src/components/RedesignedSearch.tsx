import {
  cachedContentService,
  type CachedContentItem,
} from '@/api/cachedContentService';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Briefcase,
  Clock,
  Command,
  ExternalLink,
  FileText,
  Search,
  Sparkles,
  Tag,
  Target,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SearchResult {
  item: CachedContentItem;
  relevanceScore: number;
}

const RedesignedSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved) as string[]);
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(term => term !== searchTerm);
      const updated = [searchTerm, ...filtered].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Perform semantic search
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = cachedContentService.getRecommendations({
        query: searchQuery,
        contentType: 'all',
        maxResults: 8,
        tags: searchQuery.split(' ').filter(word => word.length > 2),
      });

      if (response.success && response.results) {
        const searchResults: SearchResult[] = response.results.map(item => ({
          item,
          relevanceScore: item.relevanceScore ?? 0,
        }));

        searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
        setResults(searchResults);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        void performSearch(query);
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, performSearch]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }

      if (event.key === 'Escape') {
        setOpen(false);
        setQuery('');
        setResults([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (event.key === 'Enter' && selectedIndex >= 0) {
      event.preventDefault();
      const selectedResult = results[selectedIndex];
      if (selectedResult) {
        handleResultSelect(selectedResult);
      }
    }
  };

  // Handle result selection
  const handleResultSelect = useCallback(
    (result: SearchResult) => {
      saveRecentSearch(query);
      setOpen(false);
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);

      try {
        window.location.href = result.item.url;
      } catch (error) {
        console.warn('Navigation failed:', error);
        window.open(result.item.url, '_blank');
      }
    },
    [query, saveRecentSearch]
  );

  // Get content type icon and color
  const getContentTypeInfo = (contentType: string) => {
    switch (contentType) {
      case 'portfolio':
        return {
          icon: Briefcase,
          color: 'bg-teal-100 text-teal-800 border-teal-200',
        };
      case 'blog':
        return {
          icon: BookOpen,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'project':
        return {
          icon: FileText,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      default:
        return {
          icon: FileText,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  // Format relevance score
  const formatRelevanceScore = (score: number) => {
    if (score >= 90)
      return { text: 'Excellent', color: 'text-green-600 bg-green-50' };
    if (score >= 75)
      return { text: 'Very Good', color: 'text-blue-600 bg-blue-50' };
    if (score >= 60)
      return { text: 'Good', color: 'text-yellow-600 bg-yellow-50' };
    if (score >= 40)
      return { text: 'Fair', color: 'text-orange-600 bg-orange-50' };
    return { text: 'Basic', color: 'text-gray-600 bg-gray-50' };
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    searchInputRef.current?.focus();
  };

  // Handle dialog open change
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <div className='relative w-full max-w-2xl'>
        <div className='relative'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
          <Input
            ref={inputRef}
            type='text'
            placeholder='Search portfolio, blog, projects...'
            value={query}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            className='h-10 cursor-pointer border-teal-200 bg-white/95 pl-10 pr-20 text-gray-700 shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-teal-500 hover:shadow-md focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200'
            readOnly
          />
          <div className='absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1'>
            <kbd className='pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-gray-100 px-2 font-mono text-xs font-medium text-gray-600'>
              <span className='text-xs'>⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className='flex max-h-[85vh] max-w-4xl flex-col border-0 p-0 shadow-2xl'>
          <DialogHeader className='shrink-0 border-b border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50 px-6 py-4'>
            <DialogTitle className='flex items-center gap-3'>
              <div className='flex items-center gap-3'>
                <div className='relative'>
                  <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 shadow-sm'>
                    <Target className='size-4 text-white' />
                  </div>
                  {/* Targeting indicator dots */}
                  <div className='absolute -right-0.5 -top-0.5 flex size-2 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
                    <div className='size-1 rounded-full bg-white'></div>
                  </div>
                </div>
                <div>
                  <span className='bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-lg font-semibold text-transparent'>
                    Targeted Search
                  </span>
                  <p className='text-xs font-medium text-teal-600'>
                    Roger Lee Cormier Portfolio
                  </p>
                </div>
              </div>
              <Badge
                variant='secondary'
                className='ml-2 border-teal-300 bg-gradient-to-r from-teal-100 to-blue-100 text-teal-700'
              >
                <Sparkles className='mr-1 size-3' />
                Semantic Search
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className='flex min-h-0 flex-1 flex-col'>
            {/* Search Input */}
            <div className='shrink-0 border-b border-teal-200 px-6 py-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-teal-500' />
                <Input
                  ref={searchInputRef}
                  type='text'
                  placeholder='Target your search across portfolio, blog, and projects...'
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className='h-10 border-teal-200 bg-white pl-10 pr-20 text-base text-gray-700 placeholder:text-teal-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className='absolute right-16 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-gray-100'
                  >
                    <X className='size-4 text-gray-400 hover:text-gray-600' />
                  </button>
                )}
                <kbd className='pointer-events-none absolute right-3 top-1/2 inline-flex h-6 -translate-y-1/2 select-none items-center gap-1 rounded border bg-gray-100 px-2 font-mono text-xs font-medium text-gray-600'>
                  <span className='text-xs'>⌘</span>K
                </kbd>
              </div>
            </div>

            {/* Search Results - Scrollable Container */}
            <div className='search-results-container min-h-0 flex-1 overflow-y-auto'>
              {!query && recentSearches.length > 0 && (
                <div className='border-b border-gray-100 p-6'>
                  <h3 className='mb-4 flex items-center gap-2 text-sm font-medium text-gray-700'>
                    <Clock className='size-4 text-gray-400' />
                    Recent Searches
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {recentSearches.map((searchTerm, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(searchTerm);
                          void performSearch(searchTerm);
                        }}
                        className='rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm'
                      >
                        {searchTerm}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query && (
                <div className='p-6'>
                  <div className='mb-6 flex items-center justify-between'>
                    <h3 className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                      <Search className='size-4 text-gray-400' />
                      Search Results
                      {results.length > 0 && (
                        <Badge
                          variant='secondary'
                          className='ml-2 border-blue-200 bg-blue-50 text-blue-700'
                        >
                          {results.length} found
                        </Badge>
                      )}
                    </h3>
                    {isSearching && (
                      <div className='flex items-center gap-2 text-sm text-gray-500'>
                        <div className='size-4 animate-spin rounded-full border-b-2 border-teal-600'></div>
                        Searching...
                      </div>
                    )}
                  </div>

                  {results.length > 0 ? (
                    <div className='space-y-4'>
                      {results.map((result, index) => {
                        const contentTypeInfo = getContentTypeInfo(
                          result.item.contentType
                        );
                        const relevanceInfo = formatRelevanceScore(
                          result.relevanceScore
                        );
                        const IconComponent = contentTypeInfo.icon;
                        const isSelected = index === selectedIndex;

                        return (
                          <div
                            key={index}
                            className={cn(
                              'group cursor-pointer rounded-xl border p-5 transition-all duration-200',
                              isSelected
                                ? 'border-teal-400 bg-gradient-to-r from-teal-50 to-blue-50 shadow-lg ring-2 ring-teal-300'
                                : 'border-teal-200 hover:border-teal-300 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-blue-50/50 hover:shadow-md'
                            )}
                            onClick={() => handleResultSelect(result)}
                          >
                            <div className='flex items-start gap-4'>
                              <div className='mt-1 shrink-0'>
                                <div
                                  className={cn(
                                    'rounded-lg p-2',
                                    contentTypeInfo.color
                                  )}
                                >
                                  <IconComponent className='size-5 text-current' />
                                </div>
                              </div>

                              <div className='min-w-0 flex-1'>
                                <div className='mb-3 flex items-center gap-3'>
                                  <h4 className='line-clamp-1 text-lg font-semibold text-gray-900 transition-all duration-200 group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent'>
                                    {result.item.title}
                                  </h4>
                                  <Badge
                                    variant='secondary'
                                    className={`px-3 py-1 text-xs ${contentTypeInfo.color}`}
                                  >
                                    {result.item.contentType}
                                  </Badge>
                                  <Badge
                                    variant='outline'
                                    className={`px-3 py-1 text-xs ${relevanceInfo.color}`}
                                  >
                                    {relevanceInfo.text}
                                  </Badge>
                                </div>

                                <p className='mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600'>
                                  {result.item.description}
                                </p>

                                {result.item.tags &&
                                  result.item.tags.length > 0 && (
                                    <div className='mt-2 flex flex-wrap gap-1.5'>
                                      {[...new Set(result.item.tags)]
                                        .slice(0, 4)
                                        .map((tag, tagIndex) => (
                                          <Badge
                                            key={tagIndex}
                                            variant='secondary'
                                            className='h-auto px-1.5 py-0.5 text-xs'
                                          >
                                            <Tag className='mr-1 size-3' />
                                            <span className='whitespace-nowrap'>
                                              {tag}
                                            </span>
                                          </Badge>
                                        ))}
                                      {result.item.tags.length > 4 && (
                                        <span className='px-2 py-1 text-xs text-gray-400 dark:text-gray-500'>
                                          +{result.item.tags.length - 4}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                <div className='flex items-center justify-between'>
                                  <div className='flex items-center gap-3 text-xs text-gray-500'>
                                    <span className='font-medium'>
                                      Relevance: {result.relevanceScore}%
                                    </span>
                                    {result.item.category && (
                                      <>
                                        <span>•</span>
                                        <span className='rounded bg-gray-100 px-2 py-1 text-gray-600'>
                                          {result.item.category}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <ExternalLink className='size-4 text-gray-400 transition-colors group-hover:text-teal-600' />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : query && !isSearching ? (
                    <div className='py-12 text-center'>
                      <Search className='mx-auto mb-4 size-16 text-gray-300' />
                      <h3 className='mb-3 text-xl font-medium text-gray-700'>
                        No results found for "{query}"
                      </h3>
                      <p className='mx-auto max-w-md text-sm text-gray-500'>
                        Try different keywords, check your spelling, or browse
                        recent searches below
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='shrink-0 border-t border-gray-100 bg-gray-50 p-4'>
              <div className='flex items-center justify-between text-xs text-gray-500'>
                <span className='flex items-center gap-2'>
                  <Command className='size-3' />
                  Powered by Fuse.js fuzzy search
                </span>
                <div className='flex items-center gap-4'>
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
  );
};

export default RedesignedSearch;
