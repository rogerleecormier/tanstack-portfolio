import Fuse from 'fuse.js'
import type { SearchItem, SearchResult } from '../types/search'
import { loadAllSearchItems } from './dynamicSearchData'

// Security utilities for input sanitization
class SecurityUtils {
  // Sanitize user input to prevent XSS
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove < and > characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .trim()
      .substring(0, 1000); // Limit input length
  }

  // Validate search query format
  static validateSearchQuery(query: string): boolean {
    if (typeof query !== 'string') return false;
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:/i,
      /vbscript:/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<form/i,
      /<input/i,
      /<textarea/i,
      /<select/i,
      /<button/i
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(query));
  }

  // Rate limiting for search requests
  private static searchAttempts = new Map<string, { count: number; lastAttempt: number }>();
  private static readonly MAX_SEARCH_ATTEMPTS = 50;
  private static readonly SEARCH_WINDOW_MS = 60000; // 1 minute
  
  static isSearchAllowed(clientId: string = 'default'): boolean {
    const now = Date.now();
    const record = this.searchAttempts.get(clientId);
    
    if (!record) {
      this.searchAttempts.set(clientId, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Reset if window has passed
    if (now - record.lastAttempt > this.SEARCH_WINDOW_MS) {
      record.count = 1;
      record.lastAttempt = now;
      return true;
    }
    
    // Increment attempt count
    record.count++;
    record.lastAttempt = now;
    
    return record.count <= this.MAX_SEARCH_ATTEMPTS;
  }
}

// (Removed unused MARKDOWN_FILES declaration)

let searchIndex: Fuse<SearchItem> | null = null
let searchData: SearchItem[] = []

// Initialize search index with security
export const initializeSearchIndex = async (): Promise<void> => {
  try {
    const items: SearchItem[] = await loadAllSearchItems();
    searchData = items
    
    // Debug: Log HealthBridge item specifically (only in development)
    if (import.meta.env.DEV) {
      const healthBridgeItem = items.find(item => item.url === '/healthbridge-analysis');
      if (healthBridgeItem) {
        console.log('HealthBridge search item loaded:', {
          title: healthBridgeItem.title,
          description: healthBridgeItem.description,
          contentLength: healthBridgeItem.content?.length || 0,
          headings: healthBridgeItem.headings,
          tags: healthBridgeItem.tags,
          searchKeywords: healthBridgeItem.searchKeywords
        });
      }
    }
    
    // Configure Fuse.js search with enhanced fields and security
    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.3 },
        { name: 'description', weight: 0.25 },
        { name: 'content', weight: 0.2 },
        { name: 'headings', weight: 0.15 },
        { name: 'tags', weight: 0.1 },
        { name: 'searchKeywords', weight: 0.2 } // New field for enhanced search
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      // Add security options
      ignoreLocation: false,
      distance: 100,
      // Limit results for security
      limit: 20
    }
    
    searchIndex = new Fuse(searchData, fuseOptions)
    
    console.log(`Search index initialized with ${items.length} items`)
  } catch (error) {
    console.error('Failed to initialize search index:', error)
  }
}

// Perform search with security validation
export const performSearch = async (query: string, clientId?: string): Promise<SearchResult[]> => {
  // Security validation
  if (!SecurityUtils.validateSearchQuery(query)) {
    console.warn('Invalid search query detected:', query);
    return [];
  }
  
  // Rate limiting check
  if (!SecurityUtils.isSearchAllowed(clientId)) {
    console.warn('Search rate limit exceeded for client:', clientId);
    return [];
  }
  
  // Sanitize input
  const sanitizedQuery = SecurityUtils.sanitizeInput(query);
  
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
    console.error('Search error:', error);
    return [];
  }
}

// Get all search data (for debugging) - with security check
export const getSearchData = (): SearchItem[] => {
  // Only allow in development mode
  if (!import.meta.env.DEV) {
    console.warn('getSearchData called in production - access denied');
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
    maxSearchAttempts: SecurityUtils['MAX_SEARCH_ATTEMPTS'],
    searchWindowMs: SecurityUtils['SEARCH_WINDOW_MS']
  };
};