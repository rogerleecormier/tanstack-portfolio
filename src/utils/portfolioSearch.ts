import Fuse from 'fuse.js'
import { PortfolioItem } from './portfolioUtils'

export interface SearchResult {
  item: PortfolioItem
  refIndex: number
  score: number
}

export class PortfolioSearch {
  private fuse: Fuse<PortfolioItem>
  private items: PortfolioItem[]

  constructor(items: PortfolioItem[]) {
    this.items = items
    const options = {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'category', weight: 0.1 }
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true
    }

    this.fuse = new Fuse(items, options)
  }

  search(query: string): SearchResult[] {
    if (!query.trim()) {
      return []
    }

    const results = this.fuse.search(query)
    return results.map(result => ({
      item: result.item,
      refIndex: result.refIndex,
      score: result.score || 0
    }))
  }

  searchByCategory(category: string): PortfolioItem[] {
    return this.items.filter(item => 
      item.category.toLowerCase().includes(category.toLowerCase())
    )
  }

  searchByTags(tags: string[]): PortfolioItem[] {
    const tagSet = new Set(tags.map(tag => tag.toLowerCase()))
    return this.items.filter(item => 
      item.tags.some(tag => tagSet.has(tag.toLowerCase()))
    )
  }

  getAllItems(): PortfolioItem[] {
    return this.items
  }
}
