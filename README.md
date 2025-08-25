# Roger Lee Cormier Portfolio

A modern, professional portfolio website built with cutting-edge web technologies, featuring Cloudflare Access authentication, advanced AI-powered features, interactive data visualization, and a fully functional contact form with Resend email integration.

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

### **AI & Machine Learning**
- **Cloudflare AI Workers** - Serverless AI processing with Llama 2
- **Real-time Analysis** - Intelligent contact form analysis
- **Smart Recommendations** - AI-powered content suggestions

## ✨ Key Features

### **🤖 AI-Powered Features**
- **Intelligent Contact Analysis**: Real-time AI analysis of contact form submissions using Llama 2
- **Dynamic Search Recommendations**: AI-powered search suggestions and content recommendations
- **Smart Meeting Scheduler**: Intelligent meeting duration recommendations based on inquiry analysis
- **Timezone Finder**: AI-assisted timezone detection and meeting scheduling
- **Content Personalization**: AI-driven content recommendations based on user behavior
- **Priority Classification**: Automatic inquiry prioritization and routing

### **🔐 Advanced Authentication System**
- **Cloudflare Access Integration**: Enterprise-grade security with Zero Trust
- **Dual-Mode Architecture**: Automatically switches between development and production
- **Protected Routes**: Secure access to sensitive content and analysis tools
- **Development Mode**: Mock authentication for local development and testing
- **Email-based Access Control**: Configurable user permissions

### **📧 Professional Contact System**
- **Smart Contact Flow**: Intuitive choice between "Quick Message" and "Schedule Meeting"
- **AI-Powered Analysis**: Real-time analysis of inquiries with intelligent classification
- **Resend Integration**: Modern, reliable email delivery via Resend API
- **Cloudflare Worker**: Serverless email processing to avoid CORS issues
- **Spam Protection**: Built-in spam prevention and validation
- **Professional Templates**: Beautiful HTML email templates with branding
- **Reply-to Functionality**: Easy response handling for inquiries
- **Meeting Scheduling**: Native meeting scheduling with AI recommendations
- **Enhanced UX**: Clear visual hierarchy with interactive choice cards and supporting information

### **🔍 Intelligent Search System**
- **Fuse.js Powered**: Fuzzy search with configurable relevance scoring
- **AI-Enhanced Search**: Machine learning-powered search suggestions and content recommendations
- **Global Content Search**: Search across all markdown content, pages, and documentation
- **Real-time Results**: Debounced search with instant feedback
- **Relevance Scoring**: Visual indicators showing match quality
- **Keyboard Navigation**: ⌘K shortcut for quick access
- **Dynamic Recommendations**: AI-powered content suggestions based on search patterns

### **📊 Interactive Data Analysis**
- **HealthBridge Integration**: Protected health data analysis with dynamic filtering
- **Advanced Charting**: Line charts, bar charts, and more with Recharts
- **Dynamic Filtering**: Date ranges, custom periods, and real-time data aggregation
- **Responsive Design**: Charts adapt to different screen sizes
- **AI-Enhanced Insights**: Machine learning-powered data analysis and recommendations

### **📱 Modern User Experience**
- **Responsive Sidebar**: Collapsible navigation with project organization
- **Table of Contents**: Auto-generated TOC for markdown content
- **Breadcrumb Navigation**: Clear path indication
- **Mobile-First Design**: Optimized for all device sizes
- **Interactive Contact Flow**: Engaging choice-based contact experience
- **Enhanced Visual Feedback**: Hover effects, transforms, and clear interactive states
- **AI-Powered UX**: Intelligent interface adaptations based on user behavior

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
│   ├── AIContactAnalysis.tsx # AI-powered contact analysis
│   ├── AIMeetingScheduler.tsx # AI meeting scheduling
│   ├── Search.tsx      # Global search with AI recommendations
│   └── ...             # Other components
├── pages/               # Page components
│   ├── MarkdownPage.tsx    # Markdown content renderer
│   ├── ContactPage.tsx     # Smart contact flow with AI analysis
│   ├── HealthBridge.tsx    # Protected health analysis
│   └── NotFound.tsx        # 404 page
├── content/             # Markdown content files
├── api/                 # API and service files
│   ├── aiContactAnalyzer.ts # AI contact analysis service
│   ├── emailService.ts  # Email service for contact form
│   └── healthBridge.ts  # Health data API
├── functions/           # Cloudflare Workers
│   ├── ai-contact-analyzer.js # AI analysis worker
│   └── send-email.js    # Email processing worker
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── config/              # Configuration files
├── router.tsx           # TanStack Router configuration
└── main.tsx             # Application entry point
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Git
- Modern browser with ES2020 support
- Cloudflare account (for Workers and Access)
- Resend account (for email functionality)

### **Quick Start**
```bash
# Clone the repository
git clone <repository-url>
cd tanstack-portfolio

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Environment Setup**
Create `.env.local` for local development:
```bash
VITE_DEV_MODE=true
VITE_CLOUDFLARE_DOMAIN=rcormier.dev
```

## 📚 Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Comprehensive development guide and architecture details
- **[CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)** - Cloudflare Access and Workers setup guide
- **[AI_FEATURE_README.md](./AI_FEATURE_README.md)** - Detailed AI features documentation
- **[ACCESS_CONTROL.md](./ACCESS_CONTROL.md)** - Authentication and access control configuration
- **[SECURITY.md](./SECURITY.md)** - Security features and best practices

## 🔧 Development Commands

```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run type-check       # TypeScript type checking
npm run lint             # ESLint linting
```

## 🌟 AI Features in Action

### **Contact Form Intelligence**
- **Real-time Analysis**: AI analyzes contact form submissions as users type
- **Smart Classification**: Automatically categorizes inquiries by type, priority, and industry
- **Meeting Recommendations**: Suggests optimal meeting duration and scheduling
- **Content Suggestions**: Recommends relevant portfolio content based on inquiry analysis

### **Search Enhancement**
- **Dynamic Recommendations**: AI-powered search suggestions and content recommendations
- **Intelligent Filtering**: Smart content filtering based on user search patterns
- **Relevance Scoring**: Advanced relevance algorithms for better search results

### **Meeting Scheduler**
- **AI Duration Suggestions**: Intelligent meeting duration recommendations
- **Timezone Detection**: Automatic timezone detection and conversion
- **Schedule Optimization**: AI-powered scheduling suggestions for optimal meeting times

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome. Please ensure any contributions align with the project's professional portfolio goals.

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

**Built with ❤️ using React, TypeScript & TanStack Router**
