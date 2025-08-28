# TanStack Portfolio Site

A modern, AI-enhanced portfolio website built with TanStack Router, React, and TypeScript, optimized for Cloudflare deployment with comprehensive content management and intelligent features.

## 🚀 Features

### Core Functionality
- **Portfolio Management**: Dynamic portfolio pages with markdown content loading
- **Blog System**: Blog posts with markdown support and frontmatter parsing
- **Project Showcase**: Dedicated project pages with detailed information
- **AI-Powered Contact Form**: Intelligent form analysis with Cloudflare AI Workers
- **Smart Content Recommendations**: AI-driven content suggestions across all pages
- **Markdown Editor**: Rich text editor with TipTap integration for content creation
- **Search & Discovery**: Advanced search functionality with Fuse.js integration
- **Authentication**: Cloudflare Access integration with development fallbacks
- **Responsive Design**: Mobile-first design with Tailwind CSS

### AI & Automation Features
- **Contact Form Analysis**: AI-powered inquiry classification and priority assessment
- **Content Recommendations**: Intelligent related content suggestions
- **Portfolio Assistant**: AI-driven portfolio insights and guidance
- **Meeting Scheduler**: AI-enhanced meeting coordination
- **Newsletter Management**: Smart subscription handling with blog integration

### Security & Performance
- **Cloudflare Integration**: Optimized for Cloudflare Workers and Pages
- **Authentication**: Secure access control with rate limiting
- **Content Security Policy**: Comprehensive security headers
- **Performance Optimization**: Vite build system with code splitting
- **SEO Optimization**: Dynamic meta tags and structured data

## 🛠️ Technology Stack

### Frontend
- **React 19**: Latest React with concurrent features
- **TanStack Router**: Type-safe routing with file-based routing
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Accessible component primitives
- **TipTap**: Rich text editor for markdown creation

### AI & Backend Services
- **Cloudflare AI Workers**: AI-powered contact form analysis
- **Cloudflare Workers**: Serverless functions for email and subscriptions
- **Fuse.js**: Fuzzy search implementation
- **Gray Matter**: Markdown frontmatter parsing

### Development Tools
- **Vite**: Fast build tool and development server
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing and optimization
- **Autoprefixer**: CSS vendor prefixing

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Radix UI)
│   ├── AIPortfolioAssistant.tsx    # AI portfolio guidance
│   ├── ContactAnalysis.tsx         # Contact form AI analysis
│   ├── MarkdownEditor.tsx          # Rich text editor
│   ├── ProtectedRoute.tsx          # Authentication wrapper
│   └── CloudflareStatusChecker.tsx # Cloudflare integration status
├── pages/              # Page components
│   ├── PortfolioPage.tsx           # Portfolio item display
│   ├── BlogPage.tsx                # Blog post rendering
│   ├── ContactPage.tsx             # AI-enhanced contact form
│   ├── MarkdownEditorPage.tsx      # Content creation tool
│   └── HealthBridge.tsx            # Health analysis tool
├── api/                # API services
│   ├── contactAnalyzer.ts          # Contact form AI analysis
│   ├── smartRecommendationsService.ts # Content recommendations
│   └── emailService.ts             # Email handling
├── hooks/              # Custom React hooks
│   ├── useAuth.ts                  # Authentication management
│   └── useScrollToTop.ts           # Scroll behavior
├── utils/              # Utility functions
│   ├── portfolioUtils.ts           # Portfolio content management
│   ├── searchData.ts               # Search functionality
│   ├── logger.ts                   # Centralized logging
│   └── cloudflareAuth.ts           # Cloudflare authentication
├── content/            # Markdown content
│   ├── portfolio/      # Portfolio markdown files
│   ├── blog/           # Blog post markdown files
│   └── projects/       # Project markdown files
└── config/             # Configuration files
    └── environment.ts  # Environment-specific settings
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Cloudflare account (for production deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
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

4. **Build for production**
   ```bash
   npm run build
   ```

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🌐 Deployment

### Cloudflare Pages

This site is optimized for Cloudflare Pages deployment:

1. **Connect Repository**: Link your GitHub repository to Cloudflare Pages
2. **Build Settings**:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: 18
3. **Environment Variables**: Configure any required environment variables
4. **Custom Domain**: Set up your custom domain with Cloudflare DNS

### Cloudflare Workers

The site uses several Cloudflare Workers for enhanced functionality:

- **AI Contact Analyzer**: Intelligent contact form analysis
- **Blog Subscription Worker**: Newsletter and subscription management
- **Email Service**: Secure email handling

## 🔐 Authentication

### Development Mode
- Mock authentication system for local development
- Session timeout after 30 minutes
- Rate limiting on login attempts

### Production Mode
- Cloudflare Access integration
- Secure JWT-based authentication
- Automatic redirect handling

## 📝 Content Management

### Adding Portfolio Items
1. Create markdown file in `src/content/portfolio/`
2. Add frontmatter with metadata (title, description, tags, category)
3. Add the slug to the router configuration
4. Content automatically appears in portfolio listings

### Adding Blog Posts
1. Create markdown file in `src/content/blog/`
2. Include frontmatter with post metadata
3. Posts automatically appear in blog listings and search

### Markdown Editor
- Rich text editing with TipTap
- Real-time markdown preview
- Syntax highlighting for code blocks
- Export functionality

## 🔍 Search & Discovery

### Search Features
- Full-text search across all content
- Fuzzy matching with Fuse.js
- Tag-based filtering
- Content type categorization

### AI Recommendations
- Intelligent content suggestions
- Context-aware recommendations
- Portfolio-specific insights
- Cross-content relationships

## 🤖 AI Features

### Contact Form Analysis
- Automatic inquiry classification
- Priority assessment
- Industry identification
- Follow-up question generation
- Spam detection and prevention

### Content Intelligence
- Smart content recommendations
- Portfolio insights and analysis
- Meeting scheduling assistance
- Newsletter content optimization

## 🛡️ Security Features

### Content Security Policy
- Strict CSP headers
- XSS protection
- Frame options
- Referrer policy

### Rate Limiting
- Request throttling
- Abuse prevention
- IP-based limiting

### Authentication Security
- Secure session management
- JWT token handling
- Development mode safeguards

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS responsive utilities
- Touch-friendly interactions
- Optimized for all screen sizes

## 🔧 Configuration

### Environment Variables
- Development vs production mode detection
- Cloudflare Access configuration
- API endpoint configuration
- Security settings

### Customization
- Tailwind CSS configuration
- Component theming
- Content structure
- Routing configuration

## 📊 Performance

### Optimization Features
- Vite build optimization
- Code splitting
- Lazy loading
- Image optimization
- CSS purging

### Monitoring
- Cloudflare Analytics integration
- Performance metrics
- Error tracking
- User experience monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

## 🔄 Updates

This site is actively maintained with regular updates for:
- Security patches
- Performance improvements
- New features
- Bug fixes
- Dependency updates
