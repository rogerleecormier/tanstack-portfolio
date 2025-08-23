# Roger Lee Cormier Portfolio

A modern, professional portfolio website built with cutting-edge web technologies, featuring Cloudflare Access authentication, advanced search capabilities, and interactive data visualization.

## 🚀 Tech Stack

### **Frontend Framework**
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and developer experience
- **Vite** - Lightning-fast build tool and dev server

### **Routing & State Management**
- **TanStack Router** - Type-safe, file-based routing
- **TanStack React Query** - Server state management and caching
- **TanStack History** - Browser history management

### **UI & Styling**
- **shadcn/ui** - Beautiful, accessible React components
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Radix UI** - Headless UI primitives for accessibility
- **Lucide React** - Beautiful, customizable icons
- **Tailwind Typography** - Enhanced typography utilities

### **Data Visualization**
- **Recharts** - Composable charting library
- **shadcn/ui Chart Components** - Pre-built chart components with consistent theming

### **Search & Content**
- **Fuse.js** - Powerful fuzzy search with configurable relevance scoring
- **React Markdown** - Markdown rendering with syntax highlighting
- **Gray Matter** - Frontmatter parsing for content metadata

### **Authentication & Security**
- **Cloudflare Access** - Enterprise-grade Zero Trust authentication
- **One-Time PIN (OTP)** - Secure email-based authentication
- **JWT Token Management** - Secure session handling

## ✨ Key Features

### **🔐 Advanced Authentication System**
- **Dual-Mode Authentication**: Automatically switches between development and production
- **Cloudflare Access Integration**: Enterprise-grade security with OTP authentication
- **Protected Routes**: Secure access to sensitive content and analysis tools
- **Development Mode**: Mock authentication for local development and testing

### **🔍 Intelligent Search System**
- **Fuse.js Powered**: Fuzzy search with configurable relevance scoring
- **Global Content Search**: Search across all markdown content, pages, and documentation
- **Real-time Results**: Debounced search with instant feedback
- **Relevance Scoring**: Visual indicators showing match quality
- **Keyboard Navigation**: ⌘K shortcut for quick access

### **📊 Interactive Data Analysis**
- **HealthBridge Integration**: Protected health data analysis with dynamic filtering
- **Advanced Charting**: Line charts, bar charts, and more with Recharts
- **Dynamic Filtering**: Date ranges, custom periods, and real-time data aggregation
- **Responsive Design**: Charts adapt to different screen sizes

### **📱 Modern User Experience**
- **Responsive Sidebar**: Collapsible navigation with project organization
- **Table of Contents**: Auto-generated TOC for markdown content
- **Breadcrumb Navigation**: Clear path indication
- **Mobile-First Design**: Optimized for all device sizes

### **🎨 Professional Design System**
- **shadcn/ui Components**: Consistent, accessible UI components
- **Custom Color Scheme**: Professional portfolio aesthetic
- **Typography System**: Enhanced readability and hierarchy
- **Dark Mode Support**: Built-in theme switching

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/             # shadcn/ui components
│   │   ├── chart.tsx   # Recharts integration
│   │   ├── button.tsx  # Button variants
│   │   ├── card.tsx    # Card components
│   │   └── ...         # Other UI components
│   ├── AppSidebar.tsx  # Main navigation sidebar
│   ├── Search.tsx      # Global search with Fuse.js
│   ├── TableOfContents.tsx # Auto-generated TOC
│   ├── ProtectedRoute.tsx  # Authentication wrapper
│   └── HealthBridge.tsx    # Data analysis component
├── pages/               # Page components
│   ├── MarkdownPage.tsx    # Markdown content renderer
│   ├── HealthBridge.tsx    # Protected health analysis
│   └── NotFound.tsx        # 404 page
├── content/             # Markdown content files
│   ├── about.md         # About page content
│   ├── analytics.md     # Analytics content
│   ├── strategy.md      # Strategy content
│   └── ...              # Other content pages
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication state management
│   └── use-mobile.tsx   # Mobile detection
├── utils/               # Utility functions
│   ├── cloudflareAuth.ts # Cloudflare Access integration
│   ├── searchIndex.ts   # Fuse.js search implementation
│   └── ...              # Other utilities
├── router.tsx           # TanStack Router configuration
└── main.tsx             # Application entry point
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Cloudflare account (for production deployment)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tanstack-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### **Development Commands**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔐 Authentication Setup

### **Development Mode**
- Automatically detected when running on `localhost`
- Mock authentication for testing protected routes
- No external dependencies required
- Use the development authentication toggle for testing

### **Production Mode**
- Cloudflare Access with One-Time PIN authentication
- Secure email-based authentication
- Protected routes require valid credentials
- See `CLOUDFLARE_SETUP.md` for detailed configuration

### **Protected Routes**
- `/protected` - General protected content
- `/healthbridge-analysis` - Health data analysis tools

## 🔍 Search Implementation

### **Fuse.js Configuration**
The search system uses Fuse.js with optimized settings for portfolio content:

```typescript
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
}
```

### **Search Features**
- **Global Search**: Search across all content simultaneously
- **Relevance Scoring**: Visual indicators showing match quality
- **Context Preview**: Show search results with surrounding context
- **Keyboard Shortcuts**: ⌘K to open search dialog
- **Real-time Results**: Instant search as you type

## 📊 Data Visualization

### **Recharts Integration**
The application uses Recharts with custom shadcn/ui chart components:

- **Line Charts**: For time-series data visualization
- **Bar Charts**: For categorical data comparison
- **Responsive Design**: Charts adapt to container size
- **Custom Theming**: Consistent with design system
- **Interactive Elements**: Tooltips, zoom, and pan support

### **Chart Features**
- **Dynamic Filtering**: Date ranges and custom periods
- **Data Aggregation**: Automatic grouping by time periods
- **Real-time Updates**: Live data refresh capabilities
- **Export Options**: Chart data export functionality

## 🎨 UI Components

### **shadcn/ui Integration**
Built on shadcn/ui for consistent, accessible components:

- **Button Variants**: Primary, secondary, outline, ghost
- **Card Components**: Content containers with headers
- **Form Elements**: Inputs, selects, checkboxes
- **Navigation**: Sidebar, breadcrumbs, navigation menu
- **Feedback**: Alerts, badges, tooltips

### **Custom Design System**
- **Color Palette**: Professional portfolio aesthetic
- **Typography**: Enhanced readability with Tailwind Typography
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth transitions and micro-interactions

## 🌐 Deployment

### **Cloudflare Pages**
The application is optimized for Cloudflare Pages deployment:

- **SPA Routing**: Clean URLs without hash routing
- **Edge Computing**: Global CDN distribution
- **Zero Trust**: Integrated Cloudflare Access authentication
- **GitHub Actions**: Automated deployment workflow

### **Build Configuration**
```bash
# Build command
npm run build

# Output directory
dist/

# Environment variables
Configure in Cloudflare Pages dashboard
```

## 🔧 Configuration

### **Environment Variables**
```bash
# Development
VITE_DEV_MODE=true

# Production
VITE_CLOUDFLARE_DOMAIN=rcormier.dev
```

### **Tailwind Configuration**
Custom design system with:
- Extended color palette
- Custom spacing scale
- Typography utilities
- Animation keyframes

### **TypeScript Configuration**
- Strict type checking
- Path aliases for clean imports
- Modern ES2022 target
- React 19 JSX transform

## 📱 Responsive Design

### **Breakpoint Strategy**
- **Mobile First**: Base styles for mobile devices
- **Tablet**: `sm:` prefix (640px+)
- **Desktop**: `md:` prefix (768px+)
- **Large Desktop**: `lg:` prefix (1024px+)
- **Extra Large**: `xl:` prefix (1280px+)

### **Mobile Optimizations**
- Touch-friendly interactions
- Optimized sidebar for mobile
- Responsive chart sizing
- Mobile-first search interface

## 🚀 Performance Features

### **Code Splitting**
- Route-based code splitting
- Lazy-loaded components
- Optimized bundle sizes

### **Search Performance**
- Debounced search input
- Efficient Fuse.js indexing
- Result caching
- Progressive result loading

### **Chart Performance**
- Optimized Recharts rendering
- Data virtualization for large datasets
- Efficient re-rendering
- Memory leak prevention

## 🔒 Security Features

### **Authentication Security**
- JWT token validation
- Secure cookie handling
- CSRF protection
- Rate limiting support

### **Content Security**
- XSS protection
- Content sanitization
- Secure markdown rendering
- Input validation

## 🧪 Testing & Quality

### **Code Quality**
- ESLint configuration
- TypeScript strict mode
- Prettier formatting
- Git hooks

### **Development Tools**
- React DevTools integration
- TanStack Query DevTools
- Hot module replacement
- Error boundary handling

## 📚 Content Management

### **Markdown Support**
- Frontmatter metadata
- Syntax highlighting
- Table of contents generation
- Image optimization

### **Content Organization**
- Hierarchical navigation
- Tag-based categorization
- Search indexing
- Content versioning

## 🔄 Future Enhancements

### **Planned Features**
- **SSR Migration**: Server-side rendering for better SEO
- **CMS Integration**: Headless CMS for content management
- **Analytics Dashboard**: Enhanced data visualization
- **Multi-language Support**: Internationalization
- **PWA Features**: Progressive web app capabilities

### **Technology Upgrades**
- **React 19 Features**: Concurrent rendering and suspense
- **TanStack Router v2**: Latest routing features
- **Vite 5**: Enhanced build performance
- **Tailwind CSS v4**: Latest styling features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For questions or support:
- Open an issue on GitHub
- Check the documentation
- Review the Cloudflare setup guide

---

**Built with ❤️ using modern web technologies**
