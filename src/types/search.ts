export interface SearchItem {
  id: string
  title: string
  content: string
  url: string
  section: string
  headings?: string[]
  tags?: string[]
}

export interface SearchResult {
  item: SearchItem
  score?: number
  matches?: Array<{
    key: string
    indices: [number, number][]
  }>
}