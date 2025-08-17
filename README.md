# TanStack Portfolio

A personal portfolio and project dashboard built with React, TanStack Router, and Vite.  
Easily organize, analyze, and visualize your projects and data—including health tracking via HealthBridge.

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
