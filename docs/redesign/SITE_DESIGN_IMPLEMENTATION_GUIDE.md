# Portfolio Site Design System - Implementation Guide

## Overview
This document aligns the Precision Strategy design system with your actual React/TanStack infrastructure. It defines the design specifications for 5 dedicated pages and provides implementation guidelines.

---

## Page Architecture

### 1. **Home/Index Page** (`/`)
**Purpose**: Introduction and featured work showcase  
**Current File**: `src/pages/IndexPage.tsx`

**Key Sections**:
- Hero Section with profile and quick stats
- Featured Work (2-3 selected projects)
- Core Expertise (3 feature cards)
- Featured Blog Posts (carousel or grid)
- Call-to-Action Section

**Design Pattern**:
- Hero: 2-column layout (profile left, content right)
- Cards: 2-column responsive grid
- Feature sections: 3-column grid
- Mobile: All sections stack vertically

---

### 2. **Portfolio Page** (`/portfolio`)
**Purpose**: Professional background and resume information  
**Current File**: `src/pages/PortfolioListPage.tsx`

**Key Sections**:
- Professional Summary (hero section)
- Experience Timeline
- Technical Skills (categorized)
- Education & Certifications
- Awards & Recognition
- Download Resume CTA

**Design Pattern**:
- Summary: Similar hero as index but narrower
- Timeline: Vertical timeline with cards on left/right alternating
- Skills: Grid of skill categories with proficiency badges
- Responsive: Timeline adjusts to single column on mobile

**Component Structure**:
```
PortfolioPage
├── Hero (Professional Summary)
├── Experience Timeline
├── Technical Skills Grid
├── Education Section
└── CTA Section
```

---

### 3. **Projects Page** (`/projects`)
**Purpose**: Showcase all technical projects  
**Current File**: `src/pages/ProjectsListPage.tsx`

**Key Sections**:
- Page Header with search/filter
- Filterable Project Grid
- Sort Options (Recent, Popular, Category)
- Project Detail Cards with:
  - Title and Description
  - Tech Stack (tags)
  - Impact Metrics
  - View Details Link

**Design Pattern**:
- Header: Title + Search bar + Filter dropdown
- Grid: 2 columns on desktop, 1 on mobile
- Cards: Minimal design with hover effects
- Sidebar (optional): Filter panel on desktop

**Component Structure**:
```
ProjectsPage
├── Header (Search/Filter)
├── Filter Panel (desktop)
├── Project Grid
│   └── ProjectCard (with tags)
└── Pagination/Load More
```

**Future Merge Note**: Tools will be merged into this page. Consider categories or tabs for organization.

---

### 4. **Blog Page** (`/blog`)
**Purpose**: Article index and discovery  
**Current File**: `src/pages/BlogListPage.tsx`

**Key Sections**:
- Page Header
- Featured Post (large card)
- Recent Posts Grid
- Search & Filter
- Category Tags
- Newsletter Signup

**Design Pattern**:
- Featured: Large card spanning full width
- Grid: 3 columns on desktop, 1 on mobile
- Cards: Include date, reading time, category badge
- Sidebar (optional): Categories and recent posts

**Component Structure**:
```
BlogPage
├── Hero/Header
├── Featured Post (large)
├── Search & Filter
├── Recent Posts Grid
│   └── BlogCard (with metadata)
├── Newsletter Signup
└── Pagination
```

---

### 5. **Contact Page** (`/contact`)
**Purpose**: Contact information and inquiry form  
**Current File**: `src/pages/ContactPage.tsx`

**Key Sections**:
- Contact Header
- Contact Information (email, social links)
- Contact Form
- Alternative Contact Methods
- AI Meeting Scheduler (optional)
- Response Expectations

**Design Pattern**:
- Header: Clear CTA with context
- 2-column layout: Contact info (left), Form (right)
- Form: Clean, minimal with clear labels
- Success State: Confirmation message
- Mobile: Stack vertically

**Component Structure**:
```
ContactPage
├── Hero Section
├── Contact Info Grid
│   ├── Email
│   ├── LinkedIn
│   ├── GitHub
│   └── Twitter
├── Contact Form
├── Meeting Scheduler (optional)
└── Footer CTA
```

---

## Design System Implementation

### Color Palette (Tailwind Variables)
```javascript
// From your tailwind.config.js
precision: {
  charcoal: '#121729',
  charcoal-light: '#2B2F46',
  charcoal-lighter: '#3D4256',
}

strategy: {
  gold: '#FFD700',
  gold-dark: '#FFA500',
  emerald: '#66CC99',
  amber: '#FFA500',
  rose: '#E85D5D',
}
```

### Typography System
- **Headlines**: `font-bold`, `font-900`
- **Body**: `font-normal`, `font-500`
- **Accents**: `text-strategy-gold`
- **Secondary**: `text-muted-foreground`

### Component Patterns

#### Card Pattern
```tsx
<Card className="hover:border-strategy-gold hover:shadow-lg transition-all">
  <CardHeader>
    <CardIcon className="mb-4" />
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Description</p>
    <div className="flex flex-wrap gap-2">
      <Badge>Tag1</Badge>
      <Badge>Tag2</Badge>
    </div>
  </CardContent>
</Card>
```

#### Button Pattern
```tsx
// Primary
<Button className="bg-strategy-gold text-precision-charcoal hover:brightness-110">
  Get Started
</Button>

// Secondary
<Button variant="outline" className="border-strategy-gold text-strategy-gold">
  Learn More
</Button>
```

#### Grid Patterns
```tsx
// 2-column (projects, featured work)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

// 3-column (expertise, skills)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 4-column (small cards, tags)
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

---

## Navigation & Structure

### Header Navigation
- Fixed/Sticky header
- Logo + Brand name
- Nav links: Home, Portfolio, Projects, Blog, Contact
- CTA button: "Get In Touch"
- Mobile: Hamburger menu (delegate to AppSidebar)

### Sidebar (Mobile)
- Leverages existing `AppSidebar` component
- Profile section with avatar
- Quick TOC links
- Quick action buttons

### Footer
- 4-column layout (Portfolio, Content, Info, Connect)
- Links organized by category
- Copyright notice
- Responsive to single column on mobile

---

## Responsive Breakpoints

```css
/* Tailwind breakpoints */
sm: 640px    /* Mobile */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop */
xl: 1280px   /* Wide Desktop */
2xl: 1400px  /* Max width constraint */
```

### Layout Adjustments
| Breakpoint | Changes |
|-----------|---------|
| < 768px   | Stack all grids to 1 column, hide nav, show mobile menu |
| 768-1024px | 2-column grids, sidebar navigation appears |
| > 1024px  | Full layouts, all features visible |

---

## Implementation Priority

### Phase 1: Core Layout & Components
1. Update Header component for consistency
2. Create unified Card components
3. Build page templates (hero, section layouts)
4. Implement footer

### Phase 2: Individual Pages
1. Refine IndexPage with new design
2. Update PortfolioListPage
3. Update ProjectsListPage
4. Update BlogListPage
5. Update ContactPage

### Phase 3: Polish & Refinement
1. Animations and transitions
2. Accessibility improvements
3. Performance optimization
4. Mobile testing

---

## Component Mapping

### Existing Components to Leverage
- `AppSidebar` - Mobile navigation
- `Card`, `CardHeader`, `CardContent` - Cards
- `Badge` - Tags and labels
- `Button` - All CTA elements
- `Input`, `Textarea` - Form fields
- `Skeleton` - Loading states
- `Dialog` - Modals (optional)

### New/Updated Components Needed
- Enhanced Header with navigation
- Page template wrapper
- Hero section component
- Feature card variant
- Timeline component (for Portfolio)
- Newsletter signup variant

---

## Future Enhancements

### Tools Page Merge
When merging Tools into Projects:
- Add category/type filter
- Create "Tools" category or toggle
- Consider separate view for interactive tools
- Maintain Tools-specific styling if needed

### Advanced Features
- Dark/Light mode toggle (already in design)
- Search functionality (already implemented)
- Filtering and sorting (already implemented)
- Related content suggestions
- Reading time estimates (for blog)
- Social share buttons

---

## Accessibility Checklist

- [ ] ARIA labels on buttons and icons
- [ ] Semantic HTML structure
- [ ] Keyboard navigation support
- [ ] Color contrast ratios (7:1 for primary text)
- [ ] Focus states visible
- [ ] Alt text on images
- [ ] Proper heading hierarchy (h1, h2, h3...)
- [ ] Form labels and error messages

---

## Performance Considerations

- Lazy load images in grids
- Code split pages (already done with lazy imports)
- Cache API responses (cachedContentService)
- Optimize animations (prefers-reduced-motion)
- Minimize layout shifts
- Responsive images

---

## File Organization

```
src/
├── pages/
│   ├── IndexPage.tsx (redesign)
│   ├── PortfolioListPage.tsx (rename to PortfolioPage)
│   ├── ProjectsListPage.tsx (update)
│   ├── BlogListPage.tsx (update)
│   └── ContactPage.tsx (update)
├── components/
│   ├── layout/
│   │   ├── Header.tsx (enhance)
│   │   └── Footer.tsx (update)
│   ├── cards/
│   │   ├── ProjectCard.tsx
│   │   ├── BlogCard.tsx
│   │   └── FeatureCard.tsx
│   └── sections/
│       ├── HeroSection.tsx
│       ├── TimelineSection.tsx
│       └── SkillsGrid.tsx
└── styles/
    └── (CSS variables already in index.css)
```

---

## Next Steps

1. Review this document with design specifications
2. Begin Phase 1 implementation (Layout & Components)
3. Update pages progressively
4. Test responsive design at all breakpoints
5. Gather feedback and iterate

---

**Design System Version**: 1.0  
**Last Updated**: November 23, 2025  
**Framework**: React 18 + TanStack Router + Tailwind CSS
