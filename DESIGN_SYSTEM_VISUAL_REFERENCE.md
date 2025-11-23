# Design System - Visual Reference

## Color Palette

### Primary Accent

- **strategy-gold** - Used for highlights, borders, hovers, text emphasis
  - `strategy-gold` (base) - Primary color
  - `strategy-gold/20` - Subtle borders
  - `strategy-gold/30` - Light backgrounds
  - `strategy-gold/50` - Hover states
  - `strategy-gold/80` - Darker overlays

### Surface Colors

- **surface-deep** - Darkest backgrounds (page background)
- **surface-base** - Mid-level backgrounds
- **surface-elevated** - Elevated surfaces (cards, modals)
  - `surface-elevated/30` - Glassmorphic backgrounds
  - `surface-elevated/50` - Hover states

### Text Colors

- **text-foreground** - Primary text
- **text-muted-foreground** - Secondary text
- **text-muted** - Subtle text
- Dark mode: `text-white` (for specific light text)

## Component Patterns

### Glassmorphic Header Pattern

```tsx
<div className='border-strategy-gold/20 bg-surface-elevated/30 relative border-b backdrop-blur-xl'>
  {/* Gradient overlay */}
  <div className='from-strategy-gold/8 via-strategy-gold/5 to-strategy-gold/8 absolute inset-0 bg-gradient-to-r'></div>
  {/* Glow effect */}
  <div className='bg-strategy-gold/5 absolute -right-1/2 -top-1/2 h-96 w-96 rounded-full blur-3xl'></div>
  {/* Content with relative z-index */}
  <div className='relative ...'>Content</div>
</div>
```

### Glassmorphic Card Pattern

```tsx
<Card className='border-strategy-gold/20 bg-surface-elevated/30 hover:border-strategy-gold/50 hover:bg-surface-elevated/50 hover:shadow-strategy-gold/20 border shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl'>
  Content
</Card>
```

### Icon Container Pattern

```tsx
<div className='from-strategy-gold/20 to-strategy-gold/20 rounded-xl bg-gradient-to-r p-3'>
  <IconComponent className='text-strategy-gold size-6' />
</div>
```

## Pages Redesigned

### ✅ SiteAdminPage

- 6 glassmorphic sections with backdrop-blur-xl
- 5 hover effects
- Admin dashboard with system health monitoring
- Enhanced visual hierarchy with gradient overlays

### ✅ PrivateToolsPage

- 2 glassmorphic sections (header + cards)
- 3 hover effects
- Tool showcase with glassmorphic cards
- "Coming soon" section with glow effects

### ✅ Settings

- 4 glassmorphic card sections
- 4 hover effects
- Profile, goals, and medication management
- Enhanced text color tokens (63 instances)

### ✅ CreationStudioPage

- 6 glasmorphic sections with backdrop-blur-xl
- 3 hover effects
- Advanced markdown editor with enhanced header
- Glow effects for visual interest

## Tailwind CSS Classes Used

### Glassmorphism

- `backdrop-blur-xl` - Extreme blur effect
- `bg-surface-elevated/30` - Semi-transparent background
- `bg-surface-elevated/50` - Hover opacity

### Borders

- `border-strategy-gold/20` - Subtle borders (default)
- `border-strategy-gold/50` - Hover borders (enhanced)

### Shadows

- `shadow-lg` - Large shadow
- `shadow-xl` - Extra large shadow (hover)
- `shadow-strategy-gold/20` - Gold-tinted shadow (hover)

### Effects

- `blur-3xl` - Glow effect blur
- `rounded-full` - Circular glow elements
- `transition-all duration-300` - Smooth animations

## Responsive Design

All pages use:

- Mobile-first approach
- `max-w-7xl` container for desktop
- Responsive padding: `px-4 sm:px-6 lg:px-8`
- Flexible layouts with `flex` and grid systems
- Touch-friendly button sizes

## Dark Mode

All designs are optimized for dark mode:

- Dark backgrounds: `bg-surface-deep`, `bg-surface-elevated`
- Light text: `text-foreground`, `text-white` for headers
- Gold accents contrast well against dark surfaces
- Glassmorphism enhances depth perception in dark mode

## Accessibility

- Sufficient color contrast for text
- Clear focus states on interactive elements
- Semantic HTML structure maintained
- Icon + text combinations for clarity
- Proper label associations in forms

## Performance Considerations

- Blur effects are GPU-accelerated
- Gradient overlays are lightweight CSS
- Transition animations use `duration-300` for smoothness
- No heavy JavaScript required for effects
- All styling done with Tailwind CSS utilities
