# GitHub Pull Request Prompt Template

## How to Use This

1. **Create a new branch** for the design overhaul:
   ```bash
   git checkout -b feat/design-system-overhaul
   ```

2. **Copy the content below** and paste it into your GitHub PR description

3. **Customize as needed** (dates, assignees, reviewers)

4. **Submit** when ready to begin implementation

---

## PR Description (Copy Below)

```markdown
## 🎨 Comprehensive Site-Wide Design System Overhaul

### Summary
This PR implements a **complete design system overhaul** across all pages and components. 
It introduces the Precision Strategy design system, removes all inline styles, and replaces 
them with centralized Tailwind design system classes.

**Status**: Ready for Implementation Phase 1 (Foundation)

### Objectives
- ✅ Implement Precision Strategy Design System across all pages/components
- ✅ Remove ALL inline styles → centralized Tailwind classes
- ✅ Update Header & Footer with new logo integration (header-logo.svg)
- ✅ Redesign 5 main pages (Home, Portfolio, Projects, Blog, Contact)
- ✅ Ensure responsive design (mobile 320px → desktop 2560px+)
- ✅ Maintain WCAG AA accessibility compliance
- ✅ Optimize for performance (Lighthouse > 80)

### Design Documentation Reference
This PR implements specifications documented in 7 comprehensive design files:

**Architecture & Strategy**:
- [`SITE_DESIGN_IMPLEMENTATION_GUIDE.md`](/docs/design/SITE_DESIGN_IMPLEMENTATION_GUIDE.md) - System architecture
- [`IMPLEMENTATION_SUMMARY.md`](/docs/design/IMPLEMENTATION_SUMMARY.md) - 3-phase roadmap

**Technical Details**:
- [`PAGE_SPECIFICATIONS.md`](/docs/design/PAGE_SPECIFICATIONS.md) - Page-by-page specs
- [`COMPONENT_IMPLEMENTATION_GUIDE.md`](/docs/design/COMPONENT_IMPLEMENTATION_GUIDE.md) - React code patterns
- [`VISUAL_CODE_REFERENCE.md`](/docs/design/VISUAL_CODE_REFERENCE.md) - Quick reference & snippets

**Quick Resources**:
- [`QUICK_REFERENCE.md`](/docs/design/QUICK_REFERENCE.md) - One-page cheat sheet
- [`site_design_system_aligned.html`](/docs/design/site_design_system_aligned.html) - Visual mockup (open in browser)

### Implementation Plan

#### Phase 1: Foundation (Week 1)
- [ ] Update `tailwind.config.js` with Precision Strategy colors
- [ ] Update `src/index.css` with design system classes
- [ ] Redesign Header (`src/layout/Header.tsx`) with header-logo.svg
- [ ] Redesign Footer (`src/layout/Footer.tsx`) 4-column layout
- [ ] Create SectionHeader component
- [ ] Create HeroSection component
- [ ] Update AppSidebar with new logo

#### Phase 2: Pages (Week 2-3)
- [ ] Home Page - Hero + Featured Work + Expertise + Blog preview
- [ ] Portfolio Page - Summary + Timeline + Skills + Education
- [ ] Projects Page - Enhanced cards + search/filter
- [ ] Blog Page - Featured section + grid + newsletter
- [ ] Contact Page - Info + Form + Scheduler

#### Phase 3: Polish (Week 4)
- [ ] Add animations & transitions
- [ ] Accessibility audit (WCAG AA)
- [ ] Performance optimization (Lighthouse > 80)
- [ ] Mobile device testing

### Color System (Precision Strategy)
```
Primary Gold:      #FFD700 (text-strategy-gold)
Gold Accent:       #FFA500 (strategy-gold-dark)
Secondary Emerald: #66CC99 (text-secondary)
Dark Surfaces:
  Base:      #0F172A (bg-surface-base)
  Elevated:  #1E2847 (bg-surface-elevated)
  Deep:      #0B0F1F (bg-surface-deep)
```

### Key Changes

**Logo Integration**:
- Replace Target icon with `header-logo.svg` in Header, Footer, Logo component, AppSidebar

**Style Removal**:
- All inline `style={{}}` props removed
- All hardcoded colors replaced with design system classes
- Centralized spacing system (p-8, gap-8, mb-12, etc.)

**Files Modified**: ~15 component files
**New Components**: 2 (SectionHeader, HeroSection)
**New Files**: 0 (design files already created)

### Testing Requirements

**Responsive Design**:
- [ ] Mobile: 320px, 480px (text readable, no overflow, 44px+ touch targets)
- [ ] Tablet: 768px (2-column layouts work)
- [ ] Desktop: 1024px, 1920px (full layouts, centered content)

**Accessibility**:
- [ ] Keyboard navigation works across all pages
- [ ] WCAG AA color contrast (4.5:1 minimum)
- [ ] Screen reader friendly
- [ ] All form inputs have labels

**Performance**:
- [ ] Lighthouse Performance > 80
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90

**Browser Support**:
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Mobile (Android)

### Files to Review

**Configuration**:
- `tailwind.config.js` - New color system
- `src/index.css` - Design system utilities

**Layout**:
- `src/layout/Header.tsx` - Logo integration, navigation
- `src/layout/Footer.tsx` - 4-column layout
- `src/components/AppSidebar.tsx` - Logo update

**Pages**:
- `src/pages/IndexPage.tsx` - Hero + sections
- `src/pages/PortfolioListPage.tsx` - Timeline + skills
- `src/pages/ProjectsListPage.tsx` - Enhanced cards
- `src/pages/BlogListPage.tsx` - Featured + grid
- `src/pages/ContactPage.tsx` - Form styling

**Components**:
- `src/components/Logo.tsx` - header-logo.svg support
- `src/components/sections/SectionHeader.tsx` - NEW
- `src/components/sections/HeroSection.tsx` - NEW

### Related Issues
Closes #[issue-number] (if applicable)

### Screenshots / Mockup
Visual mockup available: [`site_design_system_aligned.html`](/docs/design/site_design_system_aligned.html)

### Checklist
- [ ] All inline styles removed
- [ ] All colors use design system classes
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] No console errors
- [ ] Lighthouse scores > 80
- [ ] WCAG AA compliance verified
- [ ] All documentation references accurate
- [ ] Code follows project conventions

### Deployment Notes
**Pre-Deployment**:
1. Run `npm run build` - verify no errors
2. Test locally with `npm run dev`
3. Run Lighthouse audit - all scores > 80
4. Test keyboard navigation
5. Verify responsive on multiple devices

**Post-Deployment**:
1. Monitor console for errors
2. Check analytics for performance
3. Gather user feedback
4. Document any issues

### Questions?
Refer to the design documentation:
- Overall structure: `/docs/design/SITE_DESIGN_IMPLEMENTATION_GUIDE.md`
- Specific pages: `/docs/design/PAGE_SPECIFICATIONS.md`
- Code patterns: `/docs/design/COMPONENT_IMPLEMENTATION_GUIDE.md`
- Quick help: `/docs/design/QUICK_REFERENCE.md`

### Implementation Resources
- Complete implementation checklist: `/IMPLEMENTATION_CHECKLIST.md`
- PR details: `/docs/design/PULL_REQUEST_DESIGN_OVERHAUL.md`

---

**Type**: Feature / Refactoring  
**Impact**: ALL pages and components  
**Priority**: High  
**Effort**: Large multi-phase  
**Reviewers**: @[reviewer-handle]  
**Assignees**: @[your-handle]
```

---

## Creating the PR on GitHub

### Option 1: Command Line (with GitHub CLI)
```bash
# If you have GitHub CLI installed
gh pr create \
  --title "feat: Comprehensive Site-Wide Design System Overhaul" \
  --body "$(cat <<'EOF'
[Copy the markdown above starting from ## 🎨 through Reviewers]
EOF
)" \
  --draft  # Create as draft first to review
```

### Option 2: Web Interface
1. Go to your GitHub repository
2. Click "Pull Requests" tab
3. Click "New Pull Request"
4. Select your branch (feat/design-system-overhaul)
5. Click "Create pull request"
6. Paste the markdown above in the description
7. Click "Create pull request"

### Option 3: Direct Link
After pushing your branch, visit:
```
https://github.com/rogerleecormier/tanstack-portfolio/compare/main...feat/design-system-overhaul
```

---

## PR Branches & Workflow

### Full Implementation (All 3 Phases)
```bash
git checkout -b feat/design-system-overhaul
```

### Phased Approach (Recommended)
```bash
# Phase 1: Foundation
git checkout -b feat/design-overhaul-phase1-foundation

# Phase 2: Pages
git checkout -b feat/design-overhaul-phase2-pages

# Phase 3: Polish
git checkout -b feat/design-overhaul-phase3-polish
```

---

## Commit Message Guidelines

### Phase 1 Commits
```
feat(design): Update tailwind config with Precision Strategy colors
feat(design): Add design system utility classes to index.css
feat(design): Redesign Header with header-logo.svg integration
feat(design): Redesign Footer with 4-column layout
feat(components): Add SectionHeader component
feat(components): Add HeroSection component
refactor(sidebar): Update AppSidebar with new logo
```

### Phase 2 Commits
```
feat(pages): Redesign Home page with new Hero and sections
feat(pages): Redesign Portfolio page with timeline and skills
feat(pages): Redesign Projects page with enhanced cards
feat(pages): Redesign Blog page with featured section
feat(pages): Redesign Contact page with improved styling
refactor(components): Remove inline styles from all components
```

### Phase 3 Commits
```
feat(animations): Add hover effects and transitions
refactor(a11y): Improve accessibility (WCAG AA)
perf(images): Optimize images and add lazy loading
perf(build): Optimize CSS and code splitting
```

---

## Before You Begin

1. **Read the Design Docs** (in order):
   - [`QUICK_REFERENCE.md`](/docs/design/QUICK_REFERENCE.md) - 5 min read
   - [`SITE_DESIGN_IMPLEMENTATION_GUIDE.md`](/docs/design/SITE_DESIGN_IMPLEMENTATION_GUIDE.md) - 10 min read
   - [`PAGE_SPECIFICATIONS.md`](/docs/design/PAGE_SPECIFICATIONS.md) - 15 min read

2. **View the Visual Mockup**:
   - Open [`site_design_system_aligned.html`](/docs/design/site_design_system_aligned.html) in your browser
   - Resize to see responsive behavior

3. **Review the Implementation Checklist**:
   - Use `/docs/design/IMPLEMENTATION_CHECKLIST.md` to track progress

4. **Set Up Your Environment**:
   ```bash
   # Verify Node version
   node --version  # Should be 16+
   
   # Install dependencies
   npm install
   
   # Start dev server
   npm run dev
   ```

---

## Success Criteria

This PR is complete when:
- ✅ All inline styles removed
- ✅ All pages use Precision Strategy classes
- ✅ Header/Footer updated with header-logo.svg
- ✅ All 5 pages redesigned per specifications
- ✅ Responsive at all breakpoints (verified)
- ✅ No console errors/warnings
- ✅ Lighthouse scores > 80 (all metrics)
- ✅ WCAG AA compliance verified
- ✅ Documentation accurate and complete

---

## Questions or Issues?

**During Implementation**:
1. Check `/docs/design/QUICK_REFERENCE.md` for quick answers
2. Review `/docs/design/COMPONENT_IMPLEMENTATION_GUIDE.md` for code patterns
3. Reference `/docs/design/PAGE_SPECIFICATIONS.md` for page details
4. Check `/docs/design/VISUAL_CODE_REFERENCE.md` for styling examples

**Architecture Questions**:
- Read `/docs/design/SITE_DESIGN_IMPLEMENTATION_GUIDE.md`

**Overall Overview**:
- Review `/docs/design/PULL_REQUEST_DESIGN_OVERHAUL.md`

---

**Ready to begin! 🚀**

---

Created: November 23, 2025  
Last Updated: November 23, 2025  
Status: Ready for PR submission
