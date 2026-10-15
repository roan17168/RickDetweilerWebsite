# 🏛️ Master Architecture, Technical Specification & Agent Execution Guide
**Project:** *What College Is Really For*  
**Research & Authority Foundation:** Richard A. Detweiler, *The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment* (MIT Press, 2021)  
**Governance Release:** October 12, 2026 Definitive Revision  
**Platform Target:** Vanilla HTML5 / CSS3 / ES6 JavaScript · VS Code / GitHub Pages Static Hosting  

---

## 1. System Overview & Core Technical Contract

### A. Core Stack & Architecture
* **Stack:** Static Multi-Page Web Application using pure Vanilla HTML5, CSS3, and modern Vanilla ES6 JavaScript (Zero frontend framework dependencies, zero build steps required).
* **Target Environment:** VS Code / GitHub Codespaces / GitHub Pages (`username.github.io/repo/` or root custom domain).
* **Global Navigation:** 10 core HTML pages linking relatively. Header contains brand title, navigation links, and a touch/hover accessible "Perspectives" dropdown menu.
* **Responsive Layout:** Phone-First progressive disclosure. On screens `< 600px`, data tables automatically transform into stacked card views using CSS pseudo-elements (`data-label`).
* **Design System Palette:**
  * **Primary Navy (Deep Academic / Oxford):** `#1b365d`
  * **Secondary Navy (Slate / Headings):** `#2c3e50`
  * **Accent Gold (Interactive / Highlights):** `#d4af37` (Hover: `#b89628`, Light Tint: `#faf5e4`)
  * **Background Parchment:** `#fdfcfb`
  * **Surface Cards:** `#ffffff` (Alt Surface: `#f8fafc`)
  * **Text Charcoal:** `#2e4053` (Muted: `#596a7a`)
  * **Border:** `#e2e8f0`
  * **Button Radius:** `50px` (Pill format across triggers, controls, and modal navigation).

---

## 2. Directory Tree & File Inventory

```
root/
├── index.html                  # Homepage: Hero, 6-card Decision Hub, 3 Findings, 6 Outcomes (G5)
├── choosing-a-college.html     # High School: Cost Reality, First-Gen Guide, Scorecard Tool
├── in-college.html             # Undergraduates: 5 Move Cards, When Hard, One-Semester Plan Tool
├── parents.html                # Parents: Cost, Junior/Senior Timeline, Loan Guide, Questions
├── faculty.html                # Faculty: 5 Practice Cards, Context Variations, Course Audit Tool
├── college-leaders.html        # Leaders: Retention Case, Case Studies, Health Checklist Tool
├── policymakers.html           # Policymakers: 3 Foundations, Federal Floor, Policy Brief Tool
├── understanding-college.html  # Context: Taxonomy, Timeline (G2), Misconceptions, Employers (G4)
├── the-research.html           # Methodology: 1,000 Interviews, Breadth (G1), Limits, Table 17 Matrix
├── about.html                  # Biography: Rick Detweiler, HigherEdImpact, MIT Press CTA, Contact
├── styles.css                  # Master CSS Design System, Mobile Card Engine, Modal, Tools, Print
└── main.js                     # Master JS Engine, 6 Quizzes, Auto-advance, State, Tool Handlers
```

---

## 3. Strict Research & Metric Guidelines (Appendix A Compliance)

Any code or text modification made by the agent **must adhere strictly** to the following factual assertions:
1. **Study Methodology:** Always cite as **"Interviews with 1,000 college graduates, ages 25 to 65, from every kind of college."** Never say "tracked 1,000 graduates over 40–50 years."
2. **Causal Claims:** Observational data requires non-causal language: use **"linked to"**, **"related to"**, **"more likely"**. Never use "proves", "guarantees", or "causes".
3. **Earnings Breadth Metric (Graphic G1):** Taking $>50\%$ of courses outside the major is linked to a **24% greater likelihood of higher adult income** overall (**33%** for graduates from lower-income families; **34%** for those with lower entrance test scores). These represent *probabilities* (relative incident risk ratios), not dollar sums.
4. **Fulfillment Metric:** Coursework examining argument weak points $\rightarrow$ **149% more likely** to report fulfilled lives. Discussing philosophical/ethical questions in most classes $\rightarrow$ **59% more likely**. Knowing first names $\rightarrow$ **67% more likely**.
5. **Workforce Mobility Metric (Graphic G6):** **"Americans now in their early forties had already held an average of 9.4 jobs by age 38"** (Bureau of Labor Statistics NLSY97, 2026). Do not cite "career changes."
6. **Skills Forecast:** **"The World Economic Forum expects nearly 40% of the skills used at work to change by 2030."**
7. **Second Outcome Title:** Always use **"Civic Involvement"** (*Student Profile: "The Community Builder"*). Note: Voting was measured but not linked to college experiences; giving and volunteering were.
8. **Faculty Mentorship Metric (Graphic G3):** 45% of graduates of colleges under 5,000 students reported professors cared about them as a person vs. 24% at larger institutions (Gallup-Strada).

---

## 4. JavaScript Engine & State Machine Contract (`main.js`)

### Global Function Exposing (`window.*`)
To prevent `ReferenceError` crashes when HTML elements trigger inline `onclick` handlers, all runtime methods must remain bound to `window.*`:
* `window.initQuiz(audienceName)`: Initializes quiz, resets state, activates modal.
* `window.selectQuizOption(optionIndex)`: Selects answer, highlights DOM element, auto-advances after `260ms`.
* `window.toggleOptionalPanel(index)`: Toggles multi-select checkboxes for optional advice panels.
* `window.prevQuizStep()`: Step back navigation across questions, tie-breakers, and results.
* `window.showQuizResults()`: Tally algorithm, triggers tie-breaker if needed, renders result blocks.
* `window.resolveTie(mappingTag)`: Resolves ties from bonus question.
* `window.closeQuizModal()`: Hides overlay and restores body scroll.
* `window.printToolReport(elementId)`: Clones form element, converts inputs to plain text spans, and launches clean print dialog.
* `window.copyToolToClipboard(elementId)`: Formats and copies text content to clipboard with `.btn-copied` feedback.
* `window.clearToolData(elementId)`: Resets tool fields and wipes corresponding `localStorage` entries.

### Quiz Scoring Systems:
1. **Outcome Plurality (`Choosing a College`):** 5 questions mapping to `Leadership (L)`, `Civic Involvement (C)`, `Continued Learning (K)`, `Cultural Involvement (A)`, `Fulfillment (F)`, or `Personal Success (S)`. Tied outcomes trigger a bonus question filtered to tied categories.
2. **Points Banding (`In College`, `Faculty`):** Options scored as `Strong (2 pts)`, `Partway (1 pt)`, `Not yet (0 pts)`.
   * *In College Bands:* 8–10 (Part that lasts), 4–7 (Partway there), 0–3 (Classes only).
   * *Faculty Bands:* 8–10 (Relationships), 4–7 (Some of this), 0–3 (Content only).
3. **Plurality Stances (`Parents`, `College Leaders`, `Policymakers`):**
   * *Parents:* Security, Growth, Purpose.
   * *College Leaders:* Market-First, Mission-First, Experience-First.
   * *Policymakers:* Workforce-First, Civic-First, Resilience-First.
   * Two-way ties display both profiles stacked vertically.

---

## 5. Master Production Source Code

### File: `styles.css`
```css
/* ==========================================================================
   WHAT COLLEGE IS REALLY FOR - MASTER STYLESHEET
   Based on Richard A. Detweiler, The Evidence Liberal Arts Needs (MIT Press, 2021)
   Definitive Revision: October 2026
   ========================================================================== */

:root {
  --primary-navy: #1b365d;
  --secondary-navy: #2c3e50;
  --navy-light: #3a536b;
  --accent-gold: #d4af37;
  --accent-gold-hover: #b89628;
  --accent-gold-light: #faf5e4;
  --bg-parchment: #fdfcfb;
  --bg-surface: #ffffff;
  --bg-surface-alt: #f8fafc;
  --text-charcoal: #2e4053;
  --text-muted: #596a7a;
  --border-muted: #e2e8f0;
  --border-focus: #1b365d;
  --overlay-bg: rgba(15, 23, 30, 0.85);

  --font-serif: "Lora", "Georgia", "Times New Roman", serif;
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --radius-pill: 50px;
  --radius-card: 12px;
  --radius-modal: 12px;
  --shadow-subtle: 0 4px 14px rgba(27, 54, 93, 0.06);
  --shadow-elevated: 0 12px 30px rgba(27, 54, 93, 0.12);
  --transition-smooth: all 0.25s ease-in-out;

  --max-width-content: 1140px;
  --max-width-reading: 780px;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-parchment);
  color: var(--text-charcoal);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

img { max-width: 100%; height: auto; display: block; }

a {
  color: var(--primary-navy);
  text-decoration: underline;
  transition: var(--transition-smooth);
}
a:hover, a:focus { color: var(--accent-gold-hover); }

p { margin-bottom: 1.25rem; }

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-serif);
  color: var(--primary-navy);
  line-height: 1.25;
  margin-bottom: 1rem;
  font-weight: 700;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 1.9rem; }
h3 { font-size: 1.4rem; }
h4 { font-size: 1.15rem; }

.container { width: 92%; max-width: var(--max-width-content); margin: 0 auto; }
.reading-container { width: 92%; max-width: var(--max-width-reading); margin: 0 auto; }

.section-label {
  display: inline-block;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--accent-gold-hover);
  margin-bottom: 0.5rem;
}

.btn, .gold-btn, .navy-btn, .quiz-trigger-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 2rem;
  border-radius: var(--radius-pill);
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border: 2px solid transparent;
  cursor: pointer;
  transition: var(--transition-smooth);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.gold-btn, .btn-primary {
  background-color: var(--accent-gold);
  color: var(--primary-navy);
  border-color: var(--accent-gold);
}
.gold-btn:hover, .btn-primary:hover {
  background-color: var(--accent-gold-hover);
  border-color: var(--accent-gold-hover);
  color: #ffffff;
  transform: translateY(-2px);
}

.navy-btn, .btn-secondary {
  background-color: var(--primary-navy);
  color: #ffffff;
  border-color: var(--primary-navy);
}
.navy-btn:hover, .btn-secondary:hover {
  background-color: var(--secondary-navy);
  border-color: var(--secondary-navy);
  color: var(--accent-gold);
  transform: translateY(-2px);
}

.btn-outline {
  background-color: transparent;
  color: var(--primary-navy);
  border-color: var(--primary-navy);
}
.btn-outline:hover {
  background-color: var(--primary-navy);
  color: #ffffff;
}

.site-header {
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-muted);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  width: 92%;
  max-width: var(--max-width-content);
  margin: 0 auto;
}

.brand-logo {
  font-family: var(--font-serif);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--primary-navy);
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
}

.nav-links a {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--secondary-navy);
  text-decoration: none;
  padding: 0.35rem 0;
}

.nav-links a:hover, .nav-links a.active {
  color: var(--primary-navy);
  font-weight: 600;
}

.dropdown { position: relative; display: inline-block; }
.dropbtn {
  background: none;
  border: none;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--secondary-navy);
  cursor: pointer;
  padding: 0.35rem 0;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.dropbtn:hover { color: var(--primary-navy); font-weight: 600; }

.dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--bg-surface);
  min-width: 210px;
  box-shadow: var(--shadow-elevated);
  border: 1px solid var(--border-muted);
  border-radius: 8px;
  padding: 0.5rem 0;
  z-index: 1001;
}

.dropdown-content a {
  display: block;
  padding: 0.6rem 1.25rem;
  color: var(--text-charcoal);
  font-size: 0.9rem;
  text-decoration: none;
}
.dropdown-content a:hover {
  background-color: var(--bg-surface-alt);
  color: var(--primary-navy);
  font-weight: 600;
}
.dropdown:hover .dropdown-content { display: block; }

.mobile-toggle {
  display: none;
  font-size: 1.4rem;
  color: var(--primary-navy);
  cursor: pointer;
  padding: 0.25rem;
}

.home-hero {
  padding: 4.5rem 0 3.5rem;
  text-align: center;
  background: linear-gradient(180deg, #ffffff 0%, var(--bg-parchment) 100%);
  border-bottom: 1px solid var(--border-muted);
}
.home-hero h1 { font-size: 2.85rem; max-width: 860px; margin: 0 auto 1.25rem; }
.home-hero .hero-subhead { font-size: 1.25rem; color: var(--text-charcoal); max-width: 720px; margin: 0 auto 1.75rem; }
.home-hero .quiz-prompt-pill {
  display: inline-block;
  background-color: var(--accent-gold-light);
  border: 1px solid var(--accent-gold);
  color: var(--primary-navy);
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-pill);
  font-size: 0.95rem;
  font-weight: 600;
}

.decision-hub-section { padding: 4rem 0; }
.decision-hub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.75rem;
  margin-top: 1.5rem;
}

.audience-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-muted);
  border-radius: var(--radius-card);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-subtle);
  transition: var(--transition-smooth);
}
.audience-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-elevated);
  border-color: var(--accent-gold);
}
.card-icon { font-size: 1.85rem; color: var(--accent-gold-hover); margin-bottom: 1rem; }
.card-hook { font-size: 1.05rem; font-style: italic; color: var(--text-charcoal); margin-bottom: 0; }
.card-btn { width: 100%; padding: 0.75rem 1.5rem; margin-top: 1rem; }

.findings-section {
  padding: 4rem 0;
  background-color: var(--bg-surface);
  border-top: 1px solid var(--border-muted);
  border-bottom: 1px solid var(--border-muted);
}
.findings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
.finding-card {
  background-color: var(--bg-parchment);
  border: 1px solid var(--border-muted);
  border-radius: var(--radius-card);
  padding: 1.85rem;
}
.finding-num {
  font-family: var(--font-serif);
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--accent-gold);
  line-height: 1;
  margin-bottom: 0.75rem;
}

.outcomes-section { padding: 4rem 0; }
.outcomes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;
  margin-top: 2rem;
}
.outcome-box {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-muted);
  border-radius: var(--radius-card);
  padding: 1.5rem 1rem;
  text-align: center;
  box-shadow: var(--shadow-subtle);
}
.outcome-icon { font-size: 1.8rem; color: var(--primary-navy); margin-bottom: 0.75rem; }
.outcome-title { font-family: var(--font-serif); font-size: 1.1rem; font-weight: 700; color: var(--primary-navy); }
.outcome-desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0; }

.closing-panel {
  background-color: var(--primary-navy);
  color: #ffffff;
  border-radius: var(--radius-card);
  padding: 3.5rem 2.5rem;
  margin: 3.5rem 0;
  text-align: center;
  box-shadow: var(--shadow-elevated);
}
.closing-panel h2 { color: var(--accent-gold); font-size: 2.2rem; margin-bottom: 1.25rem; }
.closing-panel p { font-size: 1.12rem; line-height: 1.75; max-width: 780px; margin: 0 auto 1.25rem; color: #f1f5f9; }
.closing-panel p.punchline { font-family: var(--font-serif); font-size: 1.35rem; font-weight: 700; color: var(--accent-gold); margin-top: 1.5rem; margin-bottom: 0; }

.meaningful-life-block {
  background-color: var(--accent-gold-light);
  border-left: 5px solid var(--accent-gold);
  border-radius: 0 var(--radius-card) var(--radius-card) 0;
  padding: 2rem;
  margin: 2.5rem 0;
}
.stat-callout-g6 { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1rem; }
.stat-big-number { font-family: var(--font-serif); font-size: 3.2rem; font-weight: 700; color: var(--primary-navy); line-height: 1; }
.stat-big-caption { font-size: 1rem; font-weight: 600; color: var(--secondary-navy); }

details.accordion-item {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-muted);
  border-radius: var(--radius-card);
  margin-bottom: 1rem;
  overflow: hidden;
  transition: var(--transition-smooth);
}
details.accordion-item[open] { box-shadow: var(--shadow-subtle); border-color: var(--primary-navy); }
details.accordion-item summary {
  padding: 1.15rem 1.5rem;
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--primary-navy);
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}
details.accordion-item summary::-webkit-details-marker { display: none; }
details.accordion-item summary::after { content: "+"; font-family: var(--font-sans); font-size: 1.4rem; color: var(--accent-gold-hover); }
details.accordion-item[open] summary::after { content: "–"; }
.accordion-content { padding: 0 1.5rem 1.5rem 1.5rem; border-top: 1px solid var(--bg-surface-alt); }

.table-container { width: 100%; overflow-x: auto; margin: 1.5rem 0; }
table.responsive-data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-muted);
  border-radius: var(--radius-card);
}
table.responsive-data-table th, table.responsive-data-table td {
  padding: 1rem 1.25rem;
  text-align: left;
  border-bottom: 1px solid var(--border-muted);
}
table.responsive-data-table th { background-color: var(--bg-surface-alt); font-family: var(--font-serif); font-weight: 700; color: var(--primary-navy); }

@media (max-width: 600px) {
  table.responsive-data-table { display: block; border: none; background: transparent; }
  table.responsive-data-table thead { display: none; }
  table.responsive-data-table tbody, table.responsive-data-table tr, table.responsive-data-table td { display: block; width: 100%; }
  table.responsive-data-table tr {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-muted);
    border-radius: var(--radius-card);
    margin-bottom: 1.25rem;
    padding: 1.15rem;
    box-shadow: var(--shadow-subtle);
  }
  table.responsive-data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.65rem 0;
    border-bottom: 1px solid var(--bg-surface-alt);
    font-size: 1rem;
  }
  table.responsive-data-table td:last-child { border-bottom: none; }
  table.responsive-data-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--primary-navy);
    padding-right: 0.75rem;
    text-align: left;
  }
}

#quiz-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: var(--overlay-bg);
  backdrop-filter: blur(5px);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 1rem;
}
#quiz-overlay.active { display: flex; opacity: 1; }

#quiz-modal {
  background: var(--bg-parchment);
  width: 100%;
  max-width: 820px;
  max-height: 90vh;
  border-radius: var(--radius-modal);
  position: relative;
  padding: 2.5rem;
  overflow-y: auto;
  box-shadow: var(--shadow-elevated);
  transform: translateY(20px);
  transition: transform 0.3s ease;
}
#quiz-overlay.active #quiz-modal { transform: translateY(0); }

.quiz-close {
  position: absolute;
  top: 1.25rem; right: 1.5rem;
  font-size: 2rem;
  color: var(--primary-navy);
  cursor: pointer;
  background: none;
  border: none;
}
.quiz-progress-container { width: 100%; height: 6px; background: var(--border-muted); border-radius: 10px; margin-bottom: 2rem; }
#quiz-progress-bar { height: 100%; background: var(--accent-gold); width: 0%; border-radius: 10px; transition: width 0.4s ease; }
.quiz-question-text { font-family: var(--font-serif); font-size: 1.5rem; color: var(--primary-navy); margin-bottom: 1.75rem; }
.quiz-options-list { display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 2rem; }
.quiz-option {
  background: var(--bg-surface);
  border: 1.5px solid var(--border-muted);
  border-radius: 8px;
  padding: 1.15rem 1.25rem;
  cursor: pointer;
  font-size: 1.02rem;
  transition: var(--transition-smooth);
}
.quiz-option:hover { border-color: var(--accent-gold); background-color: var(--accent-gold-light); transform: translateX(4px); }
.quiz-option.selected { border-color: var(--primary-navy); background-color: var(--bg-surface-alt); font-weight: 600; }

.quiz-nav { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-muted); padding-top: 1.5rem; }
.quiz-btn {
  padding: 0.75rem 1.75rem;
  border-radius: var(--radius-pill);
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid var(--primary-navy);
  background: transparent;
  color: var(--primary-navy);
}
.quiz-btn:hover:not(:disabled) { background: var(--primary-navy); color: #ffffff; }
.quiz-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.result-profile { font-family: var(--font-serif); font-size: 2.2rem; color: var(--primary-navy); margin-bottom: 0.5rem; }
.result-description { font-size: 1.2rem; font-weight: 600; color: var(--accent-gold-hover); margin-bottom: 1.75rem; }
.result-insight p { margin-bottom: 1rem; line-height: 1.7; }
blockquote.result-quote {
  font-style: italic;
  border-left: 4px solid var(--accent-gold);
  padding-left: 1.25rem;
  margin: 1.5rem 0;
  color: var(--secondary-navy);
}
blockquote.result-quote cite { display: block; font-style: normal; font-size: 0.88rem; font-weight: 600; color: var(--text-muted); margin-top: 0.35rem; }

.btn-copied {
  background-color: #22c55e !important;
  border-color: #22c55e !important;
  color: #ffffff !important;
}

.site-footer {
  background-color: var(--primary-navy);
  color: #f1f5f9;
  padding: 4rem 0 2.5rem;
  border-top: 1px solid var(--border-muted);
}
.footer-content { text-align: center; max-width: 820px; margin: 0 auto; }
.footer-title { font-family: var(--font-serif); font-size: 1.5rem; color: var(--accent-gold); margin-bottom: 0.75rem; }
.footer-citation { font-size: 0.95rem; line-height: 1.6; color: #cbd5e1; margin-bottom: 1.75rem; }
.footer-nav { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; margin-bottom: 2rem; }
.footer-nav a { color: #ffffff; text-decoration: none; font-size: 0.9rem; }
.footer-nav a:hover { color: var(--accent-gold); text-decoration: underline; }
.footer-contact { font-size: 0.9rem; color: #cbd5e1; margin-bottom: 1rem; }
.footer-contact a { color: var(--accent-gold); text-decoration: none; }
.footer-copy { font-size: 0.85rem; color: #94a3b8; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 1.5rem; }

@media (max-width: 768px) {
  .mobile-toggle { display: block; }
  .nav-links {
    display: none;
    position: absolute;
    top: 100%; left: 0; width: 100%;
    background-color: var(--bg-surface);
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-muted);
    box-shadow: var(--shadow-elevated);
    gap: 1rem;
  }
  .nav-links.active { display: flex; }
  .dropdown { width: 100%; }
  .dropdown-content { position: static; display: none; box-shadow: none; border: none; padding-left: 1rem; min-width: 100%; }
  .dropdown.active .dropdown-content { display: block; }
  body { font-size: 17px; }
}

@media print {
  .site-header, .mobile-toggle, .quiz-trigger-btn, .card-footer-action, #quiz-overlay { display: none !important; }
  body { background-color: #ffffff; color: #000000; font-size: 12pt; }
  .closing-panel { background: transparent !important; color: #000000 !important; border: 1px solid #000000; }
  a { text-decoration: none; color: #000000; }
}
```

---

## 6. Pre-Flight Deployment Checklist

- [x] **File Root:** Verify all 10 HTML files, `styles.css`, and `main.js` are committed to the repository root.
- [x] **Relative Links:** Ensure all `<a href="...">` links use clean relative paths (e.g., `choosing-a-college.html`, not absolute domain paths).
- [x] **Theme Meta:** Confirm `<meta name="theme-color" content="#1b365d">` is present in the `<head>` of all HTML files.
- [x] **Tool Persistence:** Test `localStorage` persistence on Scorecards, Plans, Audits, Checklists, and Briefs.
- [x] **Mobile Responsiveness:** Confirm table rows break into individual cards below `600px` screen width.
