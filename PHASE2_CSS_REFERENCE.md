# Phase 2 CSS Reference Guide

## Complete Style Updates

### Header Styling

```tsx
// Fixed container
<div className='fixed inset-x-0 top-0 z-50
  border-b border-hunter-700/30
  bg-gradient-to-br from-hunter-900/95 via-hunter-800/95 to-hunter-950/95
  backdrop-blur-md
  shadow-glass
  dark:border-hunter-700/40'>

// Main header content
<div className='flex items-center justify-between px-4 py-3'>

// Hamburger button
<button className='flex size-10 items-center justify-center rounded-lg
  border border-gold-600/30
  bg-gold-600/10
  text-gold-400
  transition-all duration-200
  hover:border-gold-600/60 hover:bg-gold-600/20 hover:text-gold-300'>
  <Menu className='size-5' />
</button>

// Logo section
<div className='hidden md:block'>
  <h1 className='header-name text-xl font-bold text-white'>
    Roger Lee Cormier
  </h1>
  <p className='text-xs font-semibold text-gold-400 uppercase tracking-wider'>
    Technical Project Manager
  </p>
</div>

// Search and login
<div className='flex shrink-0 items-center gap-4'>
  <div className='hidden lg:block'>
    <RedesignedSearch />
  </div>
  <Button className='btn-accent rounded-lg border-0 text-xs font-medium'>
    Login
  </Button>
</div>
```

### Header Mobile Section

```tsx
// Mobile search (below main header)
<div className='border-t border-hunter-700/30
  bg-hunter-800/50
  px-4 py-3
  backdrop-blur-sm
  lg:hidden'>
  <RedesignedSearch />
</div>

// Breadcrumbs row
<div className='flex h-12 items-center
  border-t border-hunter-700/30
  bg-hunter-950/60
  px-4
  backdrop-blur-sm
  dark:border-hunter-700/40'>
  <Breadcrumbs />
</div>
```

---

## Sidebar Styling

```tsx
// Container
<Sidebar className='border-r border-hunter-700/30
  bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-hunter-950/80
  backdrop-blur-sm
  dark:border-hunter-700/40'>

// Navigation group label
<SidebarGroupLabel className='px-4 py-2
  text-xs font-semibold uppercase tracking-wider
  text-gold-600/70
  dark:text-gold-400/70'>
  Navigation
</SidebarGroupLabel>

// Navigation item (Link component)
<Link className='group flex items-center gap-3
  rounded-lg
  border-l-2 border-transparent
  px-3 py-2
  text-sm font-medium
  text-slate-300
  transition-all duration-200

  hover:border-gold-600/50
  hover:bg-gold-600/10
  hover:text-gold-400

  data-[active]:border-gold-600
  data-[active]:bg-gold-600/20
  data-[active]:text-gold-300
  data-[active]:shadow-glass'>
  {/* Icon with color transitions */}
  <item.icon className='size-5 shrink-0
    text-slate-400
    transition-colors duration-200
    group-hover:text-gold-400
    group-data-[active]:text-gold-500' />

  {/* Label */}
  <span className='truncate group-data-[collapsible=icon]:hidden'>
    {item.title}
  </span>
</Link>

// Divider
<div className='mx-3 border-t border-slate-700/50 dark:border-slate-700/40' />

// TOC section label
<SidebarGroupLabel className='px-4 py-2
  text-xs font-semibold uppercase tracking-wider
  text-gold-600/70
  dark:text-gold-400/70'>
  On This Page
</SidebarGroupLabel>
```

---

## Table of Contents Styling

```tsx
// Container
<div className='mt-2 border-t border-gold-600/20 pt-3 dark:border-gold-600/20'>
  <div className='mb-2 px-3'>
    <h3 className='text-xs font-semibold uppercase tracking-wider
      text-gold-600/70
      dark:text-gold-400/70'>
      On This Page
    </h3>
  </div>

  {/* TOC List */}
  <nav>
    <ul className='space-y-0.5 px-2'>
      {currentToc.map(entry => (
        <li key={entry.slug}>
          <a href={`#${entry.slug}`}
            className={`block rounded-lg
              border-l-2
              px-3 py-2
              text-sm
              transition-all duration-200

              ${activeId === entry.slug
                ? 'border-gold-600
                   bg-gold-600/15
                   font-medium
                   text-gold-300
                   dark:border-gold-400
                   dark:bg-gold-600/20
                   dark:text-gold-300'
                : 'border-transparent
                   text-slate-400
                   hover:border-gold-600/40
                   hover:bg-gold-600/10
                   hover:text-slate-300
                   dark:text-slate-400
                   dark:hover:border-gold-600/40
                   dark:hover:bg-gold-600/10
                   dark:hover:text-slate-300'
              }`}>
            {entry.title}
          </a>
        </li>
      ))}
    </ul>
  </nav>
</div>
```

---

## Footer Styling

```tsx
// Container
<footer className='border-hunter-700/30 via-hunter-950/60 dark:border-hunter-700/40 relative border-t bg-gradient-to-br from-slate-950 to-slate-950 backdrop-blur-sm'>
  {/* Brand Section */}
  <div className='flex items-center gap-4'>
    <Logo size='lg' showTargetingDots={true} />
    <div>
      <H3 className='!mt-0 text-2xl font-bold text-white'>Roger Lee Cormier</H3>
      <p className='text-gold-400 text-xs font-semibold uppercase tracking-wider'>
        Technical Project Manager
      </p>
    </div>
  </div>

  {/* Contact Info */}
  <div className='hover:text-gold-300 flex items-center gap-3 text-slate-300 transition-colors'>
    <MapPin className='text-gold-500 size-4' />
    <span>Wellsville, NY</span>
  </div>

  {/* Quick Links */}
  <a
    href='/portfolio'
    className='hover:text-gold-400 group block text-sm text-slate-300 transition-colors'
  >
    <span className='inline-block transition-transform duration-200 group-hover:translate-x-1'>
      Portfolio
    </span>
  </a>

  {/* Newsletter Section */}
  <div className='border-gold-600/20 from-gold-600/10 via-hunter-900/20 to-gold-600/10 rounded-xl border bg-gradient-to-br p-8 backdrop-blur-sm'>
    {/* Newsletter content */}
  </div>

  {/* Social Links */}
  <a
    href='https://linkedin.com/in/rogerleecormier'
    className='border-gold-600/40 bg-gold-600/10 hover:border-gold-600/70 hover:bg-gold-600/20 group flex items-center gap-2 rounded-lg border px-4 py-2 transition-all duration-300'
  >
    <FaLinkedin className='text-gold-400 group-hover:text-gold-300 transition-colors' />
    <span className='text-sm font-medium text-slate-200 transition-colors group-hover:text-white'>
      LinkedIn
    </span>
  </a>

  {/* Separator */}
  <Separator className='via-gold-600/20 bg-gradient-to-r from-transparent to-transparent' />

  {/* Tech Stack Badges */}
  <Badge className='border-gold-600/40 bg-gold-600/10 text-gold-300 hover:bg-gold-600/20 text-xs transition-colors'>
    React
  </Badge>

  {/* Legal Links */}
  <a
    href='/privacy'
    className='hover:text-gold-400 text-slate-400 transition-colors'
  >
    Privacy Policy
  </a>
</footer>
```

---

## App Layout Background

```tsx
// Main layout container
<div className='from-hunter-950 to-hunter-950 flex min-h-screen bg-gradient-to-br via-slate-900/50 pt-48 md:pt-44'>
  {/* Sidebar and content */}
</div>
```

---

## Color Tokens Summary

### Hunter Green

```
hunter-50:   #e8f5f0  (light accents)
hunter-100:  #c8ede6
hunter-200:  #a0ddd5
hunter-300:  #78ccc4
hunter-400:  #50bbb3
hunter-500:  #2d9f8d  (primary in dark mode)
hunter-600:  #1f7a6f  (primary in light mode)
hunter-700:  #155654
hunter-800:  #0d3a3a  (dark backgrounds)
hunter-900:  #092a27  (darker backgrounds)
hunter-950:  #051a18  (darkest backgrounds)
```

### Gold

```
gold-50:     #fef9e8  (light highlights)
gold-100:    #fef3cc
gold-200:    #fde799
gold-300:    #fcd966
gold-400:    #fbcd33
gold-500:    #f4c430  (bright in dark mode)
gold-600:    #d4a328  (primary accent)
gold-700:    #b8860b  (rich gold)
gold-800:    #8b6914
gold-900:    #6b5410
gold-950:    #3d2f08  (darkest)
```

### Slate (Default Tailwind)

```
slate-50:    #f8fafc
slate-100:   #f1f5f9
slate-200:   #e2e8f0
slate-300:   #cbd5e1
slate-400:   #94a3b8
slate-500:   #64748b
slate-600:   #475569
slate-700:   #334155  (dark text)
slate-800:   #1e293b
slate-900:   #0f172a
slate-950:   #020617  (used in footer)
```

---

## Opacity Strategy

### Glass Effects

```
backdrop-blur-md  = 8px blur (Header main glass)
backdrop-blur-sm  = 4px blur (Secondary glass effects)
```

### Transparency Layers

```
/10   Use for: Subtle backgrounds, light accents
/15   Use for: Active backgrounds, highlights
/20   Use for: Hover backgrounds, emphasized elements
/30   Use for: Border lines, subtle separators
/40   Use for: Button borders, interactive elements
/50   Use for: Hover borders, stronger feedback
/60   Use for: Active states, strong contrast
/70   Use for: Label text, emphasized text
```

### Example Usage

```
Border:      border-gold-600/30     (subtle)
Hover:       border-gold-600/50     (visible)
Active:      border-gold-600        (solid/100%)

Background:  bg-gold-600/10         (very subtle)
Hover:       bg-gold-600/20         (more visible)
Active:      bg-gold-600/15 or /20  (prominent)
```

---

## Responsive Breakpoints

### Header

```
Mobile:
  - Logo and name hidden (md:hidden)
  - Search below header (hidden md:block)
  - Hamburger always visible

Tablet (md):
  - Logo and name visible
  - Search in header

Desktop (lg):
  - All elements visible
  - Optimized spacing
```

### Sidebar

```
Mobile:
  - Drawer overlay (SidebarProvider handles)
  - Closes after navigation

Desktop:
  - Always visible
  - Can collapse to icons
```

---

## Border Treatment Guide

### Subtle Borders (Dividers, Structure)

```
border-hunter-700/30   (30% opacity)
border-slate-700/50    (50% opacity)
border-gold-600/20     (20% opacity)
```

### Interactive Borders (Hover States)

```
border-gold-600/40     (40% opacity)
border-gold-600/50     (50% opacity)
```

### Active Borders (Full Opacity)

```
border-gold-600        (100% opacity)
```

---

## Transition Timing

All interactive elements use:

```
transition-all duration-200
```

This provides:

- Smooth, responsive feedback (200ms)
- Professional feel
- Accessibility (not too fast, not too slow)
- Consistent experience across all elements

---

## Text Color Hierarchy

### Headings (White)

```
text-white  - H1, H2, H3, H4 in shell
```

### Body Text (Slate)

```
text-slate-300  - Primary text
text-slate-400  - Secondary text
text-slate-500  - Tertiary text
```

### Accents (Gold)

```
text-gold-400   - Gold accent (default)
text-gold-300   - Gold accent (muted)
text-gold-600   - Gold accent (light mode)
```

---

## Usage Examples

### Button with Gold Accent

```tsx
<button className='btn-accent rounded-lg border-0'>Login</button>
```

### Navigation Item

```tsx
<a className='hover:text-gold-400 text-slate-300 transition-colors'>
  Portfolio
</a>
```

### Glass Container

```tsx
<div className='border-gold-600/20 bg-gold-600/10 rounded-lg border backdrop-blur-sm'>
  Content
</div>
```

### Section Label (Gold)

```tsx
<h3 className='text-gold-600/70 text-xs font-semibold uppercase tracking-wider'>
  Section
</h3>
```

### Divider

```tsx
<div className='border-gold-600/20 border-t' />
```

---

## Dark Mode

All styles automatically adapt to dark mode via `.dark` class:

- No additional work needed
- CSS variables handle color shifts
- Opacity values remain consistent
- Focus states properly supported

---

## Performance Notes

- Glass effects optimized with `backdrop-blur-sm` and `backdrop-blur-md`
- No animation performance impact
- Build size minimal impact
- Transitions use GPU-accelerated properties

---

**Status**: All Phase 2 styling complete and verified ✅
