# Roger Lee Cormier Portfolio

A modern, professional portfolio website built with cutting-edge web technologies, featuring Cloudflare Access authentication, AI-powered features, interactive data visualization, and a fully functional contact form with Resend email integration.

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd tanstack-portfolio
npm install

# Start development
npm run dev

# Build for production
npm run build
```

## ✨ Key Features

- **🤖 AI-Powered Assistant** - Site-wide intelligent recommendations and insights
- **🔐 Enterprise Authentication** - Cloudflare Access with Zero Trust security
- **📧 Smart Contact System** - AI-analyzed contact form with meeting scheduling
- **📧 Blog Newsletter** - Functional newsletter signups with email confirmations
- **🔍 Intelligent Search** - Fuse.js powered search across all content
- **📊 Data Visualization** - Interactive charts and analytics
- **📱 Responsive Design** - Mobile-first, accessible interface
- **⚡ Auto-Generated Content** - Dynamic portfolio from markdown files

## 🏗️ Tech Stack

- **Frontend**: React 19 + TypeScript 5.8 + Vite 7
- **Routing**: TanStack Router v1
- **UI**: shadcn/ui + Tailwind CSS 3.4
- **Search**: Fuse.js with AI enhancements
- **Authentication**: Cloudflare Access (Zero Trust)
- **Email**: Resend API + Cloudflare Workers
- **AI**: Cloudflare AI Workers with Llama 2
- **Charts**: Recharts + shadcn/ui Chart Components

## 📚 Documentation

### **Core Documentation**
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Comprehensive development guide, architecture, and implementation details
- **[CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)** - Cloudflare Access and Workers setup guide
- **[EMAIL_SYSTEM.md](./EMAIL_SYSTEM.md)** - Email system and meeting confirmation documentation

### **Feature Documentation**
- **[AI_FEATURE_README.md](./AI_FEATURE_README.md)** - AI-powered features, portfolio enhancements, and intelligent analysis
- **[BLOG_SUBSCRIPTION_SYSTEM.md](./BLOG_SUBSCRIPTION_SYSTEM.md)** - Blog newsletter signups and subscription management

### **Security & Access Control**
- **[SECURITY.md](./SECURITY.md)** - Comprehensive security features and best practices
- **[ACCESS_CONTROL.md](./ACCESS_CONTROL.md)** - Authentication and access control configuration

### **Integration Guides**
*No external integrations currently configured*

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Cloudflare account (for Workers and Access)
- Resend account (for email functionality)

### **Environment Setup**
Create `.env.local` for local development:
```bash
VITE_DEV_MODE=true
VITE_CLOUDFLARE_DOMAIN=rcormier.dev
```

### **Development Commands**
```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run type-check       # TypeScript type checking
npm run lint             # ESLint linting
```

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/             # shadcn/ui components
│   ├── SiteAssistant.tsx # AI-powered site assistant
│   ├── Search.tsx      # Global search implementation
│   └── ...             # Other components
├── pages/               # Page components
│   ├── PortfolioPage.tsx    # Auto-generated portfolio
│   ├── ContactPage.tsx      # Smart contact flow
│   └── ...                  # Other pages
├── content/             # Markdown content files
│   ├── portfolio/      # Auto-generated portfolio items
│   └── blog/           # Blog posts
├── api/                 # API and service files
├── utils/               # Utility functions
├── config/              # Configuration files
└── router.tsx           # TanStack Router configuration
```

## 🌟 AI Features in Action

### **Site Assistant**
- **Intelligent Recommendations**: AI-powered suggestions based on user queries
- **Content Discovery**: Helps users find relevant portfolio sections and blog posts
- **Smart Navigation**: Suggests appropriate pages and contact methods
- **Confidence Scoring**: Each recommendation includes reliability metrics

### **Contact Form Intelligence**
- **Real-time Analysis**: AI analyzes contact form submissions as users type
- **Smart Classification**: Automatically categorizes inquiries by type, priority, and industry
- **Meeting Recommendations**: Suggests optimal meeting duration and scheduling
- **Content Suggestions**: Recommends relevant portfolio content based on inquiry analysis

### **Search Enhancement**
- **Fuzzy Search**: Typo-tolerant search with Fuse.js
- **AI Recommendations**: Smart content suggestions based on search patterns
- **Relevance Scoring**: Advanced algorithms for better search results

## 🔧 Configuration

### **Access Control**
Manage user access in `src/config/accessControl.ts`:
```typescript
export const accessControl = {
  allowedEmails: ['roger@rcormier.dev', 'rogerleecormier@gmail.com'],
  allowedDomains: ['rcormier.dev']
};
```

### **Portfolio Content**
Add new portfolio items by creating markdown files in `src/content/portfolio/` with front matter:
```markdown
---
title: "Your Solution Title"
description: "Brief description of your solution"
tags: ["tag1", "tag2"]
---
```

## 🚨 Troubleshooting

### **Common Issues**
- **Authentication Problems**: Check [ACCESS_CONTROL.md](./ACCESS_CONTROL.md)
- **Email Issues**: See [EMAIL_SYSTEM.md](./EMAIL_SYSTEM.md)
- **AI Features**: Review [AI_FEATURE_README.md](./AI_FEATURE_README.md)
- **Cloudflare Setup**: Follow [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)

### **Debug Commands**
```bash
# Check build errors
npm run type-check

# View worker logs
wrangler tail --env development

# Test worker endpoints
curl -X POST your-worker-url
```

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome. Please ensure any contributions align with the project's professional portfolio goals.

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

**Built with ❤️ using React, TypeScript & TanStack Router**

*For detailed technical information, see [DEVELOPMENT.md](./DEVELOPMENT.md)*
