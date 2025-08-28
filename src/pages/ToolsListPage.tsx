import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wrench, ArrowRight, Code, FileText, Palette, Database, BarChart3, Settings } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { H1, H2, H3, P } from '@/components/ui/typography'

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
    description: 'A rich text editor for creating and editing markdown content with real-time preview and syntax highlighting.',
    category: 'Content Creation',
    icon: FileText,
    url: '/tools/markdown-editor',
    features: ['Rich text editing', 'Real-time markdown generation', 'Syntax highlighting', 'Export functionality'],
    status: 'active'
  },
  {
    id: 'code-generator',
    title: 'Code Generator',
    description: 'Generate boilerplate code, components, and utilities for various programming languages and frameworks.',
    category: 'Development',
    icon: Code,
    url: '/tools/code-generator',
    features: ['Multiple languages', 'Framework templates', 'Customizable output', 'Copy to clipboard'],
    status: 'coming-soon'
  },
  {
    id: 'design-tools',
    title: 'Design Tools',
    description: 'Collection of design utilities including color palettes, typography scales, and layout generators.',
    category: 'Design',
    icon: Palette,
    url: '/tools/design',
    features: ['Color schemes', 'Typography scales', 'Layout grids', 'Asset management'],
    status: 'beta'
  },
  {
    id: 'data-analyzer',
    title: 'Data Analyzer',
    description: 'Upload and analyze data files with built-in visualization tools and statistical insights.',
    category: 'Analytics',
    icon: BarChart3,
    url: '/tools/data-analyzer',
    features: ['File upload', 'Data visualization', 'Statistical analysis', 'Export reports'],
    status: 'coming-soon'
  },
  {
    id: 'database-tools',
    title: 'Database Tools',
    description: 'Database management utilities including query builders, schema designers, and migration tools.',
    category: 'Development',
    icon: Database,
    url: '/tools/database',
    features: ['Query builder', 'Schema designer', 'Migration tools', 'Performance analysis'],
    status: 'coming-soon'
  },
  {
    id: 'system-utilities',
    title: 'System Utilities',
    description: 'System administration tools for monitoring, configuration, and maintenance tasks.',
    category: 'Administration',
    icon: Settings,
    url: '/tools/system',
    features: ['System monitoring', 'Configuration management', 'Maintenance tools', 'Log analysis'],
    status: 'coming-soon'
  }
]

const ToolsListPage: React.FC = () => {
  const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-teal-600 hover:bg-teal-700 text-white">Active</Badge>
      case 'beta':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Beta</Badge>
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
      case 'Development':
        return <Code className="h-5 w-5" />
      case 'Design':
        return <Palette className="h-5 w-5" />
      case 'Analytics':
        return <BarChart3 className="h-5 w-5" />
      case 'Administration':
        return <Settings className="h-5 w-5" />
      default:
        return <Wrench className="h-5 w-5" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Wrench className="h-6 w-6 text-teal-600" />
            </div>
            <H1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Professional Tools
            </H1>
          </div>
          <P className="text-sm lg:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Strategic utilities and professional tools to enhance your workflow and productivity
          </P>
        </div>
      </div>

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
                <H3 className="text-sm font-semibold text-gray-700 mb-2">Key Features:</H3>
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
                ) : (
                  <Button disabled size="sm" variant="outline">
                    {tool.status === 'beta' ? 'Try Beta' : 'Coming Soon'}
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
  )
}

export default ToolsListPage
