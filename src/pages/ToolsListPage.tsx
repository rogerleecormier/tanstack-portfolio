import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wrench, ArrowRight, FileText } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { H1, H2, P } from '@/components/ui/typography'

interface Tool {
  id: string
  title: string
  description: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  url: string
  features: string[]
  status: 'active' | 'beta' | 'coming-soon'
}

const tools: Tool[] = [
  {
    id: 'markdown-editor',
    title: 'Markdown Editor',
    description: 'A rich text editor for creating and editing markdown content with real-time markdown generation and syntax highlighting.',
    category: 'Content Creation',
    icon: FileText,
    url: '/markdown-editor',
    features: ['Rich text editing', 'Real-time markdown generation', 'Syntax highlighting', 'Export functionality'],
    status: 'coming-soon'
  }
]

const ToolsListPage: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-teal-600 hover:bg-teal-700 text-white">Active</Badge>
      case 'beta':
        return <Badge variant="secondary" className="brand-bg-secondary text-blue-800 hover:bg-blue-200 brand-border-secondary">Beta</Badge>
      case 'coming-soon':
        return <Badge variant="outline" className="border-gray-300 text-gray-600">Coming Soon</Badge>
      default:
        return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Content Creation':
        return <FileText className="h-5 w-5" />
      default:
        return <Wrench className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 dark:from-teal-950 dark:via-blue-950 dark:to-teal-900">
      {/* Hero Section - Compact with Targeting Theme */}
      <div className="relative overflow-hidden border-b border-teal-200 dark:border-teal-800">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10"></div>
        
        <div className="relative px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Icon and Title with Targeting Theme */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Wrench className="h-7 w-7 text-white" />
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
                <H1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl" style={{fontWeight: 700}}>
                  <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    Tools & Utilities
                  </span>
                </H1>
                <div className="h-1 w-20 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto mt-2 rounded-full"></div>
              </div>
            </div>
            
            {/* Description with Targeting Language */}
            <P className="text-lg leading-7 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Strategic utilities and professional tools to enhance your workflow and productivity.
              <span className="font-medium text-teal-700 dark:text-teal-300"> Target your efficiency </span>
              with precision-engineered solutions and strategic automation.
            </P>
            
            {/* Quick Stats with Targeting Theme */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span>Workflow Tools</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Productivity Boost</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Strategic Automation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {tools.map((tool) => (
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
                  {tool.status === 'active' ? 'Ready to use' : 
                   tool.status === 'beta' ? 'Available for testing' : 'Development in progress'}
                </div>
                
                {tool.status === 'active' ? (
                  <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700 text-white group-hover:bg-teal-800 transition-colors">
                    <Link to={tool.url}>
                      Open Tool
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : tool.status === 'beta' ? (
                  <Button disabled size="sm" variant="outline">
                    Try Beta
                  </Button>
                ) : (
                  <Button disabled size="sm" variant="outline" className="text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed">
                    Coming Soon
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* More Tools Coming Soon */}
      <div className="text-center">
        <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <Wrench className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <H2 className="text-2xl font-bold text-gray-900 mb-2">More Tools Coming Soon</H2>
            <P className="text-gray-600 mb-4 max-w-2xl mx-auto">
              We're constantly developing new tools and utilities to help streamline your workflow. 
              Have a specific tool in mind? Let us know what would be most helpful for your needs.
            </P>
            <Button asChild variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50">
              <Link to="/contact">
                Suggest a Tool
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}

export default ToolsListPage
