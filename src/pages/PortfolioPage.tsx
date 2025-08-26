import React, { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Briefcase,
  ArrowRight,
  FileText,
  Search,
  X
} from 'lucide-react'
import { loadPortfolioItems, PortfolioItem, getCategoryColors } from '@/utils/portfolioUtils'
import { PortfolioSearch } from '@/utils/portfolioSearch'

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [portfolioSearch, setPortfolioSearch] = useState<PortfolioSearch | null>(null)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Load portfolio items on component mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true)
        const items = await loadPortfolioItems()
        setPortfolioItems(items)
        
        // Initialize search
        const search = new PortfolioSearch(items)
        setPortfolioSearch(search)
      } catch (error) {
        console.error('Error loading portfolio items:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [])

  // Handle search
  useEffect(() => {
    if (portfolioSearch && searchQuery.trim()) {
      const results = portfolioSearch.search(searchQuery)
      setSearchResults(results.map(r => r.item))
    } else {
      setSearchResults([])
    }
  }, [searchQuery, portfolioSearch])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Professional Solutions
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Comprehensive solutions across strategy, technology, leadership, and operations. 
          Each area represents deep expertise and proven results in helping organizations achieve their goals.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search solutions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchQuery && (
          <div className="text-center mt-2 text-sm text-gray-500">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-6 h-6 text-teal-600" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Search Results
            </h2>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchResults.map((item) => (
                <PortfolioCard key={item.url} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or browse all solutions below.
              </p>
            </div>
          )}
        </div>
      )}

      {/* All Portfolio Items in 4-column Grid */}
      {!searchQuery.trim() && (
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-6 h-6 text-teal-600" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Professional Solutions
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolioItems.map((item) => (
              <PortfolioCard key={item.url} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <Card className="text-center">
          <CardContent className="py-8">
            <Briefcase className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Ready to Transform Your Organization?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Whether you need strategic guidance, technology implementation, or organizational transformation, 
              I'm here to help you achieve your goals with proven methodologies and measurable results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                Get in Touch
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-teal-700 border border-teal-300 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <FileText className="h-4 w-4" />
                Read My Blog
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Portfolio Card Component
interface PortfolioCardProps {
  item: PortfolioItem
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ item }) => {
  const categoryColors = getCategoryColors()
  const categoryColor = categoryColors[item.category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900">
            <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <Badge className={categoryColor}>
            {item.category}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight group-hover:text-teal-600 transition-colors">
          <Link to={`/${item.url}`} className="hover:no-underline">
            {item.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {item.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto">
          <Link 
            to={`/${item.url}`}
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors group-hover:underline"
          >
            Learn More
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
