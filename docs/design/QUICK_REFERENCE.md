# Quick Reference - Design System at a Glance

## 📖 Read This First

This is your one-page cheat sheet for the complete design system.

---

## 🎯 Five Pages You're Building

| Page          | URL          | Purpose                 | Key Sections                                          |
| ------------- | ------------ | ----------------------- | ----------------------------------------------------- |
| **Home**      | `/`          | First impression & hub  | Hero + Featured Work + Expertise + Blog Preview + CTA |
| **Portfolio** | `/portfolio` | Professional background | Summary + Timeline + Skills + Education + Awards      |
| **Projects**  | `/projects`  | Technical showcase      | Search/Filter + Grid + Pagination                     |
| **Blog**      | `/blog`      | Article discovery       | Featured + Search/Filter + Grid + Newsletter          |
| **Contact**   | `/contact`   | Get in touch            | Info + Form + Scheduler + Alternatives                |

---

## 🎨 Your Color System

```
Primary Gold:      #FFD700 (text-strategy-gold)
Gold Accent:       #FFA500 (strategy-gold-dark)
Secondary Emerald: #66CC99 (text-secondary)
Error Rose:        #E85D5D (destructive)

Dark Surfaces:
  Base:      #0F172A (bg-surface-base)
  Elevated:  #1E2847 (bg-surface-elevated)
  Deep:      #0B0F1F (bg-surface-deep)

Text:
  Primary:   #FAFBFC (text-foreground)
  Secondary: #B3B9C7 (text-muted-foreground)
  Tertiary:  #7F8699 (text-muted)
```

---

## 📐 Layout Grid System

### Desktop (> 1024px)

- 2-column: Featured work, projects (desktop view)
- 3-column: Expertise, skills, blog previews
- 4-column: Tags, metadata

### Tablet (768px - 1024px)

- 2-column: Most grids
- 1-column: Some cards

### Mobile (< 768px)

- 1-column: All content stacks vertically
- Full-width: All cards
- Stack header profile on top

---

## 🧩 Core Components to Create/Update

### Must Create

- [ ] `SectionHeader.tsx` - Reusable section headers
- [ ] `HeroSection.tsx` - 2-column hero layout
- [ ] `Timeline.tsx` - Experience timeline (Portfolio page)
- [ ] `ProjectCard.tsx` - Project card variant
- [ ] `BlogCard.tsx` - Blog card with metadata

### Must Update

- [ ] `Header.tsx` - Add navigation, styling
- [ ] `Footer.tsx` - 4-column layout
- [ ] `IndexPage.tsx` - Use new components
- [ ] `PortfolioListPage.tsx` - Add timeline, skills grid
- [ ] `ProjectsListPage.tsx` - Enhanced cards
- [ ] `BlogListPage.tsx` - Featured post, newsletter
- [ ] `ContactPage.tsx` - Form enhancement

---

## 🎯 Design Patterns

### Card Pattern

```
Icon (48px gold bg)
Title (1.25rem bold)
Description (2-3 lines)
Tags (flex wrap)
CTA Link (→ View)

Hover: border gold, lift, shadow
```

### Hero Pattern

```
LEFT: Profile (avatar + name + role)
RIGHT: Content (title + desc + stats + CTAs)
Mobile: Stacks (profile on top)
```

### Grid Pattern

```
Desktop: grid-cols-2 or grid-cols-3
Tablet:  grid-cols-2
Mobile:  grid-cols-1
Gap:     space-8 or space-6
```

### Feature Card

```
Large icon (emerald)
Title
Description
Hover: emerald border + shadow
```

---

## 📱 Responsive Breakpoints

```
Mobile:  < 768px   (md breakpoint)
Tablet:  768-1024px (lg breakpoint)
Desktop: > 1024px  (full features)

Tailwind: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

---

## 🎨 Common Tailwind Classes

### Spacing

- `p-8` = padding 2rem
- `gap-8` = gap between items
- `mb-12` = margin-bottom 3rem

### Typography

- `text-3xl` = page title
- `text-2xl` = section title
- `text-lg` = body large
- `font-bold` = emphasis

### Colors

- `text-strategy-gold` = primary accent
- `text-secondary` = emerald
- `text-muted-foreground` = dim text
- `bg-surface-elevated` = card background

### States

- `hover:border-strategy-gold` = gold on hover
- `hover:shadow-lg` = shadow on hover
- `transition-all` = smooth transitions
- `duration-300` = 300ms duration

---

## 📝 Copy-Paste Code Blocks

### Section Header

```tsx
<div className='mb-12'>
  <h2 className='text-foreground mb-2 text-4xl font-bold'>Title</h2>
  <div className='from-strategy-gold h-1 w-16 bg-gradient-to-r to-transparent' />
  <p className='text-muted-foreground mt-4 text-lg'>Subtitle</p>
</div>
```

### Card Wrapper

```tsx
<div className='bg-surface-elevated border-border-subtle hover:border-strategy-gold rounded-lg border p-8 transition-all hover:shadow-lg'>
  {/* content */}
</div>
```

### Responsive Grid

```tsx
<div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
  {/* items */}
</div>
```

### Hero Section Wrapper

```tsx
<section className='from-surface-elevated to-surface-base border-border-subtle mb-24 grid grid-cols-1 items-center gap-12 rounded-lg border bg-gradient-to-b p-16 lg:grid-cols-5'>
  {/* Left: profile, Right: content */}
</section>
```

---

## ✅ Implementation Phases

### Phase 1: Foundation (Week 1)

1. Update Header + Footer
2. Create SectionHeader + HeroSection
3. Test responsive design

### Phase 2: Pages (Week 2-3)

1. Update IndexPage
2. Update PortfolioListPage (+ Timeline)
3. Update ProjectsListPage
4. Update BlogListPage
5. Update ContactPage

### Phase 3: Polish (Week 4)

1. Add animations
2. Accessibility audit
3. Performance optimization
4. Mobile testing

---

## 🧪 Testing Checklist

- [ ] Mobile: 320px, 480px
- [ ] Tablet: 768px
- [ ] Desktop: 1024px, 1400px
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast OK
- [ ] Touch targets >= 44px
- [ ] Images optimized
- [ ] Lighthouse > 80
- [ ] No console errors

---

## 📚 Documentation File Map

```
site_design_system_aligned.html
├─ Visual mockup (OPEN IN BROWSER)

SITE_DESIGN_IMPLEMENTATION_GUIDE.md
├─ Overall architecture
├─ Page breakdown
├─ Component patterns
└─ Integration points

PAGE_SPECIFICATIONS.md
├─ Home page details
├─ Portfolio page details
├─ Projects page details
├─ Blog page details
└─ Contact page details

COMPONENT_IMPLEMENTATION_GUIDE.md
├─ Header/Footer patterns
├─ Section components
├─ Card components
├─ Form components
└─ Code examples

VISUAL_CODE_REFERENCE.md
├─ ASCII layouts
├─ Color reference
├─ Typography
├─ Component patterns
└─ Copy-paste snippets

IMPLEMENTATION_SUMMARY.md
├─ Complete overview
├─ Architecture diagram
├─ Phase breakdown
└─ Quality checklist

DELIVERY_SUMMARY.md
└─ This is your guide to all the above
```

---

## 🚀 Getting Started

1. **See the Design**
   - Open `site_design_system_aligned.html` in browser
   - Resize window to see responsive behavior
   - Understand the layout patterns

2. **Understand the Structure**
   - Read `SITE_DESIGN_IMPLEMENTATION_GUIDE.md`
   - Skim `PAGE_SPECIFICATIONS.md`
   - Review `IMPLEMENTATION_SUMMARY.md`

3. **Start Building**
   - Use `COMPONENT_IMPLEMENTATION_GUIDE.md` for code
   - Reference `VISUAL_CODE_REFERENCE.md` for snippets
   - Build incrementally (Header → Footer → Pages)

4. **Quality Check**
   - Use testing checklist
   - Verify responsive design
   - Check accessibility
   - Performance test

---

## 💡 Key Principles

✅ **Consistency** - Use the design system for everything  
✅ **Responsive** - Test on all breakpoints  
✅ **Accessible** - WCAG AA compliant  
✅ **Performance** - Optimize for speed  
✅ **Incremental** - Build and test piece by piece  
✅ **Maintainable** - Clear structure and documentation

---

## 🎯 Success Looks Like

After implementation:

- All 5 pages live with consistent design ✅
- Responsive across all devices ✅
- Accessible for all users ✅
- Fast performance ✅
- Professional appearance ✅
- Clear user navigation ✅

---

## 📞 Quick Troubleshooting

**Alignment issues?**
→ Check `VISUAL_CODE_REFERENCE.md` for grid patterns

**Color questions?**
→ Reference color section above or `VISUAL_CODE_REFERENCE.md`

**Component patterns?**
→ See `COMPONENT_IMPLEMENTATION_GUIDE.md`

**Page layout?**
→ Check `PAGE_SPECIFICATIONS.md`

**Overall strategy?**
→ Read `SITE_DESIGN_IMPLEMENTATION_GUIDE.md`

---

## 📋 Files to Edit

```
src/layout/Header.tsx          ← Navigation
src/layout/Footer.tsx          ← Footer
src/pages/IndexPage.tsx        ← Home
src/pages/PortfolioListPage.tsx ← Portfolio
src/pages/ProjectsListPage.tsx ← Projects
src/pages/BlogListPage.tsx     ← Blog
src/pages/ContactPage.tsx      ← Contact
```

## 🆕 Components to Create

```
src/components/sections/SectionHeader.tsx
src/components/sections/HeroSection.tsx
src/components/sections/Timeline.tsx
src/components/cards/ProjectCard.tsx
src/components/cards/BlogCard.tsx
```

---

## 🎊 You're All Set!

Everything is documented and ready to implement.

**Start here**: Open `site_design_system_aligned.html` in your browser.

Then pick a phase and start building! 🚀

---

**Quick Links** (in order of reading):

1. `site_design_system_aligned.html` - See it
2. `SITE_DESIGN_IMPLEMENTATION_GUIDE.md` - Understand it
3. `COMPONENT_IMPLEMENTATION_GUIDE.md` - Build it
4. `VISUAL_CODE_REFERENCE.md` - Code it
5. `PAGE_SPECIFICATIONS.md` - Detail check
6. `IMPLEMENTATION_SUMMARY.md` - Reference

---

**Last Updated**: November 23, 2025  
**Status**: ✅ Ready to Build  
**Have Questions?** See the full documentation files listed above.
