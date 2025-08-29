import Fuse from 'fuse.js'
import { loadAllSearchItems } from './dynamicSearchData'
import type { SearchItem } from '../types/search'
import { logger } from './logger'

// Basic security constants
const MAX_SEARCH_ATTEMPTS = 50
const SEARCH_WINDOW_MS = 60000 // 1 minute

// Simple rate limiting for search
const searchAttempts = new Map<string, { count: number; lastAttempt: number }>()

// Basic input sanitization
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000) // Limit input length
}

// Basic search query validation
function validateSearchQuery(query: string): boolean {
  if (typeof query !== 'string') return false
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:/i,
    /vbscript:/i
  ]
  
  return !suspiciousPatterns.some(pattern => pattern.test(query))
}

// Rate limiting check
function isSearchAllowed(clientId: string = 'default'): boolean {
  const now = Date.now()
  const record = searchAttempts.get(clientId)
  
  if (!record) {
    searchAttempts.set(clientId, { count: 1, lastAttempt: now })
    return true
  }
  
  // Reset if window has passed
  if (now - record.lastAttempt > SEARCH_WINDOW_MS) {
    record.count = 1
    record.lastAttempt = now
    return true
  }
  
  // Increment attempt count
  record.count++
  record.lastAttempt = now
  
  return record.count <= MAX_SEARCH_ATTEMPTS
}

let searchIndex: Fuse<SearchItem> | null = null
let searchData: SearchItem[] = []

// Initialize search index
export const initializeSearchIndex = async (): Promise<void> => {
  try {
    const items: SearchItem[] = await loadAllSearchItems();
    searchData = items
    
    // Debug: Log HealthBridge item specifically (only in development)
    if (import.meta.env.DEV) {
      const healthBridgeItem = items.find(item => item.url === '/healthbridge-analysis');
      if (healthBridgeItem) {
        logger.debug('HealthBridge search item loaded:', {
          title: healthBridgeItem.title,
          description: healthBridgeItem.description,
          contentLength: healthBridgeItem.content?.length || 0,
          headings: healthBridgeItem.headings,
          tags: healthBridgeItem.tags,
          searchKeywords: healthBridgeItem.searchKeywords
        });
      }
    }
    
    // Configure Fuse.js search with enhanced fields
    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.3 },
        { name: 'description', weight: 0.25 },
        { name: 'content', weight: 0.2 },
        { name: 'headings', weight: 0.15 },
        { name: 'tags', weight: 0.1 },
        { name: 'searchKeywords', weight: 0.2 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: false,
      distance: 100,
      limit: 20
    }
    
    searchIndex = new Fuse(searchData, fuseOptions)
    
    logger.debug(`Search index initialized with ${items.length} items`)
  } catch (error) {
    logger.error('Failed to initialize search index:', error)
  }
}

// Perform search with basic security validation
export const performSearch = async (query: string, clientId?: string): Promise<any[]> => {
  // Security validation
  if (!validateSearchQuery(query)) {
    logger.warn('Invalid search query detected:', query);
    return [];
  }
  
  // Rate limiting check
  if (!isSearchAllowed(clientId)) {
    logger.warn('Search rate limit exceeded for client:', clientId);
    return [];
  }
  
  // Sanitize input
  const sanitizedQuery = sanitizeInput(query);
  
  if (!searchIndex) {
    await initializeSearchIndex()
  }
  
  if (!searchIndex || sanitizedQuery.length < 2) {
    return []
  }
  
  try {
    const results = searchIndex.search(sanitizedQuery)
    
    // Limit results for security
    const limitedResults = results.slice(0, 20);
    
    return limitedResults.map(result => ({
      item: result.item,
      score: result.score,
      matches: result.matches?.map(match => ({
        key: match.key || '',
        indices: match.indices.map(([start, end]) => [start, end] as [number, number])
      }))
    }))
  } catch (error) {
    logger.error('Search error:', error);
    return [];
  }
}

// Get all search data (for debugging) - with security check
export const getSearchData = (): SearchItem[] => {
  // Only allow in development mode
  if (!import.meta.env.DEV) {
    logger.warn('getSearchData called in production - access denied');
    return [];
  }
  return searchData
}

// Security status for search system
export const getSearchSecurityStatus = () => {
  return {
    isInitialized: !!searchIndex,
    totalItems: searchData.length,
    rateLimitEnabled: true,
    maxSearchAttempts: MAX_SEARCH_ATTEMPTS,
    searchWindowMs: SEARCH_WINDOW_MS
  };
};