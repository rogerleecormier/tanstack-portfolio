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

Determine how **project budget** relates to **project complexity** and whether **methodology** (Agile vs. Non-Agile) interacts with budget tier to influence complexity. A two-way ANOVA evaluates main effects and the interaction between budget tier and methodology.

---

## 📦 Data Summary

**Data Source**: [Kaggle – Project Management Risk Dataset](https://www.kaggle.com/datasets/ka66ledata/project-management-risk-raw)

**Total Records:** 4,000

**Features:** 51 columns including budget, team size, risk level, methodology, and stakeholder data

**Key Quantitative Variables:**

`ProjectBudgetUSD` → Defines tiers via 33rd and 67th percentiles (Low / Mid / High).

`Complexity_Score` → 0–10 scale (dependent variable).

`Methodology_Group` → Agile vs. Non-Agile.

## 🗂️ Data Groupings

### Project Methodologies

All projects are grouped into **Agile** vs. **Non-Agile** for analysis, and further stratified by budget tier (Low, Mid, High).

**Agile** includes projects using Agile, Scrum, or Kanban methodologies.

**Non-Agile** includes Waterfall and Hybrid approaches.

### Budget Tiers

Project budgets were divided into three tiers using the 33rd and 67th percentiles of the full portfolio.

**Low (≤33rd percentile):** Smallest third of projects by budget

**Mid (33rd–67th percentile):** Middle third

**High (&gt;67th percentile):** Largest third

This approach balances group sizes despite the right-skewed distribution, ensuring fair comparisons of complexity and methodology across budget levels.

## 📊 Summary Statistics

| **Budget Tier** | **Budget Range (USD)** | **Project Count** | **Mean Complexity (Agile)** | **Mean Complexity (Non-Agile)** |
|---|---|---|---|---|
| Low (≤33rd) | $159,355.55 – $790,000.26 | 1,334 | 4.670 | 3.982 |
| Mid (33rd–67th) | $790,000.26 – $1,279,552.09 | 1,333 | 6.667 | 5.436 |
| High (&gt;67th) | $1,279,552.09 – $3,768,354.37 | 1,333 | 8.919 | 6.391 |

---

## 📉 Visualizations

### Budget Distribution (Histogram)

```histogram
[
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$0.16M–$0.40M&amp;quot;, &amp;quot;Count&amp;quot;: 189 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$0.40M–$0.66M&amp;quot;, &amp;quot;Count&amp;quot;: 701 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$0.66M–$0.91M&amp;quot;, &amp;quot;Count&amp;quot;: 818 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$0.91M–$1.16M&amp;quot;, &amp;quot;Count&amp;quot;: 672 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$1.16M–$1.41M&amp;quot;, &amp;quot;Count&amp;quot;: 517 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$1.41M–$1.65M&amp;quot;, &amp;quot;Count&amp;quot;: 350 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$1.65M–$1.91M&amp;quot;, &amp;quot;Count&amp;quot;: 264 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$1.91M–$2.16M&amp;quot;, &amp;quot;Count&amp;quot;: 181 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$2.16M–$2.41M&amp;quot;, &amp;quot;Count&amp;quot;: 149 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$2.41M–$2.66M&amp;quot;, &amp;quot;Count&amp;quot;: 88 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$2.66M–$2.91M&amp;quot;, &amp;quot;Count&amp;quot;: 46 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$2.91M–$3.16M&amp;quot;, &amp;quot;Count&amp;quot;: 17 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$3.16M–$3.41M&amp;quot;, &amp;quot;Count&amp;quot;: 6 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$3.41M–$3.66M&amp;quot;, &amp;quot;Count&amp;quot;: 1 },
  { &amp;quot;Budget Range&amp;quot;: &amp;quot;$3.66M–$3.91M&amp;quot;, &amp;quot;Count&amp;quot;: 1 }
]
```

**Explanation:**

Budgets are **right-skewed**, with most projects under ~$1.5M. Percentile-based tiers ensure balanced groups despite skew.

---

### Complexity vs. Budget (Scatterplot – All Projects — Mean Complexity)

```scatterplot
[
  { &amp;quot;Budget&amp;quot;: 159356, &amp;quot;Mean Complexity Score&amp;quot;: 4.1 },
  { &amp;quot;Budget&amp;quot;: 408000, &amp;quot;Mean Complexity Score&amp;quot;: 3.9 },
  { &amp;quot;Budget&amp;quot;: 900000, &amp;quot;Mean Complexity Score&amp;quot;: 6.0 },
  { &amp;quot;Budget&amp;quot;: 1250000, &amp;quot;Mean Complexity Score&amp;quot;: 6.7 },
  { &amp;quot;Budget&amp;quot;: 2000000, &amp;quot;Mean Complexity Score&amp;quot;: 7.4 },
  { &amp;quot;Budget&amp;quot;: 3200000, &amp;quot;Mean Complexity Score&amp;quot;: 8.8 }
]
```

**Explanation:**

This scatterplot shows **mean complexity scores** grouped by representative budget bins, not all 4,000 records. It illustrates a **positive relationship** between project budget and complexity, motivating the use of tiers and inferential tests.

### Regression Trend – Budget vs. Complexity (Line)

```linechart
[
  { &amp;quot;Budget Estimate&amp;quot;: &amp;quot;≈$0.20M&amp;quot;, &amp;quot;Mean Complexity Score&amp;quot;: 4.0 },
  { &amp;quot;Budget Estimate&amp;quot;: &amp;quot;≈$0.80M&amp;quot;, &amp;quot;Mean Complexity Score&amp;quot;: 5.6 },
  { &amp;quot;Budget Estimate&amp;quot;: &amp;quot;≈$1.50M&amp;quot;, &amp;quot;Mean Complexity Score&amp;quot;: 6.8 },
  { &amp;quot;Budget Estimate&amp;quot;: &amp;quot;≈$2.20M&amp;quot;, &amp;quot;Mean Complexity Score&amp;quot;: 7.6 },
  { &amp;quot;Budget Estimate&amp;quot;: &amp;quot;≈$3.20M&amp;quot;, &amp;quot;Mean Complexity Score&amp;quot;: 8.6 }
]
```

**Explanation:**

The fitted trend indicates a **monotonic increase** in complexity with budget, supporting the stratification into tiers and motivating inferential testing.

---

### Complexity vs. Budget (Scatterplot – By Methodology — Mean Complexity per Tier)

```scatterplot
[
  { &amp;quot;x&amp;quot;: 450000, &amp;quot;y&amp;quot;: 4.5, &amp;quot;series&amp;quot;: &amp;quot;Agile&amp;quot; },
  { &amp;quot;x&amp;quot;: 800000, &amp;quot;y&amp;quot;: 5.8, &amp;quot;series&amp;quot;: &amp;quot;Agile&amp;quot; },
  { &amp;quot;x&amp;quot;: 1500000, &amp;quot;y&amp;quot;: 7.2, &amp;quot;series&amp;quot;: &amp;quot;Agile&amp;quot; },
  { &amp;quot;x&amp;quot;: 2800000, &amp;quot;y&amp;quot;: 8.9, &amp;quot;series&amp;quot;: &amp;quot;Agile&amp;quot; },

  { &amp;quot;x&amp;quot;: 450000, &amp;quot;y&amp;quot;: 3.7, &amp;quot;series&amp;quot;: &amp;quot;Non-Agile&amp;quot; },
  { &amp;quot;x&amp;quot;: 800000, &amp;quot;y&amp;quot;: 4.9, &amp;quot;series&amp;quot;: &amp;quot;Non-Agile&amp;quot; },
  { &amp;quot;x&amp;quot;: 1500000, &amp;quot;y&amp;quot;: 5.9, &amp;quot;series&amp;quot;: &amp;quot;Non-Agile&amp;quot; },
  { &amp;quot;x&amp;quot;: 2800000, &amp;quot;y&amp;quot;: 6.5, &amp;quot;series&amp;quot;: &amp;quot;Non-Agile&amp;quot; }
]
```

**Explanation:**

This scatterplot shows **mean complexity per budget tier** for Agile vs. Non‑Agile. Agile projects consistently show higher complexity at each representative budget level, highlighting methodology effects without visualizing all 4,000 underlying data points.

### Regression Trend – By Methodology (Line)

```linechart
[
  { &amp;quot;Budget Tier&amp;quot;: &amp;quot;Low (≤33rd)&amp;quot;, &amp;quot;Agile&amp;quot;: 4.670, &amp;quot;Non-Agile&amp;quot;: 3.982 },
  { &amp;quot;Budget Tier&amp;quot;: &amp;quot;Mid (33rd–67th)&amp;quot;, &amp;quot;Agile&amp;quot;: 6.667, &amp;quot;Non-Agile&amp;quot;: 5.436 },
  { &amp;quot;Budget Tier&amp;quot;: &amp;quot;High (&amp;gt;67th)&amp;quot;, &amp;quot;Agile&amp;quot;: 8.919, &amp;quot;Non-Agile&amp;quot;: 6.391 }
]
```

**Explanation:**

Methodology-specific trends **diverge** across tiers: **Agile** rises faster with budget than **Non‑Agile**, visually previewing the **interaction** confirmed by ANOVA.

---

### Project Count by Budget Tier

```barchart
[
  { &amp;quot;Budget Tier&amp;quot;: &amp;quot;Low (≤33rd)&amp;quot;, &amp;quot;Count&amp;quot;: 1334 },
  { &amp;quot;Budget Tier&amp;quot;: &amp;quot;Mid (33rd–67th)&amp;quot;, &amp;quot;Count&amp;quot;: 1333 },
  { &amp;quot;Budget Tier&amp;quot;: &amp;quot;High (&amp;gt;67th)&amp;quot;, &amp;quot;Count&amp;quot;: 1333 }
]
```

**Explanation:**

Counts are balanced across tiers, enabling meaningful comparisons in subsequent charts and the ANOVA.

---

### Mean Complexity by Tier (Agile vs. Non-Agile)

```barchart
[
  { &amp;quot;Budget Tier&amp;quot;: &amp;quot;Low (≤33rd)&amp;quot;, &amp;quot;Agile&amp;quot;: 4.670, &amp;quot;Non-Agile&amp;quot;: 3.982 },
  { &amp;quot;Budget Tier&amp;quot;: &amp;quot;Mid (33rd–67th)&amp;quot;, &amp;quot;Agile&amp;quot;: 6.667, &amp;quot;Non-Agile&amp;quot;: 5.436 },
  { &amp;quot;Budget Tier&amp;quot;: &amp;quot;High (&amp;gt;67th)&amp;quot;, &amp;quot;Agile&amp;quot;: 8.919, &amp;quot;Non-Agile&amp;quot;: 6.391 }
]
```

**Explanation:**

Compares **mean complexity** for **Agile** and **Non-Agile** within each tier. Agile is higher in every tier, with the largest difference at **High** budgets.

---

### Complexity Gap (Agile − Non-Agile)

```linechart
[
  { &amp;quot;Budget Tier&amp;quot;: &amp;quot;Low (≤33rd)&amp;quot;, &amp;quot;Gap&amp;quot;: 0.688 },
  { &amp;quot;Budget Tier&amp;quot;: &amp;quot;Mid (33rd–67th)&amp;quot;, &amp;quot;Gap&amp;quot;: 1.231 },
  { &amp;quot;Budget Tier&amp;quot;: &amp;quot;High (&amp;gt;67th)&amp;quot;, &amp;quot;Gap&amp;quot;: 2.528 }
]
```

**Explanation:**

The **gap widens** from Low to High tiers, implying methodology differences intensify as projects grow in size and scope.

---

## 🧩 Interpretation

1) **Budget tier main effect** — higher tiers correspond to higher complexity.

2) **Methodology main effect** — Agile has higher mean complexity.

3) **Interaction** — Agile’s advantage **increases** with budget tier.

**Budget vs. Complexity:** The histogram, scatterplots, and **trend lines** indicate a **right-skewed** budget distribution and a **positive association** between budget and complexity.

**Methodology Effect:** Across tiers and at similar budgets, **Agile** projects show **higher complexity** than Non-Agile, suggesting either selection (Agile chosen for difficult problems) or capability (Agile better supports uncertainty).

**Interaction Preview:** The tiered mean chart, **methodology-specific trend line**, and the widening gap line suggest a **methodology × budget interaction**, later tested via ANOVA.

**Two-Way ANOVA:** Results support three findings:

**Operational Implications**

**Staffing &amp; Skills:** High-tier initiatives need stronger **architecture runway**, **test automation**, and **product ownership**.

**Governance:** For Mid/High tiers, require **early validation** (spikes, dependency mapping) to prevent unnecessary scope inflation.

**Engineering Enablement:** Invest in **observability**, **feature flags**, and **progressive delivery** to manage complexity without slowing throughput.

---

## 🏁 Conclusion

**Budgets are right-skewed**; percentile tiers produce balanced groups suitable for comparison.

**Complexity rises with budget** across the portfolio.

**Agile projects are more complex** than Non-Agile at every tier, and the **difference grows** with budget.

The **two-way ANOVA** confirms significant **main effects** and a **significant interaction**, aligning with the visuals.

Portfolio policy should **match methodology to problem structure**:

**Agile** for high-uncertainty, integration-heavy, or evolving scopes.

**Non-Agile** for stable, well-specified, low-volatility work.

---

## ⏭️ Next Steps

**Post-hoc analysis:** Tukey HSD to identify which tier pairs differ. Include **effect sizes** (η² / partial η²).

**Assumptions:** Check residual normality and homoscedasticity (Levene’s). If violated, use **robust ANOVA** or **Kruskal–Wallis + Dunn’s**.

**Selection bias audit:** Model methodology choice from pre-project variables; consider **propensity score matching** before re-estimating effects.

**Outcome linkage:** Add delivery KPIs (cycle time, defect density, rework). Validate whether Agile’s higher complexity maintains or improves outcomes at Mid/High tiers.

**Sensitivity:** Re-tier at **25/50/75** and **20/40/60/80** to confirm robustness of direction and magnitude.

---

## 📁 Supporting Files

**Excel Summary Workbook:** [Download](/assets/files/M7.3%20Final%20Project%20Phase%203.xlsx)

---

## 🔗 Related Pages

[Analytics &amp; Insights](/analytics) — Portfolio of applied analytics projects

[Strategy &amp; Vision](/strategy) — How this analytical approach supports transformation initiatives

---

📋 *Detailed methodology and code snippets available upon request. [Let's connect](/contact).*