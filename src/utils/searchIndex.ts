import Fuse from 'fuse.js'
import type { FuseResultMatch } from 'fuse.js'
import { searchData } from './searchData'

export const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'content', weight: 0.3 },
    { name: 'headings', weight: 0.2 },
    { name: 'section', weight: 0.1 }
  ],
  threshold: 0.3,
  includeMatches: true,
  includeScore: true,
  minMatchCharLength: 2
}

export const searchIndex = new Fuse(searchData, fuseOptions)

export const performSearch = (query: string, limit: number = 8) => {
  if (query.length < 2) return []
  return searchIndex.search(query).slice(0, limit)
}
export const highlightText = (text: string, matches: FuseResultMatch[] = []) => {
  if (!matches.length) return text

  const match = matches.find(m => m.key === 'title' || m.key === 'content')
  if (!match || !match.indices) return text

  let highlightedText = text
  // Sort indices in reverse order to avoid offset issues
  const sortedIndices = [...match.indices].sort((a, b) => b[0] - a[0])
  
  sortedIndices.forEach(([start, end]) => {
    const before = highlightedText.slice(0, start)
    const highlighted = highlightedText.slice(start, end + 1)
    const after = highlightedText.slice(end + 1)
    highlightedText = `${before}<mark class="bg-yellow-200 text-gray-900">${highlighted}</mark>${after}`
  })

  return highlightedText
}