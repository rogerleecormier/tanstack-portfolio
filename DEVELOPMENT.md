# Development Guide - Roger Lee Cormier Portfolio

This document provides comprehensive technical information for developers working on the portfolio application, including architecture details, development setup, and implementation patterns.

## 🏗️ Architecture Overview

### **Technology Stack**
```
Frontend Framework: React 19 + TypeScript 5.8
Routing: TanStack Router v1
State Management: TanStack React Query v5
Build Tool: Vite 7
Styling: Tailwind CSS 3.4 + shadcn/ui
Search: Fuse.js
Charts: Recharts + shadcn/ui Chart Components
Authentication: Cloudflare Access (Zero Trust)
Email: Resend API + Cloudflare Workers
AI: Cloudflare AI Workers with Llama 2
Deployment: Cloudflare Pages
```

### **Application Structure**
```
src/
├── components/           # React components
│   ├── ui/             # shadcn/ui component library
│   ├── AppSidebar.tsx  # Main navigation sidebar
│   ├── Search.tsx      # Global search implementation
│   ├── SiteAssistant.tsx # AI-powered site assistant
│   ├── ProtectedRoute.tsx # Authentication wrapper
│   └── ...             # Other components
├── pages/               # Page components
│   ├── MarkdownPage.tsx    # Markdown content renderer
│   ├── PortfolioPage.tsx   # Auto-generated portfolio
│   ├── ContactPage.tsx     # Smart contact flow
│   └── ...                 # Other pages
├── content/             # Markdown content files
│   ├── portfolio/      # Auto-generated portfolio items
│   └── blog/           # Blog posts
├── api/                 # API and service files
├── utils/               # Utility functions
├── config/              # Configuration files
├── router.tsx           # TanStack Router configuration
└── main.tsx             # Application entry point
```

## 🚀 Development Setup

### **Prerequisites**
- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Git
- Modern browser with ES2020 support
- Cloudflare account (for Workers)
- Resend account (for email functionality)

### **Environment Setup**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tanstack-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   Create `.env.local` for local development:
   ```bash
   VITE_DEV_MODE=true
   VITE_CLOUDFLARE_DOMAIN=rcormier.dev
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### **Development Commands**
```bash
# Development server
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run type-check       # TypeScript type checking
npm run lint             # ESLint linting
```

## 🔐 Authentication System

### **Dual-Mode Architecture**
The application automatically switches between authentication modes based on the environment:

```typescript
// src/utils/cloudflareAuth.ts
export const isDevelopment = (): boolean => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost');
};

export const isAuthenticated = async (): Promise<boolean> => {
  if (isDevelopment()) {
    const devAuth = localStorage.getItem('dev_auth');
    return devAuth === 'true';
  }
  
  // Production: Check Cloudflare Access cookies
  const hasAuthCookie = document.cookie.includes('CF_Authorization') || 
                       document.cookie.includes('CF_Access_JWT');
  return hasAuthCookie;
};
```

### **Development Authentication**
- **Mock Authentication**: Simulated using localStorage
- **Toggle Component**: `DevAuthToggle` for testing
- **Protected Routes**: Automatically work in development mode
- **State Persistence**: Auth state persists across page refreshes

### **Production Authentication**
- **Cloudflare Access**: Zero Trust with email-based authentication
- **Email Validation**: Access controlled by configured email addresses and domains
- **Cookie Handling**: Secure authentication cookies
- **Route Protection**: Automatic redirects to login

### **Protected Route Implementation**
```tsx
// src/components/ProtectedRoute.tsx
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  return <>{children}</>;
};
```

**📖 For detailed authentication setup, see [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) and [ACCESS_CONTROL.md](./ACCESS_CONTROL.md)**

## 📧 Contact Form & Email System

### **Architecture Overview**
The contact form system uses a serverless architecture to avoid CORS issues:

```
Frontend Form → Cloudflare Worker → Resend API → Email Delivery
```

### **Email Service Implementation**
```typescript
// src/api/emailService.ts
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    const response = await fetch(WORKER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_name: emailData.from_name,
        from_email: emailData.from_email,
        company: emailData.company,
        subject: emailData.subject,
        message: emailData.message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};
```

### **Contact Form Component**
```tsx
// src/pages/ContactPage.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);
  
  try {
    const emailData = {
      to_name: 'Roger',
      from_name: formData.name,
      from_email: formData.email,
      company: formData.company || 'Not specified',
      subject: formData.subject,
      message: formData.message,
      reply_to: formData.email,
    };

    const success = await sendEmail(emailData);
    
    if (success) {
      setIsSubmitted(true);
      // Reset form after successful submission
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', company: '', subject: '', message: '' });
      }, 5000);
    } else {
      throw new Error('Failed to send message');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    setError(error instanceof Error ? error.message : 'Failed to send message. Please try again or email me directly.');
  } finally {
    setIsSubmitting(false);
  }
};
```

**📖 For detailed email system documentation, see [EMAIL_SYSTEM.md](./EMAIL_SYSTEM.md)**

## 🔍 Search System Implementation

### **Fuse.js Configuration**
The search system uses Fuse.js with optimized settings for portfolio content:

```typescript
// src/utils/searchIndex.ts
const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.3 },      // Page titles
    { name: 'description', weight: 0.25 }, // Frontmatter descriptions
    { name: 'content', weight: 0.2 },    // Main content
    { name: 'headings', weight: 0.15 },  // Section headings
    { name: 'tags', weight: 0.1 }        // Content tags
  ],
  threshold: 0.4,                        // Fuzzy matching threshold
  includeScore: true,                    // Include relevance scores
  includeMatches: true,                  // Include match details
  minMatchCharLength: 2                  // Minimum search length
};
```

### **Search Data Structure**
```typescript
// src/types/search.ts
export interface SearchItem {
  id: string;
  title: string;
  description?: string;
  content: string;
  url: string;
  section: string;
  headings: string[];
  tags: string[];
}

export interface SearchResult {
  item: SearchItem;
  score?: number;
  matches?: Array<{
    key: string;
    indices: [number, number][];
  }>;
}
```

### **Search Component Features**
- **Global Search**: Search across all content simultaneously
- **Relevance Scoring**: Visual indicators showing match quality
- **Context Preview**: Show search results with surrounding context
- **Keyboard Shortcuts**: ⌘K to open search dialog
- **Real-time Results**: Instant search as you type

## 🤖 AI Features Integration

### **Site Assistant Implementation**
The AI-powered site assistant provides intelligent recommendations across all pages:

```typescript
// src/components/SiteAssistant.tsx
interface Recommendation {
  type: 'solution' | 'insight' | 'trend' | 'blog' | 'portfolio'
  title: string
  description: string
  relatedItems: string[]
  confidence: number
  icon: React.ComponentType<{ className?: string }>
  category?: string
}
```

### **AI Analysis Service**
```typescript
// src/api/aiContactAnalyzer.ts
export const analyzeContactInquiry = async (message: string): Promise<AIAnalysis> => {
  const response = await fetch(AI_WORKER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  return response.json();
};
```

**📖 For comprehensive AI features documentation, see [AI_FEATURE_README.md](./AI_FEATURE_README.md)**

## 📊 Data Visualization

### **Recharts Integration**
The application uses Recharts with custom shadcn/ui chart components:

```tsx
// Example chart component
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

<ChartContainer>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <ChartTooltip>
      <ChartTooltipContent />
    </ChartTooltip>
    <Line type="monotone" dataKey="weight" stroke="#8884d8" />
  </LineChart>
</ChartContainer>
```

### **Chart Features**
- **Dynamic Filtering**: Date ranges and custom periods
- **Data Aggregation**: Automatic grouping by time periods
- **Real-time Updates**: Live data refresh capabilities
- **Export Options**: Chart data export functionality
- **Responsive Design**: Charts adapt to container size

## 🎨 UI Component System

### **shadcn/ui Integration**
Built on shadcn/ui for consistent, accessible components:

```tsx
// Component usage examples
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

<Card>
  <CardHeader>
    <h2>Component Title</h2>
  </CardHeader>
  <CardContent>
    <Input placeholder="Enter text..." />
    <Button variant="default">Submit</Button>
  </CardContent>
</Card>
```

### **Custom Design System**
- **Color Palette**: Professional portfolio aesthetic with teal accent colors
- **Typography**: Enhanced readability with Tailwind Typography
- **Spacing**: Consistent spacing scale with optimized contact page layout
- **Animations**: Smooth transitions and micro-interactions
- **Interactive States**: Enhanced hover effects and visual feedback for contact elements

### **Component Variants**
```typescript
// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## 🛣️ Routing Configuration

### **TanStack Router Setup**
```typescript
// src/router.tsx
import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';

const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFound,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <MarkdownPage file="about" />
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'contact',
  component: ContactPage,
});

const healthBridgeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'healthbridge-analysis',
  component: HealthBridge,
});
```

### **Route Protection**
```typescript
// Protected routes automatically redirect to authentication
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected',
  component: ProtectedPage,
});
```

### **Navigation Structure**
- **Portfolio Pages**: Public content (About, Strategy, Leadership, etc.)
- **Contact Form**: Public contact page with email integration
- **Project Analysis**: Public project documentation
- **Protected Content**: Authentication required (HealthBridge, etc.)

## 📱 Responsive Design

### **Breakpoint Strategy**
```css
/* Tailwind breakpoints */
sm: 640px+   /* Small devices */
md: 768px+   /* Medium devices */
lg: 1024px+  /* Large devices */
xl: 1280px+  /* Extra large devices */
2xl: 1536px+ /* 2X large devices */
```

### **Mobile Optimizations**
- **Touch-friendly interactions**: Optimized for mobile devices
- **Responsive sidebar**: Collapsible navigation for mobile
- **Chart responsiveness**: Charts adapt to screen size
- **Search interface**: Mobile-first search design
- **Contact form**: Mobile-optimized form layout

### **Component Responsiveness**
```tsx
// Responsive component example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="p-4 md:p-6">
    <h3 className="text-lg md:text-xl font-semibold">Title</h3>
    <p className="text-sm md:text-base">Content</p>
  </Card>
</div>
```

## 🔧 Configuration Files

### **Tailwind Configuration**
```javascript
// tailwind.config.js
export default {
  darkMode: ["class"],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Custom color palette
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")]
}
```

### **TypeScript Configuration**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### **Vite Configuration**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
```

### **Wrangler Configuration**
```toml
# wrangler.toml
name = "tanstack-portfolio-email-worker"
main = "functions/send-email.js"
compatibility_date = "2024-01-01"

# Environment-specific configurations
[env.production]
# Production environment - no additional config needed

[env.development]
# Development environment - no additional config needed
```

## 🧪 Testing & Quality

### **Code Quality Tools**
- **ESLint**: Code linting and style enforcement
- **TypeScript**: Static type checking
- **Prettier**: Code formatting (if configured)
- **Git Hooks**: Pre-commit quality checks

### **Development Tools**
- **React DevTools**: Component inspection and debugging
- **TanStack Query DevTools**: Query state management
- **Hot Module Replacement**: Instant code updates
- **Error Boundaries**: Graceful error handling

### **Performance Monitoring**
- **Bundle Analysis**: Vite build analysis
- **Lighthouse**: Performance auditing
- **React Profiler**: Component performance analysis
- **Network Tab**: API call monitoring

## 📚 Content Management

### **Markdown Support**
- **Frontmatter**: YAML metadata for pages
- **Syntax Highlighting**: Code block formatting
- **Table of Contents**: Auto-generated navigation
- **Image Optimization**: Responsive image handling

### **Content Organization**
```markdown
---
title: "Page Title"
description: "Page description"
tags: ["tag1", "tag2"]
---

# Page Content

## Section 1
Content here...

## Section 2
More content...
```

### **Content Processing**
```typescript
// src/utils/markdownContentExtractor.ts
export const extractFrontmatter = (content: string) => {
  const { data, content: markdownContent } = grayMatter(content);
  return {
    frontmatter: data,
    content: markdownContent,
    headings: extractHeadings(markdownContent),
  };
};
```

**📖 For auto-generated portfolio content details, see [AI_PORTFOLIO_ENHANCEMENTS.md](./AI_PORTFOLIO_ENHANCEMENTS.md)**

## 🚀 Performance Optimization

### **Code Splitting**
- **Route-based splitting**: Each route loads independently
- **Component lazy loading**: Heavy components loaded on demand
- **Bundle optimization**: Efficient chunk generation

### **Search Performance**
- **Debounced input**: Reduce unnecessary API calls
- **Efficient indexing**: Fuse.js optimized configuration
- **Result caching**: Cache search results
- **Progressive loading**: Load results incrementally

### **Chart Performance**
- **Optimized rendering**: Efficient Recharts configuration
- **Data virtualization**: Handle large datasets
- **Memory management**: Prevent memory leaks
- **Responsive updates**: Efficient re-rendering

### **Email Performance**
- **Worker optimization**: Efficient Cloudflare Worker code
- **Template caching**: Reusable email templates
- **Rate limiting**: Prevent spam and abuse
- **Error handling**: Graceful failure handling

## 🔒 Security Implementation

### **Authentication Security**
- **Cloudflare Access**: Zero Trust authentication
- **Email validation**: Access controlled by configured emails/domains
- **Cookie security**: Secure authentication cookies
- **Rate limiting**: API call throttling

### **Email Security**
- **API key storage**: Stored as Cloudflare secrets
- **Input validation**: Strict validation and sanitization
- **Rate limiting**: Contact form abuse prevention
- **Spam protection**: Built-in Resend protection

### **Content Security**
- **XSS prevention**: Content sanitization
- **Input validation**: Strict type checking
- **Markdown safety**: Secure rendering
- **HTTPS enforcement**: Secure connections

### **Security Headers**
- **Content Security Policy**: XSS and injection protection
- **X-Frame-Options**: Clickjacking prevention
- **X-Content-Type-Options**: MIME type sniffing protection
- **Strict-Transport-Security**: HTTPS enforcement

**📖 For comprehensive security documentation, see [SECURITY.md](./SECURITY.md) and [SECURITY_IMPROVEMENTS.md](./SECURITY_IMPROVEMENTS.md)**

## 🔄 Development Workflow

### **Feature Development**
1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Implement changes**: Follow coding standards
3. **Test functionality**: Verify in development mode
4. **Update documentation**: Document new features
5. **Submit PR**: Create pull request for review

### **Code Review Process**
- **TypeScript compliance**: Ensure type safety
- **Component standards**: Follow shadcn/ui patterns
- **Performance impact**: Check bundle size
- **Accessibility**: Verify ARIA compliance

### **Testing Strategy**
- **Development testing**: Test in local environment
- **Authentication testing**: Verify both modes
- **Search testing**: Test Fuse.js functionality
- **Chart testing**: Verify Recharts integration
- **Email testing**: Test contact form functionality

## 🆘 Troubleshooting

### **Common Issues**

#### **Authentication Problems**
```bash
# Check development mode
console.log('Development mode:', isDevelopment());

# Check authentication state
console.log('Auth state:', isAuthenticated());

# Debug Cloudflare cookies
console.log('Cookies:', document.cookie);
```

#### **Search Issues**
```bash
# Check search index
console.log('Search data:', getSearchData());

# Verify Fuse.js configuration
console.log('Fuse options:', fuseOptions);
```

#### **Email Issues**
```bash
# Check worker status
wrangler whoami

# View worker logs
wrangler tail --env development

# Test worker directly
curl -X POST your-worker-url
```

#### **Build Problems**
```bash
# Clear build cache
rm -rf dist/ node_modules/.vite

# Reinstall dependencies
npm install

# Check TypeScript errors
npm run type-check
```

### **Debug Tools**
- **Browser DevTools**: Console and network monitoring
- **React DevTools**: Component state inspection
- **TanStack Query DevTools**: Query state management
- **Cloudflare Dashboard**: Access policy verification
- **Resend Dashboard**: Email delivery monitoring

## 📚 Additional Resources

### **Documentation**
- [React 19 Documentation](https://react.dev/)
- [TanStack Router](https://tanstack.com/router)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Fuse.js Search](https://fusejs.io/)
- [Recharts Documentation](https://recharts.org/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Resend API](https://resend.com/docs)

### **Development Tools**
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Cloudflare Zero Trust](https://developers.cloudflare.com/zero-trust/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

**Happy coding! 🚀**
