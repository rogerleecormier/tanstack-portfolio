import { convertMarkdownToSearchItems } from './markdownContentExtractor'
import type { SearchItem } from '../types/search'

// This will be populated by the build process or at runtime
let cachedSearchItems: SearchItem[] = []

// Function to load markdown files dynamically
export const loadMarkdownFiles = async (): Promise<SearchItem[]> => {
  console.log('loadMarkdownFiles called')
  
  if (cachedSearchItems.length > 0) {
    return cachedSearchItems
  }

  try {
    // Use Vite's glob import to get all markdown files from src/content
    const markdownModules = import.meta.glob('/src/content/**/*.md', { 
      query: '?raw', 
      import: 'default' 
    })
    console.log('Found markdown modules:', Object.keys(markdownModules))
    
    // If no markdown files found, fall back to static data immediately
    if (Object.keys(markdownModules).length === 0) {
      console.log('No markdown files found, using static data')
      const { searchData } = await import('./searchData')
      cachedSearchItems = searchData
      return searchData
    }
    
    const markdownFiles = await Promise.all(
      Object.entries(markdownModules).map(async ([path, importFn]) => ({
        path,
        content: await importFn() as string
      }))
    )

    console.log('Loaded markdown files:', markdownFiles.length)
    cachedSearchItems = convertMarkdownToSearchItems(markdownFiles)
    console.log('Converted search items:', cachedSearchItems)
    return cachedSearchItems
  } catch (error) {
    console.error('Error loading markdown files:', error)
    
    // Fallback to static data if dynamic loading fails
    const { searchData } = await import('./searchData')
    cachedSearchItems = searchData
    return searchData
  }
}

// Function to refresh the search index (useful for development)
export const refreshSearchIndex = async (): Promise<SearchItem[]> => {
  cachedSearchItems = []
  return loadMarkdownFiles()
}