import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { 
  ExternalLink, 
  Github, 
  Mail, 
  Phone,
  Award,
  Briefcase,
  GraduationCap,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Rocket,
  CheckCircle,
  AlertCircle,
  Info,
  Code,
  Database,
  Cloud,
  Lock
} from 'lucide-react'

// Base card props interface
interface BaseCardProps {
  title?: string
  description?: string
  className?: string
  children?: React.ReactNode
  badges?: string[] | string
}

// Markdown content renderer for cards
const CardMarkdownContent: React.FC<{ content: React.ReactNode }> = ({ content }) => {
  if (typeof content === 'string') {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Override default styling to match card design
          p: ({ children, ...props }) => (
            <p className="mb-3 last:mb-0 break-words font-sans text-base" {...props}>
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside mb-3 last:mb-0 space-y-1 break-words" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside mb-3 last:mb-0 space-y-1 break-words" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-gray-600 dark:text-gray-300 break-words" {...props}>
              {children}
            </li>
          ),
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-gray-700 dark:text-gray-200 break-words" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-gray-600 dark:text-gray-300 break-words" {...props}>
              {children}
            </em>
          ),
          code: ({ children, ...props }) => (
            <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-sm font-mono break-words" {...props}>
              {children}
            </code>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-teal-200 dark:border-teal-700 pl-4 italic text-gray-600 dark:text-gray-400 mb-3 break-words" {...props}>
              {children}
            </blockquote>
          ),
          h1: ({ children, ...props }) => (
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 break-words" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 break-words" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 break-words" {...props}>
              {children}
            </h3>
          ),
          a: ({ children, href, ...props }) => (
            <a 
              href={href} 
              className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline break-words" 
              target="_blank" 
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }
  
  // If not a string, render as-is (for React elements)
  return <div className="break-words markdown-card-content">{content}</div>
}

// Info Card Component
export const InfoCard: React.FC<BaseCardProps> = ({ 
  title, 
  description, 
  badges = [],
  className, 
  children 
}) => {
  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges) 
    ? badges 
    : typeof badges === 'string' 
      ? badges.split(',').map(badge => badge.trim()).filter(badge => badge.length > 0)
      : []

  return (
    <Card className={cn("overflow-hidden h-full flex flex-col border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-sans", className)}>
      {/* Teal accent line */}
      <div className="h-1 bg-gradient-to-r from-teal-600 to-blue-600"></div>
      
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-lg text-teal-600 dark:text-teal-400 font-medium font-sans break-words">
              {description}
            </CardDescription>
          )}
                      {badgeArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {badgeArray.map((badge, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-teal-200 text-teal-700 dark:text-teal-300">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
        </CardHeader>
      )}
      <CardContent className={cn("flex-1 min-w-0", !title && "pt-6")}>
        <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base break-words font-sans min-w-0 card-content">
          <CardMarkdownContent content={children} />
        </div>
      </CardContent>
    </Card>
  )
}

// Feature Card Component
export const FeatureCard: React.FC<BaseCardProps & {
  icon?: string
  badges?: string[] | string
  link?: string
  linkText?: string
}> = ({ 
  title, 
  description, 
  icon, 
  badges = [], 
  link, 
  linkText = "Learn More",
  className, 
  children 
}) => {
  const getIcon = (iconName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      award: <Award className="w-6 h-6" />,
      briefcase: <Briefcase className="w-6 h-6" />,
      graduation: <GraduationCap className="w-6 h-6" />,
      star: <Star className="w-6 h-6" />,
      trending: <TrendingUp className="w-6 h-6" />,
      shield: <Shield className="w-6 h-6" />,
      zap: <Zap className="w-6 h-6" />,
    }
    return icons[iconName || 'star'] || <Star className="w-6 h-6" />
  }

  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges) 
    ? badges 
    : typeof badges === 'string' 
      ? badges.split(',').map((badge: string) => badge.trim()).filter((badge: string) => badge.length > 0)
      : []

  return (
    <Card className={cn("overflow-hidden h-full flex flex-col border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900", className)}>
      {/* Teal accent line */}
      <div className="h-1 bg-gradient-to-r from-teal-600 to-blue-600"></div>
      
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/50 dark:to-blue-900/50 text-teal-600 dark:text-teal-400 shadow-sm">
            {getIcon(icon)}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-sans break-words">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-lg text-teal-600 dark:text-teal-400 font-medium mb-3 font-sans break-words">
                {description}
              </CardDescription>
            )}
            {badgeArray.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badgeArray.map((badge: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs border-teal-200 text-teal-700 dark:text-teal-300">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-w-0">
        <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base break-words font-sans min-w-0 card-content">
          <CardMarkdownContent content={children} />
        </div>
      </CardContent>
      {link && (
        <CardFooter className="pt-0">
          <Button variant="outline" size="sm" asChild className="w-full">
            <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              {linkText}
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

// Profile Card Component
export const ProfileCard: React.FC<BaseCardProps & {
  name?: string
  role?: string
  image?: string
  imageAlt?: string
  badges?: string[] | string
  contact?: Record<string, string>
}> = ({ 
  title, 
  description, 
  name,
  role,
  image,
  imageAlt,
  badges = [],
  contact = {},
  className, 
  children 
}) => {
  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges) 
    ? badges 
    : typeof badges === 'string' 
      ? badges.split(',').map((badge: string) => badge.trim()).filter((badge: string) => badge.length > 0)
      : []

  return (
    <Card className={cn("overflow-hidden h-full flex flex-col border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900", className)}>
      {/* Teal accent line */}
      <div className="h-1 bg-gradient-to-r from-teal-600 to-blue-600"></div>
      
      <CardHeader className="pb-4">
        <div className="flex items-start gap-6">
          {image && (
            <div className="flex-shrink-0">
              <img
                src={image}
                alt={imageAlt || name || title || "Profile image"}
                className="w-20 h-20 rounded-full object-cover border-2 border-teal-200 shadow-md"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {name || title}
            </h2>
            <p className="text-lg text-teal-600 dark:text-teal-400 font-medium mb-3 font-sans break-words">
              {role || description}
            </p>
            {badgeArray.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badgeArray.map((badge: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs border-teal-200 text-teal-700 dark:text-teal-300">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className="flex-1 min-w-0">
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base break-words font-sans min-w-0 card-content">
            <CardMarkdownContent content={children} />
          </div>
        </CardContent>
      )}
      {Object.keys(contact).length > 0 && (
        <CardFooter className="pt-0">
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-teal-600">
                <Mail className="w-4 h-4" />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-teal-600">
                <Phone className="w-4 h-4" />
                {contact.phone}
              </a>
            )}
            {contact.github && (
              <a href={contact.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-teal-600">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            )}
            {contact.website && (
              <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-teal-600">
                <ExternalLink className="w-4 h-4" />
                Website
              </a>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

// Stats Card Component
export const StatsCard: React.FC<BaseCardProps & {
  stats?: string[] | string
}> = ({ 
  title, 
  description, 
  stats = [],
  className, 
  children 
}) => {
  // Handle badges as either string or array
  const statsArray = Array.isArray(stats) 
    ? stats 
    : typeof stats === 'string' 
      ? stats.split(',').map((stat: string) => stat.trim()).filter((stat: string) => stat.length > 0)
      : []

  return (
    <Card className={cn("overflow-hidden h-full flex flex-col border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900", className)}>
      {/* Teal accent line */}
      <div className="h-1 bg-gradient-to-r from-teal-600 to-blue-600"></div>
      
      {(title || description) && (
        <CardHeader className="pb-4">
          {title && (
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-lg text-teal-600 dark:text-teal-400 font-medium font-sans break-words">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn("flex-1 min-w-0", !title && !description && "pt-6")}>
        {statsArray.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {statsArray.map((stat: string, index: number) => {
              const [label, value] = stat.split(':').map((s: string) => s.trim())
              return (
                <div key={index} className="text-center p-4 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{label}</div>
                </div>
              )
            })}
          </div>
        )}
        {children && (
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base break-words font-sans min-w-0 card-content">
            <CardMarkdownContent content={children} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Timeline Card Component
export const TimelineCard: React.FC<BaseCardProps & {
  items?: Array<{
    date: string
    title: string
    description?: string
    badge?: string
  }>
}> = ({ 
  title, 
  description, 
  items = [], 
  className, 
  children 
}) => {
  return (
    <Card className={cn("overflow-hidden h-full flex flex-col border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900", className)}>
      {/* Teal accent line */}
      <div className="h-1 bg-gradient-to-r from-teal-600 to-blue-600"></div>
      
      {(title || description) && (
        <CardHeader className="pb-4">
          {title && (
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-lg text-teal-600 dark:text-teal-400 font-medium font-sans break-words">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn("flex-1 min-w-0", !title && !description && "pt-6")}>
        {items.length > 0 && (
          <div className="space-y-4 mb-6">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-teal-500 mt-2"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                      {item.date}
                    </span>
                    {item.badge && (
                      <Badge variant="outline" className="text-xs border-teal-200 text-teal-700 dark:text-teal-300">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {children && (
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base break-words font-sans min-w-0 card-content">
            <CardMarkdownContent content={children} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Hero Card Component - Large, prominent card for key content
export const HeroCard: React.FC<BaseCardProps & {
  size?: 'sm' | 'md' | 'lg'
  image?: string
  imageAlt?: string
  badges?: string[] | string
  cta?: {
    text: string
    link: string
    variant?: 'default' | 'outline' | 'secondary'
  }
}> = ({ 
  title, 
  description, 
  size = 'md',
  image,
  imageAlt,
  badges = [],
  cta,
  className, 
  children 
}) => {
  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges) 
    ? badges 
    : typeof badges === 'string' 
      ? badges.split(',').map((badge: string) => badge.trim()).filter((badge: string) => badge.length > 0)
      : []

  const sizes = {
    sm: "p-6",
    md: "p-8",
    lg: "p-12"
  }

  return (
    <Card className={cn("overflow-hidden shadow-lg h-full flex flex-col border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900", className)}>
      {/* Teal accent line */}
      <div className="h-1 bg-gradient-to-r from-teal-600 to-blue-600"></div>
      
      <CardHeader className={cn("pb-4", sizes[size])}>
        <div className="flex items-start gap-6">
          {image && (
            <div className="flex-shrink-0">
              <img
                src={image}
                alt={imageAlt || title || "Hero image"}
                className="w-16 h-16 rounded-lg object-cover border-2 border-teal-200 shadow-md"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <CardTitle className={cn(
                "text-gray-900 dark:text-gray-100 mb-2",
                size === 'lg' ? "text-3xl" : size === 'md' ? "text-2xl" : "text-xl"
              )}>
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className={cn(
                "text-teal-600 dark:text-teal-400 mb-4 font-medium font-sans break-words",
                size === 'lg' ? "text-lg" : "text-base"
              )}>
                {description}
              </CardDescription>
            )}
            {badgeArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {badgeArray.map((badge: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-teal-200 text-teal-700 dark:text-teal-300">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
            {cta && (
              <Button 
                variant={cta.variant || 'default'} 
                size={size === 'lg' ? 'lg' : 'default'}
                asChild
                className="mt-2"
              >
                <a href={cta.link} target="_blank" rel="noopener noreferrer">
                  {cta.text}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className="flex-1 min-w-0">
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base break-words font-sans min-w-0 card-content">
            <CardMarkdownContent content={children} />
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Success Card Component - Green accent for positive content
export const SuccessCard: React.FC<BaseCardProps & {
  icon?: string
}> = ({ 
  title, 
  description, 
  badges = [],
  icon = 'check',
  className, 
  children 
}) => {
  const getIcon = (iconName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      check: <CheckCircle className="w-6 h-6" />,
      award: <Award className="w-6 h-6" />,
      star: <Star className="w-6 h-6" />,
      target: <Target className="w-6 h-6" />,
    }
    return icons[iconName || 'check'] || <CheckCircle className="w-6 h-6" />
  }

  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges) 
    ? badges 
    : typeof badges === 'string' 
      ? badges.split(',').map(badge => badge.trim()).filter(badge => badge.length > 0)
      : []

  return (
    <Card className={cn("overflow-hidden h-full flex flex-col border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900", className)}>
      {/* Green accent line */}
      <div className="h-1 bg-gradient-to-r from-green-600 to-teal-600"></div>
      
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/50 dark:to-teal-900/50 text-green-600 dark:text-green-400 shadow-sm">
            {getIcon(icon)}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-lg text-green-600 dark:text-green-400 font-medium font-sans break-words">
                {description}
              </CardDescription>
            )}
            {badgeArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {badgeArray.map((badge, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-green-200 text-green-700 dark:text-green-300">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className="flex-1 min-w-0">
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base break-words font-sans min-w-0 card-content">
            <CardMarkdownContent content={children} />
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Warning Card Component - Orange accent for important notices
export const WarningCard: React.FC<BaseCardProps & {
  icon?: string
}> = ({ 
  title, 
  description, 
  badges = [],
  icon = 'alert',
  className, 
  children 
}) => {
  const getIcon = (iconName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      alert: <AlertCircle className="w-6 h-6" />,
      info: <Info className="w-6 h-6" />,
      shield: <Shield className="w-6 h-6" />,
      lock: <Lock className="w-6 h-6" />,
    }
    return icons[iconName || 'alert'] || <AlertCircle className="w-6 h-6" />
  }

  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges) 
    ? badges 
    : typeof badges === 'string' 
      ? badges.split(',').map(badge => badge.trim()).filter(badge => badge.length > 0)
      : []

  return (
    <Card className={cn("overflow-hidden h-full flex flex-col border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900", className)}>
      {/* Orange accent line */}
      <div className="h-1 bg-gradient-to-r from-orange-600 to-red-600"></div>
      
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 text-orange-600 dark:text-orange-400 shadow-sm">
            {getIcon(icon)}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-lg text-orange-600 dark:text-orange-400 font-medium font-sans break-words">
                {description}
              </CardDescription>
            )}
            {badgeArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {badgeArray.map((badge, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-orange-200 text-orange-700 dark:text-orange-300">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className="flex-1 min-w-0">
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base break-words font-sans min-w-0 card-content">
            <CardMarkdownContent content={children} />
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Tech Card Component - Blue accent for technical content
export const TechCard: React.FC<BaseCardProps & {
  icon?: string
}> = ({ 
  title, 
  description, 
  icon = 'code',
  badges = [],
  className, 
  children 
}) => {
  const getIcon = (iconName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      code: <Code className="w-6 h-6" />,
      database: <Database className="w-6 h-6" />,
      cloud: <Cloud className="w-6 h-6" />,
      rocket: <Rocket className="w-6 h-6" />,
      zap: <Zap className="w-6 h-6" />,
    }
    return icons[iconName || 'code'] || <Code className="w-6 h-6" />
  }

  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges) 
    ? badges 
    : typeof badges === 'string' 
      ? badges.split(',').map(badge => badge.trim()).filter(badge => badge.length > 0)
      : []

  return (
    <Card className={cn("overflow-hidden h-full flex flex-col border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900", className)}>
      {/* Blue accent line */}
      <div className="h-1 bg-gradient-to-r from-blue-600 to-teal-600"></div>
      
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 text-blue-600 dark:text-blue-400 shadow-sm">
            {getIcon(icon)}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-3 font-sans break-words">
                {description}
              </CardDescription>
            )}
            {badgeArray.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badgeArray.map((badge, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700 dark:text-blue-300">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className="flex-1 min-w-0">
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base break-words font-sans min-w-0 card-content">
            <CardMarkdownContent content={children} />
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Hero Profile Card Component - For main profile display
export const HeroProfileCard: React.FC<BaseCardProps & {
  name?: string
  title?: string
  image?: string
  imageAlt?: string
  badges?: string[] | string
}> = ({ 
  title, 
  description, 
  name,
  image,
  imageAlt,
  badges = [],
  className, 
  children 
}) => {
  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges) 
    ? badges 
    : typeof badges === 'string' 
      ? badges.split(',').map(badge => badge.trim()).filter(badge => badge.length > 0)
      : []

  // Define badge color classes for multi-colored badges
  const badgeColors = [
    "bg-blue-100 text-blue-800 dark:bg-blue-50 dark:text-blue-800 border-blue-200",
    "bg-green-100 text-green-800 dark:bg-green-50 dark:text-green-800 border-green-200",
    "bg-orange-100 text-orange-800 dark:bg-orange-50 dark:text-orange-800 border-orange-200",
    "bg-red-100 text-red-800 dark:bg-red-50 dark:text-red-800 border-red-200",
    "bg-purple-100 text-purple-800 dark:bg-purple-50 dark:text-purple-800 border-purple-200"
  ]

  return (
    <Card className={cn("overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-white hero-profile-card", className)}>
      {/* Teal accent line */}
      <div className="h-1 bg-gradient-to-r from-teal-600 to-blue-600"></div>
      
      <CardHeader className="pb-4 pt-1">
        <div className="flex items-start gap-6">
          {image && (
            <div className="flex-shrink-0">
              <img
                src={image}
                alt={imageAlt || name || title || "Profile image"}
                className="w-24 h-24 rounded-full object-cover border-3 border-teal-200 shadow-lg"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {name || title}
            </h2>
            <p className="text-lg text-teal-600 dark:text-teal-400 font-medium mb-3 break-words overflow-wrap-break-word whitespace-normal hero-profile-content markdown-card-content">
              {description}
            </p>
            {badgeArray.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badgeArray.map((badge: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={`text-xs ${badgeColors[index % badgeColors.length]}`}
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent>
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base break-words font-sans max-w-none hero-profile-content markdown-card-content space-y-6">
            <CardMarkdownContent content={children} />
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Multi-Column Card Container
export const MultiColumnCards: React.FC<{
  columns: 2 | 3
  cards: Array<{
    type: string
    props: Record<string, unknown>
    content: string
  }>
  className?: string
}> = ({ columns, cards, className }) => {
  const gridClass = columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  
  const renderCard = (card: { type: string; props: Record<string, unknown>; content: string }, index: number) => {
    const { type, props, content } = card
    
    switch (type) {
      case 'info':
        return <InfoCard key={index} {...props}>{content}</InfoCard>
      case 'feature':
        return <FeatureCard key={index} {...props}>{content}</FeatureCard>
      case 'profile':
        return <ProfileCard key={index} {...props}>{content}</ProfileCard>
      case 'stats':
        return <StatsCard key={index} {...props}>{content}</StatsCard>
      case 'timeline':
        return <TimelineCard key={index} {...props}>{content}</TimelineCard>
      case 'hero':
        return <HeroCard key={index} {...props}>{content}</HeroCard>
      case 'success':
        return <SuccessCard key={index} {...props}>{content}</SuccessCard>
      case 'warning':
        return <WarningCard key={index} {...props}>{content}</WarningCard>
      case 'tech':
        return <TechCard key={index} {...props}>{content}</TechCard>
      case 'hero-profile':
        return <HeroProfileCard key={index} {...props}>{content}</HeroProfileCard>
      default:
        return (
          <div key={index} className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <p className="text-red-600">Unknown card type: {type}</p>
            <pre className="text-xs mt-2">{String(content)}</pre>
          </div>
        )
    }
  }
  
  return (
    <div className={cn("grid gap-6", gridClass, className)}>
      {cards.map((card, index) => (
        <div key={index} className="h-full">
          {renderCard(card, index)}
        </div>
      ))}
    </div>
  )
}
