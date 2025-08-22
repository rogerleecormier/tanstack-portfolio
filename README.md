# TanStack Portfolio

A modern portfolio website built with React, TanStack Router, and Vite, featuring Cloudflare Access authentication and shadcn/ui components.

## Routing Setup

This application uses **normal routing** (not hash routing) for clean, SEO-friendly URLs:

- **Development**: Clean URLs like `http://localhost:5174/strategy`, `http://localhost:5174/leadership`
- **Production**: Clean URLs like `yoursite.com/strategy`, `yoursite.com/leadership`

### Current Deployment

- **Cloudflare Pages**: Native SPA routing support with Cloudflare Access authentication
- **Future**: Ready for potential SSR conversion

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview Build

```bash
npm run preview
```

---

## 🚀 Features

- **Cloudflare Access Authentication:**  
  Secure One-Time PIN (OTP) authentication for protected content using Cloudflare Zero Trust.

- **Project Navigation:**  
  Organize all your projects under a dedicated sidebar section with icons and quick access.

- **Analytics & Insights:**  
  Top-level analytics page and per-project analysis with interactive charts.

- **HealthBridge Integration:**  
  Protected health data analysis with dynamic charting and filtering capabilities.

- **Dynamic Filtering:**  
  Filter data by quick ranges (7, 14, 30 days, 3/6 months, all), custom date ranges, and more.

- **Chart Aggregation:**  
  Automatically aggregate data by day or month based on selected filters for clear visualization.

- **Markdown Content:**  
  Easily add and edit content pages using Markdown for project documentation and analysis.

- **Responsive Sidebar:**  
  Portfolio and Projects navigation with collapsible groups and icons.

- **Search Functionality:**  
  Global search across all content with fuzzy matching and keyboard navigation.

- **Table of Contents:**  
  Automatic TOC generation for markdown content with smooth scrolling.

---

## ⚙️ Configuration

### Authentication

- **Cloudflare Access**: One-Time PIN (OTP) authentication for protected routes
- **Protected Routes**: `/protected`, `/healthbridge-analysis`
- **Public Routes**: All other portfolio pages
- **Identity Provider**: Configured for `rcormier.dev` domain

### Sidebar Navigation

- **Portfolio Navigation:**  
  Main site sections (About, Analytics & Insights, Strategy, Leadership, Talent, DevOps, ERP/SaaS).

- **Projects:**  
  Each project (e.g., HealthBridge) is listed as a top-level link with its own icon.  
  Project analysis pages (e.g., HealthBridge Analysis, Projects Analysis) are also included.

### Routing

- Uses [TanStack Router](https://tanstack.com/router) for page navigation.
- Example routes:
  - `/` — About
  - `/analytics` — Analytics & Insights
  - `/project-analysis` — Projects Analysis
  - `/healthbridge-analysis` — HealthBridge Analysis (Protected)
  - `/protected` — Protected Content (Protected)

### Charting

- Uses [Recharts](https://recharts.org/) with shadcn/ui chart components for data visualization
- Supports Bar, Line, Scatter, and other chart types
- Responsive design with proper theming
- Chart colors and aggregation logic are configurable in code

### UI Components

- **shadcn/ui**: Modern, accessible React components
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI primitives
- **Lucide React**: Beautiful, customizable icons

### Deployment

- **Cloudflare Pages** with Cloudflare Access integration
- **GitHub Actions** workflow (`.github/workflows/deploy.yml`) automates build and deploy
- Uses Node.js 20, Vite, and Cloudflare Pages deployment

---

## 🛠️ Getting Started

1. **Install dependencies:**
   ```sh
   npm ci
   ```

2. **Run locally:**
   ```sh
   npm run dev
   ```

3. **Build for production:**
   ```sh
   npm run build
   ```

4. **Deploy:**  
   Push to `main` branch or trigger the GitHub Actions workflow manually.

---

## 📁 Project Structure

```
src/
  components/          # React components
    ui/               # shadcn/ui components
      chart.tsx       # Recharts integration
      sidebar.tsx     # Responsive sidebar
      button.tsx      # Button components
      ...
    AppSidebar.tsx    # Main navigation sidebar
    Search.tsx        # Global search functionality
    TableOfContents.tsx # Auto-generated TOC
    ProtectedPage.tsx # Authentication wrapper
    LoginPage.tsx     # Cloudflare Access login
    ...
  pages/              # Page components
    MarkdownPage.tsx  # Markdown content renderer
    HealthBridge.tsx  # Protected health analysis
    NotFound.tsx      # 404 page
  content/            # Markdown content files
    about.md          # About page content
    analytics.md      # Analytics content
    ...
  hooks/              # Custom React hooks
    useAuth.ts        # Authentication state
    use-mobile.tsx    # Mobile detection
  utils/              # Utility functions
    cloudflareAuth.ts # Cloudflare Access integration
    searchIndex.ts    # Search functionality
  router.tsx          # TanStack Router configuration
  ...
.github/
  workflows/
    deploy.yml        # Cloudflare Pages deployment workflow
```

---

## 📝 Customization

- **Add new projects:**  
  Update `AppSidebar.tsx` and `router.tsx` to add new project links and routes.
- **Add analysis pages:**  
  Create new Markdown files and add corresponding routes.
- **Change chart colors:**  
  Edit theme variables in chart components.
- **Modify authentication:**  
  Update Cloudflare Access policies in the dashboard.

---

## 🔐 Authentication Setup

### Cloudflare Access Configuration

1. **Enable Zero Trust** in Cloudflare dashboard
2. **Create One-Time PIN identity provider** for your domain
3. **Configure application policies**:
   - Public Access (Bypass) for portfolio pages
   - Protected Routes (Allow) for sensitive content
4. **Set up email restrictions** for protected content

See `CLOUDFLARE_SETUP.md` for detailed configuration instructions.

---

## 📦 Dependencies

### Core
- React 19
- TanStack Router
- Vite
- TypeScript

### UI & Styling
- shadcn/ui components
- Tailwind CSS
- Radix UI primitives
- Lucide React icons

### Charts & Data
- Recharts (with shadcn/ui integration)
- Fuse.js (fuzzy search)

### Authentication
- Cloudflare Access (Zero Trust)

### Content
- React Markdown
- Gray Matter (frontmatter parsing)
- Remark/Rehype plugins

### Development
- ESLint
- TypeScript
- GitHub Actions

---

## 📄 License

MIT

---

**Questions or suggestions?**  
Open an issue or submit a pull request!
