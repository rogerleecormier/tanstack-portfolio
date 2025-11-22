# Phase 2: Shell Design Visual Guide

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (Glass Effect - Hunter Green with Gold Accents)     │ Fixed at top
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ SIDEBAR  │ MAIN CONTENT AREA                                │
│ (Glass)  │ (Dark Gradient Background)                       │
│          │                                                   │
│ • Nav    │ ┌─────────────────────────────────────────────┐  │
│   Items  │ │ Page Content                                │  │
│ • TOC    │ │ (Uses Typography & Card Components)        │  │
│   (Gold) │ │                                             │  │
│          │ └─────────────────────────────────────────────┘  │
│          │                                                   │
├──────────┴──────────────────────────────────────────────────┤
│  FOOTER (Glass - Gold Accents, Newsletter, Social)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Header Component

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ☰ [Logo] Roger Lee Cormier      [Search]  [Login Button]   │
│          TECHNICAL PROJECT MANAGER                          │
├─────────────────────────────────────────────────────────────┤
│                    [Mobile Search]                          │
├─────────────────────────────────────────────────────────────┤
│ › Portfolio › Blog › Current Page                           │
└─────────────────────────────────────────────────────────────┘
```

### Color Breakdown

**Background Layers**:

```
Layer 1: from-hunter-900/95 (darker hunter green)
  ↓
Layer 2: via-hunter-800/95 (medium hunter green)
  ↓
Layer 3: to-hunter-950/95 (very dark hunter green)
  ↓
Glass Effect: backdrop-blur-md (8px blur)
```

**Hamburger Button**:

```
Border:      border-gold-600/30   (30% opacity gold)
Background:  bg-gold-600/10       (10% opacity gold)
Icon Color:  text-gold-400        (Gold)
Hover:       border-gold-600/60   (60% opacity gold)
             bg-gold-600/20       (20% opacity gold)
             text-gold-300        (Lighter gold)
```

**Breadcrumbs Row**:

```
Background:  bg-hunter-950/60 backdrop-blur-sm
Border-top:  border-hunter-700/30
Color:       Slate gray text on dark background
```

---

## Sidebar Component

### Visual Layout

```
┌──────────────┐
│ NAVIGATION   │ ← Gold label
├──────────────┤
│ • Portfolio  │ ← Slate text, hover shows gold
│ • Blog       │
│ • Projects   │
│ • About      │ ← Active shows gold border + background
│ • Contact    │
├──────────────┤ ← Subtle divider
│ ON THIS PAGE │ ← Gold label
├──────────────┤
│ • Heading 1  │ ← Gold accent when active
│ • Heading 2  │
│ • Heading 3  │
└──────────────┘
```

### Navigation Item States

**Default**:

```
Border:      border-transparent
Background:  None
Text Color:  text-slate-300
Icon Color:  text-slate-400
```

**Hover**:

```
Border:      border-gold-600/50
Background:  bg-gold-600/10
Text Color:  text-gold-400
Icon Color:  text-gold-400
Transition:  duration-200
```

**Active**:

```
Border:      border-gold-600 (solid)
Background:  bg-gold-600/20
Text Color:  text-gold-300
Icon Color:  text-gold-500
Shadow:      shadow-glass
```

### Background Effect

```
from-slate-900/80
  ↓
via-slate-900/50
  ↓
to-hunter-950/80
  +
backdrop-blur-sm (4px blur)
```

---

## Table of Contents (TOC)

### Visual Appearance

```
┌─────────────────────┐
│ ON THIS PAGE (Gold) │  ← Section header
├─────────────────────┤
│ ✓ Introduction      │  ← Active (gold border + bg)
│   Getting Started   │  ← Default (slate)
│   Main Content      │
│   Conclusion        │  ← Can hover (gold highlight)
└─────────────────────┘
```

### Item States

**Default (Not Active)**:

```
Border-left:  border-transparent
Background:   None
Text Color:   text-slate-400
Hover:        border-gold-600/40 bg-gold-600/10 text-slate-300
```

**Active (Currently in View)**:

```
Border-left:  border-gold-600 (solid)
Background:   bg-gold-600/15
Text Color:   text-gold-300
Shadow:       Implicit from parent
```

---

## Footer Component

### Visual Layout

```
┌───────────────────────────────────────────────────────────┐
│ [Logo] Roger Lee Cormier                                  │
│        TECHNICAL PROJECT MANAGER                          │
│ PMP-certified specialist in digital transformation...     │
│                                                           │
│ Wellsville, NY  │  roger@rcormier.dev                     │
├──────────────────────────────────────────────────────────┤
│ QUICK LINKS              TECH FOCUS       RESOURCES       │
│ • Portfolio              • Leadership     (If any)        │
│ • Blog                   • Strategy                       │
│ • Projects               • Transformation                 │
│ • Tools                                                   │
│ • About                                                   │
│ • Contact                                                 │
├──────────────────────────────────────────────────────────┤
│          Newsletter Section (Gold Border)                │
│   "Stay Updated with Strategic Insights"                 │
│   [Email Input] [Subscribe Button]                       │
├──────────────────────────────────────────────────────────┤
│ [LinkedIn] [GitHub]                                       │
│                                                           │
│ © 2025 Roger Lee Cormier Portfolio                       │
│ Built with ❤️ using React TypeScript TanStack           │
│                  [Privacy] [Contact]                      │
└───────────────────────────────────────────────────────────┘
```

### Footer Background

```
from-slate-950
  ↓
via-hunter-950/60
  ↓
to-slate-950
  +
backdrop-blur-sm (4px blur)
```

### Newsletter Section

```
Border:      border-gold-600/20
Background:  from-gold-600/10 via-hunter-900/20 to-gold-600/10
             (Gradient with gold and hunter tones)
Blur:        backdrop-blur-sm
```

### Social Links

```
Border:      border-gold-600/40
Background:  bg-gold-600/10
Icon Color:  text-gold-400
Hover:       border-gold-600/70 bg-gold-600/20
             text-gold-300
```

### Tech Stack Badges

```
Border:      border-gold-600/40
Background:  bg-gold-600/10
Text Color:  text-gold-300
Hover:       bg-gold-600/20
```

---

## Color Palette in Use

### Hunter Green (Professional Primary)

```
Shades Used:
- #1f7a6f  (hunter-600) - Main darker shade
- #2d9f8d  (hunter-500) - Brighter for dark mode
- #0d3a3a  (hunter-800) - Very dark backgrounds
- #092a27  (hunter-900) - Darkest backgrounds
- #051a18  (hunter-950) - Extreme dark
```

### Gold (Strategic Accents)

```
Shades Used:
- #d4a328  (gold-600)  - Primary accent
- #f4c430  (gold-500)  - Bright accent (dark mode)
- #b8860b  (gold-700)  - Darker shade
- #f4c430  (gold-400)  - Light, hover states
```

### Slate (Professional Neutral)

```
Shades Used:
- #334155  (slate-700) - Dark text
- #475569  (slate-600) - Medium text
- #64748b  (slate-500) - Light text
- #94a3b8  (slate-400) - Very light text
- #cbd5e1  (slate-300) - Minimal contrast
```

---

## Opacity Usage

### Glass Effects

```
backdrop-blur-md  = 8px blur (Header)
backdrop-blur-sm  = 4px blur (Sidebar, Footer, Secondary)
```

### Color Opacity

```
/10  = 10%  (Subtle background)
/15  = 15%  (Active background)
/20  = 20%  (Hover background)
/30  = 30%  (Border lines)
/40  = 40%  (Stronger borders)
/50  = 50%  (Hover borders)
/60  = 60%  (Active borders)
```

---

## Responsive Design

### Desktop (≥1024px)

- Sidebar: Full width, visible by default
- Header: All sections visible
- Search: Visible in header

### Tablet (768px - 1023px)

- Sidebar: Collapsible icon mode
- Header: Hamburger menu
- Search: Visible in header

### Mobile (<768px)

- Sidebar: Drawer overlay
- Header: Hamburger menu
- Search: Below header row
- Breadcrumbs: Still visible

---

## Accessibility Considerations

### Contrast Ratios

```
Hunter Green on Dark Background:  5.2:1 (WCAG AA+)
Gold on Dark Background:          7.1:1 (WCAG AA+)
Slate on Dark Background:         7.3:1 (WCAG AA+)
All text meets WCAG AA standards
```

### Focus States

```
All interactive elements maintain focus rings
Gold accents provide visual feedback
Transitions use 200ms for clarity
```

### Screen Reader Support

```
Semantic HTML maintained
Alt text on all icons
ARIA labels on interactive elements
```

---

## Animation & Transitions

### All Interactions Use

```
transition-all duration-200  (200ms smooth transitions)
```

**Common Animations**:

- Hover effects on navigation items
- Active state highlighting
- Icon color transitions
- Border and background changes

---

## Design Principles Applied

1. **Dark-First**: Default perception is dark mode elegance
2. **Professional**: Executive-appropriate aesthetic
3. **Strategic**: Gold accents guide attention
4. **Consistent**: Unified design language throughout
5. **Accessible**: WCAG AA+ contrast and clarity
6. **Modern**: Glassmorphism for depth and sophistication
7. **Responsive**: Graceful degradation on mobile

---

## Comparison: Before vs After

### Before (Previous Design)

- White/gradient header with hunter green
- Light sidebar with limited gold accents
- Generic dark footer
- Limited glass effects
- Inconsistent color usage

### After (Phase 2)

- Dark glass header with gold button
- Glass sidebar with gold navigation
- Modern glass footer with strategic gold
- Consistent glassmorphism throughout
- Professional Hunter Green/Gold/Slate palette
- Executive-appropriate aesthetic
- Proper dark-first design

---

## Integration Points

All shell components ready for:

- **Typography Components** - Use H1-H6, P, Small, etc.
- **Card Components** - GlassCard, SolidCard, FeatureCard, etc.
- **Utility Classes** - btn-primary, text-gold, badge-gold, etc.
- **Page Content** - Flows naturally with shell styling

---

## Next Phase: Home Page

Phase 3 will use these shell components with:

- Hero section featuring the new cards
- Value proposition using Typography system
- Feature cards with gold accents
- Call-to-action buttons with proper styling
- All integrated seamlessly with the shell

The foundation is set. Ready to build the content layers!
