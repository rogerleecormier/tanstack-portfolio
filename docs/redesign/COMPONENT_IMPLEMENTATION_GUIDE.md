# Component Implementation Guide

## Overview
This guide maps the design system to React components and provides code patterns for implementation.

---

## 1. LAYOUT COMPONENTS

### Header Component
**File**: `src/layout/Header.tsx` (update)

**Requirements**:
- Fixed/sticky positioning
- Logo + brand name
- Navigation links (Home, Portfolio, Projects, Blog, Contact)
- "Get In Touch" CTA button
- Mobile hamburger menu (trigger AppSidebar)
- Responsive navigation (hide on mobile)

**Implementation Pattern**:
```tsx
export default function Header() {
  const { state } = useRouterContext()
  const location = state.location
  
  return (
    <header className="sticky top-0 bg-gradient-to-r from-surface-deep to-precision-charcoal border-b border-border-subtle backdrop-blur-sm z-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-900/20 border-2 border-strategy-gold rounded-full flex items-center justify-center text-strategy-gold font-bold">🎯</div>
          <span className="hidden sm:inline text-lg font-bold text-foreground">Roger Lee Cormier</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-8 items-center">
          <NavLink href="/" active={isActive('/')}>Home</NavLink>
          <NavLink href="/portfolio" active={isActive('/portfolio')}>Portfolio</NavLink>
          <NavLink href="/projects" active={isActive('/projects')}>Projects</NavLink>
          <NavLink href="/blog" active={isActive('/blog')}>Blog</NavLink>
          <NavLink href="/contact" active={isActive('/contact')}>Contact</NavLink>
        </nav>
        
        {/* CTA Button */}
        <Button className="hidden md:inline bg-strategy-gold text-precision-charcoal hover:brightness-110">
          Get In Touch
        </Button>
        
        {/* Mobile Menu Button */}
        <SidebarTrigger className="lg:hidden" />
      </div>
    </header>
  )
}

function NavLink({ href, children, active }: any) {
  return (
    <a 
      href={href}
      className={`text-muted-foreground hover:text-strategy-gold transition-colors relative ${
        active ? 'text-strategy-gold' : ''
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-strategy-gold" />
      )}
    </a>
  )
}
```

---

### Footer Component
**File**: `src/layout/Footer.tsx` (update)

**Requirements**:
- 4-column layout (Portfolio, Content, Info, Connect)
- Footer divider
- Copyright notice
- Responsive to single column

**Implementation Pattern**:
```tsx
export default function Footer() {
  const sections = [
    {
      title: 'Portfolio',
      links: [
        { label: 'Projects', href: '/projects' },
        { label: 'Case Studies', href: '/projects' },
        { label: 'Archive', href: '/portfolio' },
      ],
    },
    {
      title: 'Content',
      links: [
        { label: 'Articles', href: '/blog' },
        { label: 'Guides', href: '/blog' },
        { label: 'Resources', href: '/blog' },
      ],
    },
    // ... more sections
  ]

  return (
    <footer className="bg-surface-elevated border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {sections.map(section => (
            <div key={section.title}>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.links.map(link => (
                  <Link 
                    key={link.href}
                    to={link.href}
                    className="text-muted-foreground hover:text-strategy-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <Separator className="bg-border-subtle" />
        
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>&copy; 2025 Roger Lee Cormier. Full-Stack Engineer & Technical Leader.</p>
        </div>
      </div>
    </footer>
  )
}
```

---

## 2. SECTION COMPONENTS

### Hero Section Component
**File**: `src/components/sections/HeroSection.tsx` (new)

**Props**:
```tsx
interface HeroSectionProps {
  profile?: {
    name: string
    role: string
    avatar?: string
  }
  title: string
  subtitle?: string
  description: string
  stats?: Array<{ number: string; label: string }>
  ctas?: Array<{ label: string; href?: string; variant?: 'primary' | 'secondary' }>
}
```

**Implementation Pattern**:
```tsx
export function HeroSection({
  profile,
  title,
  subtitle,
  description,
  stats = [],
  ctas = [],
}: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-b from-surface-elevated to-surface-base border border-border-subtle rounded-lg p-12 mb-24 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-radial from-strategy-gold/10 to-transparent pointer-events-none" />
      
      {/* Profile Section */}
      {profile && (
        <div className="flex flex-col items-center text-center lg:col-span-2 relative z-10">
          <div className="w-40 h-40 bg-strategy-gold/10 border-4 border-strategy-gold rounded-full flex items-center justify-center mb-6 shadow-lg shadow-strategy-gold/20">
            <span className="text-6xl">{profile.avatar || '👨‍💻'}</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{profile.name}</h2>
          <p className="text-sm font-semibold text-strategy-gold uppercase tracking-wider">{profile.role}</p>
        </div>
      )}
      
      {/* Content Section */}
      <div className={profile ? 'lg:col-span-3' : 'lg:col-span-5'} className="relative z-10">
        {subtitle && (
          <p className="text-sm font-semibold text-strategy-gold uppercase tracking-wider mb-3">
            {subtitle}
          </p>
        )}
        
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
          {title}
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl">
          {description}
        </p>
        
        {/* Stats Grid */}
        {stats.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map(stat => (
              <div key={stat.label} className="bg-strategy-gold/5 border border-border-subtle rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-strategy-gold">{stat.number}</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* CTAs */}
        {ctas.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {ctas.map((cta, idx) => (
              <Button
                key={idx}
                variant={cta.variant === 'secondary' ? 'outline' : 'default'}
                className={cta.variant === 'secondary' ? 'border-strategy-gold text-strategy-gold' : ''}
              >
                {cta.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
```

---

### Section Header Component
**File**: `src/components/sections/SectionHeader.tsx` (new)

**Props**:
```tsx
interface SectionHeaderProps {
  title: string
  subtitle?: string
  divider?: boolean
}
```

**Implementation Pattern**:
```tsx
export function SectionHeader({ title, subtitle, divider = true }: SectionHeaderProps) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
        {title}
      </h2>
      
      {divider && (
        <div className="w-16 h-1 bg-gradient-to-r from-strategy-gold to-transparent rounded-full my-4" />
      )}
      
      {subtitle && (
        <p className="text-lg text-muted-foreground max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}
```

---

### Timeline Component
**File**: `src/components/sections/Timeline.tsx` (new)

**Props**:
```tsx
interface TimelineItem {
  id: string
  title: string
  company: string
  date: string
  description: string
  achievements: string[]
  skills?: string[]
  side?: 'left' | 'right' | 'auto'
}

interface TimelineProps {
  items: TimelineItem[]
}
```

**Implementation Pattern**:
```tsx
export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      {/* Center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-strategy-gold to-transparent" />
      
      <div className="space-y-12">
        {items.map((item, idx) => (
          <div key={item.id} className="relative">
            {/* Circle connector */}
            <div className="absolute left-1/2 top-6 -translate-x-1/2 w-6 h-6 bg-surface-base border-2 border-strategy-gold rounded-full" />
            
            {/* Content */}
            <div className={`grid grid-cols-2 gap-8 ${idx % 2 === 0 ? '' : 'direction-rtl'}`}>
              {/* Left side - empty on alternating */}
              <div className={idx % 2 === 0 ? 'pr-8' : 'text-right pl-8'}>
                {idx % 2 === 0 && (
                  <Card className="bg-surface-elevated border-border-subtle hover:border-strategy-gold transition-all">
                    <CardHeader>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <CardDescription>{item.company}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{item.date}</p>
                      <p className="text-sm mb-4">{item.description}</p>
                      <ul className="space-y-2">
                        {item.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-sm flex gap-2">
                            <span className="text-strategy-gold">✓</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                      {item.skills && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {item.skills.map(skill => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Right side */}
              <div className={idx % 2 === 1 ? 'pl-8' : ''}>
                {idx % 2 === 1 && (
                  // Same card structure
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 3. CARD COMPONENTS

### Project Card Component
**File**: `src/components/cards/ProjectCard.tsx` (new/update)

**Props**:
```tsx
interface ProjectCardProps {
  title: string
  description: string
  tags: string[]
  icon?: string
  impact?: string
  href?: string
}
```

**Implementation Pattern**:
```tsx
export function ProjectCard({
  title,
  description,
  tags,
  icon = '💻',
  impact,
  href,
}: ProjectCardProps) {
  return (
    <Card className="bg-surface-elevated border-border-subtle hover:border-strategy-gold hover:shadow-lg transition-all duration-300 hover:scale-95 group">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-strategy-gold/10 border border-strategy-gold/20 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl group-hover:text-strategy-gold transition-colors">
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {description}
        </p>
        
        {impact && (
          <p className="text-sm text-strategy-gold font-semibold mb-4">
            {impact}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge key={tag} variant="outline" className="bg-strategy-gold/5 border-strategy-gold/20 text-strategy-gold">
              {tag}
            </Badge>
          ))}
        </div>
        
        {href && (
          <Button variant="ghost" className="text-strategy-gold mt-4 group-hover:gap-2 transition-all">
            View Details
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

---

### Blog Card Component
**File**: `src/components/cards/BlogCard.tsx` (new/update)

**Props**:
```tsx
interface BlogCardProps {
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  tags: string[]
  featured?: boolean
  href?: string
}
```

**Implementation Pattern**:
```tsx
export function BlogCard({
  title,
  excerpt,
  category,
  date,
  readTime,
  tags,
  featured = false,
  href,
}: BlogCardProps) {
  return (
    <Card className={`${featured ? 'lg:col-span-2' : ''} bg-surface-elevated border-border-subtle hover:border-strategy-gold transition-all group`}>
      <CardHeader>
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="bg-secondary/10 border-secondary/20 text-secondary">
            {category}
          </Badge>
          {featured && <span className="text-xl">⭐</span>}
        </div>
        <CardTitle className={`${featured ? 'text-2xl' : 'text-xl'} group-hover:text-strategy-gold transition-colors`}>
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {excerpt}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{date}</span>
          <span>{readTime}</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 4. FORM COMPONENTS

### Contact Form Component
**File**: `src/components/forms/ContactForm.tsx` (update)

**Requirements**:
- Real-time AI analysis
- Field validation
- Dynamic CTA button
- Success/error states
- Loading states

**Key Integration Points**:
- Use existing `analyzeContactForm` from `contactAnalyzer`
- Use existing `sendEmail` from `emailService`
- Show AI analysis results dynamically
- Optional meeting scheduler

---

## 5. UTILITY HOOKS

### usePageActive Hook
```tsx
export function usePageActive() {
  const { state } = useRouterContext()
  
  const isActive = (path: string) => {
    return state.location.pathname === path
  }
  
  return { isActive }
}
```

---

## 6. LAYOUT TEMPLATES

### Single Column Layout
```tsx
export function SingleColumnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-24">
      {children}
    </div>
  )
}
```

### Two Column Layout (for Portfolio, Contact)
```tsx
export function TwoColumnLayout({
  left,
  right,
}: {
  left: React.ReactNode
  right: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  )
}
```

---

## Implementation Checklist

- [ ] Update Header.tsx
- [ ] Update Footer.tsx
- [ ] Create SectionHeader.tsx
- [ ] Create HeroSection.tsx
- [ ] Create Timeline.tsx (for Portfolio)
- [ ] Create/Update ProjectCard.tsx
- [ ] Create/Update BlogCard.tsx
- [ ] Create/Update ContactForm.tsx
- [ ] Update IndexPage.tsx
- [ ] Update PortfolioListPage.tsx
- [ ] Update ProjectsListPage.tsx
- [ ] Update BlogListPage.tsx
- [ ] Update ContactPage.tsx
- [ ] Test responsive design
- [ ] Test accessibility
- [ ] Performance optimization

---

**Next Steps**:
1. Start with Header and Footer
2. Create reusable section components
3. Gradually refactor each page
4. Test incrementally

**Last Updated**: November 23, 2025
