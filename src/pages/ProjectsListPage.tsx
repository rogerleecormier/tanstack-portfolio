import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, BarChart3, TrendingUp, Calendar, User, Briefcase, Filter, Search, X, Tag } from 'lucide-react'
import { H2, H3, P } from '@/components/ui/typography'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollToTop } from '@/components/ScrollToTop'
import { cachedContentService, type CachedContentItem } from '@/api/cachedContentService'
import { UnifiedRelatedContent } from '@/components/UnifiedRelatedContent'

export default function ProjectsListPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<CachedContentItem[]>([])
  const [filteredProjects, setFilteredProjects] = useState<CachedContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false)
  const [displayedProjects, setDisplayedProjects] = useState<CachedContentItem[]>([])
  const [projectsPerPage] = useState(6)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Update document title and meta tags
  useDocumentTitle({
    title: "Projects & Case Studies",
    description: "Explore my technical projects, case studies, and analytical work in project management, digital transformation, and data analysis.",
    keywords: ["Projects", "Case Studies", "Technical Projects", "Data Analysis", "Project Management", "Digital Transformation"],
    type: "website"
  })

  // Load projects from cache
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true)
        const loadedProjects = await cachedContentService.getContentByType('project')
        setProjects(loadedProjects)
        setFilteredProjects(loadedProjects)
      } catch (error) {
        console.error('Error loading projects:', error)
        // Fallback to empty array or handle error state
        setProjects([])
        setFilteredProjects([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  // Filter projects based on search and tags
  useEffect(() => {
    let filtered = projects

    // Filter by search query
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase()
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(project =>
        selectedTags.some(tag => project.tags.includes(tag))
      )
    }

    setFilteredProjects(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [projects, searchQuery, selectedTags])

  // Update displayed projects when filtered projects or current page changes
  useEffect(() => {
    const endIndex = currentPage * projectsPerPage
    setDisplayedProjects(filteredProjects.slice(0, endIndex))
  }, [filteredProjects, currentPage, projectsPerPage])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
  }

  // Get all unique tags from projects
  const allTags = [...new Set(filteredProjects.flatMap(project => project.tags))].sort()

  // Intersection Observer for infinite scroll
  const loadingRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry.isIntersecting && !isLoading && !isLoadingMore && displayedProjects.length < filteredProjects.length) {
            setIsLoadingMore(true)
            // Small delay to show loading state
            setTimeout(() => {
              setCurrentPage(prev => prev + 1)
              setIsLoadingMore(false)
            }, 300)
          }
        },
        {
          rootMargin: '100px', // Trigger 100px before the element comes into view
          threshold: 0.1
        }
      )
      observer.observe(node)
      return () => observer.disconnect()
    }
  }, [isLoading, isLoadingMore, displayedProjects.length, filteredProjects.length])


  const handleProjectClick = (projectId: string) => {
    navigate({ to: `/projects/${projectId}` })
  }

  // Category icons mapping
  const categoryIcons: Record<string, React.ReactNode> = {
    'Analytics': <BarChart3 className="w-3 h-3 mr-1" />,
    'Health Analytics': <TrendingUp className="w-3 h-3 mr-1" />,
    // Add more as needed based on cache categories
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-16 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>
          
          {/* Search Skeleton */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950">
      {/* Hero Section - Compact with Targeting Theme */}
      <div className="relative overflow-hidden border-b border-teal-200 dark:border-teal-800">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10"></div>
        
        <div className="relative px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Icon and Title with Targeting Theme */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-gradient-to-br from-teal-500 to-blue-600 rounded"></div>
                  </div>
                </div>
                {/* Targeting indicator dots */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl" style={{fontWeight: 700}}>
                  <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    Projects & Case Studies
                  </span>
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto mt-2 rounded-full"></div>
              </div>
            </div>
            
            {/* Description with Targeting Language */}
            <p className="text-lg leading-7 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Explore my technical projects, analytical work, and real-world case studies that demonstrate 
              expertise in project management, digital transformation, and data-driven decision making.
              <span className="font-medium text-teal-700 dark:text-teal-300"> Target your success </span>
              with proven methodologies and strategic insights.
            </p>
            
            {/* Quick Stats with Targeting Theme */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span>Technical Projects</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Case Studies</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Strategic Insights</span>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 px-3 py-1.5 text-sm">
                <BarChart3 className="w-4 h-4 mr-1.5" />
                Data Analysis
              </Badge>
              <Badge variant="secondary" className="bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 px-3 py-1.5 text-sm">
                <Briefcase className="w-4 h-4 mr-1.5" />
                Project Management
              </Badge>
              <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 px-3 py-1.5 text-sm">
                <User className="w-4 h-4 mr-1.5" />
                Digital Transformation
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-12 h-11 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                {allTags.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setIsTagFilterOpen(true)}
                    className="flex items-center gap-2 h-11 px-6 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  >
                    <Filter className="w-4 h-4" />
                    Topics {selectedTags.length > 0 && `(${selectedTags.length})`}
                  </Button>
                )}
                {(searchQuery || selectedTags.length > 0) && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex items-center gap-2 h-11 px-6 border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Selected Tags Display */}
              {selectedTags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="default"
                        className="cursor-pointer bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0"
                        onClick={() => toggleTag(tag)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tag Filter Dialog */}
          <Dialog open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filter by Topics</DialogTitle>
                <DialogDescription>
                  Select topics to filter projects. Choose multiple topics to see projects that match any of them.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 py-4">
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                      className={`justify-start text-left h-auto py-2 px-3 ${
                        selectedTags.includes(tag)
                          ? "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      }`}
                    >
                      <Tag className="w-3 h-3 mr-2 flex-shrink-0" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTags([])
                    setIsTagFilterOpen(false)
                  }}
                  className="text-gray-600 dark:text-gray-400"
                >
                  Clear All
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsTagFilterOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setIsTagFilterOpen(false)}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    Apply Filters ({selectedTags.length})
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="text-center mb-12">
            <H2 className="mb-3">
              Featured Projects
            </H2>
            <P className="max-w-2xl mx-auto">
              Each project represents real-world challenges, analytical insights, and practical solutions
              that drive business value and operational excellence. Showing {displayedProjects.length} of {filteredProjects.length} projects.
            </P>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <Card className="inline-block max-w-md">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <H3 className="mb-2">
                    No projects found
                  </H3>
                  <P>
                    {searchQuery || selectedTags.length > 0
                      ? 'Try adjusting your search or filters'
                      : 'No projects available yet'
                    }
                  </P>
                  <Button onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* All Projects Grid */}
              <div className="mb-8">
                <H2 className="mb-6 text-gray-800 dark:text-gray-200">
                  Projects
                </H2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedProjects.map((project) => {
                    const categoryIcon = categoryIcons[project.category] || <Briefcase className="w-3 h-3 mr-1" />
                    return (
                      <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 flex flex-col h-full">
                        <CardHeader className="pb-3 flex-shrink-0">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300 text-xs">
                              {categoryIcon}
                              {project.category}
                            </Badge>
                            {project.date && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(project.date).getFullYear()}</span>
                            )}
                          </div>
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {project.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {project.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="flex flex-col h-full pt-0">
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {project.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 text-xs px-2 py-0.5">
                                {tag}
                              </Badge>
                            ))}
                            {project.tags.length > 3 && (
                              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5">
                                +{project.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="mt-auto">
                            <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>{project.date ? new Date(project.date).getFullYear() : 'Ongoing'}</span>
                              </div>
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                <span>Roger Cormier</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleProjectClick(project.id)}
                              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white border-0 group-hover:shadow-lg transition-all duration-300 text-sm py-2"
                            >
                              View Project
                              <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
        
              {/* Loading indicator for infinite scroll */}
              {displayedProjects.length < filteredProjects.length && (
                <div ref={loadingRef} className="text-center py-12">
                  <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="font-medium">Loading more projects...</span>
                  </div>
                </div>
              )}
        
              {/* End of projects indicator */}
              {displayedProjects.length === filteredProjects.length && filteredProjects.length > 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    You've reached the end of all projects
                  </p>
                </div>
              )}
            </>
          )}

          {/* Methodology Section - More Compact */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/50 dark:to-blue-950/50 rounded-xl p-6 mb-12">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Analytical Approach
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                My projects follow a structured methodology combining quantitative analysis, 
                industry best practices, and practical implementation strategies.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">Data-Driven Insights</h4>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  Comprehensive data analysis using statistical methods and visualization techniques
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">Strategic Recommendations</h4>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  Actionable insights and implementation roadmaps for business impact
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">Expert Execution</h4>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  PMP-certified project management with proven delivery methodologies
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section - More Compact */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">
                Ready to Transform Your Projects?
              </h3>
              <p className="text-base text-teal-100 mb-4 max-w-2xl mx-auto">
                Let's discuss how data-driven project management and strategic analysis 
                can drive success in your organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate({ to: '/contact' })}
                  variant="secondary"
                  size="default"
                  className="bg-white text-teal-600 hover:bg-gray-100 border-0"
                >
                  Get in Touch
                </Button>
                <Button 
                  onClick={() => navigate({ to: '/portfolio' })}
                  variant="secondary"
                  size="default"
                  className="bg-white/20 text-white hover:bg-white hover:text-teal-600 border border-white/30 hover:border-white transition-all duration-300"
                >
                  View Portfolio
                </Button>
              </div>
            </div>
          </div>

          {/* Related Content */}
          <div className="mt-16 max-w-4xl mx-auto">
            <UnifiedRelatedContent
              title="Projects and Case Studies"
              tags={['projects', 'analytics', 'case studies']}
              currentUrl="/projects"
              maxResults={3}
              variant="inline"
            />
          </div>
        </div>
      </div>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
