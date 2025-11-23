import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

import {
  AlertCircle,
  Award,
  Briefcase,
  CheckCircle,
  Cloud,
  Code,
  Database,
  ExternalLink,
  Github,
  GraduationCap,
  Info,
  Lock,
  Mail,
  Phone,
  Rocket,
  Shield,
  Star,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

// Base card props interface
interface BaseCardProps {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  badges?: string[] | string;
}

// Markdown content renderer for cards
const CardMarkdownContent: React.FC<{ content: React.ReactNode }> = ({
  content,
}) => {
  if (typeof content === 'string') {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Override default styling to match card design
          p: ({ children, ...props }) => (
            <p
              className='mb-3 break-words font-sans text-base last:mb-0'
              {...props}
            >
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul
              className='mb-3 list-inside list-disc space-y-1 break-words last:mb-0'
              {...props}
            >
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol
              className='mb-3 list-inside list-decimal space-y-1 break-words last:mb-0'
              {...props}
            >
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li
              className='break-words text-gray-600 dark:text-gray-300'
              {...props}
            >
              {children}
            </li>
          ),
          strong: ({ children, ...props }) => (
            <strong
              className='break-words font-semibold text-gray-700 dark:text-gray-200'
              {...props}
            >
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em
              className='break-words italic text-gray-600 dark:text-gray-300'
              {...props}
            >
              {children}
            </em>
          ),
          code: ({ children, ...props }) => (
            <code
              className='break-words rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              {...props}
            >
              {children}
            </code>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className='mb-3 break-words border-l-4 border-hunter-200 pl-4 italic text-gray-600 dark:border-hunter-700 dark:text-gray-400'
              {...props}
            >
              {children}
            </blockquote>
          ),
          h1: ({ children, ...props }) => (
            <h1
              className='mb-3 break-words text-xl font-bold text-gray-900 dark:text-gray-100'
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className='mb-2 break-words text-lg font-semibold text-gray-900 dark:text-gray-100'
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className='mb-2 break-words text-base font-semibold text-gray-900 dark:text-gray-100'
              {...props}
            >
              {children}
            </h3>
          ),
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className='break-words text-hunter-600 underline hover:text-hunter-700 dark:text-hunter-400 dark:hover:text-hunter-300'
              target='_blank'
              rel='noopener noreferrer'
              {...props}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }

  // If not a string, render as-is (for React elements)
  return <div className='markdown-card-content break-words'>{content}</div>;
};

// Info Card Component
export const InfoCard: React.FC<BaseCardProps> = ({
  title,
  description,
  badges = [],
  className,
  children,
}) => {
  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges)
    ? badges
    : typeof badges === 'string'
      ? badges
          .split(',')
          .map(badge => badge.trim())
          .filter(badge => badge.length > 0)
      : [];

  return (
    <Card
      className={cn(
        'info-card flex h-full flex-col overflow-hidden border-gray-200 bg-white font-sans dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {/* Teal accent line */}
      <div className='h-1 bg-gradient-to-r from-hunter-800 to-hunter-900'></div>

      {title && (
        <CardHeader className='pb-4'>
          <CardTitle className='overflow-wrap-break-word whitespace-normal break-words text-2xl font-bold text-gray-900 dark:text-gray-100'>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className='overflow-wrap-break-word whitespace-normal break-words font-sans text-lg font-medium text-hunter-600 dark:text-hunter-400'>
              {description}
            </CardDescription>
          )}
          {badgeArray.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-2'>
              {badgeArray.map((badge, index) => (
                <Badge
                  key={index}
                  variant='outline'
                  className='border-hunter-200 text-xs text-hunter-700 dark:text-hunter-300'
                >
                  {badge}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className={cn('min-w-0 flex-1', !title && 'pt-6')}>
        <div className='overflow-wrap-break-word card-content min-w-0 whitespace-normal break-words font-sans text-base leading-relaxed text-gray-600 dark:text-gray-300'>
          <CardMarkdownContent content={children} />
        </div>
      </CardContent>
    </Card>
  );
};

// Feature Card Component
export const FeatureCard: React.FC<
  BaseCardProps & {
    icon?: string;
    badges?: string[] | string;
    link?: string;
    linkText?: string;
  }
> = ({
  title,
  description,
  icon,
  badges = [],
  link,
  linkText = 'Learn More',
  className,
  children,
}) => {
  const getIcon = (iconName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      award: <Award className='size-6' />,
      briefcase: <Briefcase className='size-6' />,
      graduation: <GraduationCap className='size-6' />,
      star: <Star className='size-6' />,
      trending: <TrendingUp className='size-6' />,
      shield: <Shield className='size-6' />,
      zap: <Zap className='size-6' />,
    };
    return icons[iconName ?? 'star'] ?? <Star className='size-6' />;
  };

  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges)
    ? badges
    : typeof badges === 'string'
      ? badges
          .split(',')
          .map((badge: string) => badge.trim())
          .filter((badge: string) => badge.length > 0)
      : [];

  return (
    <Card
      className={cn(
        'feature-card flex h-full flex-col overflow-hidden border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {/* Teal accent line */}
      <div className='h-1 bg-gradient-to-r from-hunter-800 to-hunter-900'></div>

      <CardHeader className='pb-4'>
        <div className='flex items-start gap-4'>
          <div className='shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-hunter-100 p-3 text-hunter-800 shadow-sm dark:from-slate-800/50 dark:to-hunter-800/50 dark:text-hunter-300'>
            {getIcon(icon)}
          </div>
          <div className='min-w-0 flex-1'>
            {title && (
              <CardTitle className='overflow-wrap-break-word mb-2 whitespace-normal break-words font-sans text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className='overflow-wrap-break-word mb-3 whitespace-normal break-words font-sans text-lg font-medium text-hunter-600 dark:text-hunter-400'>
                {description}
              </CardDescription>
            )}
            {badgeArray.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {badgeArray.map((badge: string, index: number) => (
                  <Badge
                    key={index}
                    variant='outline'
                    className='border-hunter-200 text-xs text-hunter-700 dark:text-hunter-300'
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className='min-w-0 flex-1'>
        <div className='overflow-wrap-break-word card-content min-w-0 whitespace-normal break-words font-sans text-base leading-relaxed text-gray-600 dark:text-gray-300'>
          <CardMarkdownContent content={children} />
        </div>
      </CardContent>
      {link && (
        <CardFooter className='pt-0'>
          <Button variant='outline' size='sm' asChild className='w-full'>
            <a
              href={link}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2'
            >
              {linkText}
              <ExternalLink className='size-4' />
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

// Profile Card Component
export const ProfileCard: React.FC<
  BaseCardProps & {
    name?: string;
    role?: string;
    image?: string;
    imageAlt?: string;
    badges?: string[] | string;
    contact?: Record<string, string>;
  }
> = ({
  title,
  description,
  name,
  role,
  image,
  imageAlt,
  badges = [],
  contact = {},
  className,
  children,
}) => {
  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges)
    ? badges
    : typeof badges === 'string'
      ? badges
          .split(',')
          .map((badge: string) => badge.trim())
          .filter((badge: string) => badge.length > 0)
      : [];

  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {/* Teal accent line */}
      <div className='h-1 bg-gradient-to-r from-hunter-800 to-hunter-900'></div>

      <CardHeader className='pb-4'>
        <div className='flex items-start gap-6'>
          {image && (
            <div className='shrink-0'>
              <img
                src={image}
                alt={imageAlt ?? name ?? title ?? 'Profile image'}
                className='size-20 rounded-full border-2 border-hunter-200 object-cover shadow-md'
              />
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'>
              {name ?? title}
            </h2>
            <p className='mb-3 break-words font-sans text-lg font-medium text-hunter-600 dark:text-hunter-400'>
              {role ?? description}
            </p>
            {badgeArray.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {badgeArray.map((badge: string, index: number) => (
                  <Badge
                    key={index}
                    variant='outline'
                    className='border-hunter-200 text-xs text-hunter-700 dark:text-hunter-300'
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
        <CardContent className='min-w-0 flex-1'>
          <div className='card-content min-w-0 break-words font-sans text-base leading-relaxed text-gray-600 dark:text-gray-300'>
            <CardMarkdownContent content={children} />
          </div>
        </CardContent>
      )}
      {Object.keys(contact).length > 0 && (
        <CardFooter className='pt-0'>
          <div className='flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400'>
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className='flex items-center gap-1 hover:text-hunter-600'
              >
                <Mail className='size-4' />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className='flex items-center gap-1 hover:text-hunter-600'
              >
                <Phone className='size-4' />
                {contact.phone}
              </a>
            )}
            {contact.github && (
              <a
                href={contact.github}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1 hover:text-hunter-600'
              >
                <Github className='size-4' />
                GitHub
              </a>
            )}
            {contact.website && (
              <a
                href={contact.website}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1 hover:text-hunter-600'
              >
                <ExternalLink className='size-4' />
                Website
              </a>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

// Stats Card Component
export const StatsCard: React.FC<
  BaseCardProps & {
    stats?: string[] | string;
  }
> = ({ title, description, stats = [], className, children }) => {
  // Handle badges as either string or array
  const statsArray = Array.isArray(stats)
    ? stats
    : typeof stats === 'string'
      ? stats
          .split(',')
          .map((stat: string) => stat.trim())
          .filter((stat: string) => stat.length > 0)
      : [];

  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {/* Teal accent line */}
      <div className='h-1 bg-gradient-to-r from-hunter-800 to-hunter-900'></div>

      {(title ?? description) && (
        <CardHeader className='pb-4'>
          {title && (
            <CardTitle className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className='break-words font-sans text-lg font-medium text-hunter-600 dark:text-hunter-400'>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent
        className={cn('min-w-0 flex-1', !title && !description && 'pt-6')}
      >
        {statsArray.length > 0 && (
          <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {statsArray.map((stat: string, index: number) => {
              const [label, value] = stat
                .split(':')
                .map((s: string) => s.trim());
              return (
                <div
                  key={index}
                  className='rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-hunter-50 p-4 text-center dark:border-slate-600 dark:from-slate-800/20 dark:to-hunter-800/20'
                >
                  <div className='text-2xl font-bold text-hunter-600 dark:text-hunter-400'>
                    {value}
                  </div>
                  <div className='mt-1 text-sm text-gray-600 dark:text-gray-300'>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {children && (
          <div className='card-content min-w-0 break-words font-sans text-base leading-relaxed text-gray-600 dark:text-gray-300'>
            <CardMarkdownContent content={children} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Timeline Card Component
export const TimelineCard: React.FC<
  BaseCardProps & {
    items?: Array<{
      date: string;
      title: string;
      description?: string;
      badge?: string;
    }>;
  }
> = ({ title, description, items = [], className, children }) => {
  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {/* Teal accent line */}
      <div className='h-1 bg-gradient-to-r from-hunter-800 to-hunter-900'></div>

      {(title ?? description) && (
        <CardHeader className='pb-4'>
          {title && (
            <CardTitle className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className='break-words font-sans text-lg font-medium text-hunter-600 dark:text-hunter-400'>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent
        className={cn('min-w-0 flex-1', !title && !description && 'pt-6')}
      >
        {items.length > 0 && (
          <div className='mb-6 space-y-4'>
            {items.map((item, index) => (
              <div key={index} className='flex gap-4'>
                <div className='mt-2 size-2 shrink-0 rounded-full bg-hunter-500'></div>
                <div className='min-w-0 flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <span className='text-sm font-medium text-hunter-600 dark:text-hunter-400'>
                      {item.date}
                    </span>
                    {item.badge && (
                      <Badge
                        variant='outline'
                        className='border-hunter-200 text-xs text-hunter-700 dark:text-hunter-300'
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className='mt-1 break-words text-sm text-gray-600 dark:text-gray-300'>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {children && (
          <div className='card-content min-w-0 break-words font-sans text-base leading-relaxed text-gray-600 dark:text-gray-300'>
            <CardMarkdownContent content={children} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Hero Card Component - Large, prominent card for key content
export const HeroCard: React.FC<
  BaseCardProps & {
    size?: 'sm' | 'md' | 'lg';
    image?: string;
    imageAlt?: string;
    badges?: string[] | string;
    cta?: {
      text: string;
      link: string;
      variant?: 'default' | 'outline' | 'secondary';
    };
  }
> = ({
  title,
  description,
  size = 'md',
  image,
  imageAlt,
  badges = [],
  cta,
  className,
  children,
}) => {
  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges)
    ? badges
    : typeof badges === 'string'
      ? badges
          .split(',')
          .map((badge: string) => badge.trim())
          .filter((badge: string) => badge.length > 0)
      : [];

  const sizes = {
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-12',
  };

  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {/* Teal accent line */}
      <div className='h-1 bg-gradient-to-r from-hunter-800 to-hunter-900'></div>

      <CardHeader className={cn('pb-4', sizes[size])}>
        <div className='flex items-start gap-6'>
          {image && (
            <div className='shrink-0'>
              <img
                src={image}
                alt={imageAlt ?? title ?? 'Hero image'}
                className='size-16 rounded-lg border-2 border-hunter-200 object-cover shadow-md'
              />
            </div>
          )}
          <div className='min-w-0 flex-1'>
            {title && (
              <CardTitle
                className={cn(
                  'mb-2 text-gray-900 dark:text-gray-100',
                  size === 'lg'
                    ? 'text-3xl'
                    : size === 'md'
                      ? 'text-2xl'
                      : 'text-xl'
                )}
              >
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription
                className={cn(
                  'mb-4 break-words font-sans font-medium text-hunter-600 dark:text-hunter-400',
                  size === 'lg' ? 'text-lg' : 'text-base'
                )}
              >
                {description}
              </CardDescription>
            )}
            {badgeArray.length > 0 && (
              <div className='mb-4 flex flex-wrap gap-2'>
                {badgeArray.map((badge: string, index: number) => (
                  <Badge
                    key={index}
                    variant='outline'
                    className='border-hunter-200 text-hunter-700 dark:text-hunter-300'
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
            {cta && (
              <Button
                variant={cta.variant ?? 'default'}
                size={size === 'lg' ? 'lg' : 'default'}
                asChild
                className='mt-2'
              >
                <a href={cta.link} target='_blank' rel='noopener noreferrer'>
                  {cta.text}
                  <ExternalLink className='ml-2 size-4' />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className='min-w-0 flex-1'>
          <div className='card-content min-w-0 break-words font-sans text-base leading-relaxed text-gray-600 dark:text-gray-300'>
            <CardMarkdownContent content={children} />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Success Card Component - Green accent for positive content
export const SuccessCard: React.FC<
  BaseCardProps & {
    icon?: string;
  }
> = ({
  title,
  description,
  badges = [],
  icon = 'check',
  className,
  children,
}) => {
  const getIcon = (iconName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      check: <CheckCircle className='size-6' />,
      award: <Award className='size-6' />,
      star: <Star className='size-6' />,
      target: <Target className='size-6' />,
    };
    return icons[iconName ?? 'check'] ?? <CheckCircle className='size-6' />;
  };

  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges)
    ? badges
    : typeof badges === 'string'
      ? badges
          .split(',')
          .map(badge => badge.trim())
          .filter(badge => badge.length > 0)
      : [];

  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {/* Green accent line */}
      <div className='h-1 bg-gradient-to-r from-hunter-600 to-hunter-800'></div>

      <CardHeader className='pb-4'>
        <div className='flex items-start gap-4'>
          <div className='shrink-0 rounded-xl bg-gradient-to-br from-hunter-100 to-hunter-200 p-3 text-hunter-700 shadow-sm dark:from-hunter-900/50 dark:to-hunter-800/50 dark:text-hunter-400'>
            {getIcon(icon)}
          </div>
          <div className='min-w-0 flex-1'>
            {title && (
              <CardTitle className='mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className='break-words font-sans text-lg font-medium text-green-600 dark:text-green-400'>
                {description}
              </CardDescription>
            )}
            {badgeArray.length > 0 && (
              <div className='mt-3 flex flex-wrap gap-2'>
                {badgeArray.map((badge, index) => (
                  <Badge
                    key={index}
                    variant='outline'
                    className='border-green-200 text-xs text-green-700 dark:text-green-300'
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
        <CardContent className='min-w-0 flex-1'>
          <div className='card-content min-w-0 break-words font-sans text-base leading-relaxed text-gray-600 dark:text-gray-300'>
            <CardMarkdownContent content={children} />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Warning Card Component - Orange accent for important notices
export const WarningCard: React.FC<
  BaseCardProps & {
    icon?: string;
  }
> = ({
  title,
  description,
  badges = [],
  icon = 'alert',
  className,
  children,
}) => {
  const getIcon = (iconName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      alert: <AlertCircle className='size-6' />,
      info: <Info className='size-6' />,
      shield: <Shield className='size-6' />,
      lock: <Lock className='size-6' />,
    };
    return icons[iconName ?? 'alert'] ?? <AlertCircle className='size-6' />;
  };

  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges)
    ? badges
    : typeof badges === 'string'
      ? badges
          .split(',')
          .map(badge => badge.trim())
          .filter(badge => badge.length > 0)
      : [];

  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {/* Orange accent line */}
      <div className='h-1 bg-gradient-to-r from-orange-600 to-red-600'></div>

      <CardHeader className='pb-4'>
        <div className='flex items-start gap-4'>
          <div className='shrink-0 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 p-3 text-orange-600 shadow-sm dark:from-orange-900/50 dark:to-red-900/50 dark:text-orange-400'>
            {getIcon(icon)}
          </div>
          <div className='min-w-0 flex-1'>
            {title && (
              <CardTitle className='mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className='break-words font-sans text-lg font-medium text-orange-600 dark:text-orange-400'>
                {description}
              </CardDescription>
            )}
            {badgeArray.length > 0 && (
              <div className='mt-3 flex flex-wrap gap-2'>
                {badgeArray.map((badge, index) => (
                  <Badge
                    key={index}
                    variant='outline'
                    className='border-orange-200 text-xs text-orange-700 dark:text-orange-300'
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
        <CardContent className='min-w-0 flex-1'>
          <div className='card-content min-w-0 break-words font-sans text-base leading-relaxed text-gray-600 dark:text-gray-300'>
            <CardMarkdownContent content={children} />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Tech Card Component - Blue accent for technical content
export const TechCard: React.FC<
  BaseCardProps & {
    icon?: string;
  }
> = ({
  title,
  description,
  icon = 'code',
  badges = [],
  className,
  children,
}) => {
  const getIcon = (iconName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      code: <Code className='size-6' />,
      database: <Database className='size-6' />,
      cloud: <Cloud className='size-6' />,
      rocket: <Rocket className='size-6' />,
      zap: <Zap className='size-6' />,
    };
    return icons[iconName ?? 'code'] ?? <Code className='size-6' />;
  };

  // Handle badges as either string or array
  const badgeArray = Array.isArray(badges)
    ? badges
    : typeof badges === 'string'
      ? badges
          .split(',')
          .map(badge => badge.trim())
          .filter(badge => badge.length > 0)
      : [];

  return (
    <Card
      className={cn(
        'tech-card flex h-full flex-col overflow-hidden border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {/* Blue accent line */}
      <div className='h-1 bg-gradient-to-r from-hunter-700 to-hunter-900'></div>

      <CardHeader className='pb-4'>
        <div className='flex items-start gap-4'>
          <div className='shrink-0 rounded-xl bg-gradient-to-br from-hunter-100 to-hunter-200 p-3 text-hunter-600 shadow-sm dark:from-hunter-900/50 dark:to-hunter-800/50 dark:text-hunter-400'>
            {getIcon(icon)}
          </div>
          <div className='min-w-0 flex-1'>
            {title && (
              <CardTitle className='overflow-wrap-break-word mb-2 whitespace-normal break-words text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className='overflow-wrap-break-word mb-3 whitespace-normal break-words font-sans text-lg font-medium text-hunter-600 dark:text-hunter-400'>
                {description}
              </CardDescription>
            )}
            {badgeArray.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {badgeArray.map((badge, index) => (
                  <Badge
                    key={index}
                    variant='outline'
                    className='border-hunter-200 text-xs text-hunter-700 dark:text-hunter-300'
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
        <CardContent className='min-w-0 flex-1'>
          <div className='overflow-wrap-break-word card-content min-w-0 whitespace-normal break-words font-sans text-base leading-relaxed text-gray-600 dark:text-gray-300'>
            <CardMarkdownContent content={children} />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Hero Profile Card Component - For main profile display
export const HeroProfileCard: React.FC<
  BaseCardProps & {
    name?: string;
    title?: string;
    image?: string;
    imageAlt?: string;
    badges?: string[] | string;
  }
> = ({
  title,
  description,
  name,
  image,
  imageAlt,
  badges = [],
  className,
  children,
}) => {
  // Handle badges as either string, array of strings, or array of objects with variant
  const badgeArray: Array<
    string | { text: string; variant?: 'gold' | 'hunter' | 'slate' }
  > = Array.isArray(badges)
    ? badges
    : typeof badges === 'string'
      ? badges
          .split(',')
          .map(badge => badge.trim())
          .filter(badge => badge.length > 0)
      : [];

  return (
    <div className={cn('hero-profile-card-wrapper relative', className)}>
      <Card
        className={cn(
          'hero-profile-card via-slate-900/98 relative overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl'
        )}
      >
        {/* Top accent gradient bar */}
        <div className='h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent'></div>

        <CardHeader className='py-8'>
          <div className='flex items-start gap-8'>
            {image && (
              <div className='relative shrink-0'>
                {/* Glow effect behind image */}
                <div className='absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-br from-gold-600/20 to-hunter-600/20 opacity-60 blur-2xl'></div>
                <img
                  src={image}
                  alt={imageAlt ?? name ?? title ?? 'Profile image'}
                  className='size-40 rounded-2xl border-2 border-gold-500/40 object-cover shadow-2xl ring-2 ring-gold-400/20'
                />
              </div>
            )}
            <div className='min-w-0 flex-1'>
              {/* Name with premium styling */}
              <div className='mb-2'>
                <h2 className='bg-gradient-to-r from-white via-slate-100 to-gold-300 bg-clip-text text-4xl font-bold text-transparent'>
                  {name ?? title}
                </h2>
              </div>

              {/* Professional title in gold */}
              {title && (
                <p className='mb-3 text-base font-semibold text-gold-400'>
                  {title}
                </p>
              )}

              {/* Description - compelling call to action */}
              <p className='mb-6 text-base font-medium leading-relaxed text-slate-200'>
                {description}
              </p>

              {/* CTA-style subtext */}
              <p className='mb-5 text-sm italic text-slate-400'>
                Discover how enterprise-grade solutions and strategic vision
                drive measurable transformation.
              </p>

              {/* Badges - enhanced styling */}
              {badgeArray.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {badgeArray.map((badge, index: number) => {
                    const badgeText =
                      typeof badge === 'string' ? badge : badge.text;
                    const variant =
                      typeof badge === 'object' ? badge.variant : undefined;

                    return (
                      <Badge
                        key={index}
                        variant='outline'
                        className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                          variant === 'gold'
                            ? 'border-gold-500/60 bg-gold-500/15 text-gold-300 shadow-lg shadow-gold-500/10 hover:border-gold-400/80 hover:bg-gold-500/25'
                            : variant === 'hunter'
                              ? 'border-hunter-500/60 bg-hunter-600/15 text-hunter-300 shadow-lg shadow-hunter-500/10 hover:border-hunter-400/80 hover:bg-hunter-600/25'
                              : 'border-slate-600/60 bg-slate-800/50 text-slate-200 shadow-lg shadow-slate-600/10 hover:border-slate-500/80 hover:bg-slate-700/70'
                        }`}
                      >
                        {badgeText}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {children && (
          <CardContent className='pb-8'>
            <div className='hero-profile-content markdown-card-content space-y-6 break-words font-sans text-base leading-relaxed text-slate-300'>
              <CardMarkdownContent content={children} />
            </div>
          </CardContent>
        )}

        {/* Bottom accent glow */}
        <div className='absolute bottom-0 right-0 -z-10 size-64 rounded-full bg-gradient-to-tl from-gold-600/15 via-hunter-600/10 to-transparent blur-3xl'></div>
      </Card>
    </div>
  );
};

// Multi-Column Card Container
export const MultiColumnCards: React.FC<{
  columns: 2 | 3;
  cards: Array<{
    type: string;
    props: Record<string, unknown>;
    content: string;
  }>;
  className?: string;
}> = ({ columns, cards, className }) => {
  const gridClass =
    columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  const renderCard = (
    card: { type: string; props: Record<string, unknown>; content: string },
    index: number
  ) => {
    const { type, props, content } = card;

    switch (type) {
      case 'info':
        return (
          <InfoCard key={index} {...props}>
            {content}
          </InfoCard>
        );
      case 'feature':
        return (
          <FeatureCard key={index} {...props}>
            {content}
          </FeatureCard>
        );
      case 'profile':
        return (
          <ProfileCard key={index} {...props}>
            {content}
          </ProfileCard>
        );
      case 'stats':
        return (
          <StatsCard key={index} {...props}>
            {content}
          </StatsCard>
        );
      case 'timeline':
        return (
          <TimelineCard key={index} {...props}>
            {content}
          </TimelineCard>
        );
      case 'hero':
        return (
          <HeroCard key={index} {...props}>
            {content}
          </HeroCard>
        );
      case 'success':
        return (
          <SuccessCard key={index} {...props}>
            {content}
          </SuccessCard>
        );
      case 'warning':
        return (
          <WarningCard key={index} {...props}>
            {content}
          </WarningCard>
        );
      case 'tech':
        return (
          <TechCard key={index} {...props}>
            {content}
          </TechCard>
        );
      case 'hero-profile':
        return (
          <HeroProfileCard key={index} {...props}>
            {content}
          </HeroProfileCard>
        );
      default:
        return (
          <div
            key={index}
            className='rounded-lg border border-red-200 bg-red-50 p-4'
          >
            <p className='text-red-600'>Unknown card type: {type}</p>
            <pre className='mt-2 text-xs'>{String(content)}</pre>
          </div>
        );
    }
  };

  return (
    <div className={cn('grid gap-6', gridClass, className)}>
      {cards.map((card, index) => (
        <div key={index} className='h-full'>
          {renderCard(card, index)}
        </div>
      ))}
    </div>
  );
};
