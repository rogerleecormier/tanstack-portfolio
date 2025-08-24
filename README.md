# Roger Lee Cormier Portfolio

A modern, professional portfolio website built with cutting-edge web technologies, featuring Cloudflare Access authentication, advanced search capabilities, interactive data visualization, and a fully functional contact form with Resend email integration.

## 🚀 Tech Stack

### **Frontend Framework**
- **React 19** - Latest React with concurrent features and suspense
- **TypeScript 5.8** - Full type safety and developer experience
- **Vite 7** - Lightning-fast build tool and dev server

### **Routing & State Management**
- **TanStack Router v1** - Type-safe, file-based routing
- **TanStack React Query v5** - Server state management and caching
- **TanStack History** - Browser history management

### **UI & Styling**
- **shadcn/ui** - Beautiful, accessible React components
- **Tailwind CSS 3.4** - Utility-first CSS framework with custom design system
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
- **Email-based Access Control** - Configurable user access management
- **Development Mock Auth** - Local development authentication simulation

### **Email & Contact**
- **Resend** - Modern email API for reliable email delivery
- **Cloudflare Workers** - Serverless functions for email processing
- **Contact Form** - Professional contact form with spam protection

## ✨ Key Features

### **🔐 Advanced Authentication System**
- **Cloudflare Access Integration**: Enterprise-grade security with Zero Trust
- **Dual-Mode Architecture**: Automatically switches between development and production
- **Protected Routes**: Secure access to sensitive content and analysis tools
- **Development Mode**: Mock authentication for local development and testing
- **Email-based Access Control**: Configurable user permissions

### **📧 Professional Contact System**
- **Resend Integration**: Modern, reliable email delivery via Resend API
- **Cloudflare Worker**: Serverless email processing to avoid CORS issues
- **Spam Protection**: Built-in spam prevention and validation
- **Professional Templates**: Beautiful HTML email templates with branding
- **Reply-to Functionality**: Easy response handling for inquiries
- **Contact Form**: Professional contact form with company, subject, and message fields

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
│   ├── ContactPage.tsx     # Contact form with email integration
│   └── HealthBridge.tsx    # Data analysis component
├── pages/               # Page components
│   ├── MarkdownPage.tsx    # Markdown content renderer
│   ├── ContactPage.tsx     # Contact form page
│   ├── HealthBridge.tsx    # Protected health analysis
│   └── NotFound.tsx        # 404 page
├── content/             # Markdown content files
│   ├── about.md         # About page content
│   ├── analytics.md     # Analytics content
│   ├── strategy.md      # Strategy content
│   └── ...              # Other content pages
├── api/                 # API and service files
│   ├── emailService.ts  # Email service for contact form
│   └── healthBridge.ts  # Health data API
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication state management
│   └── use-mobile.tsx   # Mobile detection
├── utils/               # Utility functions
│   ├── cloudflareAuth.ts # Cloudflare Access integration
│   ├── searchIndex.ts   # Fuse.js search implementation
│   └── ...              # Other utilities
├── config/              # Configuration files
│   ├── accessControl.ts # Email-based access control
│   ├── environment.ts   # Environment configuration
│   └── securityHeaders.ts # Security headers
├── router.tsx           # TanStack Router configuration
└── main.tsx             # Application entry point
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Cloudflare account (for production deployment)
- Resend account (for email functionality)

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
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run type-check       # TypeScript type checking
npm run lint             # ESLint linting
```

## 🔐 Authentication Setup

### **Development Mode**
- Automatically detected when running on `localhost`
- Mock authentication for testing protected routes
- No external dependencies required
- Use the development authentication toggle for testing

### **Production Mode**
- Cloudflare Access with Zero Trust authentication
- Email-based access control
- Protected routes require valid credentials
- See `CLOUDFLARE_SETUP.md` for detailed configuration

### **Protected Routes**
- `/protected` - General protected content
- `/healthbridge-analysis` - Health data analysis tools

### **Access Control**
Access is controlled by email addresses and domains configured in `src/config/accessControl.ts`:
- **roger@rcormier.dev** - ✅ Allowed
- **rogerleecormier@gmail.com** - ✅ Allowed  
- **any-email@rcormier.dev** - ✅ Allowed (domain access)
- **other@gmail.com** - ❌ Denied (not in allowed list)

## 📧 Contact Form & Email Setup

### **Resend Integration**
The contact form uses Resend for reliable email delivery:

- **Modern Email API**: Resend provides a developer-friendly email service
- **High Deliverability**: Built-in spam protection and email validation
- **Professional Templates**: Beautiful HTML email templates with your branding
- **Reply-to Support**: Easy response handling for inquiries

### **Cloudflare Worker**
Email processing is handled by a Cloudflare Worker to avoid CORS issues:

- **Serverless Processing**: No backend server required
- **CORS-Free**: Emails sent server-side via the worker
- **Environment Support**: Separate development and production configurations
- **Secure**: API keys stored as Cloudflare secrets

### **Contact Form Features**
- **Professional Design**: Clean, accessible form with validation
- **Company Information**: Capture company/organization details
- **Subject Line**: Clear categorization of inquiries
- **Message Content**: Rich text support for detailed messages
- **Spam Protection**: Built-in validation and rate limiting
- **Success Feedback**: Clear confirmation when messages are sent

### **Email Setup Requirements**
1. **Resend Account**: Sign up at [resend.com](https://resend.com)
2. **Domain Verification**: Verify your domain with Resend
3. **API Key**: Get your Resend API key
4. **Cloudflare Worker**: Deploy the email worker
5. **Environment Variables**: Configure secrets in Cloudflare

See `CLOUDFLARE_WORKERS_SETUP.md` for detailed email setup instructions.

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

### **Resend Configuration**
```typescript
// Configured via Cloudflare Workers secrets
// No local config file needed - API keys stored securely
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
- Modern ES2020 target
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
- Cloudflare Access Zero Trust
- Email-based access control
- Secure cookie handling
- Rate limiting support

### **Content Security**
- XSS protection
- Content sanitization
- Secure markdown rendering
- Input validation

### **Email Security**
- API key stored as Cloudflare secrets
- Input validation and sanitization
- Rate limiting on contact form
- Spam protection measures

### **Security Headers**
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

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
- **Email Templates**: Customizable email templates
- **Contact Analytics**: Track contact form performance

### **Technology Upgrades**
- **React 19 Features**: Concurrent rendering and suspense
- **TanStack Router v2**: Latest routing features
- **Vite 7**: Enhanced build performance
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
- Check the email setup documentation

---

**Built with ❤️ using modern web technologies**
