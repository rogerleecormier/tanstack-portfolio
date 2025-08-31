import React, { useState } from 'react'
import ContentCreationStudio from '@/components/ContentCreationStudio'
import { FrontmatterData } from '@/components/FrontmatterManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Briefcase, 
  FolderOpen, 
  Code, 
  BarChart3, 
  Table,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'

interface ContentData {
  html: string
  markdown: string
  frontmatter: FrontmatterData
}

const ContentStudioDemo: React.FC = () => {
  const [blogContent, setBlogContent] = useState<ContentData>({
    html: '<h1>Welcome to My Blog</h1><p>This is a sample blog post created with the Content Creation Studio.</p>',
    markdown: '# Welcome to My Blog\n\nThis is a sample blog post created with the Content Creation Studio.',
    frontmatter: {
      title: 'Welcome to My Blog',
      description: 'A sample blog post showcasing the Content Creation Studio',
      author: 'Roger Lee Cormier',
      tags: ['demo', 'content-creation'],
      keywords: ['blog', 'demo', 'content'],
      date: new Date().toISOString().split('T')[0]
    }
  })

  const [portfolioContent, setPortfolioContent] = useState<ContentData>({
    html: '<h1>Portfolio Project</h1><p>This is a sample portfolio project showcasing my work.</p>',
    markdown: '# Portfolio Project\n\nThis is a sample portfolio project showcasing my work.',
    frontmatter: {
      title: 'Portfolio Project',
      description: 'A sample portfolio project created with the Content Creation Studio',
      author: 'Roger Lee Cormier',
      tags: ['portfolio', 'project'],
      keywords: ['portfolio', 'project', 'demo'],
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      technologies: ['React', 'TypeScript', 'Tailwind CSS']
    }
  })

  const [projectContent, setProjectContent] = useState<ContentData>({
    html: '<h1>Project Documentation</h1><p>This is a sample project with detailed documentation.</p>',
    markdown: '# Project Documentation\n\nThis is a sample project with detailed documentation.',
    frontmatter: {
      title: 'Project Documentation',
      description: 'A sample project with comprehensive documentation',
      author: 'Roger Lee Cormier',
      tags: ['project', 'documentation'],
      keywords: ['project', 'docs', 'demo'],
      date: new Date().toISOString().split('T')[0],
      status: 'in-progress',
      technologies: ['Next.js', 'TypeScript', 'Shadcn UI']
    }
  })

  const [showPreview, setShowPreview] = useState(true)

  const handleBlogChange = (html: string, markdown: string, frontmatter: FrontmatterData) => {
    setBlogContent({ html, markdown, frontmatter })
  }

  const handlePortfolioChange = (html: string, markdown: string, frontmatter: FrontmatterData) => {
    setPortfolioContent({ html, markdown, frontmatter })
  }

  const handleProjectChange = (html: string, markdown: string, frontmatter: FrontmatterData) => {
    setProjectContent({ html, markdown, frontmatter })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-teal-900">
            Content Creation Studio Demo
          </h1>
          <p className="text-xl text-teal-700 max-w-3xl mx-auto">
            Experience the power of dual HTML/Markdown editing with advanced features including 
            tables, charts, and smart frontmatter management.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-teal-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle className="text-teal-900">Dual Mode Editing</CardTitle>
              <CardDescription>
                Switch seamlessly between HTML and Markdown views
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Table className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-blue-900">Rich Tables</CardTitle>
              <CardDescription>
                Create interactive tables with rich text formatting
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-teal-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle className="text-teal-900">Chart Creation</CardTitle>
              <CardDescription>
                Build interactive charts with JSON data
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Content Type Tabs */}
        <Tabs value="blog" onValueChange={() => {}} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-teal-200">
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Blog Post
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Project
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blog" className="space-y-4">
            <Card className="border-teal-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-900">
                  <FileText className="w-5 h-5" />
                  Blog Post Editor
                </CardTitle>
                <CardDescription>
                  Create and edit blog posts with rich content, tables, and charts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentCreationStudio
                  initialContent={blogContent.html}
                  initialFrontmatter={blogContent.frontmatter}
                  contentType="blog"
                  showPreview={showPreview}
                  onContentChange={handleBlogChange}
                  className="min-h-[600px]"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <Card className="border-blue-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Briefcase className="w-5 h-5" />
                  Portfolio Project Editor
                </CardTitle>
                <CardDescription>
                  Showcase your work with detailed project descriptions and visual elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentCreationStudio
                  initialContent={portfolioContent.html}
                  initialFrontmatter={portfolioContent.frontmatter}
                  contentType="portfolio"
                  showPreview={showPreview}
                  onContentChange={handlePortfolioChange}
                  className="min-h-[600px]"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="project" className="space-y-4">
            <Card className="border-teal-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-900">
                  <FolderOpen className="w-5 h-5" />
                  Project Documentation Editor
                </CardTitle>
                <CardDescription>
                  Create comprehensive project documentation with technical details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentCreationStudio
                  initialContent={projectContent.html}
                  initialFrontmatter={projectContent.frontmatter}
                  contentType="project"
                  showPreview={showPreview}
                  onContentChange={handleProjectChange}
                  className="min-h-[600px]"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Content Output Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HTML Output */}
          <Card className="border-teal-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-900">
                <Code className="w-5 h-5" />
                HTML Output
              </CardTitle>
              <CardDescription>
                The rendered HTML content from the editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {blogContent.html}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Markdown Output */}
          <Card className="border-blue-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <FileText className="w-5 h-5" />
                Markdown Output
              </CardTitle>
              <CardDescription>
                The markdown content from the editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {blogContent.markdown}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Frontmatter Display */}
        <Card className="border-teal-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-teal-900">
              <Settings className="w-5 h-5" />
              Frontmatter Data
            </CardTitle>
            <CardDescription>
              Metadata automatically generated and managed by the studio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(blogContent.frontmatter).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="text-sm text-gray-900">
                      {Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-1">
                          {value.map((item, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span>{String(value)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card className="border-teal-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-teal-900">Keyboard Shortcuts</CardTitle>
            <CardDescription>
              Quick access to common features in the Content Creation Studio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Insert Table</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                    Ctrl/Cmd + T
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Insert Chart</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                    Ctrl/Cmd + Shift + C
                  </kbd>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Undo</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                    Ctrl/Cmd + Z
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Redo</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                    Ctrl/Cmd + Y
                  </kbd>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ContentStudioDemo