import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

import { 
  ArrowRight, 
  BarChart3, 
  User, 
  Briefcase,
  BookOpen,
  Wrench,
  MessageSquare,
  Target,
  Globe,
  Database,
  Brain
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useEffect, useState } from 'react'

// Types for blog, projects, and tools data
interface BlogPost {
  id: string
  title: string
  description: string
  date: string
  tags: string[]
  category: string
  url: string
}

interface ProjectItem {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
}

interface ToolItem {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
}

export default function IndexPage() {
  const navigate = useNavigate()
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([])
  const [featuredWork, setFeaturedWork] = useState<(ProjectItem | ToolItem)[]>([])

  // Update document title and meta tags
  useDocumentTitle({
    title: "Roger Cormier - Digital Transformation & Technical Leadership",
    description: "Technical Project Manager specializing in ERP, SaaS integration, AI automation, and digital transformation. PMP-certified leader driving organizational excellence through strategic technology implementation.",
    keywords: ["Digital Transformation", "Technical Leadership", "ERP Integration", "AI Automation", "Project Management", "SaaS Integration", "NetSuite", "Ramp", "Cloudflare"],
    type: "website"
  })

  // Load recent blog posts and featured work (projects + tools)
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Load content cache
        const response = await fetch('/src/data/content-cache.json')
        const data = await response.json()
        
        // Get recent blog posts (sorted by date, most recent first)
        const blogs = data.blog || []
        const sortedBlogs = blogs
          .sort((a: BlogPost, b: BlogPost) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 6) // Get 6 most recent
        
        setRecentBlogs(sortedBlogs)
        
        // Get featured work from projects and tools
        const projects = data.projects || []
        const tools = data.tools || []
        
        // Create a HealthBridge project entry since it's a project, not a portfolio item
        const healthBridgeProject = {
          id: 'healthbridge-enhanced',
          title: 'HealthBridge Enhanced',
          description: 'Health tracking and analytics platform with weight management, medication tracking, and predictive regression analysis for goal targeting.',
          tags: ['Health Analytics', 'Weight Tracking', 'Medication Management', 'Regression Analysis', 'Predictive Modeling', 'Cloudflare Workers', 'D1 Database'],
          category: 'Health Technology',
          url: '/healthbridge-enhanced'
        }
        
        // Combine projects, tools, and add HealthBridge as a project
        let allWork = [...projects, healthBridgeProject, ...tools]
        
        // If we still don't have enough items, supplement with portfolio items that represent actual work
        if (allWork.length < 3) {
          const portfolio = data.portfolio || []
          const workPortfolio = portfolio.filter((item: { id: string }) => 
            ['ai-automation', 'analytics', 'capabilities', 'devops'].includes(item.id)
          )
          allWork = [...allWork, ...workPortfolio]
        }
        
        const featured = allWork.slice(0, 6) // Get up to 6 featured items
        
        setFeaturedWork(featured)
      } catch (error) {
        console.error('Error loading content:', error)
      }
    }

    loadContent()
  }, [])

  const handleNavigation = (url: string) => {
    navigate({ to: url })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 dark:from-teal-950 dark:via-blue-950 dark:to-teal-900">
      {/* Hero Section - Compact with Targeting Theme */}
      <div className="relative overflow-hidden border-b border-teal-200 dark:border-teal-800">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10"></div>
        
        <div className="relative px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Icon and Title with Targeting Theme */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-8 h-8 text-white" />
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
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl" style={{fontWeight: 700}}>
                  <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    Roger Cormier
                  </span>
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto mt-3 rounded-full"></div>
              </div>
            </div>
            
            {/* Description with Targeting Language */}
            <p className="text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Technical Project Manager specializing in 
              <span className="font-medium text-teal-700 dark:text-teal-300"> targeting digital transformation </span>
              through ERP integration, AI automation, and strategic technology implementation. 
              PMP-certified leader driving organizational excellence.
            </p>
            
            {/* Quick Stats with Targeting Theme */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span>ERP Integration</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>AI Automation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Digital Transformation</span>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => handleNavigation('/portfolio')}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white border-0 px-8 py-3 text-lg"
              >
                View Portfolio
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                onClick={() => handleNavigation('/contact')}
                variant="outline"
                className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 px-8 py-3 text-lg"
              >
                Get in Touch
                <MessageSquare className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Core Expertise Section */}
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" style={{fontWeight: 700}}>
              Core Expertise
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Specialized capabilities that drive digital transformation and operational excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* ERP & SaaS Integration */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  ERP & SaaS Integration
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  NetSuite, Ramp, and enterprise system orchestration for seamless operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                    NetSuite
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    Ramp
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                    API Integration
                  </Badge>
                </div>
                <Button 
                  onClick={() => handleNavigation('/portfolio/analytics')}
                  variant="outline"
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* AI & Automation */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  AI & Automation
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Intelligent workflows, copilot integration, and autonomous operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    AI Copilots
                  </Badge>
                  <Badge variant="secondary" className="bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                    Workflow Automation
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                    Cloudflare AI
                  </Badge>
                </div>
                <Button 
                  onClick={() => handleNavigation('/portfolio/ai-automation')}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Digital Transformation */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Digital Transformation
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Strategic technology implementation and organizational change management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                    Strategy
                  </Badge>
                  <Badge variant="secondary" className="bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                    Change Management
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    PMP Certified
                  </Badge>
                </div>
                <Button 
                  onClick={() => handleNavigation('/portfolio/leadership')}
                  variant="outline"
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

       {/* Featured Projects & Tools Carousel */}
       <div className="px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/50 dark:to-blue-950/50">
         <div className="mx-auto max-w-7xl">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" style={{fontWeight: 700}}>
               Featured Projects & Tools
             </h2>
             <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
               Technical solutions, automation tools, and strategic projects including HealthBridge Enhanced and other digital transformation initiatives
             </p>
           </div>

           {featuredWork.length > 0 ? (
             <Carousel className="w-full max-w-6xl mx-auto">
               <CarouselContent>
                 {featuredWork.map((item) => (
                 <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                   <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 h-full flex flex-col">
                     <CardHeader className="pb-4 flex-shrink-0">
                       <div className="flex items-center justify-between mb-3">
                         <Badge variant="outline" className="border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300">
                           {item.category}
                         </Badge>
                       </div>
                       <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                         {item.title}
                       </CardTitle>
                       <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                         {item.description}
                       </CardDescription>
                     </CardHeader>
                     <CardContent className="pt-0 flex flex-col flex-grow">
                       <div className="flex flex-wrap gap-1.5 mb-4">
                         {item.tags.slice(0, 3).map((tag, index) => (
                           <Badge key={index} variant="secondary" className="bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 text-xs">
                             {tag}
                           </Badge>
                         ))}
                       </div>
                       <Button 
                         onClick={() => handleNavigation(item.url)}
                         className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white border-0 mt-auto"
                       >
                         View Details
                         <ArrowRight className="w-4 h-4 ml-2" />
                       </Button>
                     </CardContent>
                   </Card>
                 </CarouselItem>
               ))}
               </CarouselContent>
               <CarouselPrevious />
               <CarouselNext />
             </Carousel>
           ) : (
             <div className="text-center py-12">
               <p className="text-gray-500 dark:text-gray-400">Loading featured work...</p>
             </div>
           )}
         </div>
       </div>

      {/* Recent Blog Posts */}
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" style={{fontWeight: 700}}>
              Recent Insights
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Latest thoughts on digital transformation, technical leadership, and operational excellence
            </p>
          </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {recentBlogs.map((blog) => (
               <Card key={blog.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 h-full flex flex-col">
                 <CardHeader className="pb-4 flex-shrink-0">
                   <div className="flex items-center justify-between mb-3">
                     <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                       {blog.category}
                     </Badge>
                     <span className="text-xs text-gray-500 dark:text-gray-400">
                       {new Date(blog.date).toLocaleDateString('en-US', { 
                         month: 'short', 
                         day: 'numeric',
                         year: 'numeric'
                       })}
                     </span>
                   </div>
                   <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                     {blog.title}
                   </CardTitle>
                   <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                     {blog.description}
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="pt-0 flex flex-col flex-grow">
                   <div className="flex flex-wrap gap-1.5 mb-4">
                     {blog.tags.slice(0, 3).map((tag, index) => (
                       <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs">
                         {tag}
                       </Badge>
                     ))}
                   </div>
                   <Button 
                     onClick={() => handleNavigation(blog.url)}
                     variant="outline"
                     className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 mt-auto"
                   >
                     Read Article
                     <ArrowRight className="w-4 h-4 ml-2" />
                   </Button>
                 </CardContent>
               </Card>
             ))}
           </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => handleNavigation('/blog')}
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 px-8 py-3 text-lg"
            >
              View All Articles
              <BookOpen className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Section */}
      <div className="px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/50 dark:to-blue-950/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" style={{fontWeight: 700}}>
              Explore My Work
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Navigate to different areas of expertise and experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Portfolio
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Leadership & technical capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleNavigation('/portfolio')}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white border-0"
                >
                  Explore
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Projects
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Case studies & analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleNavigation('/projects')}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0"
                >
                  Explore
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Tools
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Utilities & resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleNavigation('/tools')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                >
                  Explore
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Contact
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Let's connect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleNavigation('/contact')}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white border-0"
                >
                  Connect
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4" style={{fontWeight: 700}}>
              Ready to Transform Your Organization?
            </h2>
            <p className="text-lg text-teal-100 mb-6 max-w-2xl mx-auto">
              Let's discuss how strategic technology implementation, AI automation, and digital transformation 
              can drive success in your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => handleNavigation('/contact')}
                variant="secondary"
                size="lg"
                className="bg-white text-teal-600 hover:bg-gray-100 border-0 px-8 py-3"
              >
                Start a Conversation
                <MessageSquare className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                onClick={() => handleNavigation('/about')}
                variant="outline"
                size="lg"
                className="bg-white/20 text-white hover:bg-white hover:text-teal-600 border border-white/30 hover:border-white px-8 py-3"
              >
                Learn More About Me
                <User className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
