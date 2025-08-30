---
title: "Project Method Analysis – Budget Tiers & Complexity"
description: "Percentile-based budget tiers (≤33rd, 33rd–67th, >67th) comparing Agile vs. Non-Agile complexity with pre-ANOVA visuals and two-way ANOVA insights."
author: "Roger Lee Cormier"
date: "2025-08-30"
tags: ["Analytics", "Project Method Analysis", "Risk Analysis", "Budget Analysis"]
---

## 📝 Project Overview

This project analyzes a dataset of 4,000 real-world project records to explore how budget correlates with project complexity. The goal is to surface patterns in budget allocation across projects and visualize how often projects fall into specific budget tiers.

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

**High (>67th percentile):** Largest third

This approach balances group sizes despite the right-skewed distribution, ensuring fair comparisons of complexity and methodology across budget levels.

## 📊 Summary Statistics

| **Budget Tier** | **Budget Range (USD)** | **Project Count** | **Mean Complexity (Agile)** | **Mean Complexity (Non-Agile)** |
|---|---|---|---|---|
| Low (≤33rd) | $159,355.55 – $790,000.26 | 1,334 | 4.670 | 3.982 |
| Mid (33rd–67th) | $790,000.26 – $1,279,552.09 | 1,333 | 6.667 | 5.436 |
| High (>67th) | $1,279,552.09 – $3,768,354.37 | 1,333 | 8.919 | 6.391 |

---

## 📉 Visualizations

### Budget Distribution (Histogram)

```histogram
[
  { 
```

**Explanation:**

Budgets are **right-skewed**, with most projects under ~$1.5M. Percentile-based tiers ensure balanced groups despite skew.

---

### Complexity vs. Budget (Scatterplot – All Projects — Mean Complexity)

```scatterplot
[
  { 
```

**Explanation:**

This scatterplot shows **mean complexity scores** grouped by representative budget bins, not all 4,000 records. It illustrates a **positive relationship** between project budget and complexity, motivating the use of tiers and inferential tests.

### Regression Trend – Budget vs. Complexity (Line)

```linechart
[
  { 
```

**Explanation:**

The fitted trend indicates a **monotonic increase** in complexity with budget, supporting the stratification into tiers and motivating inferential testing.

---

### Complexity vs. Budget (Scatterplot – By Methodology — Mean Complexity per Tier)

```scatterplot
[
  { 
```

**Explanation:**

This scatterplot shows **mean complexity per budget tier** for Agile vs. Non‑Agile. Agile projects consistently show higher complexity at each representative budget level, highlighting methodology effects without visualizing all 4,000 underlying data points.

### Regression Trend – By Methodology (Line)

67th)", "Agile": 8.919, "Non-Agile": 6.391 }
]" charttitle="" xaxislabel="" yaxislabel="" width="100%" height="320px" data-type="chart" data-chart-type="linechart" data-chart-data="[
  { "Budget Tier": "Low (≤33rd)", "Agile": 4.670, "Non-Agile": 3.982 },
  { "Budget Tier": "Mid (33rd–67th)", "Agile": 6.667, "Non-Agile": 5.436 },
  { "Budget Tier": "High (>67th)", "Agile": 8.919, "Non-Agile": 6.391 }
]" data-chart-title="" data-chart-x-axis-label="" data-chart-y-axis-label="" data-chart-width="100%" data-chart-height="320px">**Explanation:**

Methodology-specific trends **diverge** across tiers: **Agile** rises faster with budget than **Non‑Agile**, visually previewing the **interaction** confirmed by ANOVA.

---

### Project Count by Budget Tier

67th)", "Count": 1333 }
]" charttitle="" xaxislabel="" yaxislabel="" width="100%" height="320px" data-type="chart" data-chart-type="barchart" data-chart-data="[
  { "Budget Tier": "Low (≤33rd)", "Count": 1334 },
  { "Budget Tier": "Mid (33rd–67th)", "Count": 1333 },
  { "Budget Tier": "High (>67th)", "Count": 1333 }
]" data-chart-title="" data-chart-x-axis-label="" data-chart-y-axis-label="" data-chart-width="100%" data-chart-height="320px">**Explanation:**

Counts are balanced across tiers, enabling meaningful comparisons in subsequent charts and the ANOVA.

---

### Mean Complexity by Tier (Agile vs. Non-Agile)

67th)", "Agile": 8.919, "Non-Agile": 6.391 }
]" charttitle="" xaxislabel="" yaxislabel="" width="100%" height="320px" data-type="chart" data-chart-type="barchart" data-chart-data="[
  { "Budget Tier": "Low (≤33rd)", "Agile": 4.670, "Non-Agile": 3.982 },
  { "Budget Tier": "Mid (33rd–67th)", "Agile": 6.667, "Non-Agile": 5.436 },
  { "Budget Tier": "High (>67th)", "Agile": 8.919, "Non-Agile": 6.391 }
]" data-chart-title="" data-chart-x-axis-label="" data-chart-y-axis-label="" data-chart-width="100%" data-chart-height="320px">**Explanation:**

Compares **mean complexity** for **Agile** and **Non-Agile** within each tier. Agile is higher in every tier, with the largest difference at **High** budgets.

---

### Complexity Gap (Agile − Non-Agile)

67th)", "Gap": 2.528 }
]" charttitle="" xaxislabel="" yaxislabel="" width="100%" height="320px" data-type="chart" data-chart-type="linechart" data-chart-data="[
  { "Budget Tier": "Low (≤33rd)", "Gap": 0.688 },
  { "Budget Tier": "Mid (33rd–67th)", "Gap": 1.231 },
  { "Budget Tier": "High (>67th)", "Gap": 2.528 }
]" data-chart-title="" data-chart-x-axis-label="" data-chart-y-axis-label="" data-chart-width="100%" data-chart-height="320px">**Explanation:**

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

**Staffing & Skills:** High-tier initiatives need stronger **architecture runway**, **test automation**, and **product ownership**.

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

[Analytics & Insights](/analytics) — Portfolio of applied analytics projects

[Strategy & Vision](/strategy) — How this analytical approach supports transformation initiatives

---

📋 *Detailed methodology and code snippets available upon request. [Let's connect](/contact).*