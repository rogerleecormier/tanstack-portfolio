# Custom Markdown Card Syntax

This document explains how to use the custom markdown card syntax in your content files. The system allows you to create beautiful, styled cards using shadcn/ui components directly in your markdown.

## Syntax

The basic syntax for custom cards uses code blocks with the "card" language identifier (same pattern as charts):

```markdown
```card
{
  "type": "info",
  "props": {
    "title": "Card Title",
    "description": "Card description"
  },
  "content": "Your card content here with **markdown** support."
}
```

## Markdown Formatting Support

All card content now supports full markdown formatting! You can use:

- **Bold text** with `**text**`
- *Italic text* with `*text*`
- ~~Strikethrough~~ with `~~text~~`
- `Inline code` with backticks
- [Links](https://example.com) with `[text](url)`
- Bullet points with `- item`
- Numbered lists with `1. item`
- > Blockquotes with `> text`
- Headers with `# H1`, `## H2`, etc.

The markdown is rendered with styling that matches your card design and maintains the teal-blue brand aesthetic.

## Card Types

### 1. Info Card

Creates a simple informational card with teal styling.

```markdown
```card
{
  "type": "info",
  "props": {
    "title": "Important Note",
    "description": "This is a key point to remember"
  },
  "content": "This is the main content of the info card. You can include **bold text**, *italic text*, and other markdown formatting.

## Key Features
- **Bold emphasis** for important points
- *Italic styling* for subtle emphasis  
- `Inline code` for technical terms
- [External links](https://example.com) for references

> This is a blockquote that stands out from the main content."
}
```

### 2. Hero Card

Large, prominent cards for key content with gradient backgrounds and optional images.

```markdown
```card
{
  "type": "hero",
  "props": {
    "title": "Leadership Philosophy",
    "description": "Core principles that guide my approach",
    "variant": "primary",
    "size": "lg",
    "badges": "PMP Certified, U.S. Army Veteran, Technical Leader",
    "image": "/images/profile.jpg",
    "imageAlt": "Profile image",
    "cta": {
      "text": "Learn More",
      "link": "https://example.com",
      "variant": "default"
    }
  },
  "content": "Your hero content here with **markdown** support."
}
```

**Hero Card Options:**
- `variant`: "primary" (teal), "secondary" (slate), "accent" (blue)
- `size`: "sm", "md", "lg"
- `badges`: Comma-separated string or array of badge text
- `image`: Optional image URL
- `cta`: Optional call-to-action button

### 3. Hero Profile Card

A specialized profile card designed for main profile display with image, name, tagline, and multi-colored badges.

```markdown
```card
{
  "type": "hero-profile",
  "props": {
    "name": "Roger Lee Cormier",
    "title": "Technical Project Manager",
    "description": "Driving digital transformation through cloud-native solutions and strategic leadership",
    "image": "/images/profile.jpg",
    "imageAlt": "Roger Cormier profile image",
    "badges": "PMP Certified, U.S. Army Veteran, Cloud Expert, DevOps Specialist"
  },
  "content": "Experienced technical project manager with a proven track record of leading complex digital transformation initiatives. Specializing in modernizing legacy systems, building cloud-native architectures, and implementing AI-augmented workflows that drive measurable business outcomes.

## Core Competencies
- **Strategic Leadership**: PMP-certified project management with military leadership background
- **Technical Excellence**: Cloud platforms (Azure, Cloudflare), DevOps automation, and system integration
- **Business Impact**: 98% on-time delivery rate across 25+ enterprise projects
- **Innovation Focus**: AI/ML integration, workflow automation, and emerging technology adoption"
}
```

**Hero Profile Card Features:**
- **Image**: Circular profile image with teal border
- **Name/Title**: Large, prominent display
- **Tagline**: Descriptive text that wraps properly
- **Badges**: Multi-colored badges with automatic color cycling
- **Content**: Full markdown support with proper font and word wrapping

### 4. Success Card

Green-accented cards for positive content with icons.

```markdown
```card
{
  "type": "success",
  "props": {
    "title": "Project Success",
    "description": "Consistent delivery excellence",
    "icon": "target",
    "badges": "On-Time Delivery, Client Satisfaction, Quality Assurance"
  },
  "content": "98% on-time delivery rate across 25+ enterprise projects."
}
```

**Success Card Icons:** "check", "award", "star", "target"
**Badges:** Comma-separated string or array of badge names

### 5. Warning Card

Orange-accented cards for important notices with icons.

```markdown
```card
{
  "type": "warning",
  "props": {
    "title": "Security First",
    "description": "Enterprise-grade protection",
    "icon": "shield",
    "badges": "Zero-Trust, Compliance, Audit-Ready"
  },
  "content": "All implementations follow zero-trust principles."
}
```

**Warning Card Icons:** "alert", "info", "shield", "lock"
**Badges:** Comma-separated string or array of badge names

### 6. Tech Card

Blue-accented cards for technical content with technology badges.

```markdown
```card
{
  "type": "tech",
  "props": {
    "title": "Cloud Expertise",
    "description": "Modern platform mastery",
    "icon": "cloud",
    "badges": "Azure, Cloudflare, GitHub Actions"
  },
  "content": "Specialized in cloud-native architectures and edge computing."
}
```

**Tech Card Icons:** "code", "database", "cloud", "rocket", "zap"
**Badges:** Comma-separated string or array of badge names

### 7. Feature Card

Creates a feature card with an icon, badges, and optional link.

```markdown
```card
{
  "type": "feature",
  "props": {
    "title": "Cloud Integration",
    "description": "Seamless cloud platform integration",
    "icon": "zap",
    "badges": "Azure, Cloudflare, DevOps",
    "link": "https://example.com",
    "linkText": "Learn More"
  },
  "content": "Our cloud integration services help you modernize legacy systems and leverage the power of cloud-native architectures."
}
```

**Available Icons:** `award`, `briefcase`, `graduation`, `star`, `trending`, `shield`, `zap`
**Badges:** Comma-separated string or array of badge names

### 8. Profile Card

Creates a profile card with image, contact info, and badges.

```markdown
```card
{
  "type": "profile",
  "props": {
    "name": "Roger Lee Cormier",
    "role": "Technical Project Manager",
    "image": "/images/profile.jpg",
    "imageAlt": "Profile image",
    "badges": "PMP Certified, U.S. Army NCO, Cloud & DevOps",
    "contact": "email:roger@example.com,phone:555-123-4567,location:Remote,github:https://github.com/rcormier"
  },
  "content": "Experienced technical project manager specializing in digital transformation and cloud-native solutions."
}
```

### 9. Stats Card

Creates a card displaying statistics and metrics.

```markdown
```card
{
  "type": "stats",
  "props": {
    "title": "Project Metrics",
    "description": "Key performance indicators"
  },
  "content": "Projects Completed: 25\nSuccess Rate: 98%\nClient Satisfaction: 4.9/5"
}
```

### 10. Timeline Card

Creates a timeline card showing chronological events.

```markdown
```card
{
  "type": "timeline",
  "props": {
    "title": "Career Timeline",
    "description": "Professional milestones"
  },
  "content": "2023-01-15 | Senior Technical PM | Led digital transformation initiative | Current\n2021-06-01 | Technical Project Manager | ERP modernization projects | Completed\n2019-03-15 | U.S. Army NCO | Signal Corps operations | Veteran"
}
```

### 11. Multi-Column Layout

Create 2 or 3 column layouts with different card types.

```markdown
```card
{
  "type": "columns",
  "props": {},
  "content": "{\n  \"columns\": 3,\n  \"cards\": [\n    {\n      \"type\": \"success\",\n      \"props\": {\n        \"title\": \"Project Success\",\n        \"description\": \"Consistent delivery excellence\",\n        \"icon\": \"target\",\n        \"badges\": \"On-Time Delivery, Quality Assurance\"\n      },\n      \"content\": \"98% on-time delivery rate.\"\n    },\n    {\n      \"type\": \"tech\",\n      \"props\": {\n        \"title\": \"Cloud Expertise\",\n        \"description\": \"Modern platform mastery\",\n        \"icon\": \"cloud\",\n        \"badges\": \"Azure, Cloudflare, GitHub Actions\"\n      },\n      \"content\": \"Specialized in cloud-native architectures.\"\n    },\n    {\n      \"type\": \"warning\",\n      \"props\": {\n        \"title\": \"Security First\",\n        \"description\": \"Enterprise-grade protection\",\n        \"icon\": \"shield\",\n        \"badges\": \"Zero-Trust, Compliance\"\n      },\n      \"content\": \"Zero-trust principles with audit trails.\"\n    }\n  ]\n}"
}
```

## Badges System

All card types now support a unified badges system that provides consistent styling and multi-colored display:

### Badge Format
- **String format**: `"badges": "Badge 1, Badge 2, Badge 3"`
- **Array format**: `"badges": ["Badge 1", "Badge 2", "Badge 3"]`

### Badge Colors
Badges automatically cycle through a predefined color palette:
- **Blue**: Professional certifications and credentials
- **Green**: Success metrics and achievements  
- **Orange**: Technical skills and expertise
- **Red**: Security and compliance focus
- **Purple**: Innovation and emerging technologies

### Badge Usage Examples
```markdown
// Success Card
"badges": "On-Time Delivery, Client Satisfaction, Quality Assurance"

// Tech Card  
"badges": "Azure, Cloudflare, GitHub Actions, DevOps"

// Warning Card
"badges": "Zero-Trust, Compliance, Audit-Ready, SOC 2"

// Hero Profile Card
"badges": "PMP Certified, U.S. Army Veteran, Cloud Expert, DevOps Specialist"
```

## Color Schemes

All cards are designed to integrate with your teal-blue brand:

- **Info Cards**: Teal gradient backgrounds
- **Hero Cards**: Teal, slate, or blue gradients
- **Success Cards**: Green accents for positive content
- **Warning Cards**: Orange accents for important notices
- **Tech Cards**: Blue accents for technical content
- **Feature/Profile/Stats/Timeline**: Teal styling
- **Hero Profile Cards**: Teal accent line with multi-colored badges

## Content Formats

### Stats Card Content
Use colon-separated format:
```
Label: Value
Another Label: Another Value
```

### Timeline Card Content
Use pipe-separated format:
```
Date | Title | Description | Badge
```

## Examples in Practice

### About Page Enhancement
```markdown
## Professional Focus

```card
{
  "type": "hero-profile",
  "props": {
    "name": "Roger Lee Cormier",
    "title": "Technical Project Manager",
    "description": "Driving digital transformation through cloud-native solutions and strategic leadership",
    "image": "/images/profile.jpg",
    "imageAlt": "Roger Cormier profile image",
    "badges": "PMP Certified, U.S. Army Veteran, Cloud Expert, DevOps Specialist"
  },
  "content": "Experienced technical project manager with a proven track record of leading complex digital transformation initiatives."
}
```

### Multi-Column Showcase
```markdown
```card
{
  "type": "columns",
  "props": {},
  "content": "{\n  \"columns\": 2,\n  \"cards\": [\n    {\n      \"type\": \"tech\",\n      \"props\": {\n        \"title\": \"ERP & SaaS\",\n        \"description\": \"Enterprise system integration\",\n        \"icon\": \"database\",\n        \"badges\": \"NetSuite, Ramp, Vena, Box\"\n      },\n      \"content\": \"Modernizing legacy ERP systems with cloud-native integrations.\"\n    },\n    {\n      \"type\": \"tech\",\n      \"props\": {\n        \"title\": \"Cloud Platforms\",\n        \"description\": \"Edge computing and automation\",\n        \"icon\": \"cloud\",\n        \"badges\": \"Azure, Cloudflare, GitHub Actions\"\n      },\n      \"content\": \"Building scalable, secure cloud architectures with AI-augmented workflows.\"\n    }\n  ]\n}"
}
```

## Styling

All cards use your site's teal-blue brand colors and follow shadcn/ui design patterns. The cards are responsive and include:

- Consistent teal color scheme
- Proper spacing and typography
- Hover effects for interactive elements
- Dark mode support
- Mobile-responsive design
- Proper font rendering (Inter font family)
- Word wrapping and text overflow handling

## Integration

The custom card syntax is automatically processed when rendering markdown content. No additional setup is required - just use the syntax in your markdown files and the cards will be rendered with the appropriate shadcn/ui styling.

## Best Practices

1. **Keep content concise** - Cards work best with focused, scannable content
2. **Use appropriate card types** - Match the card type to your content purpose
3. **Include relevant badges** - Use badges to highlight key technologies, achievements, or focus areas
4. **Provide contact info** - For profile cards, include relevant contact methods
5. **Test responsiveness** - Ensure your cards look good on all device sizes
6. **Use multi-column layouts** - For related content, consider using the columns card type
7. **Leverage the hero-profile card** - Use for main profile sections with comprehensive information
8. **Consistent badge naming** - Use clear, descriptive badge text that adds value

## Troubleshooting

If a card doesn't render correctly:
1. Check the JSON syntax - ensure proper brackets and braces
2. Verify prop values are properly quoted
3. Check that the card type is supported
4. Ensure content follows the expected format for the card type
5. For arrays/strings, use comma-separated values or proper JSON arrays
6. Verify that badges are properly formatted as comma-separated strings or arrays

For complex layouts, consider using multiple smaller cards or the multi-column layout rather than one large card with lots of content.

## Recent Updates

- **Added `hero-profile` card type** for main profile display with image, name, tagline, and multi-colored badges
- **Unified badges system** across all card types for consistent styling
- **Enhanced typography** with proper font rendering and word wrapping
- **Improved responsive design** for better mobile experience
- **Multi-colored badge support** with automatic color cycling