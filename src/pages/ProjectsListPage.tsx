import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, BarChart3, TrendingUp, Calendar, User, Briefcase } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ScrollToTop } from '@/components/ScrollToTop'
import { useEffect } from 'react'

export default function ProjectsListPage() {
  const navigate = useNavigate()

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

  const handleProjectClick = (url: string) => {
    navigate({ to: url })
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

      {/* Projects Grid - More Compact */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Featured Projects
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Each project represents real-world challenges, analytical insights, and practical solutions 
              that drive business value and operational excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Project Method Analysis - More Compact */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 flex flex-col h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300 text-xs">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Analytics
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">2025</span>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Project Method Analysis
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Comprehensive analysis of 4,000+ project records comparing Agile vs. Non-Agile methodologies 
                  across budget tiers and complexity metrics.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col h-full pt-0">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant="secondary" className="bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 text-xs px-2 py-0.5">
                    Budget Analysis
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs px-2 py-0.5">
                    Risk Analysis
                  </Badge>
                  <Badge variant="secondary" className="bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 text-xs px-2 py-0.5">
                    ANOVA Testing
                  </Badge>
                </div>
                
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>4,000+ Records</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span>Roger Cormier</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleProjectClick('/projects/project-analysis')}
                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white border-0 group-hover:shadow-lg transition-all duration-300 text-sm py-2"
                  >
                    View Project
                    <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
                        </Card>

            {/* HealthBridge Enhanced - NEW */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 flex flex-col h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Health Analytics
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">2025</span>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  HealthBridge Enhanced
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Advanced weight loss journey analysis with medication tracking, predictive modeling, 
                  and personalized insights for optimal health outcomes.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col h-full pt-0">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs px-2 py-0.5">
                    Predictive Analytics
                  </Badge>
                  <Badge variant="secondary" className="bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 text-xs px-2 py-0.5">
                    Medication Tracking
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs px-2 py-0.5">
                    Weight Projections
                  </Badge>
                </div>
                
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Personal Journey</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span>Roger Cormier</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleProjectClick('/projects/healthbridge-enhanced')}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0 group-hover:shadow-lg transition-all duration-300 text-sm py-2"
                  >
                    View Project
                    <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

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
        </div>
      </div>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
