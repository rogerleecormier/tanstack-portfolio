---
title: "From Docs to Delivery: Building a Cloud & DevOps Portfolio with MkDocs + GitHub Actions"
description: "How to build a lean, Git-based, Markdown-driven developer portfolio site using MkDocs, Material theme, and automated CI/CD deployment for showcasing technical projects and experience."
date: "2025-07-07"
author: "Roger Lee Cormier"
tags: ["MkDocs", "GitHub Actions", "Portfolio", "Static Site Generator", "DevOps", "Documentation", "Technical Writing", "CI/CD"]
keywords: ["MkDocs", "GitHub Actions", "Portfolio", "Static Site", "DevOps", "Documentation", "CI/CD"]
---

## Introduction

After years of working behind the scenes on automation, SaaS integration, and DevOps tooling, I decided it was time to consolidate that experience into something public, structured, and easy to share: a **developer portfolio site**.

Instead of using a bloated CMS or hardcoding HTML, I took a leaner approach — Git-based, Markdown-driven, and CI/CD-enabled.

Here's how I built it 👇

***

## 🚀 Why MkDocs?

[MkDocs](https://www.linkedin.com/redir/redirect?url=https%3A%2F%2Fwww%2Emkdocs%2Eorg%2F&urlhash=pE0G&trk=article-ssr-frontend-pulse_little-text-block) is a fast, minimalistic static site generator built for documentation. Combined with the Material for MkDocs theme, it gives you:

*   Clean design out-of-the-box
*   Powerful navigation and search
*   Dark/light mode, tabs, and keyboard shortcuts
*   A modern UI without writing any front-end code

It's perfect for technical content like:

*   Cloud architecture summaries
*   DevOps pipelines
*   Project retrospectives
*   Automation scripts and tooling breakdowns

All projects are written up with:

*   Stack details
*   Outcomes and metrics
*   Process breakdowns

***

## 🔁 The Tech Stack

Here's what powers the site:

*   [MkDocs](https://www.linkedin.com/redir/redirect?url=https%3A%2F%2Fwww%2Emkdocs%2Eorg%2F&urlhash=pE0G&trk=article-ssr-frontend-pulse_little-text-block) – A fast, Markdown-native static site generator that makes it easy to write and version content like code.
*   [Material for MkDocs](https://www.linkedin.com/redir/redirect?url=https%3A%2F%2Fcheckbook-io.github.io&urlhash=r4gC&trk=article-ssr-frontend-pulse_little-text-block) – A professional, responsive theme that adds built-in search, dark mode, tabbed sections, and accessible UI components out-of-the-box.
*   pymdown-extensions – Enhances Markdown with tabbed code blocks, callouts (!!), emojis, and better syntax support.
*   mkdocs-awesome-nav – Simplifies navigation management using a single `nav.yml` file instead of deeply nested `mkdocs.yml` trees.
*   python-markdown-math – Adds LaTeX/KaTeX support for math rendering (used where applicable).
*   GitHub Actions – Automates CI/CD by building and deploying the site on every push to main.
*   GitHub Pages – Hosts the site directly from the `gh-pages` branch, linked to a custom domain via Porkbun.
*   VS Code + GitHub Copilot – Speeds up editing of config files, Markdown content, and plugin scaffolding.
*   ChatGPT (GPT-4) – Used to draft, polish, and format content sections, especially for consistency and clarity.

***

## 💡 What I Showcased

Inside the portfolio, I documented real projects such as:

* ✅ A serverless ETL pipeline (Box → Vena) using Azure Functions and Java-based data loaders

* ✅ NetSuite automation with direct [Checkbook.io](https://www.linkedin.com/redir/redirect?url=http%3A%2F%2Fcheckbook.io&urlhash=r4gC&trk=article-ssr-frontend-pulse_little-text-block) API integration to prevent payment errors

* ✅ AI-augmented dev workflows using Copilot, Claude, and Codespaces

* ✅ Power Automate flows to connect Outlook + Teams with Smartsheet-based ops tracking

* ✅ Python tools for file conversion, data transformation, and API-driven dashboards

All projects are written up with:

*   Stack details
*   Outcomes and metrics
*   Process breakdowns

***

## 🛠️ Why This Matters

I didn't just want a site—I wanted a living portfolio:

*   Markdown lets me version content the same way I manage code
*   GitHub Actions makes deployment seamless
*   No servers, no dependencies—just push and go
*   And it actually reflects how I think, build, and automate

If you're building technical tools, managing systems, or want to share your work beyond the resume, I highly recommend building something like this. It's clean, lightweight, and 100% in your control.

