import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wrench, ArrowRight, Lock, TestTube } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { H1, H2, P } from '@/components/ui/typography'

interface PrivateTool {
  id: string
  title: string
  description: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  url: string
  features: string[]
  status: 'beta' | 'development'
  accessLevel: 'private'
}

const privateTools: PrivateTool[] = [
  {
    id: 'raci-builder',
    title: 'RACI Chart Builder',
    description: 'Create professional RACI matrices to define roles and responsibilities for your projects. Generate interactive tables and exportable Mermaid diagrams.',
    category: 'Project Management',
    icon: Wrench,
    url: '/tools/raci-builder',
    features: ['Role Assignment', 'Matrix Generation', 'Mermaid Diagrams', 'Export Options'],
    status: 'development' as const,
    accessLevel: 'private' as const,
  },
  {
    id: 'priority-matrix',
    title: 'Priority Matrix Generator',
    description: 'Prioritize your tasks using the Eisenhower Matrix based on importance and urgency. Visualize quadrants and export to XLSX for offline use.',
    category: 'Project Management',
    icon: Wrench,
    url: '/tools/priority-matrix',
    features: ['Eisenhower Matrix', 'Quadrant Visualization', 'Score-based Prioritization', 'XLSX Export'],
    status: 'development' as const,
    accessLevel: 'private' as const,
  },
  {
    id: 'gantt-builder',
    title: 'Gantt Chart Builder',
    description: 'Build project timelines with task durations and dates. Visualize with interactive Gantt charts and export to XLSX. Ready for AI-optimized scheduling.',
    category: 'Project Management',
    icon: Wrench,
    url: '/tools/gantt-chart',
    features: ['Timeline Visualization', 'Duration Calculation', 'Date Range Support', 'XLSX Export', 'AI Ready'],
    status: 'development' as const,
    accessLevel: 'private' as const,
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment Tool',
    description: 'Assess project risks with likelihood and impact scores. Generate matrix table with risk levels and export to XLSX. Ready for AI mitigation suggestions.',
    category: 'Project Management',
    icon: Wrench,
    url: '/tools/risk-assessment',
    features: ['Risk Scoring', 'Matrix Generation', 'Level Classification', 'XLSX Export', 'AI Ready'],
    status: 'development' as const,
    accessLevel: 'private' as const,
  },
]

const PrivateToolsPage: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const getStatusBadge = (status: PrivateTool['status']) => {
    switch (status) {
      case 'beta':
        return <Badge variant="secondary" className="brand-bg-secondary text-blue-800 hover:bg-blue-200 brand-border-secondary">Beta Testing</Badge>
      case 'development':
        return <Badge variant="outline" className="border-orange-300 text-orange-600">In Development</Badge>
      default:
        return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Content Creation':
        return <Wrench className="h-5 w-5" />
      default:
        return <Wrench className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 dark:from-teal-950 dark:via-blue-950 dark:to-teal-900">
      {/* Hero Section - Compact with Private Theme */}
      <div className="relative overflow-hidden border-b border-teal-200 dark:border-teal-800">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10"></div>

        <div className="relative px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Icon and Title with Private Theme */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Lock className="h-7 w-7 text-white" />
                </div>
                {/* Private indicator dots */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <H1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl" style={{fontWeight: 700}}>
                  <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    Private Tools
                  </span>
                </H1>
                <div className="h-1 w-20 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto mt-2 rounded-full"></div>
              </div>
            </div>

            {/* Description with Private Language */}
            <P className="text-lg leading-7 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Access your private toolkit with tools currently in development and beta testing.
              <span className="font-medium text-teal-700 dark:text-teal-300"> Exclusive access </span>
              to cutting-edge utilities and experimental features.
            </P>

            {/* Quick Stats with Private Theme */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Private Access</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Early Access</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Development Tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {privateTools.map((tool) => (
          <Card key={tool.id} className="group hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                    <tool.icon className="h-6 w-6 text-teal-700" />
                  </div>
                  <div>
                    <CardTitle className="text-xl group-hover:text-gray-900 transition-colors">
                      {tool.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        {getCategoryIcon(tool.category)}
                        <span>{tool.category}</span>
                      </div>
                      {getStatusBadge(tool.status)}
                      <Badge variant="outline" className="border-red-300 text-red-600 text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <P className="text-gray-600 mb-4 leading-relaxed">
                {tool.description}
              </P>

              <div className="mb-4">
                <H2 className="text-sm font-semibold text-gray-700 mb-2">Key Features:</H2>
                <div className="flex flex-wrap gap-1">
                  {tool.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {tool.status === 'beta' ? 'Available for testing' : 'Development in progress'}
                </div>

                {tool.status === 'beta' ? (
                  <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700 text-white group-hover:bg-teal-800 transition-colors">
                    <Link to={tool.url}>
                      Try Beta
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50 group-hover:border-orange-400 transition-colors">
                    <Link to={tool.url}>
                      <TestTube className="mr-2 h-4 w-4" />
                      Test Development
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="text-center">
        <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <Wrench className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <H2 className="text-2xl font-bold text-gray-900 mb-2">More Private Tools Coming Soon</H2>
            <P className="text-gray-600 mb-4 max-w-2xl mx-auto">
              We're constantly developing new private tools and utilities. These exclusive tools are available only to authenticated users during their development phase.
            </P>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50">
                <Link to="/tools">
                  View Public Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                <Link to="/protected/content-studio">
                  Content Studio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}

export default PrivateToolsPage
