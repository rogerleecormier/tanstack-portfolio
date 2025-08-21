# TanStack Portfolio

A modern portfolio website built with React, TanStack Router, and Vite.

## Routing Setup

This application uses **normal routing** (not hash routing) for clean, SEO-friendly URLs:

- **Development**: Clean URLs like `http://localhost:5174/strategy`, `http://localhost:5174/leadership`
- **Production**: Clean URLs like `yoursite.com/strategy`, `yoursite.com/leadership`

### Hosting Platform Compatibility

The app includes intelligent routing support for different hosting platforms:

- **Cloudflare Pages**: Native SPA routing support (no workarounds needed)
- **Netlify**: Uses the `public/_redirects` file
- **Vercel**: Uses the `vercel.json` configuration
- **GitHub Pages**: Uses the included routing scripts (only on github.io domains)
- **Other platforms**: Most modern hosting platforms support SPA routing natively

### Routing Script Logic

The routing script in `index.html` only runs on GitHub Pages domains (`*.github.io`) and excludes:
- Localhost (development)
- Cloudflare Pages (`*.pages.dev`, `*.cloudflare.com`)
- Netlify (`*.netlify.app`, `*.netlify.com`)
- Vercel (`*.vercel.app`, `*.vercel.com`)
- Firebase (`*.firebaseapp.com`, `*.web.app`)

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

```bash
npm run deploy
```

---

## 🚀 Features

- **Project Navigation:**  
  Organize all your projects under a dedicated sidebar section with icons and quick access.

- **Analytics & Insights:**  
  Top-level analytics page and per-project analysis (e.g., HealthBridge Analysis, Projects Analysis).

- **HealthBridge Integration:**  
  Sync and visualize health data from external sources, with dynamic charting and filtering.

- **Dynamic Filtering:**  
  Filter data by quick ranges (7, 14, 30 days, 3/6 months, all), custom date ranges, and more.

- **Chart Aggregation:**  
  Automatically aggregate data by day or month based on selected filters for clear visualization.

- **Markdown Content:**  
  Easily add and edit content pages using Markdown for project documentation and analysis.

- **Responsive Sidebar:**  
  Portfolio and Projects navigation with collapsible groups and icons.

- **GitHub Pages Deployment:**  
  Automated CI/CD workflow for static site deployment.

---

## ⚙️ Configuration

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
  - `/healthbridge-analysis` — HealthBridge Analysis

### Charting

- HealthBridge uses [Mermaid](https://mermaid-js.github.io/mermaid/#/) for data visualization.
- Chart colors and aggregation logic are configurable in code.

### Deployment

- **GitHub Actions** workflow (`.github/workflows/deploy.yml`) automates build and deploy to GitHub Pages.
- Uses Node.js 20, Vite, and [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages).

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
  components/      # Sidebar, layout, charts, etc.
  pages/           # MarkdownPage, HealthBridge, analysis pages
  router.tsx       # Route definitions
  ...
.github/
  workflows/
    deploy.yml     # GitHub Pages deployment workflow
```

---

## 📝 Customization

- **Add new projects:**  
  Update `AppSidebar.tsx` and `router.tsx` to add new project links and routes.
- **Add analysis pages:**  
  Create new Markdown files and add corresponding routes.
- **Change chart colors:**  
  Edit theme variables in HealthBridge chart config.

---

## 📦 Dependencies

- React
- TanStack Router
- Vite
- Mermaid
- Lucide React (icons)
- GitHub Actions

---

## 📄 License

MIT

---

**Questions or suggestions?**  
Open an issue or submit a pull request!
