import React, { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Target, 
  Users, 
  User, 
  Code, 
  Settings,
  Briefcase,
  ArrowRight,
  Users2,
  PieChart,
  FileText,
  Star
} from 'lucide-react'

interface PortfolioItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  tags: string[]
  category: string
  featured?: boolean
}

const portfolioData: PortfolioItem[] = [
  {
    title: "Strategic Planning",
    url: "strategic-planning",
    icon: Target,
    description: "Process modernization, tool evaluation, and strategic vision development to transform legacy workflows into cloud-native systems.",
    tags: ["Strategy", "Process Modernization", "Tool Evaluation", "Strategic Vision"],
    category: "Strategy & Consulting",
    featured: true
  },
  {
    title: "Digital Transformation",
    url: "digital-transformation",
    icon: Settings,
    description: "AP transformation, forecast streamlining, and custom automation solutions that modernize legacy processes and deliver measurable impact.",
    tags: ["Digital Transformation", "AP Automation", "Process Modernization", "Automation"],
    category: "Strategy & Consulting",
    featured: true
  },
  {
    title: "Team Leadership",
    url: "team-leadership",
    icon: Users,
    description: "Cross-functional leadership delivering complex initiatives across business and engineering domains, bridging technical and operational perspectives.",
    tags: ["Leadership", "Cross-functional", "Project Management", "Team Management"],
    category: "Leadership & Culture",
    featured: true
  },
  {
    title: "ERP Systems",
    url: "erp-systems",
    icon: Code,
    description: "NetSuite governance, workflow automation, and multi-entity management to optimize financial operations and ensure compliance.",
    tags: ["ERP", "NetSuite", "Workflow Automation", "Compliance"],
    category: "Technology & Operations",
    featured: true
  },
  {
    title: "Strategy & Vision",
    url: "strategy",
    icon: Target,
    description: "Leading initiatives that modernize legacy workflows into cloud-native, API-connected systems with measurable business impact.",
    tags: ["Strategy", "Digital Transformation", "Strategic Planning", "Consulting"],
    category: "Strategy & Consulting"
  },
  {
    title: "Leadership & Culture",
    url: "leadership",
    icon: Users2,
    description: "Cross-functional leadership delivering complex initiatives across business and engineering domains, bridging SaaS tools and operational workflows.",
    tags: ["Leadership", "Organizational Development", "Team Management", "Culture"],
    category: "Leadership & Culture"
  },
  {
    title: "Talent & Org Design",
    url: "talent",
    icon: User,
    description: "Systems-thinking approach to team development, strategic alignment, and culture-forward transformation through organizational behavior.",
    tags: ["Talent", "Organizational Design", "HR", "Workforce Planning"],
    category: "Talent & HR"
  },
  {
    title: "DevOps & Automation",
    url: "devops",
    icon: Code,
    description: "Hands-on engineering turning fragmented SaaS ecosystems into automated, audit-ready pipelines using Azure Functions and GitHub Actions.",
    tags: ["DevOps", "Automation", "CI/CD", "Infrastructure", "Cloud"],
    category: "Technology & Operations"
  },
  {
    title: "ERP & SaaS Integration",
    url: "saas",
    icon: Settings,
    description: "Designing and governing secure, low-friction workflows across NetSuite, Ramp, Vena, and enterprise systems with automated data flows.",
    tags: ["ERP", "SaaS", "Integration", "Enterprise Software", "Cloud"],
    category: "Technology & Operations"
  },
  {
    title: "Analytics & Insights",
    url: "analytics",
    icon: BarChart3,
    description: "Using analytics to identify delivery risks, expose inefficiencies, and improve cross-functional coordination through dashboards.",
    tags: ["Analytics", "Business Intelligence", "Data Analysis", "Reporting"],
    category: "Data & Analytics"
  },
  {
    title: "Data Analytics",
    url: "data-analytics",
    icon: BarChart3,
    description: "Operational dashboards, governance metrics, and ETL automation to surface delivery risks and improve cross-functional coordination.",
    tags: ["Analytics", "Dashboards", "ETL", "Governance"],
    category: "Data & Analytics"
  },
  {
    title: "Project Method Analysis",
    url: "project-portfolio-management",
    icon: PieChart,
    description: "Comprehensive project method analysis, risk assessment, and portfolio optimization using data-driven insights to maximize value delivery.",
    tags: ["Portfolio Management", "Risk Assessment", "Project Method Analysis", "Data Analytics"],
    category: "Strategy & Consulting"
  }
]

const categoryIcons = {
  "Data & Analytics": BarChart3,
  "Strategy & Consulting": Target,
  "Leadership & Culture": Users2,
  "Talent & HR": User,
  "Technology & Operations": Code
}

const categoryColors = {
  "Data & Analytics": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Strategy & Consulting": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Leadership & Culture": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Talent & HR": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "Technology & Operations": "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
}

export default function PortfolioPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const featuredItems = portfolioData.filter(item => item.featured)
  const regularItems = portfolioData.filter(item => !item.featured)
  const categories = Array.from(new Set(regularItems.map(item => item.category)))

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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

      {/* Featured Portfolio Items - Top Layer */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-6 h-6 text-teal-600" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Featured Solutions
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item) => (
            <PortfolioCard key={item.url} item={item} featured={true} />
          ))}
        </div>
      </div>

      {/* Portfolio Grid by Category */}
      {categories.map((category) => {
        const categoryItems = regularItems.filter(item => item.category === category)
        const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons]
        
        return (
          <div key={category} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <CategoryIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {category}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryItems.map((item) => (
                <PortfolioCard key={item.url} item={item} featured={false} />
              ))}
            </div>
          </div>
        )
      })}

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
  featured?: boolean
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ item, featured = false }) => {
  const ItemIcon = item.icon
  const categoryColor = categoryColors[item.category as keyof typeof categoryColors]
  
  return (
    <Card className={`h-full flex flex-col hover:shadow-lg transition-shadow duration-200 group ${
      featured ? 'border-2 border-teal-200 bg-gradient-to-br from-white to-teal-50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${
            featured ? 'bg-teal-200' : 'bg-teal-100 dark:bg-teal-900'
          }`}>
            <ItemIcon className={`w-6 h-6 ${
              featured ? 'text-teal-700' : 'text-teal-600 dark:text-teal-400'
            }`} />
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
