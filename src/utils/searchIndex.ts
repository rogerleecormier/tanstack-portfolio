import Fuse from 'fuse.js'
import type { SearchItem, SearchResult } from '../types/search'
import { loadAllSearchItems } from './dynamicSearchData'

// (Removed unused MARKDOWN_FILES declaration)

let searchIndex: Fuse<SearchItem> | null = null
let searchData: SearchItem[] = []

// Initialize search index
export const initializeSearchIndex = async (): Promise<void> => {
  try {
    const items: SearchItem[] = await loadAllSearchItems();
    searchData = items
    
    // Configure Fuse.js search
    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.3 },
        { name: 'description', weight: 0.25 },
        { name: 'content', weight: 0.2 },
        { name: 'headings', weight: 0.15 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2
    }
    
    searchIndex = new Fuse(searchData, fuseOptions)
    
    console.log(`Search index initialized with ${items.length} items`)
  } catch (error) {
    console.error('Failed to initialize search index:', error)
  }
}

// Perform search
export const performSearch = async (query: string): Promise<SearchResult[]> => {
  if (!searchIndex) {
    await initializeSearchIndex()
  }
  
  if (!searchIndex || query.length < 2) {
    return []
  }
  
  const results = searchIndex.search(query)
  
  return results.map(result => ({
    item: result.item,
    score: result.score,
    matches: result.matches?.map(match => ({
      key: match.key || '',
      indices: match.indices.map(([start, end]) => [start, end] as [number, number])
    }))
  }))
}

// Get all search data (for debugging)
export const getSearchData = (): SearchItem[] => {
  return searchData
}