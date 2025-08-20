const e=`---
title: "Project Risk Analysis – Budget Tiers & Complexity"
description: "Percentile-based budget tiers (≤33rd, 33rd–67th, >67th) comparing Agile vs. Non-Agile complexity using two-way ANOVA insights."
tags: ["Analytics", "Project Analysis", "Risk Analysis", "Budget Analysis"]
---

## 💡 Problem Statement
The objective is to understand how **project budget** influences **project complexity** and whether **methodology** (Agile vs. Non-Agile) interacts with budget tier to affect complexity levels. A two-way ANOVA test was performed to evaluate main effects and interactions.

---

## 📊 Data Summary

- **Total Projects:** 4,000
- **Key Variables:**  
  - \`Project_Budget_USD\` → Defines Low / Mid / High tiers via 33rd and 67th percentiles.
  - \`Complexity_Score\` → Dependent variable (scale 0–10).
  - \`Methodology_Group\` → Agile vs. Non-Agile.

### Budget Tiers and Summary Statistics

| **Budget Tier**     | **Budget Range (USD)**          | **Project Count** | **Mean Complexity (Agile)** | **Mean Complexity (Non-Agile)** |
|---------------------|---------------------------------|-------------------|------------------------------|----------------------------------|
| Low (≤33rd)         | $159,355.55 – $790,000.26       | 1,334             | 4.670                        | 3.982                            |
| Mid (33rd–67th)     | $790,000.26 – $1,279,552.09     | 1,333             | 6.667                        | 5.436                            |
| High (>67th)        | $1,279,552.09 – $3,768,354.37   | 1,333             | 8.919                        | 6.391                            |

---

## 📈 Visualizations

### Project Count by Budget Tier

\`\`\`barchart
[
  { "date": "Low (≤33rd)", "value": 1334 },
  { "date": "Mid (33rd–67th)", "value": 1333 },
  { "date": "High (>67th)", "value": 1333 }
]
\`\`\`

**Explanation:**  
Projects are evenly distributed across Low, Mid, and High tiers (~1,333 each), ensuring balanced comparisons without bias toward any single group.

---

### Mean Complexity by Tier (Agile vs Non-Agile)

\`\`\`barchart
[
  { "date": "Low (≤33rd)", "Agile": 4.670, "Non-Agile": 3.982 },
  { "date": "Mid (33rd–67th)", "Agile": 6.667, "Non-Agile": 5.436 },
  { "date": "High (>67th)", "Agile": 8.919, "Non-Agile": 6.391 }
]
\`\`\`

**Explanation:**  
Displays **mean complexity** for **Agile** and **Non-Agile** projects across budget tiers:
- Agile projects consistently show higher complexity in all tiers.
- The difference grows from **+0.69** at Low budgets to **+2.53** at High budgets.
- Indicates Agile is more frequently chosen—or better suited—for higher-complexity efforts.

---

### Complexity Gap by Tier

\`\`\`linechart
[
  { "date": "Low (≤33rd)", "Gap": 0.688 },
  { "date": "Mid (33rd–67th)", "Gap": 1.231 },
  { "date": "High (>67th)", "Gap": 2.528 }
]
\`\`\`

**Explanation:**  
Shows the **difference** between Agile and Non-Agile mean complexity per tier. The widening gap indicates Agile’s role in addressing more complex projects at higher budget levels.

---

## 🧠 Interpretation

### Two-Way ANOVA Findings
A two-way ANOVA tested the effects of **budget tier**, **methodology**, and their interaction on **project complexity**:

- **Main Effect of Budget Tier:** Significant → Higher budgets strongly correlate with higher complexity.
- **Main Effect of Methodology:** Significant → Agile projects are consistently more complex than Non-Agile.
- **Interaction Effect:** Significant → Agile’s complexity advantage widens at higher tiers.

### Key Insights
1. **Complexity Increases with Budget:** Higher budgets consistently mean higher complexity for all methodologies.
2. **Agile Handles More Complex Work:** Agile projects demonstrate higher complexity in all tiers.
3. **Methodology Interaction Matters:** Agile’s complexity advantage becomes most pronounced for High-budget projects.

### Operational Implications
- **Staffing:** High-tier Agile projects require advanced architecture, test automation, and deeper technical skill sets.
- **Governance:** Mid/High tiers benefit from early risk validation, dependency mapping, and strong portfolio oversight.
- **Tooling:** Invest in observability, feature flagging, and automated testing to support scaling Agile under high complexity.

---

## ✅ Conclusion

1. Budget and project complexity are **strongly positively correlated**.
2. Agile projects are consistently more complex than Non-Agile, with the largest gaps at higher budgets.
3. The two-way ANOVA confirms a **significant interaction**: Agile’s advantage grows as budgets increase.
4. Methodology selection should be aligned with project characteristics:
   - **Agile** for uncertain, high-integration, or high-risk efforts.
   - **Non-Agile** for stable, low-risk, and well-defined scopes.

---

## ⏭️ Next Steps

### Statistical Extensions
- **Post-Hoc Tests:** Apply Tukey HSD to analyze pairwise differences among budget tiers.
- **Effect Sizes:** Report η² and partial η² for clarity on magnitude of impacts.

### Sensitivity Analyses
- Test alternate tier thresholds (**25/50/75**, **20/40/60/80**) to confirm robustness of results.

### Predictive Modeling
- Build a logistic regression to predict **methodology selection** based on pre-project characteristics.

### Delivery Metrics Integration
- Extend analysis to assess delivery outcomes like cycle time, defect density, and rework.
- Validate if Agile’s higher complexity correlates with equal or better delivery performance at Mid/High tiers.

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
