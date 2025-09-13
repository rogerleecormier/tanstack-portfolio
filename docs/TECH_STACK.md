# Tech Stack Documentation

## Overview

This document provides a comprehensive overview of the technology stack used in the tanstack-portfolio project. The stack is designed for performance, scalability, and developer experience, leveraging modern web technologies, Cloudflare's edge computing platform, and AI-powered features for content creation and analysis.

## Table of Contents

1. [Frontend Framework](#frontend-framework)
2. [Cloudflare Infrastructure](#cloudflare-infrastructure)
3. [AI-Powered Features](#ai-powered-features)
4. [Content Management System](#content-management-system)
5. [External Services](#external-services)
6. [Development Tools](#development-tools)
7. [Deployment & CI/CD](#deployment--cicd)
8. [Performance & Optimization](#performance--optimization)
9. [Security & Configuration](#security--configuration)
10. [HealthBridge Enhanced System](#healthbridge-enhanced-system)
11. [Future Roadmap](#future-roadmap)

## Frontend Framework

### Core Technologies

- **React 19.1.0**: Modern React with latest features and performance improvements
- **TypeScript 5.8.3**: Full type safety and enhanced developer experience
- **Vite 7.1.1**: Fast build tool and development server with optimized bundling
- **TanStack Router 1.130.12**: Type-safe routing solution with file-based routing
- **TanStack Query 5.85.3**: Server state management and caching with React Query DevTools

### UI Components & Styling

- **Shadcn/ui 0.0.4**: High-quality, accessible component library built on Radix UI
- **Radix UI**: Comprehensive unstyled, accessible component primitives (15+ components)
- **Tailwind CSS 3.4.3**: Utility-first CSS framework with custom design system
- **Tailwind Typography 0.5.16**: Enhanced typography utilities for content rendering
- **Lucide React 0.536.0**: Beautiful, customizable icons (500+ icons)
- **React Icons 5.5.0**: Comprehensive icon library for additional icon sets
- **Tailwind Merge 3.3.1**: Utility for merging Tailwind classes
- **Class Variance Authority 0.7.1**: Component variant management

### Rich Text & Content Editing

- **TipTap 3.4.1**: Modern rich text editor framework with React integration
- **TipTap Extensions**: Table, Image, and StarterKit extensions for rich content
- **React Markdown 10.1.0**: Markdown rendering with custom components
- **CodeMirror 6**: Advanced code editor with syntax highlighting
- **Highlight.js 11.11.1**: Syntax highlighting for code blocks
- **Mermaid 11.9.0**: Diagram and flowchart generation
- **Recharts 2.15.4**: Chart and data visualization library

### Search & Content Discovery

- **Fuse.js 7.1.0**: Advanced fuzzy search with semantic matching and weighted scoring
- **Content Indexing**: Pre-built KV cache for high-performance search
- **Smart Recommendations**: AI-powered content suggestions with context awareness
- **Turndown 7.1.3**: HTML to Markdown conversion for content editing
- **Front-matter 4.0.2**: YAML frontmatter parsing and generation
- **Unified**: Markdown processing pipeline with remark and rehype plugins

### Forms & Validation

- **React Hook Form 7.62.0**: Performant forms with easy validation
- **Hookform Resolvers 5.2.1**: Validation resolvers for form libraries
- **Zod 3.25.76**: TypeScript-first schema validation
- **React Day Picker 9.9.0**: Accessible date picker component
- **React Hotkeys Hook 5.1.0**: Keyboard shortcuts management

### PDF & Document Generation

- **React PDF Renderer 4.3.0**: PDF generation in React
- **jsPDF 3.0.2**: Client-side PDF generation
- **jsPDF AutoTable 5.0.2**: Table generation for PDFs
- **HTML2Canvas 1.4.1**: HTML to canvas conversion
- **ExcelJS 4.4.0**: Excel file generation and manipulation

### Utilities & Helpers

- **Date-fns 4.1.0**: Modern JavaScript date utility library
- **Slugify 1.6.6**: String slugification for URLs
- **CLSX 2.1.1**: Utility for constructing className strings
- **Embla Carousel React 8.6.0**: Carousel component library
- **CMDK 1.1.1**: Command palette component
- **Jose 6.1.0**: JWT and JWE library for authentication

## Cloudflare Infrastructure

### Cloudflare Pages

- **Hosting Platform**: Static site hosting with global CDN
- **Custom Domain**: `rcormier.dev` with SSL/TLS encryption
- **Build Integration**: Automatic builds from GitHub repository
- **Preview Deployments**: Automatic preview URLs for pull requests
- **Pages Functions**: Server-side functionality with Node.js compatibility

### Cloudflare R2 (Object Storage)

- **Content Storage**: Portfolio content, images, and assets
- **Bucket Name**: `tanstack-portfolio-r2`
- **Global Distribution**: Content served from edge locations worldwide
- **Cost Optimization**: No egress fees for content delivery
- **CORS Support**: Cross-origin resource sharing via proxy workers

#### R2 Bucket Structure

```
tanstack-portfolio-r2/
├── blog/                    # Blog post markdown files
├── portfolio/               # Portfolio item markdown files
├── projects/                # Project documentation files
├── trash/                   # Soft-deleted files
└── assets/
    ├── images/              # Image assets
    └── files/               # Document files
```

### Cloudflare Workers (10+ Specialized Workers)

#### AI-Powered Workers

**AI Contact Analyzer Worker**

- **Name**: `tanstack-portfolio-ai-contact-analyzer`
- **Purpose**: AI-powered contact form analysis and content recommendations
- **AI Integration**: Cloudflare AI binding for natural language processing
- **Features**: Inquiry analysis, industry detection, project scope assessment, meeting detection

**AI Frontmatter Generator Worker**

- **Name**: `tanstack-portfolio-ai-generator`
- **Purpose**: AI-powered frontmatter generation for content creation
- **AI Models**: Llama 3.1 8B/70B/405B with smart model selection
- **Features**: Content complexity analysis, multiple persona generation, KV caching

#### Content Management Workers

**R2 Content Proxy Worker**

- **Name**: `r2-content-proxy`
- **Purpose**: Secure content delivery and CORS handling
- **Features**: Content caching, access control, rate limiting
- **Environments**: Production and development configurations

**Cache Rebuild Worker**

- **Name**: `cache-rebuild-worker`
- **Purpose**: Automated content indexing and KV cache management
- **Features**: Content parsing, metadata extraction, cache versioning
- **Cron Jobs**: Every 4 hours automatic rebuilds

**KV Cache Get Worker**

- **Name**: `kv-cache-get`
- **Purpose**: Fast cache retrieval for content search
- **Features**: CORS-enabled responses, cache validation, error handling

**R2 Content Full Worker**

- **Name**: `r2-content-full`
- **Purpose**: Full content access and management
- **Features**: Complete R2 bucket operations, file management

#### Communication Workers

**Email Worker**

- **Name**: `tanstack-portfolio-email-worker`
- **Purpose**: Contact form email processing via Resend API
- **Features**: Email validation, spam protection, delivery confirmation
- **Integration**: Resend email service with domain verification

**Blog Subscription Worker**

- **Name**: `tanstack-portfolio-blog-subscription`
- **Purpose**: Handle blog subscription management via Resend
- **Features**: Email list management, subscription workflows, newsletter delivery
- **Integration**: Resend API for reliable email delivery

#### HealthBridge Enhanced Worker

**HealthBridge Enhanced Worker**

- **Name**: `healthbridge-enhanced`
- **Purpose**: Advanced weight loss tracking and projection system
- **Database**: D1 SQLite database with 8+ tables
- **Features**: AI-powered projections, medication efficacy modeling, iOS integration
- **Cron Jobs**: Daily projection calculations

### Cloudflare D1 (Database)

- **Database Type**: Serverless SQLite database
- **Primary Database**: `health_bridge` for health tracking
- **Use Cases**: User analytics, content metadata, search indexing, health data
- **Performance**: Global distribution with edge computing
- **Integration**: Workers can directly query D1 database
- **Migrations**: Automated schema management with version control

### Cloudflare KV (Key-Value Store)

- **Content Cache**: `content-cache-kv-namespace` for high-performance search
- **Blog Subscriptions**: `blog-subscriptions-kv-namespace` for email management
- **AI Cache**: KV storage for AI-generated content caching
- **Performance**: Global edge distribution with <50ms retrieval times

### Cloudflare Secrets Store

- **Purpose**: Secure environment variable management
- **Secrets**: Resend API keys, database credentials, worker API keys
- **Integration**: Workers access secrets via bindings
- **Security**: Encrypted at rest, never logged or exposed
- **Management**: Centralized secret management across all workers

### Domain Management

- **Domain Registrar**: Porkbun (not Cloudflare)
- **DNS Configuration**: Nameservers point to Cloudflare
- **Benefits**: Cloudflare's security and performance features
- **SSL/TLS**: Automatic SSL certificate management
- **CDN**: Global content delivery network
- **Worker Routes**: Custom domains for specialized workers

## AI-Powered Features

### Cloudflare AI Integration

- **AI Models**: Llama 3.1 (8B, 70B, 405B parameters) with smart model selection
- **Contact Analysis**: Intelligent inquiry analysis with industry detection
- **Content Generation**: AI-powered frontmatter generation for content creation
- **Smart Recommendations**: Context-aware content suggestions based on user behavior
- **Natural Language Processing**: Advanced text analysis and classification

### AI Contact Analyzer

- **Inquiry Classification**: Automatic categorization of contact form submissions
- **Industry Detection**: AI-powered industry identification from message content
- **Project Scope Assessment**: Intelligent project size and complexity evaluation
- **Meeting Detection**: Automatic identification of meeting requests
- **Content Recommendations**: Smart content suggestions based on inquiry analysis
- **Follow-up Questions**: AI-generated contextual follow-up questions

### AI Frontmatter Generator

- **Content Complexity Analysis**: Automatic assessment of content complexity
- **Smart Model Selection**: Optimal AI model selection based on content characteristics
- **Multiple Personas**: Varied generation approaches for diverse frontmatter
- **KV Caching**: Intelligent caching of similar content for performance
- **Fallback Generation**: Heuristic-based generation when AI is unavailable

## Content Management System

### Content Creation Studio

- **TipTap Editor**: Rich text editing with real-time Markdown conversion
- **AI Frontmatter Generation**: Automatic metadata generation using Cloudflare AI
- **R2 Integration**: Direct content storage in Cloudflare R2 bucket
- **Smart Cache Rebuilds**: Automatic cache updates for search indexing
- **Content Types**: Support for blog, portfolio, and project content
- **File Management**: Browse, search, and manage files through integrated interface

### Content Indexing & Search

- **KV Cache System**: High-performance content indexing with <50ms retrieval
- **Fuse.js Integration**: Advanced fuzzy search with semantic matching
- **Smart Recommendations**: AI-powered content suggestions with relevance scoring
- **Cross-Content Discovery**: Unified search across portfolio, blog, and project content
- **Real-time Updates**: Automatic cache rebuilding from content changes

### Content Types

- **Portfolio Items**: Professional experience and capabilities with AI metadata
- **Blog Posts**: Technical insights and thought leadership with smart categorization
- **Project Analysis**: Case studies and project documentation with technology tracking
- **Assets**: Images, documents, and multimedia content with R2 storage

## External Services

### Email Services

- **Resend**: Primary email delivery service
  - **API Integration**: RESTful API for transactional emails
  - **Domain Verification**: `rcormier.dev` verified for sending
  - **Use Cases**: Contact forms, blog subscriptions, notifications
  - **Features**: High deliverability, analytics, webhook support
  - **Security**: API key stored in Cloudflare Secrets Store

### Health & Analytics

- **HealthBridge Enhanced**: Advanced weight loss tracking and projection system
- **iOS Integration**: Apple Health sync via iOS Shortcuts automation
- **Medication Efficacy**: Research-based medication modeling with clinical data
- **AI Projections**: Linear regression with confidence intervals for weight predictions

## Development Tools

### Build & Development

- **Vite 7.1.1**: Fast development server and build tool with HMR
- **TypeScript 5.8.3**: Compiler with strict type checking and advanced features
- **ESLint 9.30.1**: Code quality and consistency with React-specific rules
- **PostCSS 8.5.6**: CSS processing and optimization
- **Autoprefixer 10.4.21**: CSS vendor prefixing for cross-browser compatibility
- **Terser 5.44.0**: JavaScript minification for production builds

### Package Management

- **npm**: Node.js package manager
- **Dependencies**: 70+ production dependencies
- **Dev Dependencies**: 30+ development tools
- **Version Management**: Locked dependency versions with package-lock.json
- **Node.js Compatibility**: Cloudflare Workers with Node.js compatibility flags

### Code Quality & Testing

- **ESLint**: JavaScript/TypeScript linting with React and Tailwind plugins
- **TypeScript**: Static type checking with strict configuration
- **Prettier 3.4.2**: Code formatting with Tailwind CSS plugin
- **Vitest 3.2.4**: Fast unit testing framework
- **Testing Library**: React component testing utilities
- **Git Hooks**: Pre-commit quality checks with Windows PowerShell scripts

### Development Environment

- **Wrangler 4.33.1**: Cloudflare Workers development and deployment
- **Chokidar 4.0.3**: File watching for development
- **Concurrently 9.1.2**: Running multiple development processes
- **Windows Support**: PowerShell scripts for Windows development environment

## Deployment & CI/CD

### GitHub Actions Integration

- **Trigger**: Push to main branch and pull requests
- **Build Process**: Automated content indexing and build
- **Deployment**: Automatic deployment to Cloudflare Pages
- **Worker Deployment**: Separate deployment for Cloudflare Workers
- **Environment Management**: Production, preview, and development environments

### Build Pipeline

```bash
# Type checking
npm run type-check

# Linting and formatting
npm run lint:fix
npm run format

# Security audit
npm run audit:fix

# Build application
npm run build

# Deploy to Cloudflare Pages
npm run deploy-branch
```

### Worker Deployment

```bash
# Development workers
wrangler dev --config wrangler/wrangler-[worker-name].toml

# Production deployment
wrangler deploy --config wrangler/wrangler-[worker-name].toml --env production

# Preview deployment
wrangler deploy --config wrangler/wrangler-[worker-name].toml --env preview
```

### Windows CI Pipeline

- **PowerShell Scripts**: Windows-compatible CI/CD pipeline
- **Git Hooks**: Pre-commit and pre-push quality checks
- **Automated Testing**: Type checking, linting, formatting, and security audits
- **Build Verification**: Complete build process validation

## Performance & Optimization

### Frontend Performance

- **Code Splitting**: Automatic route-based code splitting with Vite
- **Lazy Loading**: Components loaded on demand with React.lazy
- **Image Optimization**: Optimized image delivery via R2 with WebP support
- **Bundle Optimization**: Terser minification with tree shaking
- **Asset Optimization**: Optimized chunk splitting and caching headers

### Search Performance

- **KV Cache System**: Pre-built content index with <50ms retrieval times
- **Fuse.js Integration**: Fast fuzzy search with semantic matching
- **Result Caching**: Search results cached for performance
- **Debounced Input**: 300ms debounced search input handling
- **Smart Indexing**: Automatic cache rebuilding every 4 hours

### CDN & Edge Computing

- **Global Distribution**: Content served from 200+ edge locations
- **Automatic Scaling**: Cloudflare handles traffic spikes automatically
- **DDoS Protection**: Built-in security and protection
- **Performance Monitoring**: Real-time performance metrics and analytics
- **Edge Caching**: Multi-layer caching strategy with KV and browser caching

### AI Performance

- **Smart Model Selection**: Optimal AI model selection based on content complexity
- **KV Caching**: Intelligent caching of AI-generated content
- **Fallback Systems**: Graceful degradation when AI services are unavailable
- **Response Optimization**: Efficient AI response processing and parsing

## Security & Configuration

### Security Features

- **HTTPS Only**: All traffic encrypted with SSL/TLS
- **CORS Configuration**: Proper cross-origin resource sharing with allowed origins
- **Content Security Policy**: XSS protection and security headers
- **Rate Limiting**: API endpoint protection with KV-based rate limiting
- **Input Validation**: Comprehensive input sanitization and validation
- **Secrets Management**: Encrypted secrets storage with Cloudflare Secrets Store

### Environment Configuration

- **Environment Variables**: Secure configuration management across environments
- **Secrets Store**: Encrypted sensitive data (API keys, credentials)
- **Multi-Environment**: Production, preview, and development configurations
- **Configuration Validation**: Runtime configuration checks and validation
- **Worker Bindings**: Secure binding configuration for Cloudflare services

### Access Control

- **R2 Access**: Secure bucket access via Workers with path validation
- **API Protection**: Rate limiting and authentication for all endpoints
- **Content Permissions**: Role-based access control for content management
- **Audit Logging**: Comprehensive access and modification tracking
- **Security Headers**: Enhanced security headers for all responses

## HealthBridge Enhanced System

### Advanced Health Tracking

- **Weight Loss Projections**: AI-powered linear regression with confidence intervals
- **Medication Efficacy**: Research-based medication modeling with clinical trial data
- **iOS Integration**: Apple Health sync via iOS Shortcuts automation
- **Database Schema**: Comprehensive D1 database with 8+ tables for health tracking
- **Activity Level Integration**: User activity tracking with projection adjustments
- **Cron Jobs**: Daily automated projection calculations

### Technical Implementation

- **D1 Database**: Serverless SQLite database for health data persistence
- **API Endpoints**: 15+ specialized endpoints for health data management
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Robust error handling with graceful degradation
- **Performance**: Optimized queries with <100ms response times

## Future Roadmap

### Short-term Enhancements (1-3 months)

- **Enhanced Search Filters**: Date range, author, and content type filters
- **Search Suggestions**: Autocomplete and search suggestions
- **Content Templates**: Pre-built templates for common content types
- **Media Library**: Integrated media management system
- **Search Analytics**: Search behavior tracking and analytics
- **Content Validation**: Automated content quality checks

### Medium-term Enhancements (3-6 months)

- **Content Versioning**: Content version control system
- **Publication Scheduling**: Content scheduling capabilities
- **Personalization**: User-specific search preferences
- **Content Analytics**: Comprehensive content performance tracking
- **AI Content Generation**: Expanded AI content generation capabilities
- **Multi-language Support**: Internationalization features

### Long-term Enhancements (6+ months)

- **Real-time Collaboration**: Real-time collaborative editing
- **Machine Learning**: ML-based recommendation improvements
- **Advanced Analytics**: Comprehensive user behavior and content analytics
- **Content Translation**: AI-powered content translation
- **SEO Optimization**: AI-powered SEO suggestions and optimization
- **Content Quality Scoring**: Automated content quality assessment

### Infrastructure Improvements

- **Edge Computing**: More complex logic in Workers
- **Database Scaling**: D1 database optimization and sharding
- **Content Delivery**: Advanced caching strategies
- **Monitoring**: Enhanced observability and alerting
- **AI Model Updates**: Integration of newer AI models as they become available

## Conclusion

The tech stack represents a modern, AI-powered web application built on Cloudflare's edge computing platform. With React 19, TypeScript, and comprehensive AI integration, the application achieves global performance while providing advanced content management and health tracking capabilities.

The combination of Cloudflare Workers, AI services, and modern frontend technologies provides a robust foundation for building and deploying high-performance web applications with intelligent features. The integrated content management system, AI-powered recommendations, and HealthBridge enhanced system demonstrate the platform's versatility and advanced capabilities.

## Maintenance & Updates

### Regular Tasks

- **Dependency Updates**: Monthly security and feature updates
- **Performance Monitoring**: Regular performance audits and optimization
- **Security Reviews**: Security assessment and updates
- **Backup Verification**: R2 content and D1 database backup validation
- **AI Model Monitoring**: AI service performance and accuracy monitoring

### Monitoring & Alerts

- **Performance Metrics**: Core Web Vitals monitoring with Cloudflare Analytics
- **Error Tracking**: Application error monitoring across all Workers
- **Uptime Monitoring**: Service availability tracking for all endpoints
- **Cost Monitoring**: Cloudflare service cost tracking and optimization
- **AI Performance**: AI response times and accuracy monitoring

### Documentation Updates

- **API Documentation**: Keep API docs current with OpenAPI specifications
- **Deployment Guides**: Update deployment procedures for all Workers
- **Troubleshooting**: Maintain troubleshooting guides for all systems
- **Change Logs**: Document all significant changes and feature additions
- **User Guides**: Update user documentation for new features and capabilities
