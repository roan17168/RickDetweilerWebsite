# RickDetweilerWebsite
# What College Is Really For

A static, multi-page site built with HTML, CSS and vanilla JavaScript. The live root pages have no build step or package installation. The site is assembled into the repository root by a small, zero-dependency Node script and published there by GitHub Pages.

## Run locally

From the repository root, start a static server:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/>. Use a local server rather than opening an HTML file directly so relative assets, navigation and browser storage behave as they do when hosted.

## The site

The site is built in `src/` and assembled into the repository root. GitHub Pages serves the root, so `node build.js` plus a push publishes it.

```sh
node build.js
python3 -m http.server 8000
```

Run `node build.js`, then open <http://localhost:8000/> from the repository root. The build has no dependencies. Source pages are in `src/pages`, shared partials in `src/partials`, styles in `src/styles`, chart data in `src/data`, and the chart, menu and notes behaviour in `src/scripts`. Edit `src/`, not the generated root pages; the build copies assets and concatenates the CSS each time. Generated files at the root are: every `*.html` page, `styles.css`, `scripts/`, `assets/`, `robots.txt` and, when `SITE_URL` is set, `sitemap.xml`.

The build plan and current phase status live in `PHASES.md`. `index.html` is the Home page, `what-matters.html` is the one-chart evidence overview with its accessible table, sources and limits, `the-research.html` is the Research page, `choosing-a-college.html` is the Choosing a College page with its quiz (the scorecard is the separate `tools/college-scorecard.html` tool page), `in-college.html` is the In College page with its check and semester plan, `parents.html` is the Parents page with its cost guidance and quiz, `faculty.html` is the Faculty page with its practice cards and course self-audit, `college-leaders.html` is the College Leaders page with its quiz, institutional checklist, board summary, message, alumni survey and sample promotion language, `counselors.html` is the printable Counselor Kit with student and family handouts, first-in-family steps, a group session, a glossary and links, `policymakers.html` is the Policymakers page with its optional emphasis quiz and one-page brief, `understanding-college.html` is the long-form Understanding College guide with its college-type table, history, charts and ten-minute checklist, `about.html` is Richard A. Detweiler's biography with his career milestones, the book and contact details, `privacy.html` describes what the site stores in the browser and what it does not collect, `404.html` is the not-found page, and `foundation.html` is the design-system reference, not part of the final site (it is marked `noindex`). The Choosing data lives in `src/data/choosing.json`, the In College data lives in `src/data/in-college.json`, the Parents data lives in `src/data/parents.json`, the Faculty data lives in `src/data/faculty.json`, the College Leaders data lives in `src/data/college-leaders.json`, and the Policymakers data lives in `src/data/policymakers.json`; the build emits each as a `scripts/` data file for the browser.

### Revision 6 gaps closed (13 November 2026)

The Revision 6 document and the six take-away PDFs were uploaded to the repository root. The three items `artifacts/handoff/` listed as impossible are now built:

- **Five tool pages** in `preview/tools/`: `college-scorecard.html`, `semester-plan.html`, `course-self-audit.html`, `leaders-checklist.html`, `policy-brief.html`. Each has a visible label on every field, saves in the browser, and offers Print, Copy text, Download as PDF and Reset from one shared script (`src/scripts/tools.js`) and stylesheet (`src/styles/tools.css`). If you took the In College or Faculty check, the plan and self-audit open with those answers filled in, with an Undo link.
- **Six downloads** in `preview/downloads/`, copied from `src/downloads/` by the build: the parent checklist (Parents and Counselors), workshop kit (Faculty), dean's briefing (College Leaders), state brief and federal staff memo (Policymakers), and counselor kit (Counselors).
- **The Counselors quiz** (`src/data/counselors.json`, `src/scripts/counselors.js`): five scored questions, one optional setting question, a tie-breaker, four results (Door Opener, Matchmaker, Guide, Finisher), situation advice, Copy / Email / Share / Retake and browser storage. The Home counselor card now reads "Start the 2-minute quiz".

`node artifacts/rev6-audit.js` now reports 55 PASS, 0 FAIL, 0 BLOCKED; `node artifacts/counselors-quiz-audit.js` walks all 1,024 answer paths; `node artifacts/downloads-audit.js` checks the six PDFs and their links.

## Site files

- Pages are in the repository root.
- Shared styles: `css/styles.css`
- Shared quiz, navigation and form logic: `js/main.js`
- Images and favicon: `assets/images/`
- `current-students.html` redirects to the current `in-college.html` page.
- `understanding-college.htm` redirects to the canonical `understanding-college.html` page.

## Quick checks

Run `node build.js`, then check the navigation, chart table, notes panel and mobile menu at narrow and wide widths. On the Choosing page, check all six quiz results, the two-way tie, the always-available tie-break, optional panels, saved result, share/copy/email/print and retake. On the separate College Scorecard tool page (`tools/college-scorecard.html`), check the tabs, ratings, stars, compare view, saved data, leading choice, copy/email and print. On the In College page, check all three result bands, the optional version priorities, card sorting/opening, the first-generation shortcut, plan save/reload, and copy/email/print. On the Parents page, check all three results, both two-way ties, the question-4 “not sure” panel, optional panels, and the mobile collapsed sections. On the Faculty page, check all three result bands, practice-card sorting, each optional settings variant, and the course self-audit copy/email/print controls. On the College Leaders page, check all three results, every two-way tie, the eight checklist rows, the board summary, the alumni survey and the checklist copy/email/print controls. On the Policymakers page, check all three results, the two-way ties, the show-all view, the five-measure brief, and its copy/email/print controls. On the Counselors page, check the eight sections, all four tables, the glossary, the internal and external links, and the print layout. On the Understanding College page, check the six college types, the timeline and full-history toggle, the content/context table, the G3/G4 charts and their number tables, the quotation grid, and the section links. For the QA pass, run `node artifacts/qa-audit.js` after `node build.js`; it checks links, anchors, headings, labels, tables and ids across every built page. The cross-phase checks are `node artifacts/spec-audit.js` (every 12 October source paragraph against the built copy; it predates Revision 6, so it is historical, not Revision 6 acceptance), `node artifacts/feature-audit.js` (every phase's feature inventory), `node artifacts/quiz-audit.js` (every answer path in all six quizzes) and `node artifacts/data-html-audit.js` (the allowlist for HTML embedded in the JSON content files). `node artifacts/qa-audit.js` also checks cross-page fragments, `aria-current` values and the native sources dialog. `node artifacts/rev6-audit.js` checks the mechanically verifiable Revision 6 requirements, and `node artifacts/seo-audit.js` checks titles, descriptions, canonicals, sharing cards, structured data, `sitemap.xml` and `robots.txt`.

### Handoff for the remaining Revision 6 content

The four unnamed tool pages, six PDF downloads and the Counselors quiz are specified but absent from the repository. The brief for building them in a chat that has the attachments is in [artifacts/handoff/README.md](artifacts/handoff/README.md).

### Search optimization

Titles and descriptions live in the `pages` array in `build.js` (the Home and Choosing pair match Revision 6 word for word). Canonical URLs, `og:url`, the sharing image, JSON-LD structured data and `sitemap.xml` need the production origin, so set it once:

```bash
SITE_URL=https://your-domain.org node build.js
```

or put the same address in `url` in `src/data/site.json`. With no origin configured the build skips those absolute-URL tags, deletes any stale `sitemap.xml`, and still writes `robots.txt`. Share-card image and alt text are set in `src/data/site.json`. `node artifacts/spec-audit.js` still lists what the superseded 12 October source cannot find, but it is historical: it exits 0 unless run with `--strict`. The optional browser pass is `artifacts/browser-audit.mjs` (Playwright installed outside the project; see the file header). Revision 6 status and blocked inputs are recorded in `artifacts/revision-6-input-ledger.md`, and the full fix instruction set is `artifacts/revision-6-master-fix-prompt.md`.