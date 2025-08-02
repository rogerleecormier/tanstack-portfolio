import React, { useState, useRef, useEffect } from 'react'
import { Search as SearchIcon, ArrowRight } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useRouter } from '@tanstack/react-router'
import { performSearch, highlightText } from '../utils/searchIndex'
import type { SearchItem } from '../types/search'

export default function Search() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Keyboard shortcuts
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault()
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  })

  useHotkeys('escape', () => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    setSelectedIndex(0)
  }, { enabled: isOpen })

  // Handle search
  useEffect(() => {
    const searchResults = performSearch(query)
    setResults(searchResults)
    setSelectedIndex(0)
  }, [query])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setQuery('')
        setResults([])
        setSelectedIndex(0)
        break
      case 'ArrowDown':
        if (results.length > 0) {
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        }
        break
      case 'ArrowUp':
        if (results.length > 0) {
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
        }
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          navigateToResult(results[selectedIndex].item)
        }
        break
    }
  }

  // Navigate to selected result
  const navigateToResult = (item: SearchItem) => {
    router.navigate({ to: item.url })
    setIsOpen(false)
    setQuery('')
    setResults([])
    setSelectedIndex(0)
  }

  // Close popup when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2 text-teal-100 hover:text-white transition-colors border border-teal-500 rounded-md hover:border-teal-400 w-auto min-w-[200px] sm:min-w-[250px] md:min-w-[300px] lg:min-w-[350px] max-w-[400px]"
      >
        <SearchIcon className="h-4 w-4 flex-shrink-0" />
        <span className="hidden xs:inline text-sm md:text-base">Search</span>
        <div className="flex-1"></div>
        <kbd className="hidden lg:inline-flex items-center px-2 py-1 text-xs font-mono bg-teal-700 text-teal-100 rounded">
          ⌘K
        </kbd>
      </button>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-none sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl border border-gray-200 mt-2 sm:mt-4 max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <SearchIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 mr-2 sm:mr-4 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 outline-none text-base sm:text-lg lg:text-xl bg-transparent placeholder-gray-500 focus:placeholder-gray-400 py-1 sm:py-2 min-w-0"
            autoFocus
          />
          <kbd className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-mono bg-gray-200 text-gray-600 rounded ml-2 sm:ml-4 border border-gray-300 flex-shrink-0">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={result.item.id}
                className={`flex items-start sm:items-center justify-between p-3 sm:p-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                  index === selectedIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => navigateToResult(result.item)}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded border border-blue-200 flex-shrink-0">
                      {result.item.section}
                    </span>
                    {result.score && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {Math.round((1 - result.score) * 100)}% match
                      </span>
                    )}
                  </div>
                  <h3 
                    className="font-medium text-gray-900 text-sm sm:text-base break-words"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(result.item.title, result.matches)
                    }}
                  />
                  <p 
                    className="text-xs sm:text-sm text-gray-600 mt-1 break-words line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        result.item.content.slice(0, 100) + '...',
                        result.matches
                      )
                    }}
                  />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {query.length >= 2 && results.length === 0 && (
          <div className="p-4 sm:p-6 md:p-8 text-center text-gray-500">
            <SearchIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm sm:text-base break-words">No results found for "{query}"</p>
          </div>
        )}

        {/* Search Tips */}
        {query.length === 0 && (
          <div className="p-3 sm:p-4 text-xs sm:text-sm text-gray-500 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <p className="mb-2 sm:mb-3">Start typing to search through documentation...</p>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs">
              <span><kbd className="bg-white px-1 sm:px-1.5 py-0.5 rounded border border-gray-300">↑↓</kbd> Navigate</span>
              <span><kbd className="bg-white px-1 sm:px-1.5 py-0.5 rounded border border-gray-300">Enter</kbd> Select</span>
              <span><kbd className="bg-white px-1 sm:px-1.5 py-0.5 rounded border border-gray-300">Esc</kbd> Close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}