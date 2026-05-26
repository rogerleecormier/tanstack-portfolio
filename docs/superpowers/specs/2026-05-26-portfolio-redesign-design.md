# Spec: Portfolio Redesign & Simplification (TanStack Start PoC)

**Date**: 2026-05-26  
**Author**: Antigravity AI  
**Status**: Proposed

---

## 1. Goal & Requirements

The goal is to simplify, modernize, and declutter the portfolio site at `rcormier` by migrating it to a clean, fast-loading **TanStack Start** application configured for deployment on **Cloudflare Workers/Pages**.

### Requirements:

- **Simplify & De-bloat**: Purge all CMS and admin pages, authentication layers, and wrangler database integrations.
- **Remove Dependencies**: Remove heavy, unused dependencies (e.g. TipTap, CodeMirror, Recharts, pdf/excel generators, mermaid).
- **Engaging User Journey**: Home page styled as a "Strategic Leadership Journey" connecting business strategy (ERP/SaaS) ➔ PMO governance ➔ AI automation.
- **Separate Tool Repositories**: Move or link all tools to their own respective domains:
  - **Taper** ([taper.rcormier.dev](https://taper.rcormier.dev)): Zero-based envelope budgeting app.
  - **Caliber** ([caliber.rcormier.dev](https://caliber.rcormier.dev)): AI job search agent and match scoring companion.
  - **ProOrca** ([proorca.rcormier.dev](https://proorca.rcormier.dev)): Map-first learning management system (LMS) for homeschoolers.
- **Responsive & Fast**: Completely mobile-responsive layouts, quick load speeds, and subtle animations.
- **Professional Aesthetic**: High-contrast dark mode slate base with neon indigo accents using **shadcn/ui** primitives.
- **Real-world content**: Grounded in Master Resume Version 12 details.
- **Resume Download**: Integrate an easy-download button for the "Senior TPM" resume PDF.

---

## 2. System Architecture & Routing

We will restructure the application to use a standard TanStack Start (v0) file-based routing architecture.

### File Structure:

```
rcormier/
├── docs/superpowers/specs/  # Design specs
├── public/                 # Static assets (images, favicon, Senior_TPM.pdf)
├── src/
│   ├── components/        # shadcn/ui components & custom UI helpers
│   ├── data/              # Static data sources
│   │   ├── resume.ts      # Structured resume details (V12)
│   │   └── projects.ts    # Project metadata (Taper, Caliber, ProOrca)
│   ├── routes/            # TanStack Start file-based routing
│   │   ├── __root.tsx     # Base template (Nav, Footer, layout wrapper)
│   │   ├── index.tsx      # Home page (The Strategic Leadership Journey)
│   │   ├── about.tsx      # Interactive resume / timeline
│   │   ├── projects.tsx   # External applications showcase
│   │   └── contact.tsx    # Simple contact form
│   ├── entry-client.tsx   # React 19 Client Entry
│   └── entry-server.tsx   # React 19 Server Entry
├── vite.config.ts         # Vite configuration with @tanstack/start + Cloudflare plugins
├── wrangler.jsonc         # Wrangler config for Cloudflare Pages/Workers deployment
└── package.json           # Streamlined dependencies
```

### Dependencies to Retain & Enforce:

- **React 19 / React-DOM 19**
- **`@tanstack/react-start` / `@tanstack/react-router`**
- **Tailwind CSS / Lucide React**
- **shadcn/ui primitives** (Radix UI, `clsx`, `tailwind-merge`)
- **`@cloudflare/vite-plugin` and `wrangler`** (for deployment)

---

## 3. UI/UX Design & User Journey (shadcn-First Guardrail)

All UI interfaces must be built using shadcn/ui styles.

### 3.1 Home Page (The Journey)

- **Chapter 1: The Blueprint (Hero)**: Large typographic intro presenting you as a PMP-certified Technical Project Manager. Action button leads to the Journey, and a primary CTA button is added to download the **Senior TPM** Resume PDF.
- **Chapter 2: The Philosophy (Vertical Flow)**:
  - _Strategic Vision_: Multi-entity SaaS/ERP integrations (NetSuite, Vena, Ramp AP).
  - _PMO Governance_: Asynchronous, cross-functional multi-timezone signal execution.
  - _AI & Automation_: Reclaiming 100+ manual hours/mo and reducing invoice cycles by 35%.
- **Chapter 3: The Proof (Metrics Grid)**: Responsive cards showing 25TB migration, POS rollouts, and custom scripts.
- **Chapter 4: The Deployments**: Previews of **Taper**, **Caliber**, and **ProOrca** prompting users to visit the projects.

### 3.2 Projects Page (The Showcase)

A high-curation grid containing:

- **Taper** card: Explaining zero-based envelope budgeting.
- **Caliber** card: Explaining remote job search agents and ATS match analysis.
- **ProOrca** card: Explaining map-first homeschool LMS paths.
- _Controls_: Tech stack listing, repository link, and a prominent "Launch App" button.

### 3.3 About Page (History & Credentials)

- Interactive history using shadcn `Accordion` components for **Vertex Education** (2022–Present), **Ravyx (STCR)** (2016–2023), and **U.S. Army** (2008–2015).
- Sidebar displaying PMP, CompTIA Network+, and **M.S. in Organizational Leadership (Expected July 2026)**.
- Prominent download action button linking directly to the local static `/Senior_TPM.pdf`.

---

## 4. Verification Plan

- **Dev Server**: Run `npm run dev` to verify the routes and responsiveness on desktop and mobile viewports.
- **Build Check**: Run `npm run build` to confirm zero compilation errors.
- **Lighthouse/Performance Check**: Ensure no heavy bundle warnings and pages load in < 500ms.
