const e=`---
title: "Project Risk Analysis – Budget Tiers & Complexity"
description: "Percentile-based budget tiers (≤33rd, 33rd–67th, >67th) comparing Agile vs. Non-Agile complexity with pre-ANOVA visuals and two-way ANOVA insights."
tags: ["Analytics", "Project Analysis", "Risk Analysis", "Budget Analysis"]
---

## 💡 Problem Statement
Determine how **project budget** relates to **project complexity** and whether **methodology** (Agile vs. Non-Agile) interacts with budget tier to influence complexity. A two-way ANOVA evaluates main effects and the interaction between budget tier and methodology.

---

## 📊 Data Summary

- **Total Projects:** 4,000
- **Key Variables:**  
  - \`Project_Budget_USD\` → Defines tiers via 33rd and 67th percentiles (Low / Mid / High).  
  - \`Complexity_Score\` → 0–10 scale (dependent variable).  
  - \`Methodology_Group\` → Agile vs. Non-Agile.

### Budget Tiers and Summary Statistics

| **Budget Tier**     | **Budget Range (USD)**          | **Project Count** | **Mean Complexity (Agile)** | **Mean Complexity (Non-Agile)** |
|---------------------|---------------------------------|-------------------|------------------------------|----------------------------------|
| Low (≤33rd)         | $159,355.55 – $790,000.26       | 1,334             | 4.670                        | 3.982                            |
| Mid (33rd–67th)     | $790,000.26 – $1,279,552.09     | 1,333             | 6.667                        | 5.436                            |
| High (>67th)        | $1,279,552.09 – $3,768,354.37   | 1,333             | 8.919                        | 6.391                            |

---

## 📈 Visualizations

### Budget Distribution (Histogram)

\`\`\`histogram
[
  { "date": "$0.16M–$0.40M", "value": 189 },
  { "date": "$0.40M–$0.66M", "value": 701 },
  { "date": "$0.66M–$0.91M", "value": 818 },
  { "date": "$0.91M–$1.16M", "value": 672 },
  { "date": "$1.16M–$1.41M", "value": 517 },
  { "date": "$1.41M–$1.65M", "value": 350 },
  { "date": "$1.65M–$1.91M", "value": 264 },
  { "date": "$1.91M–$2.16M", "value": 181 },
  { "date": "$2.16M–$2.41M", "value": 149 },
  { "date": "$2.41M–$2.66M", "value": 88 },
  { "date": "$2.66M–$2.91M", "value": 46 },
  { "date": "$2.91M–$3.16M", "value": 17 },
  { "date": "$3.16M–$3.41M", "value": 6 },
  { "date": "$3.41M–$3.66M", "value": 1 },
  { "date": "$3.66M–$3.91M", "value": 1 }
]
\`\`\`

**Explanation:**  
Budgets are **right-skewed**, with most projects under ~$1.5M. Percentile-based tiers ensure balanced groups despite skew.

---

### Complexity vs. Budget (Scatterplot – All Projects)

\`\`\`scattertrend
[
  { "x": 159356, "y": 4.1 },
  { "x": 408000, "y": 3.9 },
  { "x": 900000, "y": 6.0 },
  { "x": 1250000, "y": 6.7 },
  { "x": 2000000, "y": 7.4 },
  { "x": 3200000, "y": 8.8 }
]
\`\`\`

**Explanation:**  
Shows a **positive relationship** between budget and complexity, motivating the use of tiers and inferential tests.
### Regression Trend – Budget vs. Complexity (Line)

\`\`\`linechart
[
  { "date": "≈$0.20M", "All Projects": 4.0 },
  { "date": "≈$0.80M", "All Projects": 5.6 },
  { "date": "≈$1.50M", "All Projects": 6.8 },
  { "date": "≈$2.20M", "All Projects": 7.6 },
  { "date": "≈$3.20M", "All Projects": 8.6 }
]
\`\`\`

**Explanation:**  
The fitted trend indicates a **monotonic increase** in complexity with budget, supporting the stratification into tiers and motivating inferential testing.


---

### Complexity vs. Budget (Scatterplot – By Methodology)

\`\`\`scattertrend
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
\`\`\`

**Explanation:**  
At comparable budgets, **Agile** points tend to have **higher complexity** than **Non-Agile**, previewing the methodology effect and eventual interaction.
### Regression Trend – By Methodology (Line)

\`\`\`linechart
[
  { "date": "Low (≤33rd)",  "Agile": 4.670, "Non-Agile": 3.982 },
  { "date": "Mid (33rd–67th)", "Agile": 6.667, "Non-Agile": 5.436 },
  { "date": "High (>67th)", "Agile": 8.919, "Non-Agile": 6.391 }
]
\`\`\`

**Explanation:**  
Methodology-specific trends **diverge** across tiers: **Agile** rises faster with budget than **Non‑Agile**, visually previewing the **interaction** confirmed by ANOVA.


---

### Project Count by Budget Tier

\`\`\`barchart
[
  { "date": "Low (≤33rd)", "value": 1334 },
  { "date": "Mid (33rd–67th)", "value": 1333 },
  { "date": "High (>67th)", "value": 1333 }
]
\`\`\`

**Explanation:**  
Counts are balanced across tiers, enabling meaningful comparisons in subsequent charts and the ANOVA.

---

### Mean Complexity by Tier (Agile vs. Non-Agile)

\`\`\`barchart
[
  { "date": "Low (≤33rd)", "Agile": 4.670, "Non-Agile": 3.982 },
  { "date": "Mid (33rd–67th)", "Agile": 6.667, "Non-Agile": 5.436 },
  { "date": "High (>67th)", "Agile": 8.919, "Non-Agile": 6.391 }
]
\`\`\`

**Explanation:**  
Compares **mean complexity** for **Agile** and **Non-Agile** within each tier. Agile is higher in every tier, with the largest difference at **High** budgets.

---

### Complexity Gap (Agile − Non-Agile)

\`\`\`linechart
[
  { "date": "Low (≤33rd)", "Gap": 0.688 },
  { "date": "Mid (33rd–67th)", "Gap": 1.231 },
  { "date": "High (>67th)", "Gap": 2.528 }
]
\`\`\`

**Explanation:**  
The **gap widens** from Low to High tiers, implying methodology differences intensify as projects grow in size and scope.

---

## 🧠 Interpretation

- **Budget vs. Complexity:** The histogram, scatterplots, and **trend lines** indicate a **right-skewed** budget distribution and a **positive association** between budget and complexity.  
- **Methodology Effect:** Across tiers and at similar budgets, **Agile** projects show **higher complexity** than Non-Agile, suggesting either selection (Agile chosen for difficult problems) or capability (Agile better supports uncertainty).  
- **Interaction Preview:** The tiered mean chart, **methodology-specific trend line**, and the widening gap line suggest a **methodology × budget interaction**, later tested via ANOVA.  
- **Two-Way ANOVA:** Results support three findings:  
  1) **Budget tier main effect** — higher tiers correspond to higher complexity.  
  2) **Methodology main effect** — Agile has higher mean complexity.  
  3) **Interaction** — Agile’s advantage **increases** with budget tier.

**Operational Implications**  
- **Staffing & Skills:** High-tier initiatives need stronger **architecture runway**, **test automation**, and **product ownership**.  
- **Governance:** For Mid/High tiers, require **early validation** (spikes, dependency mapping) to prevent unnecessary scope inflation.  
- **Engineering Enablement:** Invest in **observability**, **feature flags**, and **progressive delivery** to manage complexity without slowing throughput.

---

## ✅ Conclusion

1. **Budgets are right-skewed**; percentile tiers produce balanced groups suitable for comparison.  
2. **Complexity rises with budget** across the portfolio.  
3. **Agile projects are more complex** than Non-Agile at every tier, and the **difference grows** with budget.  
4. The **two-way ANOVA** confirms significant **main effects** and a **significant interaction**, aligning with the visuals.  
5. Portfolio policy should **match methodology to problem structure**:  
   - **Agile** for high-uncertainty, integration-heavy, or evolving scopes.  
   - **Non-Agile** for stable, well-specified, low-volatility work.

---

## ⏭️ Next Steps

- **Post-hoc analysis:** Tukey HSD to identify which tier pairs differ. Include **effect sizes** (η² / partial η²).  
- **Assumptions:** Check residual normality and homoscedasticity (Levene’s). If violated, use **robust ANOVA** or **Kruskal–Wallis + Dunn’s**.  
- **Selection bias audit:** Model methodology choice from pre-project variables; consider **propensity score matching** before re-estimating effects.  
- **Outcome linkage:** Add delivery KPIs (cycle time, defect density, rework). Validate whether Agile’s higher complexity maintains or improves outcomes at Mid/High tiers.  
- **Sensitivity:** Re-tier at **25/50/75** and **20/40/60/80** to confirm robustness of direction and magnitude.

---

## 📂 Supporting Files

- **Excel Summary Workbook:** [Download](/assets/files/M7.3%20Final%20Project%20Phase%203.xlsx)

---

## 🔗 Related Pages

- [Analytics & Insights](/#/analytics) — Portfolio of applied analytics projects  
- [Strategy & Vision](/#/strategy) — How this analytical approach supports transformation initiatives  

---

📋 *Detailed methodology and code snippets available upon request. [Let's connect](/#/contact).*


`;export{e as default};
