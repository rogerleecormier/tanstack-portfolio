---
title: "Project Method Analysis – Budget Tiers & Complexity"
description: "Percentile-based budget tiers (≤33rd, 33rd–67th, >67th) comparing Agile vs. Non-Agile complexity with pre-ANOVA visuals and two-way ANOVA insights."
author: "Roger Lee Cormier"
date: "2025-08-30"
tags: ["Analytics", "Project Method Analysis", "Risk Analysis", "Budget Analysis"]
---

## 📝 Project Overview

This project analyzes a dataset of 4,000 real-world project records to explore how budget correlates with **project complexity**. The goal is to surface patterns in budget allocation across projects and visualize how often projects fall into specific budget tiers.

## ❓ Problem Statement

@@ -50,7 +50,7 @@ Project budgets were divided into three tiers using the 33rd and 67th percentile

**Mid (33rd–67th percentile):** Middle third

**High (&gt;67th percentile):** Largest third

This approach balances group sizes despite the right-skewed distribution, ensuring fair comparisons of complexity and methodology across budget levels.

@@ -60,7 +60,7 @@ This approach balances group sizes despite the right-skewed distribution, ensuri
|---|---|---|---|---|
| Low (≤33rd) | $159,355.55 – $790,000.26 | 1,334 | 4.670 | 3.982 |
| Mid (33rd–67th) | $790,000.26 – $1,279,552.09 | 1,333 | 6.667 | 5.436 |
| High (&gt;67th) | $1,279,552.09 – $3,768,354.37 | 1,333 | 8.919 | 6.391 |

---

@@ -70,22 +70,7 @@ This approach balances group sizes despite the right-skewed distribution, ensuri

```histogram
[
  { "Budget Range": "$0.16M–$0.40M", "Count": 189 },
  { "Budget Range": "$0.40M–$0.66M", "Count": 701 },
  { "Budget Range": "$0.66M–$0.91M", "Count": 818 },
  { "Budget Range": "$0.91M–$1.16M", "Count": 672 },
  { "Budget Range": "$1.16M–$1.41M", "Count": 517 },
  { "Budget Range": "$1.41M–$1.65M", "Count": 350 },
  { "Budget Range": "$1.65M–$1.91M", "Count": 264 },
  { "Budget Range": "$1.91M–$2.16M", "Count": 181 },
  { "Budget Range": "$2.16M–$2.41M", "Count": 149 },
  { "Budget Range": "$2.41M–$2.66M", "Count": 88 },
  { "Budget Range": "$2.66M–$2.91M", "Count": 46 },
  { "Budget Range": "$2.91M–$3.16M", "Count": 17 },
  { "Budget Range": "$3.16M–$3.41M", "Count": 6 },
  { "Budget Range": "$3.41M–$3.66M", "Count": 1 },
  { "Budget Range": "$3.66M–$3.91M", "Count": 1 }
]
```

**Explanation:**
@@ -98,13 +83,7 @@ Budgets are **right-skewed**, with most projects under ~$1.5M. Percentile-based

```scatterplot
[
  { "Budget": 159356, "Mean Complexity Score": 4.1 },
  { "Budget": 408000, "Mean Complexity Score": 3.9 },
  { "Budget": 900000, "Mean Complexity Score": 6.0 },
  { "Budget": 1250000, "Mean Complexity Score": 6.7 },
  { "Budget": 2000000, "Mean Complexity Score": 7.4 },
  { "Budget": 3200000, "Mean Complexity Score": 8.8 }
]
```

**Explanation:**
@@ -115,12 +94,7 @@ This scatterplot shows **mean complexity scores** grouped by representative budg

```linechart
[
  { "Budget Estimate": "≈$0.20M", "Mean Complexity Score": 4.0 },
  { "Budget Estimate": "≈$0.80M", "Mean Complexity Score": 5.6 },
  { "Budget Estimate": "≈$1.50M", "Mean Complexity Score": 6.8 },
  { "Budget Estimate": "≈$2.20M", "Mean Complexity Score": 7.6 },
  { "Budget Estimate": "≈$3.20M", "Mean Complexity Score": 8.6 }
]
```

**Explanation:**
@@ -133,16 +107,7 @@ The fitted trend indicates a **monotonic increase** in complexity with budget, s

```scatterplot
[
  { "x": 450000, "y": 4.5, "series": "Agile" },
  { "x": 800000, "y": 5.8, "series": "Agile" },
  { "x": 1500000, "y": 7.2, "series": "Agile" },
  { "x": 2800000, "y": 8.9, "series": "Agile" },

  { "x": 450000, "y": 3.7, "series": "Non-Agile" },
  { "x": 800000, "y": 4.9, "series": "Non-Agile" },
  { "x": 1500000, "y": 5.9, "series": "Non-Agile" },
  { "x": 2800000, "y": 6.5, "series": "Non-Agile" }
]
```

**Explanation:**
@@ -151,63 +116,51 @@ This scatterplot shows **mean complexity per budget tier** for Agile vs. Non‑A

### Regression Trend – By Methodology (Line)

```linechart
[
  { "Budget Tier": "Low (≤33rd)", "Agile": 4.670, "Non-Agile": 3.982 },
  { "Budget Tier": "Mid (33rd–67th)", "Agile": 6.667, "Non-Agile": 5.436 },
  { "Budget Tier": "High (&amp;gt;67th)", "Agile": 8.919, "Non-Agile": 6.391 }
]
```

**Explanation:**

Methodology-specific trends **diverge** across tiers: **Agile** rises faster with budget than **Non‑Agile**, visually previewing the **interaction** confirmed by ANOVA.

---

### Project Count by Budget Tier

```barchart
[
  { "Budget Tier": "Low (≤33rd)", "Count": 1334 },
  { "Budget Tier": "Mid (33rd–67th)", "Count": 1333 },
  { "Budget Tier": "High (&amp;gt;67th)", "Count": 1333 }
]
```

**Explanation:**

Counts are balanced across tiers, enabling meaningful comparisons in subsequent charts and the ANOVA.

---

### Mean Complexity by Tier (Agile vs. Non-Agile)

```barchart
[
  { "Budget Tier": "Low (≤33rd)", "Agile": 4.670, "Non-Agile": 3.982 },
  { "Budget Tier": "Mid (33rd–67th)", "Agile": 6.667, "Non-Agile": 5.436 },
  { "Budget Tier": "High (&amp;gt;67th)", "Agile": 8.919, "Non-Agile": 6.391 }
]
```

**Explanation:**

Compares **mean complexity** for **Agile** and **Non-Agile** within each tier. Agile is higher in every tier, with the largest difference at **High** budgets.

---

### Complexity Gap (Agile − Non-Agile)

```linechart
[
  { "Budget Tier": "Low (≤33rd)", "Gap": 0.688 },
  { "Budget Tier": "Mid (33rd–67th)", "Gap": 1.231 },
  { "Budget Tier": "High (&amp;gt;67th)", "Gap": 2.528 }
]
```

**Explanation:**

The **gap widens** from Low to High tiers, implying methodology differences intensify as projects grow in size and scope.

@@ -231,7 +184,7 @@ The **gap widens** from Low to High tiers, implying methodology differences inte

**Operational Implications**

**Staffing &amp; Skills:** High-tier initiatives need stronger **architecture runway**, **test automation**, and **product ownership**.

**Governance:** For Mid/High tiers, require **early validation** (spikes, dependency mapping) to prevent unnecessary scope inflation.

@@ -279,9 +232,9 @@ Portfolio policy should **match methodology to problem structure**:

## 🔗 Related Pages

[Analytics &amp; Insights](/analytics) — Portfolio of applied analytics projects

[Strategy &amp; Vision](/strategy) — How this analytical approach supports transformation initiatives

---


📋 *Detailed methodology and code snippets available upon request. [Let's connect](/contact).*
