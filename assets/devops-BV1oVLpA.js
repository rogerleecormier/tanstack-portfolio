const e=`---
title: "Cloud & DevOps Engineering"
description: "Hands-on engineering turning fragmented SaaS ecosystems into automated, audit-ready pipelines using Azure Functions, GitHub Actions, and AI-assisted development."
---

I work at the crossroads of product leadership and hands‑on engineering, turning fragmented SaaS ecosystems into automated, audit‑ready pipelines. Across education, fintech, and retail, my projects remove manual toil, fortify release governance, and surface real‑time insight for hundreds of end‑users — all while keeping compliance teams happy.

---

## 🔧 Core Tooling & Stack

| Domain | Primary Tools & Services |
|--------|--------------------------|
| **Cloud & CI/CD** | Azure Functions, Azure Communication Services, Azure Key Vault, Azure Application Insights, GitHub Actions |
| **Automation & Scripting** | Python, PowerShell, SuiteScript, Power Automate, Batch |
| **SaaS Footprint** | NetSuite, Vena, Box, Ramp, Checkbook.io, Smartsheet |
| **Documentation & Static Sites** | MkDocs (Material), GitHub Pages, VS Code, GitHub Copilot, ChatGPT, HTML/CSS |
| **Environments** | Git‑first workflows, serverless architecture, VMware test labs |

---

## 🔁 Portfolio Highlights

### 📦 Box → Vena Serverless ETL  
**Stack:** Azure Functions • GitHub Actions • Java ETL • Box API  

Replaced a brittle Windows batch process with a serverless pipeline that validates, loads, and audits finance files from Box into Vena. Features include schema checks, idempotent retries, Key Vault secrets, and real‑time alerts via Azure Communication Services. GitHub Actions manages build and slot‑based deployments.

- Retired legacy hardware and its upkeep  
- Cut integration failures by **75 %** through automated validation & retries  
- Added structured logs and Application Insights dashboards

---

### 🤖 AI‑Augmented & Cloud‑Native Development  
**Stack:** GitHub Codespaces • GitHub Copilot • Claude Sonnet 3.7 • ChatGPT‑4o  

AI is a first‑class citizen in my SDLC. Codespaces provides reproducible, containerized environments; Copilot, Claude, and ChatGPT handle code scaffolding, config generation, and edge‑case reasoning.

- **Code acceleration:** up to **5×** faster delivery on Python, SuiteScript, PowerShell  
- **Pipeline hardening:** LLMs debug and optimize GitHub Actions YAML  
- **Docs‑as‑code:** context‑aware comments and onboarding guides generated on demand  
- Saved **≈ 100 developer‑hours/month**

---

### 💳 Finance Ops Orchestration  
**Stack:** Oracle NetSuite • SuiteScript • REST APIs  

Built a NetSuite‑native ACH workflow that pipes validated payments to Checkbook.io. SuiteScript enforces GL and entity logic; all steps are logged for audit.

- Zero duplicate/misrouted payments  
- 100 % hands‑off Checkbook.io uploads  
- Serves **300 +** charter‑school finance users

---

### 🌐 Portfolio Site – Docs-as-Code  
**Stack:** MkDocs (Material) • Python • GitHub Actions • GitHub Pages • HTML/CSS  

This portfolio site is a standalone DevOps project, built to treat documentation with the same rigor as application code—version-controlled, auditable, and CI/CD-enabled.

| Layer | Details |
|-------|---------|
| **Static Generator** | MkDocs 1.6 with the Material 9.x theme |
| **Plugin Ecosystem** | Search indexing (\`search\`), YAML-driven navigation (\`awesome-nav\`), Open Graph previews (\`social\`), HTML/CSS/JS minification (\`minify\`), Git-based revision tracking (\`git-revision-date-localized\`), redirect mapping (\`redirects\`), advanced formatting (\`admonition\`, \`pymdown-extensions\`, \`mdx_math\`, \`mermaid\`) |
| **CI/CD Pipeline** | Two GitHub Actions workflows: <br>1. \`Deploy\` – installs deps, builds the site, pushes to \`gh-pages\` via \`peaceiris/actions-gh-pages\` <br>2. \`pages-build-deployment\` – handles the final publish via GitHub Pages |
| **Hosting** | GitHub Pages with custom domain [rcormier.dev](https://www.rcormier.dev), DNS via Porkbun |
| **Performance** | Sub-10 second build times, ~2 MB total output, minified assets, instant-loading via \`navigation.instant\` |

**Why it matters:**  
This site exemplifies best practices in static site deployment, including:

- **Zero runtime footprint** – no server, patching, or backend infrastructure  
- **Auditable changes** – every commit is versioned and timestamped via Git  
- **Developer-native workflow** – content is written in Markdown and managed via pull requests  
- **Scalable and free** – high-performance GitHub-hosted site with no hosting costs  
- **Practical DevOps** – demonstrates YAML pipeline design, static site generators, and plugin customization



---

### 🛠️ Custom Automation Utilities  
**Stack:** Python • Power Automate • SuiteScript • Smartsheet API • Excel XML • Outlook • Teams  

| Utility | Purpose | Outcome |
|---------|---------|---------|
| **CalPERS XLSX → XML** | Convert pension spreadsheets to county‑standard XML | Manual re‑entry eliminated |
| **Box → Smartsheet Indexer** | Auto‑catalog docs & push to Smartsheet | Live inventory dashboards |
| **NetSuite CSV Pipeline** | Clean & re‑import accounting exports | Faster month‑end, fewer errors |
| **Outlook → Smartsheet Tickets** | Create tickets from emails | 300 + requests triaged monthly |
| **Onboarding Tracker** | Populate Smartsheet from Teams/Outlook | SLA adherence up ↑ |

---

### 🖥️ Retail POS Automation at Scale  
**Stack:** Python • VBScript • Batch • VMware  

30 + scripts patch Toshiba POS nodes, deploy zero‑day fixes, and collect logs across 150 + stores, validated in a 50‑VM staging lab.

- Deployment 3× faster  
- Support tickets down 40 %  
- 95 % first‑pass install rate

---

## 📈 Measured Impact

- 🕒 **20 + hours/week** eliminated via serverless ETL  
- 🤖 **100 + hours/month** saved through AI‑assisted workflows  
- 🧾 **300 + users** relying on automated AP pipelines  
- 🌐 Static‑site builds in **< 10 s**, hosted for **$0** on GitHub Pages  

---

## ⚡ DevOps Philosophy

> *"Velocity without traceability is vanity; true DevOps balances shipped value with defensible compliance."*

Whether building serverless ETL pipelines or hardening CI/CD workflows, my engineering approach prioritizes sustainable automation that teams can trust, audit, and maintain—not just solutions that work once.

---

📋 *Sample artifacts, documentation, and detailed case studies available upon request. [Let's connect](/contact).*
`;export{e as default};
