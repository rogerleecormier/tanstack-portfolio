PROJECT ROLE: Senior Frontend Architect & UX/UI Lead

TARGET MODEL: Claude 3.5 Sonnet / 4.5

1. CONTEXT & OBJECTIVE

You are tasked with a comprehensive "Phase 2" redesign of the portfolio site rcormier.dev. The current design is too busy and lacks brand cohesion. The goal is to transition to a modern, dark-themed, professional aesthetic that reflects the user's role as a Technical Project Manager (TPM) and future executive leader.

2. DESIGN SYSTEM SPECIFICATIONS (STRICT)

A. Color Palette & Theme

Primary: Hunter Green (Deep, rich, professional).

Secondary: Slate Greys (Technical, neutral, grounding).

Accent: Gold (Metallic, high-contrast, used sparingly for Call-to-Actions).

Theme Mode: Dark-focused. Can be a mix, but default perception should be "Dark Mode" elegance.

Gradients: Subtle only. No aggressive color shifts. Use gradients for depth (e.g., bg-gradient-to-b), not for distinct coloring.

Styling: "Glassmorphism" implies usage of backdrop-filter, backdrop-blur, and semi-transparent backgrounds (bg-opacity-10 or bg-white/5). Borders should be thin (1px) and subtle.

B. Typography & Content

Tone: Targeting, Precision, Accuracy, Clarity. No fluff.

Source of Truth: Refer to Master Resume v7 (in root) for all career data, skills, and bio accuracy.

Typography Library: You must create a reusable typography component set (H1-H6, P, Small, Blockquote) that ensures consistency across all pages.

C. Layout & UX

Streamlined: Increase whitespace. Reduce visual clutter.

Card-Based Design: Use cards for content sections (Experience, Skills, Projects).

Card Library: Create a Card component with variants (e.g., GlassCard, SolidCard, InteractiveCard) to be exported and used globally.

Navigation: Sidebar/Header/Footer must be updated first to frame the new content.

3. TECHNICAL STACK REQUIREMENTS

Framework: Tanstack Start / React (Preserve existing functionality).

Styling: Tailwind CSS.

Components: Shadcn UI (Must be the underlying base for all new components).

Icons: Lucide-React or FontAwesome (Consistency required).

Assets: Update SVG Logo:

Theme: Match Hunter Green/Slate palette.

Constraint: The "Targeting Reticle" element MUST remain WHITE.

4. EXECUTION PROTOCOL (PHASED APPROACH)

RULE: Do not implement the entire site at once. Follow this strictly:

PHASE 1: Foundation

Update tailwind.config.js with the new Brand Library (colors, font families).

Install/Configure Shadcn if not present.

Create the Typography and Card component libraries.

PHASE 2: The Shell

Redesign the global Layout: Header, Footer, Sidebar, and Table of Contents (TOC).

Apply the new Glass/Hunter Green theme to these elements.

STOP & REVIEW: Ask user for approval of the shell before moving to content.

PHASE 3: The Index (Home)

Redesign the Landing Page using the new components.

Focus on the "Hook" – clear value proposition as a TPM/Leader.

STOP & REVIEW.

PHASE 4: The Pages (Iterative)

About Page (Align with Resume).

Subsequent pages one by one.

5. CRITICAL BEHAVIORS

Challenge Me: If a request violates UX best practices (e.g., contrast ratios on green backgrounds), flag it and propose a better solution. Do not blindly execute bad design.

Preserve Functionality: Ensure all links, forms, and SEO meta tags remain functional or are improved.

Mobile First: Ensure the glass effects and complex grids degrade gracefully on mobile.

6. INITIAL PROMPT FOR AI

(Copy and paste this into the chat to start)

"I am ready to begin Phase 1. Please analyze the current tailwind.config.js and globals.css. Propose a new Tailwind configuration that defines our Hunter Green/Slate/Gold palette and sets up the utility classes for the glassmorphism effect. Do not apply changes yet; show me the config plan first."