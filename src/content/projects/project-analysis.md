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

Budgets are **right-skewed**, with most projects under ~$1.5M. Percentile-based tiers ensure balanced groups despite skew.

---

### Complexity vs. Budget (Scatterplot – All Projects — Mean Complexity)

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

This scatterplot shows **mean complexity scores** grouped by representative budget bins, not all 4,000 records. It illustrates a **positive relationship** between project budget and complexity, motivating the use of tiers and inferential tests.

### Regression Trend – Budget vs. Complexity (Line)

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

The fitted trend indicates a **monotonic increase** in complexity with budget, supporting the stratification into tiers and motivating inferential testing.

---

### Complexity vs. Budget (Scatterplot – By Methodology — Mean Complexity per Tier)

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

This scatterplot shows **mean complexity per budget tier** for Agile vs. Non‑Agile. Agile projects consistently show higher complexity at each representative budget level, highlighting methodology effects without visualizing all 4,000 underlying data points.

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