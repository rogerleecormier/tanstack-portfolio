# Phase 1 Quick Start Guide

## Component Libraries Overview

Your portfolio now has two production-ready component libraries built on Shadcn/UI and Tailwind CSS.

---

## Typography System

**Import**:

```tsx
import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  Small,
  XSmall,
  Blockquote,
  Muted,
  Strong,
  Accent,
  Code,
  Lead,
  Label,
} from '@/components/ui/typography-system';
```

**Examples**:

```tsx
// Page Title
<H1>Welcome to My Portfolio</H1>

// Section Header
<H2>My Experience</H2>

// Body Text
<P>I'm a Technical Project Manager focused on driving results.</P>

// Secondary Text
<Small>Published on November 22, 2025</Small>

// Emphasis
<P>I specialize in <Accent>executive leadership</Accent> and strategy.</P>

// Quote/Blockquote
<Blockquote>
  "Innovation happens at the intersection of technology and strategy."
</Blockquote>

// Code
<P>Use the <Code>useState</Code> hook for state management.</P>

// Lead/Opening
<Lead>
  My journey from individual contributor to TPM has shaped my leadership philosophy.
</Lead>

// Labeled Input
<Label htmlFor="email">Email Address</Label>

// Strong/Bold
<P>This is <Strong>very important</Strong> information.</P>

// Muted/Secondary
<P><Muted>This is less important context.</Muted></P>
```

**Color Customization**:

All typography components support the `className` prop:

```tsx
<H1 className="text-gold-accent">Special Title in Gold</H1>
<P className="text-slate-300">Light gray paragraph</P>
<Accent className="text-hunter-strong">Hunter green emphasis</Accent>
```

---

## Card System

**Import**:

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardBadge,
  GlassCard,
  SolidCard,
  InteractiveCard,
  BorderCard,
  GoldOutlineCard,
  ExperienceCard,
  SkillCard,
  FeatureCard,
  ProjectCard,
} from '@/components/ui/card-system';
```

### Preset Cards (Easiest to Use)

#### 1. Glass Card (Primary/Premium)

```tsx
<GlassCard>
  <CardHeader accent='gold'>
    <CardTitle>Featured Section</CardTitle>
  </CardHeader>
  <CardContent>
    This content has a glassmorphic effect with a subtle blue tint.
  </CardContent>
</GlassCard>
```

#### 2. Solid Card (Professional Standard)

```tsx
<SolidCard>
  <CardHeader>
    <CardTitle>Standard Card</CardTitle>
  </CardHeader>
  <CardContent>Professional solid background with shadow.</CardContent>
</SolidCard>
```

#### 3. Interactive Card (Clickable)

```tsx
<InteractiveCard onClick={() => navigate('/details')}>
  <CardHeader>
    <CardTitle>Click Me</CardTitle>
  </CardHeader>
  <CardContent>
    This card responds to hover with a shadow lift effect.
  </CardContent>
</InteractiveCard>
```

#### 4. Border Card (Minimal)

```tsx
<BorderCard>
  <CardContent>Clean, minimal border-only design.</CardContent>
</BorderCard>
```

#### 5. Gold Outline Card (Featured/CTA)

```tsx
<GoldOutlineCard>
  <CardHeader accent='gold'>
    <CardTitle>Call to Action</CardTitle>
  </CardHeader>
  <CardContent>Features a prominent gold border for emphasis.</CardContent>
</GoldOutlineCard>
```

### Specialized Cards

#### Experience Card (Work/Projects)

```tsx
<ExperienceCard
  icon={<Briefcase className='h-5 w-5' />}
  title='Senior Project Manager'
  subtitle='Tech Innovation Inc.'
  period='Jan 2021 - Present'
  description='Led cross-functional teams on 15+ enterprise initiatives with $50M+ budgets.'
  badges={[
    { text: 'Leadership', variant: 'gold' },
    { text: 'Strategy', variant: 'gold' },
    { text: 'Agile', variant: 'hunter' },
    { text: 'P&L', variant: 'hunter' },
  ]}
/>
```

#### Skill Card

```tsx
<SkillCard
  title='Technology Stack'
  icon={<Code2 className='h-6 w-6' />}
  skills={['React', 'TypeScript', 'Tailwind', 'Node.js']}
/>
```

#### Feature Card

```tsx
<FeatureCard
  icon={<Zap className='h-8 w-8' />}
  title='Rapid Execution'
  description='Ship projects 40% faster with our proven methodology.'
  highlight='gold'
/>
```

#### Project Card

```tsx
<ProjectCard
  title='Portfolio Redesign'
  description='Modernized brand identity with glassmorphic UI and dark mode.'
  image='/images/project.jpg'
  tags={['Design', 'React', 'Tailwind']}
  status='featured'
  link='/projects/portfolio'
/>
```

### Custom Card Composition

```tsx
<Card variant='solid'>
  <CardHeader accent='gold' icon={<Award className='h-5 w-5' />}>
    <CardTitle accent>Major Achievement</CardTitle>
    <CardDescription>Exceeded quarterly targets by 150%</CardDescription>
  </CardHeader>

  <CardContent>
    Led the enterprise platform redesign, resulting in 40% faster load times and
    improved user satisfaction scores from 7.2 to 9.1.
  </CardContent>

  <CardFooter>
    <div className='flex gap-2'>
      <CardBadge variant='gold'>2024</CardBadge>
      <CardBadge variant='hunter'>Q4</CardBadge>
    </div>
  </CardFooter>
</Card>
```

---

## Utility Classes (Tailwind)

### Typography Utilities

```tsx
<h1 className="text-h1">Main Title</h1>
<h2 className="text-h2">Section Title</h2>
<p className="text-body">Body paragraph</p>
<p className="text-small">Small caption</p>
<p className="text-blockquote">Quoted text</p>
```

### Brand Colors

```tsx
// Text
<span className="text-hunter">Hunter green text</span>
<span className="text-slate">Slate text</span>
<span className="text-gold">Gold text</span>
<span className="text-gold-accent">Bold gold accent</span>

// Backgrounds
<div className="bg-hunter-subtle">Hunter light bg</div>
<div className="bg-slate-subtle">Slate light bg</div>
<div className="bg-gold-highlight">Gold highlight bg</div>

// Highlights
<span className="highlight-gold">Gold highlight</span>
<span className="highlight-hunter">Hunter highlight</span>
```

### Borders & Accents

```tsx
// Borders
<div className="border border-gold">Gold border</div>
<div className="border border-hunter">Hunter border</div>
<div className="border-l-4 border-gold pl-4">Gold left accent</div>
<div className="border-t-4 border-gold pt-4">Gold top accent</div>

// Dividers
<div className="divider-gold">Divider</div>
```

### Buttons

```tsx
// Solid buttons
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-accent">Accent/CTA</button>

// Outlined buttons
<button className="btn-gold-outline">Gold Outline</button>
<button className="btn-hunter-outline">Hunter Outline</button>

// Ghost button
<button className="btn-ghost">Minimal Button</button>

// Glass button
<button className="glass-button">Glass Effect</button>
```

### Glass Effects

```tsx
<div className="glass-base">Basic glass</div>
<div className="glass-card">Glass card</div>
<div className="glass-header">Glass header</div>
<input className="glass-input" placeholder="Type..." />
```

### Badges

```tsx
<span className="badge-gold">Gold Badge</span>
<span className="badge-hunter">Hunter Badge</span>
<span className="badge-slate">Slate Badge</span>
```

---

## Combining Components

### Example: Experience Section

```tsx
import { H2, ExperienceCard } from '@/components/ui';

export function ExperienceSection() {
  return (
    <section className='space-y-6'>
      <H2>Career Experience</H2>

      <ExperienceCard
        title='VP of Product'
        subtitle='Acme Corp'
        period='2023 - Present'
        description='Scaled product team from 5 to 25 people...'
        badges={[
          { text: 'Leadership', variant: 'gold' },
          { text: 'Strategy', variant: 'gold' },
        ]}
      />

      <ExperienceCard
        title='Senior PM'
        subtitle='TechStart Inc'
        period='2020 - 2023'
        description='Launched 3 major product initiatives...'
        badges={[
          { text: 'Product', variant: 'hunter' },
          { text: 'Analytics', variant: 'hunter' },
        ]}
      />
    </section>
  );
}
```

### Example: Skills Section

```tsx
import { H2, SkillCard } from '@/components/ui';
import { Code2, BarChart3, Zap } from 'lucide-react';

export function SkillsSection() {
  return (
    <section>
      <H2>Core Competencies</H2>
      <div className='mt-6 grid grid-cols-3 gap-4'>
        <SkillCard
          icon={<Code2 />}
          title='Technical'
          skills={['Architecture', 'APIs', 'Infrastructure']}
        />
        <SkillCard
          icon={<BarChart3 />}
          title='Analytics'
          skills={['Metrics', 'Data', 'Dashboards']}
        />
        <SkillCard
          icon={<Zap />}
          title='Leadership'
          skills={['Strategy', 'Teams', 'Execution']}
        />
      </div>
    </section>
  );
}
```

---

## Dark Mode Support

All components automatically support dark mode. No additional work needed!

```tsx
// Automatic dark mode
<div className="text-slate dark:text-slate-300">
  Text that adapts to light/dark mode
</div>

// Using CSS variables
<div style={{ background: 'var(--brand-hunter)' }}>
  Hunter green in both modes
</div>
```

---

## Color Tokens Reference

### Available Colors in Tailwind

- `hunter-{50,100,200,300,400,500,600,700,800,900,950}`
- `gold-{50,100,200,300,400,500,600,700,800,900,950}`
- `slate-{50,100,200,300,400,500,600,700,800,900,950}`

### CSS Variables

- `--brand-hunter` - Primary brand color
- `--brand-gold` - Accent color
- `--brand-slate` - Secondary color
- `--glass-bg` - Glass background opacity
- `--glass-border` - Glass border color

---

## Next Phase

Phase 2 will redesign the layout shell (header, sidebar, footer) using these new components.

All existing pages will gradually migrate to use these new typography and card components.

---

## Questions?

Refer to:

- `src/components/ui/typography-system.tsx` - Full typography implementation
- `src/components/ui/card-system.tsx` - Full card implementation
- `src/index.css` - All utility class definitions
- `tailwind.config.js` - Color and theme configuration
