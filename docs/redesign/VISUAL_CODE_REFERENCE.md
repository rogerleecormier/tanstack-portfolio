# Visual & Code Reference Guide

## Quick Visual Reference

### Page Layout Templates

#### Home Page Layout
```
┌──────────────────────────────────────────────────┐
│                     HEADER                       │
├──────────────────────────────────────────────────┤
│                  HERO SECTION                    │
│  [Profile] │ [Title, Description, Stats, CTA]   │
├──────────────────────────────────────────────────┤
│           FEATURED WORK (2-col grid)             │
│  [Card 1] │ [Card 2]                            │
│  [Card 3] │                                      │
├──────────────────────────────────────────────────┤
│      CORE EXPERTISE (3-col feature grid)        │
│  [Feature 1] [Feature 2] [Feature 3]            │
├──────────────────────────────────────────────────┤
│              CTA SECTION (centered)              │
│         "Let's Work Together"                    │
├──────────────────────────────────────────────────┤
│                     FOOTER                       │
└──────────────────────────────────────────────────┘
```

#### Portfolio Page Layout
```
┌──────────────────────────────────────────────────┐
│                     HEADER                       │
├──────────────────────────────────────────────────┤
│             PROFESSIONAL SUMMARY                 │
│          [Centered, brief intro]                │
├──────────────────────────────────────────────────┤
│            EXPERIENCE TIMELINE                   │
│                    │                            │
│  [Card] ─•─ [Card] ─•─ [Card]                   │
│                    │                            │
├──────────────────────────────────────────────────┤
│         TECHNICAL SKILLS (3-col grid)           │
│  [Skill Cat] [Skill Cat] [Skill Cat]            │
├──────────────────────────────────────────────────┤
│     EDUCATION & AWARDS (list/cards)             │
├──────────────────────────────────────────────────┤
│                     FOOTER                       │
└──────────────────────────────────────────────────┘
```

#### Projects Page Layout
```
┌──────────────────────────────────────────────────┐
│                     HEADER                       │
├──────────────────────────────────────────────────┤
│             PAGE HEADER (centered)               │
│         "Projects & Case Studies"               │
├──────────────────────────────────────────────────┤
│          SEARCH & FILTER BAR                    │
│  [Search] [Filter ▼] [Sort ▼] [Clear]          │
├──────────────────────────────────────────────────┤
│          PROJECT GRID (2-col or 1-col)         │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ [Icon]       │  │ [Icon]       │            │
│  │ Project 1    │  │ Project 2    │            │
│  │ Description  │  │ Description  │            │
│  │ [Tags]       │  │ [Tags]       │            │
│  └──────────────┘  └──────────────┘            │
├──────────────────────────────────────────────────┤
│        PAGINATION / LOAD MORE (centered)        │
├──────────────────────────────────────────────────┤
│                     FOOTER                       │
└──────────────────────────────────────────────────┘
```

#### Blog Page Layout
```
┌──────────────────────────────────────────────────┐
│                     HEADER                       │
├──────────────────────────────────────────────────┤
│             PAGE HEADER (centered)               │
│            "Articles & Insights"                │
├──────────────────────────────────────────────────┤
│        FEATURED POST (full-width card)          │
│  [Category] Featured Article Title              │
│  Excerpt of the featured article...             │
│  Jan 15 • 5 min read  → Read Full              │
├──────────────────────────────────────────────────┤
│          SEARCH & FILTER BAR                    │
│  [Search] [Category ▼] [Sort ▼]               │
├──────────────────────────────────────────────────┤
│          BLOG GRID (3-col or 1-col)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ [Category]│ │ [Category]│ │ [Category]│    │
│  │ Article 1 │ │ Article 2 │ │ Article 3 │    │
│  │ Excerpt   │ │ Excerpt   │ │ Excerpt   │    │
│  │ Date • Time│ │ Date • Time│ │ Date • Time│   │
│  └──────────┘  └──────────┘  └──────────┘     │
├──────────────────────────────────────────────────┤
│         NEWSLETTER SIGNUP (highlighted)         │
│      [Headline] [Email Input] [Subscribe]      │
├──────────────────────────────────────────────────┤
│        PAGINATION (centered / infinite)         │
├──────────────────────────────────────────────────┤
│                     FOOTER                       │
└──────────────────────────────────────────────────┘
```

#### Contact Page Layout
```
┌──────────────────────────────────────────────────┐
│                     HEADER                       │
├──────────────────────────────────────────────────┤
│             CONTACT HEADER                      │
│          "Get In Touch" (centered)              │
├──────────────────────────────────────────────────┤
│        CONTACT INFO (2-col or 1-col)           │
│  ┌────────────┐  ┌────────────┐                │
│  │ 📧 Email   │  │ 👤 LinkedIn│                │
│  │ Contact    │  │ Link       │                │
│  └────────────┘  └────────────┘                │
│  ┌────────────┐  ┌────────────┐                │
│  │ 🔗 GitHub  │  │ 𝕏 Twitter │                │
│  │ Link       │  │ Link       │                │
│  └────────────┘  └────────────┘                │
├──────────────────────────────────────────────────┤
│        CONTACT FORM (2-col or full)            │
│  [Name]           [Email]                       │
│  [Subject]        [Subject]                     │
│  [Type Filter]    [Type Filter]                │
│  [Message - full width]                        │
│  [Submit Button]                               │
├──────────────────────────────────────────────────┤
│      RESPONSE EXPECTATIONS (subtle info)        │
│     "Typically respond within 24 hours"         │
├──────────────────────────────────────────────────┤
│                     FOOTER                       │
└──────────────────────────────────────────────────┘
```

---

## Card Component Examples

### Hero Section Card
```tsx
┌─────────────────────────────────────────┐
│ Background: gradient + subtle border    │
│                                          │
│  [140px avatar]   [Content area]        │
│   - Name          - Title               │
│   - Role          - Description         │
│                   - Stats grid          │
│                   - CTA buttons         │
│                                          │
│ Hover: border → gold, shadow           │
└─────────────────────────────────────────┘
```

### Standard Card (Projects/Blog)
```tsx
┌────────────────────────────────┐
│ [48px Icon]  Title             │
├────────────────────────────────┤
│ Description text here...        │
│ Keeps to 2-3 lines             │
│                                 │
│ [Tag] [Tag] [Tag]              │
│                                 │
│ → View Details                 │
└────────────────────────────────┘
Hover: 
  - border: gold
  - shadow: md/lg
  - transform: translateY(-4px)
```

### Feature Card (3-column)
```tsx
┌─────────────────────────────┐
│         🏗️                   │ (emerald)
│    (Feature Icon)           │
│                              │
│   Feature Title             │
├─────────────────────────────┤
│ Description of the feature  │
│ supporting bullet points or │
│ brief explanation.          │
└─────────────────────────────┘
Hover:
  - border: emerald
  - shadow: 0 0 20px emerald/15
```

---

## Color Usage Reference

### Gold (Primary Accent)
```
Use for:
- Primary buttons
- Important borders on hover
- Icons and highlights
- Gold glows/shadows
- Active states
- Section dividers

Tailwind class: 
text-strategy-gold
bg-strategy-gold
border-strategy-gold
```

### Emerald (Secondary Accent)
```
Use for:
- Secondary features
- Growth/success metrics
- Feature card borders
- Secondary badges
- Alt accent styling

Tailwind class:
text-secondary
border-secondary
hover: border-secondary/75
```

### Rose (Error)
```
Use for:
- Error states
- Destructive actions
- Warnings

Tailwind class:
text-destructive
bg-destructive
border-destructive
```

### Surfaces
```
Base (primary): #0F172A
Elevated (cards): #1E2847
Deep (backgrounds): #0B0F1F

Tailwind equivalent:
bg-surface-base
bg-surface-elevated
bg-surface-deep
```

---

## Responsive Breakpoints

### Mobile First (< 768px)
```
- 1-column layouts
- Full width cards
- Stacked hero (profile on top)
- Hidden desktop nav
- Hamburger menu visible
- Touch-friendly targets (44px+)
- Larger touch areas
```

### Tablet (768px - 1024px)
```
- 2-column layouts where applicable
- Sidebar nav appears
- Adjusted spacing
- Readable font sizes
- Optimized for 5-8" screens
```

### Desktop (> 1024px)
```
- Multi-column layouts
- Full features visible
- Hover states active
- Full navigation visible
- Max width constraint (1400px)
```

---

## Typography Quick Reference

### Headlines
```
Page Title:    3rem (bold) leading-tight
Section Title: 1.75rem (bold)
Card Title:    1.25rem (bold)
```

### Body
```
Regular:     1rem, line-height 1.6
Large:       1.125rem, line-height 1.7
Emphasis:    1rem (bold)
```

### Metadata
```
Caption:     0.85rem
Small text:  0.75rem
Uppercase:   letter-spacing 0.05em
```

---

## Common Component Patterns

### Button with Icon
```tsx
<Button className="flex items-center gap-2">
  Label
  <ArrowRight className="w-4 h-4" />
</Button>
```

### Card with Badge
```tsx
<Card>
  <CardHeader>
    <div className="flex justify-between items-start">
      <CardTitle>Title</CardTitle>
      <Badge>Label</Badge>
    </div>
  </CardHeader>
</Card>
```

### Grid with Responsive Cols
```tsx
{/* 2-col on desktop, 1 on mobile */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

{/* 3-col on desktop, 2 on tablet, 1 on mobile */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

{/* 4-col on desktop, responsive down */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

### Hover Effects
```tsx
className="hover:border-strategy-gold hover:shadow-lg hover:scale-105 transition-all duration-300"
```

### Section Padding
```tsx
<div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-24">
  {/* Content */}
</div>
```

---

## Accessibility Patterns

### Form Example
```tsx
<div className="space-y-4">
  <label htmlFor="name" className="block text-sm font-medium">
    Full Name *
  </label>
  <input
    id="name"
    type="text"
    required
    aria-required="true"
    aria-label="Full name"
    className="w-full px-4 py-2 border border-border rounded-md"
  />
</div>
```

### Icon Button
```tsx
<button
  aria-label="Close menu"
  className="p-2"
>
  <X className="w-6 h-6" />
</button>
```

### Skip Link
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only"
>
  Skip to main content
</a>
```

---

## Performance Tips

### Image Optimization
```tsx
<img
  src="image.jpg"
  alt="Descriptive alt text"
  loading="lazy"
  className="w-full object-cover"
/>
```

### Code Splitting
```tsx
// Already implemented with lazy()
const ProjectsPage = lazy(() => import('./pages/ProjectsListPage'))
```

### Memoization
```tsx
import { memo } from 'react'

export const ProjectCard = memo(function ProjectCard(props) {
  return (/* card content */)
})
```

---

## Testing Checklist

### Responsive Design
- [ ] Mobile: 320px, 480px
- [ ] Tablet: 768px
- [ ] Desktop: 1024px, 1400px
- [ ] Ultra-wide: 1920px+
- [ ] Touch interactions work
- [ ] Images scale properly

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Screen reader friendly
- [ ] Color contrast OK
- [ ] Form validation clear
- [ ] Alt text on images

### Performance
- [ ] Lighthouse > 80
- [ ] Core Web Vitals good
- [ ] Images optimized
- [ ] No console errors
- [ ] Smooth scrolling
- [ ] Fast interactions

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers
- [ ] Zoom at 200%

---

## Common Mistakes to Avoid

❌ **Don't:**
- Use inconsistent spacing
- Mix color systems
- Forget responsive design
- Skip accessibility
- Use low-contrast text
- Make text too small
- Over-animate elements
- Ignore mobile performance

✅ **Do:**
- Use design tokens
- Maintain consistency
- Test on real devices
- Include alt text
- Use semantic HTML
- Keep font sizes readable
- Use subtle animations
- Optimize for all devices

---

## Quick Copy-Paste Snippets

### Hero Section Wrapper
```tsx
<section className="bg-gradient-to-b from-surface-elevated to-surface-base border border-border-subtle rounded-lg p-12 md:p-16 mb-24">
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
    {/* Profile and content */}
  </div>
</section>
```

### Section Header
```tsx
<div className="mb-12">
  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
    Section Title
  </h2>
  <div className="w-16 h-1 bg-gradient-to-r from-strategy-gold to-transparent rounded-full" />
  <p className="text-lg text-muted-foreground mt-4">Subtitle</p>
</div>
```

### Card Hover Effect
```tsx
className="bg-surface-elevated border border-border-subtle rounded-lg p-8 transition-all duration-300 hover:border-strategy-gold hover:shadow-lg hover:scale-105"
```

### Responsive Grid
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
```

---

**Last Updated**: November 23, 2025  
**Purpose**: Quick reference for developers during implementation
