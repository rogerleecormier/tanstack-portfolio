# Page-by-Page Design Specifications

## HOME PAGE (`/`)

### Purpose
First impression and hub for navigation. Showcases recent work and directs visitors to deeper content.

### Sections Breakdown

#### 1. Hero Section
**Layout**: 2 columns (Profile | Content)
**Height**: ~500px desktop, full height mobile

**Left Column (Profile)**:
- Avatar: 140px circular with gold border
- Name: "Roger Lee Cormier" (1.5rem, bold)
- Role: "Full-Stack Engineer" (gold accent, uppercase)
- Social links: 4 icon buttons (GitHub, LinkedIn, Twitter, Email)

**Right Column (Content)**:
- Title: "Building Enterprise Solutions with Precision" (2.5rem, bold)
- Description: 2-3 sentences about expertise and impact
- Stats Grid: 3 columns (Years, Projects, Learning)
- CTAs: 2 buttons (View Work, Learn More)

**Design Details**:
- Background: Gradient (elevated → base)
- Border: Subtle gold on hover
- Border radius: 12px
- Padding: 4rem
- Responsive: Stacks to 1 column at 768px (profile on top)

---

#### 2. Featured Work Section
**Layout**: 2-column grid
**Cards**: 3-5 projects

**Card Structure**:
```
┌─────────────────────────────────┐
│ 💻  [Icon]  Project Title       │
├─────────────────────────────────┤
│ Brief description (2-3 lines)   │
│                                  │
│ [React] [Node.js] [AWS]         │ ← Tags
│                                  │
│ → View Details                  │
└─────────────────────────────────┘
```

**Card Properties**:
- Background: Surface elevated
- Border: Subtle, gold on hover
- Hover: Lift + shadow + border color change
- Border radius: 12px
- Padding: 2rem

---

#### 3. Featured Blog Posts Section
**Layout**: 3-column carousel/grid
**Posts**: 3-6 recent or featured posts

**Card Structure**:
```
┌─────────────────────────────────┐
│ [Category Badge]                │
│ Article Title                   │
│ Brief excerpt (2-3 lines)       │
│ Jan 15, 2025 • 5 min read       │ ← Metadata
│                                  │
│ [React] [Performance]           │ ← Tags
└─────────────────────────────────┘
```

---

#### 4. Core Expertise Section
**Layout**: 3-column feature grid
**Features**: 3 main expertise areas

**Card Structure**:
```
┌─────────────────────────────────┐
│         🏗️                        │
│   Full-Stack Architecture        │
├─────────────────────────────────┤
│ Designing scalable systems...   │
│ • Microservices                  │
│ • Cloud Infrastructure           │
│ • Database Design                │
└─────────────────────────────────┘
```

**Icon**: Large, centered, emerald accent
**Title**: Bold, 1.1rem
**Description**: Paragraph + bullet list
**Hover**: Border color changes to emerald

---

#### 5. Call-to-Action Section
**Layout**: Centered, full width
**Height**: ~200px

**Content**:
- Headline: "Let's Work Together"
- Subtitle: Tagline about collaboration
- 2 CTAs: Primary (Contact) + Secondary (Resume)

**Design**:
- Background: Subtle gradient
- Border: 2px gold
- Text: Centered
- Padding: 4rem

---

### Navigation & Structure
- Header: Fixed/sticky, logo + nav links + CTA
- Footer: 4 columns + divider + copyright

---

## PORTFOLIO PAGE (`/portfolio`)

### Purpose
Professional background, experience, and credentials.

### Sections Breakdown

#### 1. Professional Summary Hero
**Layout**: Single column, centered
**Height**: ~300px

**Content**:
- Title: "Full-Stack Engineer & Technical Leader"
- Subtitle: Specializations (Architecture, Leadership, Transformation)
- Summary paragraph: 2-3 sentences
- Download Resume button

---

#### 2. Experience Timeline
**Layout**: Vertical timeline, alternating left/right

**Timeline Item Structure**:
```
          ┌─ 2020-Present
          │
    [Card]─•─[Card]
          │
          └─ 2018-2020
```

**Card Content**:
- Title: Job title / Company
- Date range: Formatted nicely
- Bullet points: 3-4 key achievements
- Skills/Tech: Inline tags

**Design**:
- Center line: Gold gradient
- Circles: Gold with border
- Cards: Elevated surface, subtle border
- Hover: Lift + shadow
- Mobile: Single column (all cards on right)

---

#### 3. Technical Skills Grid
**Layout**: 3-column grid (categories)

**Skill Category Card**:
```
┌──────────────────────────┐
│ 🏗️ Backend               │
├──────────────────────────┤
│ • Node.js      ████████  │
│ • Python       ██████    │
│ • TypeScript   █████████ │
│ • AWS          ████████  │
└──────────────────────────┘
```

**Categories**:
- Frontend (React, TypeScript, CSS)
- Backend (Node.js, Python, Databases)
- DevOps (AWS, Docker, CI/CD)
- Tools (Git, Figma, Jira)

---

#### 4. Education & Certifications
**Layout**: List or cards

**Item Structure**:
- Certification/Degree name
- Issuing organization
- Date obtained
- Icon indicator (gold bullet)

---

#### 5. Awards & Recognition
**Layout**: Grid or list

**Item Structure**:
- Award name
- Organization
- Year
- Brief description

---

## PROJECTS PAGE (`/projects`)

### Purpose
Showcase all technical projects with filtering and discovery.

### Sections Breakdown

#### 1. Page Header
**Layout**: Single column

**Content**:
- Title: "Projects & Case Studies"
- Subtitle: Brief description
- Search bar: Full width
- Filter button + Sort dropdown

---

#### 2. Filter & Sort Bar
**Layout**: Horizontal bar

**Elements**:
- Search input: Left side
- Category filter: Dropdown
- Sort options: Dropdown (Recent, Popular, Name)
- Clear filters: Button

---

#### 3. Project Grid
**Layout**: 2 columns desktop, 1 column mobile
**Cards**: Full project listing

**Card Structure**:
```
┌───────────────────────────────┐
│ 💻  [Icon]                    │
│ Project Title                 │
├───────────────────────────────┤
│ Description (2-3 lines)       │
│                                │
│ Impact: +60% Performance      │
│                                │
│ [React] [Node.js] [AWS]       │
│                                │
│ → View Case Study             │
└───────────────────────────────┘
```

**Card Properties**:
- Background: Surface elevated
- Border: Subtle, gold accent on hover
- Icon: 48px, gold background
- Title: 1.25rem, bold
- Description: Secondary text
- Impact metric: Gold text
- Tags: 3-5 tech tags
- CTA: Secondary button

**Hover Effects**:
- Border → Gold
- Box shadow: Gold glow
- Transform: translateY(-4px)

---

#### 4. Pagination or Load More
**Design**: Centered button or pagination controls

---

## BLOG PAGE (`/blog`)

### Purpose
Article discovery and reading entry point.

### Sections Breakdown

#### 1. Blog Header
**Layout**: Single column, centered

**Content**:
- Title: "Articles & Insights"
- Subtitle: "Thoughts on technology, leadership, and digital transformation"

---

#### 2. Featured Post
**Layout**: Full width, large card

**Card Structure**:
```
┌───────────────────────────────────────┐
│ [Category Badge] [Reading Time]       │
│ Featured Article Title                │
│ This is the excerpt of the article... │
│                                        │
│ → Read Full Article                   │
│                                        │
│ By Roger | Jan 15, 2025               │
└───────────────────────────────────────┘
```

**Styling**:
- Background: Elevated surface with border
- Featured post icon/indicator
- Larger typography
- Full width desktop, normal width mobile

---

#### 3. Search & Filter
**Layout**: Horizontal bar

**Elements**:
- Search input
- Category filter dropdown
- Sort options (Recent, Popular, Reading Time)

---

#### 4. Recent Posts Grid
**Layout**: 3 columns desktop, 1 mobile

**Card Structure**:
```
┌─────────────────────────────┐
│ [Category]   [Featured ⭐] │
│ Article Title               │
├─────────────────────────────┤
│ Brief excerpt (2-3 lines)   │
│                              │
│ [React] [Performance]       │ ← Tags
│                              │
│ Jan 15 • 5 min read         │ ← Metadata
└─────────────────────────────┘
```

**Card Properties**:
- Height: Auto, min 250px
- Category badge: Top right
- Featured indicator: Optional star
- Date & reading time: Bottom
- Hover: Border → gold, lift

---

#### 5. Newsletter Signup
**Layout**: Full width, highlighted section

**Content**:
- Headline: "Stay Updated"
- Description: "Get new articles delivered to your inbox"
- Email input + Subscribe button
- Privacy note: Small text

**Design**:
- Background: Gradient or emerald accent
- Border: 1px subtle
- Padding: 3rem
- Border radius: 12px

---

#### 6. Pagination
**Design**: Centered buttons (Previous, Next) or numbered pagination

---

## CONTACT PAGE (`/contact`)

### Purpose
Multiple channels for reaching out; AI-powered contact form.

### Sections Breakdown

#### 1. Contact Header
**Layout**: Centered

**Content**:
- Title: "Get In Touch"
- Subtitle: "Let's discuss your project or opportunity"

---

#### 2. Contact Information
**Layout**: 2-3 column grid

**Cards**:
```
┌──────────────────┐
│ 📧               │
│ Email            │
│ hello@roger...   │
│ [Copy]           │
└──────────────────┘
```

**Contact Methods**:
- Email: Clickable link
- LinkedIn: Direct profile link
- GitHub: Direct profile link
- Twitter: Direct profile link
- Calendar: Calendly or similar

---

#### 3. Contact Form
**Layout**: 2 columns (Left: Info | Right: Form) or Full width

**Form Fields**:
- Name (required)
- Email (required)
- Subject (required)
- Message (required)
- Type selector: Project inquiry, Collaboration, Other

**Form Features**:
- AI analysis: Background process during typing
- Dynamic CTA: "Analyze", "Schedule Meeting", or "Send"
- Validation: Real-time feedback
- Success state: Confirmation message

**Design**:
- Input styling: Subtle border, gold focus
- Labels: Small, uppercase
- Placeholder: Muted text
- Submit button: Primary CTA
- Form container: Card with border

---

#### 4. Meeting Scheduler (Optional)
**Layout**: Separate card or modal

**Content**:
- Calendar integration
- Available time slots
- Timezone selector
- Meeting description

---

#### 5. Response Expectations
**Layout**: Small info box

**Content**:
- "I typically respond within 24 hours"
- "Check your spam folder"
- "You can also reach me on LinkedIn"

**Design**: Subtle background, secondary text

---

#### 6. Alternative Contact Methods
**Layout**: Horizontal list or vertical

**Methods**:
- Calendly/Scheduling link
- Twitter/Social direct message
- Discord/Slack (if applicable)

---

## Design System Constants

### Spacing
- XS: 0.5rem (space-2)
- SM: 1rem (space-4)
- MD: 1.5rem (space-6)
- LG: 2rem (space-8)
- XL: 3rem (space-12)
- XXL: 4rem (space-16)

### Typography
- Page title: 2.5rem, bold, line-height 1.2
- Section title: 1.75rem, bold
- Card title: 1.25rem, bold
- Body text: 1rem, line-height 1.6
- Caption: 0.85rem, muted

### Shadows
- Default: 0 10px 15px rgba(0,0,0,0.3)
- Hover: 0 20px 25px rgba(0,0,0,0.4)
- Gold: 0 10px 30px rgba(255,215,0,0.15)

### Colors
- Primary: Precision Gold (#FFD700)
- Secondary: Strategy Emerald (#66CC99)
- Accent: Strategy Gold (#FFA500)
- Error: Strategy Rose (#E85D5D)
- Background: Precision Charcoal (#121729)

---

**Last Updated**: November 23, 2025
