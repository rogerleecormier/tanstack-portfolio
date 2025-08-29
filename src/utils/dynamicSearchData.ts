import { convertMarkdownToSearchItems } from './markdownContentExtractor'
import type { SearchItem } from '../types/search'
import { logger } from './logger'

// This will be populated by the build process or at runtime
let cachedSearchItems: SearchItem[] = []

// Function to load markdown files dynamically
export const loadMarkdownFiles = async (): Promise<SearchItem[]> => {
  logger.debug('loadMarkdownFiles called')
  
  if (cachedSearchItems.length > 0) {
    return cachedSearchItems
  }

  // Only load markdown files at runtime, not during build
  if (typeof window === 'undefined') {
    logger.debug('Markdown loading skipped during build/SSR')
    const { searchData } = await import('./searchData')
    // Filter out About page from static data
    cachedSearchItems = searchData.filter(item => 
      item.url !== '/' && 
      item.url !== '/about' && 
      item.id !== 'about'
    )
    return cachedSearchItems
  }

  try {
    // Use Vite's glob import to get all markdown files from src/content
    const markdownModules = import.meta.glob('/src/content/**/*.md', { 
      query: '?raw', 
      import: 'default' 
    })
    logger.debug('Found markdown modules:', Object.keys(markdownModules))
    
    // If no markdown files found, fall back to static data immediately
    if (Object.keys(markdownModules).length === 0) {
      logger.debug('No markdown files found, using static data')
      const { searchData } = await import('./searchData')
      // Filter out About page from static data
      cachedSearchItems = searchData.filter(item => 
        item.url !== '/' && 
        item.url !== '/about' && 
        item.id !== 'about'
      )
      return cachedSearchItems
    }
    
    const markdownFiles = await Promise.all(
      Object.entries(markdownModules).map(async ([path, importFn]) => ({
        path,
        content: await importFn() as string
      }))
    )

    logger.debug('Loaded markdown files:', markdownFiles.length)
    const searchItems = convertMarkdownToSearchItems(markdownFiles)
    
    // Filter out the About page (homepage) from search results
    cachedSearchItems = searchItems.filter(item => 
      item.url !== '/' && 
      item.url !== '/about' && 
      item.id !== 'about'
    )
    
    logger.debug(`Converted search items: ${searchItems.length}, Filtered: ${cachedSearchItems.length} (excluded About page)`)
    return cachedSearchItems
  } catch (error) {
    logger.error('Error loading markdown files:', error)
    
    // Fallback to static data if dynamic loading fails
    const { searchData } = await import('./searchData')
    // Filter out About page from static data too
    cachedSearchItems = searchData.filter(item => 
      item.url !== '/' && 
      item.url !== '/about' && 
      item.id !== 'about'
    )
    return cachedSearchItems
  }
}

// Enhanced function to extract searchable content from React components
const extractComponentContent = (content: string, filename: string): Partial<SearchItem> => {
  // Extract JSDoc comments and other meaningful content
  const jsDocMatch = content.match(/\/\*\*[\s\S]*?\*\//g);
  const descriptionMatch = content.match(/@description\s+(.+)/);
  const featuresMatch = content.match(/@features\s+([\s\S]*?)(?=\n\s*\*\s*@|\n\s*$|\*\/)/);
  const searchKeywordsMatch = content.match(/@searchKeywords\s+([\s\S]*?)(?=\n\s*\*\s*@|\n\s*$|\*\/)/);
  const searchTagsMatch = content.match(/@searchTags\s+\[([\s\S]*?)\]/);
  // const searchSectionMatch = content.match(/@searchSection\s+"([^"]+)"/); // Unused for now
  const searchDescriptionMatch = content.match(/@searchDescription\s+"([^"]+)"/);
  
  // Extract component descriptions from JSX comments or text content
  const jsxComments = content.match(/\/\*[\s\S]*?\*\//g) || [];
  const textContent = content.match(/>([^<>{}\n]+)</g) || [];
  
  // Clean and combine extracted content for search
  const cleanJsDoc = (jsDocMatch || []).map(doc => 
    doc.replace(/\/\*\*|\*\//g, '') // Remove JSDoc markers
      .replace(/@\w+\s+/g, '') // Remove @tags
      .replace(/\*\s*/g, '') // Remove asterisks
      .replace(/\n\s*/g, ' ') // Convert newlines to spaces
      .trim()
  );
  
  const cleanJsxComments = (jsxComments || []).map(comment => 
    comment.replace(/\/\*|\*\//g, '').trim()
  );
  
  const cleanTextContent = (textContent || []).map(text => 
    text.replace(/[<>]/g, '').trim()
  ).filter(text => 
    text.length > 3 && // Filter out very short text
    !text.includes('{') && // Filter out code snippets
    !text.includes('}') && 
    !text.includes('@') && // Filter out JSDoc syntax
    !text.includes('filteredData') && // Filter out specific code references
    !text.includes('metrics') && 
    !text.includes('length') &&
    !text.includes('> 0')
  );
  
  // Combine all cleaned content for search
  const extractedContent = [
    ...cleanJsDoc,
    ...cleanJsxComments,
    ...cleanTextContent
  ].join(' ');
  
  // Extract headings from component content (looking for H1, H2, etc.)
  const headingMatches = content.match(/<H[1-6][^>]*>([^<]+)<\/H[1-6]>/g) || [];
  const headings = headingMatches
    .map(h => h.replace(/<[^>]*>/g, '').trim())
    .filter(h => h.length > 0 && !h.includes('{') && !h.includes('}')) // Filter out code snippets
    .filter(h => h.length < 100); // Filter out very long headings
  
  // Extract tags from JSDoc or content
  let tags: string[] = [];
  if (searchTagsMatch) {
    try {
      tags = JSON.parse(`[${searchTagsMatch[1]}]`);
    } catch {
      // Fallback: extract individual tags
      tags = searchTagsMatch[1].split(',').map(t => t.trim().replace(/"/g, ''));
    }
  }
  
  // Generate description from various sources
  let description = '';
  if (searchDescriptionMatch) {
    description = searchDescriptionMatch[1];
  } else if (descriptionMatch) {
    description = descriptionMatch[1];
  } else if (featuresMatch) {
    description = featuresMatch[1].replace(/\n\s*\*\s*/g, ' ').trim();
  } else {
    // Fallback: use first meaningful text content
    const firstText = cleanTextContent[0];
    if (firstText && firstText.length > 20) {
      description = firstText.substring(0, 150) + '...';
    }
  }
  
  // Generate search keywords
  let searchKeywords: string[] = [];
  if (searchKeywordsMatch) {
    searchKeywords = searchKeywordsMatch[1]
      .split('\n')
      .map(line => line.replace(/\*\s*/, '').trim())
      .filter(line => line.length > 0);
  }
  
  // Create a clean, readable content summary for search
  const cleanContent = [
    // Include clean description
    description,
    // Include clean headings (limited to first few)
    ...headings.slice(0, 5),
    // Include clean features (without JSDoc syntax)
    ...(featuresMatch ? [featuresMatch[1].replace(/\n\s*\*\s*/g, ' ').trim()] : []),
    // Include clean search keywords (limited)
    ...searchKeywords.slice(0, 10)
  ].filter(Boolean).join(' ');
  
  // Debug output for HealthBridge specifically
  if (filename.toLowerCase() === 'healthbridge') {
    logger.debug('HealthBridge content extraction:', {
      hasJsDoc: !!jsDocMatch,
      hasDescription: !!description,
      hasFeatures: !!featuresMatch,
      hasSearchKeywords: !!searchKeywordsMatch,
      hasSearchTags: !!searchTagsMatch,
      hasSearchDescription: !!searchDescriptionMatch,
      cleanContentLength: cleanContent.length,
      headingsCount: headings.length,
      tagsCount: tags.length,
      extractedContentLength: extractedContent.length
    });
  }
  
  return {
    content: cleanContent, // Use clean content instead of raw extracted content
    description,
    headings,
    tags,
    searchKeywords: searchKeywords.join(' ')
  };
};

// Enhanced function to load TSX pages dynamically with rich content extraction
export const loadTsxPages = async (): Promise<SearchItem[]> => {
  try {
    const tsxModules = import.meta.glob('/src/pages/**/*.tsx', { 
      query: '?raw', 
      import: 'default' 
    });
    
    const tsxFiles = await Promise.all(
      Object.entries(tsxModules).map(async ([path, importFn]) => {
        const filename = path.split('/').pop()?.replace('.tsx', '') || 'page';
        const content = await importFn() as string;
        
        // Map filename to route
        let url = `/${filename.toLowerCase()}`;
        if (filename.toLowerCase() === 'healthbridge') {
          url = '/healthbridge-analysis';
        }
        
        // Extract rich content from the component
        const extractedContent = extractComponentContent(content, filename);
        
        // Generate meaningful title
        let title = filename.charAt(0).toUpperCase() + filename.slice(1);
        if (filename.toLowerCase() === 'healthbridge') {
          title = 'HealthBridge Weight Analysis';
        } else if (filename.toLowerCase() === 'markdownpage') {
          title = 'Markdown Content';
        } else if (filename.toLowerCase() === 'notfound') {
          title = 'Page Not Found';
        }
        
        // Determine section based on filename
        let section = 'Pages';
        if (filename.toLowerCase() === 'healthbridge') {
          section = 'Health Analysis';
        } else if (filename.toLowerCase() === 'markdownpage') {
          section = 'Content';
        }
        
        return {
          id: `page-${filename}`,
          title,
          content: extractedContent.content || '',
          description: extractedContent.description || '',
          url,
          section,
          headings: extractedContent.headings || [],
          tags: extractedContent.tags || [],
          searchKeywords: extractedContent.searchKeywords || '',
          contentType: 'page' as const
        };
      })
    );
    
    logger.debug('Loaded TSX pages with enhanced content:', tsxFiles.length);
    return tsxFiles;
  } catch (error) {
    logger.error('Error loading TSX pages:', error);
    return [];
  }
};

// Function to refresh the search index (useful for development)
export const refreshSearchIndex = async (): Promise<SearchItem[]> => {
  cachedSearchItems = []
  return loadMarkdownFiles()
}

// New function to load all search items (markdown + TSX)
export const loadAllSearchItems = async (): Promise<SearchItem[]> => {
  const markdownItems = await loadMarkdownFiles();
  const tsxItems = await loadTsxPages();
  return [...markdownItems, ...tsxItems];
};