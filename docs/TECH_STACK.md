# Tech Stack Documentation

## Overview

This document provides a comprehensive overview of the technology stack used in the tanstack-portfolio project. The stack is designed for performance, scalability, and developer experience, leveraging modern web technologies and cloud services.

## Table of Contents

1. [Frontend Framework](#frontend-framework)
2. [Cloudflare Infrastructure](#cloudflare-infrastructure)
3. [External Services](#external-services)
4. [Content Management](#content-management)
5. [Development Tools](#development-tools)
6. [Deployment & CI/CD](#deployment--cicd)
7. [Performance & Optimization](#performance--optimization)
8. [Security & Configuration](#security--configuration)
9. [Future Roadmap](#future-roadmap)

## Frontend Framework

### Core Technologies

- **React 19.1.0**: Modern React with latest features and performance improvements
- **TypeScript 5.8.3**: Full type safety and enhanced developer experience
- **Vite 7.1.1**: Fast build tool and development server
- **TanStack Router 1.130.12**: Type-safe routing solution
- **TanStack Query 5.85.3**: Server state management and caching

### UI Components & Styling

- **Shadcn/ui**: High-quality, accessible component library
- **Radix UI**: Unstyled, accessible component primitives
- **Tailwind CSS 3.4.3**: Utility-first CSS framework
- **Tailwind Typography**: Enhanced typography utilities
- **Lucide React**: Beautiful, customizable icons
- **React Icons**: Comprehensive icon library

### Rich Text & Content

- **TipTap**: Modern rich text editor framework
- **React Markdown**: Markdown rendering with custom components
- **Shadcn/charts**: Diagram and chart generation
- **Highlight.js**: Syntax highlighting for code blocks
- **Lowlight**: Lightweight syntax highlighting

### Search & Content Discovery

- **Fuse.js 7.1.0**: Fuzzy search with semantic matching
- **Content Indexing**: Pre-built content cache for performance
- **Smart Recommendations**: AI-powered content suggestions
- **Resend**: Email delivery service for contact forms and blog subscriptions

## Cloudflare Infrastructure

### Cloudflare Pages

- **Hosting Platform**: Static site hosting with global CDN
- **Custom Domain**: `rcormier.dev` with SSL/TLS encryption
- **Build Integration**: Automatic builds from GitHub repository
- **Preview Deployments**: Automatic preview URLs for pull requests

### Cloudflare R2 (Object Storage)

- **Content Storage**: Portfolio content, images, and assets
- **Bucket Name**: `tanstack-portfolio-r2`
- **Global Distribution**: Content served from edge locations worldwide
- **Cost Optimization**: No egress fees for content delivery

#### R2 Bucket Structure

```
tanstack-portfolio-r2/
├── content/
│   ├── blog/
│   ├── portfolio/
│   └── projects/
├── assets/
│   ├── images/
│   └── files/
└── uploads/
```

### Cloudflare Workers

#### AI Contact Analyzer Worker

- **Purpose**: AI-powered contact form analysis and content recommendations
- **AI Integration**: Cloudflare AI binding for natural language processing
- **Route**: `ai-contact-analyzer.rcormier.dev`
- **Features**: Inquiry analysis, industry detection, project scope assessment

#### R2 Content Proxy Worker

- **Purpose**: Secure content delivery and access control
- **Route**: `r2-content-proxy.rcormier.dev`
- **Features**: Content caching, access control, rate limiting
- **Environments**: Production and development configurations

#### Blog Subscription Worker

- **Purpose**: Handle blog subscription management via Resend
- **Features**: Email list management, subscription workflows, newsletter delivery
- **Integration**: Resend API for reliable email delivery

#### Email Worker

- **Purpose**: Contact form email processing via Resend API
- **Features**: Email validation, spam protection, delivery confirmation
- **Integration**: Resend email service with domain verification

### Cloudflare D1 (Database)

- **Database Type**: Serverless SQLite database
- **Use Cases**: User analytics, content metadata, search indexing
- **Performance**: Global distribution with edge computing
- **Integration**: Workers can directly query D1 database

### Cloudflare Secrets Store

- **Purpose**: Secure environment variable management
- **Integration**: Workers access secrets via bindings
- **Security**: Encrypted at rest, never logged or exposed
- **Management**: Centralized secret management across all workers

### Domain Management

- **Domain Registrar**: Porkbun (not Cloudflare)
- **DNS Configuration**: Nameservers point to Cloudflare
- **Benefits**: Cloudflare's security and performance features
- **SSL/TLS**: Automatic SSL certificate management
- **CDN**: Global content delivery network

## External Services

### Email Services

- **Resend**: Primary email delivery service
  - **API Integration**: RESTful API for transactional emails
  - **Domain Verification**: `rcormier.dev` verified for sending
  - **Use Cases**: Contact forms, blog subscriptions, notifications
  - **Features**: High deliverability, analytics, webhook support
  - **Security**: API key stored in Cloudflare Secrets Store

## Content Management

### Current System

- **Static Content**: Markdown files in `content/` directory
- **Content Indexing**: Pre-built JSON cache for search performance
- **Asset Management**: Images and files stored in R2
- **Version Control**: Content managed through Git repository

### Coming Soon: On-Site Content Management

- **Content Editor**: TipTap-based rich text editor
- **Direct R2 Upload**: Content saved directly to R2 storage
- **Real-time Preview**: Live preview of content changes
- **Version Control**: Content versioning and rollback capabilities
- **Collaboration**: Multi-user editing and approval workflows

### Content Types

- **Portfolio Items**: Professional experience and capabilities
- **Blog Posts**: Technical insights and thought leadership
- **Project Analysis**: Case studies and project documentation
- **Assets**: Images, documents, and multimedia content

## Development Tools

### Build & Development

- **Vite**: Fast development server and build tool
- **TypeScript**: Compiler with strict type checking
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing and optimization
- **Tailwind CSS**: Utility-first styling framework

### Package Management

- **npm**: Node.js package manager
- **Dependencies**: 40+ production dependencies
- **Dev Dependencies**: 20+ development tools
- **Version Management**: Locked dependency versions

### Code Quality

- **ESLint**: JavaScript/TypeScript linting
- **TypeScript**: Static type checking
- **Prettier**: Code formatting (via Tailwind CSS)
- **Git Hooks**: Pre-commit quality checks

## Deployment & CI/CD

### GitHub Actions Integration

- **Trigger**: Push to main branch
- **Build Process**: Automated content indexing and build
- **Deployment**: Automatic deployment to Cloudflare Pages
- **Worker Deployment**: Separate deployment for Cloudflare Workers
- **Environment Management**: Production and development environments

### Build Pipeline

```bash
# Content indexing
npm run index-content

# Type checking
npm run type-check

# Build application
npm run build

# Deploy to Cloudflare
npm run deploy
```

### Worker Deployment

```bash
# Development
npm run worker:dev

# Production deployment
npm run worker:deploy:prod

# Type checking
npm run worker:type-check
```

## Performance & Optimization

### Frontend Performance

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Optimized image delivery via R2
- **Caching Strategy**: Multiple layers of caching

### Search Performance

- **Pre-built Index**: Content indexed at build time
- **Fuse.js**: Fast fuzzy search implementation
- **Result Caching**: Search results cached for performance
- **Debounced Input**: Optimized search input handling

### CDN & Edge Computing

- **Global Distribution**: Content served from edge locations
- **Automatic Scaling**: Cloudflare handles traffic spikes
- **DDoS Protection**: Built-in security and protection
- **Performance Monitoring**: Real-time performance metrics

## Security & Configuration

### Security Features

- **HTTPS Only**: All traffic encrypted with SSL/TLS
- **CORS Configuration**: Proper cross-origin resource sharing
- **Content Security Policy**: XSS protection and security headers
- **Rate Limiting**: API endpoint protection

### Environment Configuration

- **Environment Variables**: Secure configuration management
- **Secrets Store**: Encrypted sensitive data
- **Production vs Development**: Separate configurations
- **Configuration Validation**: Runtime configuration checks

### Access Control

- **R2 Access**: Secure bucket access via Workers
- **API Protection**: Rate limiting and authentication
- **Content Permissions**: Role-based access control
- **Audit Logging**: Access and modification tracking

## Future Roadmap

### Planned Features

- **On-Site CMS**: Full content management system
- **Real-time Collaboration**: Multi-user editing capabilities
- **Advanced Analytics**: User behavior and content performance
- **AI Content Generation**: AI-assisted content creation
- **Multi-language Support**: Internationalization features

### Infrastructure Improvements

- **Edge Computing**: More complex logic in Workers
- **Database Scaling**: D1 database optimization
- **Content Delivery**: Advanced caching strategies
- **Monitoring**: Enhanced observability and alerting

### Integration Opportunities

- **External APIs**: Third-party service integrations
- **Webhook Support**: Real-time content updates
- **API Gateway**: Centralized API management
- **Microservices**: Service-oriented architecture evolution

## Conclusion

The tech stack is designed for modern web development with a focus on performance, scalability, and developer experience. By leveraging Cloudflare's edge computing platform, the application achieves global performance while maintaining security and reliability.

The combination of React, TypeScript, and Cloudflare services provides a robust foundation for building and deploying high-performance web applications. The upcoming on-site content management system will further enhance the platform's capabilities and user experience.

## Maintenance & Updates

### Regular Tasks

- **Dependency Updates**: Monthly security and feature updates
- **Performance Monitoring**: Regular performance audits
- **Security Reviews**: Security assessment and updates
- **Backup Verification**: R2 content backup validation

### Monitoring & Alerts

- **Performance Metrics**: Core Web Vitals monitoring
- **Error Tracking**: Application error monitoring
- **Uptime Monitoring**: Service availability tracking
- **Cost Monitoring**: Cloudflare service cost tracking

### Documentation Updates

- **API Documentation**: Keep API docs current
- **Deployment Guides**: Update deployment procedures
- **Troubleshooting**: Maintain troubleshooting guides
- **Change Logs**: Document all significant changes
