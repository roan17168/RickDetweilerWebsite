# Build phases: What College Is Really For

Last updated: 7 November 2026
Current phase: **Phase 12 — QA, accessibility, performance, SEO, analytics, deployment** (partial)
Next: **launch decisions — analytics, domain, OG image and deployment**

This file is the handoff between chats. Read it before doing any build work.

## How to continue

When the user says **“start next phase”**:

1. Read this file, `README.md`, and the current files in `src/`.
2. Find the first phase whose status is **NEXT** or **IN PROGRESS**. Do not skip a blocked phase without saying so.
3. Read that phase’s exact source paragraphs in `What_College_Is_Really_For_Revised_Site_Text_2026-10-12_2.docx` (ranges below) and the relevant tables. The extracted plain-text copy is reproducible from the docx; do not treat an old chat summary as copy.
4. Build the page in `src/pages/`, add any shared components to `src/styles/` and `src/scripts/`, and add the page to `build.js`.
5. Run `node build.js`. Check the new page at `/preview/` at phone and desktop widths, plus keyboard behaviour for menus, notes and forms.
6. Update the status in this file and report exactly what was built, what was checked, and what remains.
7. Do not edit `preview/` by hand. Do not change live root pages, publish, or commit unless the user explicitly asks.

One phase per “start next phase” request unless the user asks to keep going. If a phase is blocked by missing copy or a missing asset, finish the unblocked work, mark it **PARTIAL**, and name the exact missing input. Never invent Rick’s copy, quotations, press headlines, statistics, photo permissions or quiz scoring.

## Status

| Phase | Name | Status |
|---|---|---|
| 0 | Foundation and design system | **DONE** |
| 1 | Home | **DONE** |
| 2 | The Research + evidence spine | **DONE** |
| 3 | Choosing a College + quiz + scorecard | **DONE** |
| 4 | In College + check + one-semester plan | **DONE** |
| 5 | Parents + quiz | **DONE** |
| 6 | Counselors + counselor kit | **DONE — built from the supplied Counselor Kit PDF** |
| 7 | Faculty + quiz + course self-audit | **DONE** |
| 8 | College Leaders + quiz + institutional checklist + board summary + alumni survey + promotion/tenure language | **DONE** |
| 9 | Policymakers + quiz + one-page brief | **DONE** |
| 10 | Understanding College + history timeline + faculty-care and employer charts | **DONE** |
| 11 | About, Privacy, resources and PDFs | **PARTIAL — About, Privacy and all six PDFs done; photos P1–P8 still missing** |
| 12 | QA, accessibility, performance, SEO, analytics, domain, deployment | **PARTIAL — SEO layer built and audited (titles, descriptions, canonicals, sharing cards, JSON-LD, sitemap, robots); domain, analytics and deployment pending** |

Status values: **DONE**, **NEXT**, **IN PROGRESS**, **PARTIAL**, **BLOCKED**, **QUEUED**.

## Source hierarchy

1. **Rick’s revised site text**: `What_College_Is_Really_For_Revised_Site_Text_2026-10-12_2.docx`, revised 12 October 2026. This is the copy of record for the pages it covers. Use its wording exactly. Paragraph numbers below are from the extracted document body.
2. **Chart data**: `src/data/big-picture.json`, transcribed from Rick’s attached `big-picture.svg`; the book’s figure 10.1 is the authority. The site’s percent figures are the book’s percent relative effect.
3. **Rev6 design decisions**: recorded in this file, `README.md`, and the existing `src/` shell. These cover the new Home/What Matters/Counselors/Privacy structure, self-hosted fonts, no Font Awesome, static HTML/CSS/JS, the accessible chart, and the later analytics/domain decisions.
4. **Live site**: the root HTML, CSS, JS, quizzes and assets are useful for structure, tools and material not present in the docx. Do not copy their old visual styling or their factual errors. Known corrections: Hartwick’s **eighth** president, not tenth; do not invent or repeat the Peace Corps claim until Rick verifies it; replace the home address with a P.O. box before launch.

**Supplied Counselor Kit**: `counselor-kit (1).pdf`, attached 7 November 2026, is the copy of record for the Counselors page. **Supplied Dean’s Briefing**: `deans-briefing (1).pdf`, attached the same day, is a College Leaders companion (one-page summary plus a 10-slide outline); it is not yet published.

If sources conflict, use Rick’s docx for prose, the chart data for figures, and add the conflict to **Open decisions**. Do not silently rewrite.

## Common definition of done

A page phase is done only when:

- Every section in the listed source range is present; copy is exact except for typographic entities and headings added purely for navigation.
- The page has one `h1`, a logical heading tree, unique IDs, descriptive link text, alt text and a skip target.
- All local links and assets resolve; no unresolved `{{PLACEHOLDER}}` remains.
- The page is checked at 375px, 768px and 1440px; tables become cards or scroll with a visible affordance; no horizontal overflow.
- Menus, details/disclosures, notes and any tool forms work by keyboard; focus returns correctly; Escape closes overlays.
- `node build.js` and the structural/content check pass.
- No new inline styles outside the foundation reference page.
- This file’s status and notes are updated. Report anything not checked.

## Phase details

### Phase 0 — Foundation and design system — DONE

Built the zero-dependency build, shared header/footer, self-hosted Lora and Inter (including Lora italic), tokens, base/layout/component/page CSS, accessible chart from `big-picture.json`, sources panel, mobile navigation, Home shell, About and Privacy drafts, and `preview/foundation.html` as the design-system reference.

### Phase 1 — Home — DONE

Source: docx paragraphs 213–261, plus audience-card table (table 2).

Delivered:
- `src/pages/home.html`; `preview/index.html` is now the real Home page.
- Hero, 1,000-graduate stat row, six audience cards, three research findings, six outcomes with hand-drawn inline SVG icons, and the closing “A meaningful life in a world of change” block.
- The specified “See the research” link and closing “Find your questions” CTA (which jumps to the audience cards), plus the book link.
- `preview/foundation.html` retains the design-system reference.
- Audience cards currently link to the old live pages by relative path (`../choosing-a-college.html`, etc.) until those phases rebuild them. The “See the research” link also points to the old research page until Phase 2.

Checks run: build; all 16 Home source paragraphs and all six audience questions present word-for-word; one `h1`; unique IDs; all local links resolve; no inline styles; six audience cards, three findings and six outcomes. Visual check at the cloud browser’s phone-width viewport (512 CSS px): hero, audience cards, findings, outcomes and closing render with no horizontal overflow and no console errors; the closing CTA jumps to `#audiences`. A wide-screen screenshot was not available because the browser viewport is fixed in this environment; the desktop grid rules are present in `pages.css` and are covered by the Phase 12 QA pass.

### Phase 2 — The Research + evidence spine — DONE

Source: docx paragraphs 1761–1876; tables 16 (six outcomes), 17 (six experiences), 18 (other research); graphic G1 in table 20.

Delivered:
- `src/pages/the-research.html`: opening, how the study was done, sample and demographics, author note, collapsible analysis note, the six outcomes and six experiences as semantic responsive tables, the five findings, limits, other research, why it matters now, citation and related organizations.
- `src/partials/numbers.html`: the reusable plain-language “How to read these numbers” component.
- G1 three-bar chart with 24%, 33% and 34%, a `<details>` data table and the source line to p. 162.
- `the-research.html` added to `build.js` with active nav key `research`; header, footer and Home links updated. `what-matters.html` remains the chart/outcome overview.

Checks run: `node build.js`; every selected source paragraph and every cell in tables 16, 17 and 18 is present word-for-word; one `h1`; unique IDs; no unresolved placeholders; no inline styles; all local links resolve. At the browser’s 320 CSS px viewport: no horizontal overflow; the responsive table cards, G1 bars, citation and related-organization list render; details were opened to confirm their content and chart-data table.

Not checked: a 768/1440 wide-screen screenshot (this browser viewport is fixed at 320); the external organization URLs were not fetched; the untouched legacy root page was not compared visually. The missing Rev6 What Matters outcome-by-outcome copy was not invented.

### Phase 3 — Choosing a College + quiz + scorecard — DONE

Source: docx paragraphs 263–658; table 3 (rating scale), tables 4–6 (scorecard).

Delivered:
- `src/pages/choosing-a-college.html`: landing, “What you get,” cost guidance, first-generation steps, the quiz shell, scorecard instructions and rating scale, and the closing.
- `src/data/choosing.json`: five scored questions, the optional panels question, the tie-break question, all six result blocks, optional panels, “Words colleges use,” “Before you fall for a campus,” and tables 3–6. The build emits it as `preview/scripts/choosing-data.js`.
- `src/scripts/choosing.js`: answer-order shuffling; all six outcomes; two-way ties shown as two results; a tie-break step for three or more tied outcomes; optional panels; result stars; the four-college scorecard with dealbreakers, ratings, notes, localStorage, tabs, compare view and print/copy/email controls.
- `build.js`: Choosing page registry, per-page script support, and copying/emitting the quiz data and engine.
- Header, Home and Foundation links now point at the new preview page. `README.md` lists the new page.

Checks run:
- `node build.js`; `node --check src/scripts/choosing.js`.
- Scoring tests: all six outcomes reach a written result; a two-way tie returns both results without the bonus question; a five-way tie requires the bonus question and resolves to one result; an empty answer set returns no default result.
- Data audit: all six result blocks, the quiz/optional/tie questions and every row in tables 3–6 match the docx word-for-word.
- Static copy audit: 42 landing, cost, first-generation, scorecard and closing paragraphs/labels are present.
- Browser at the available 320 CSS px viewport: quiz question flow, optional panels, “None of these,” two-way and single-result rendering, tie-break rendering, honesty line, scorecard tabs, rating/star/dealbreaker/name/note entry, save and reload, and the six-column compare view. No console errors. A page-overflow fix is applied to the wide compare table; the scorecard remains horizontally scrollable inside its own wrapper.

Not checked:
- 768/1440 visual passes; this browser viewport is fixed at 320 CSS px.
- A real print dialog/PDF and Playwright print emulation. The print stylesheet is in place, but Playwright repeatedly failed with the tool error `The property 'options.mode' must be one of: 'strip'. Received 'transform'`, so print output was not visually verified.
- Copy and email actions were not executed end-to-end; their controls and code paths are present.
- Full keyboard/screen-reader pass. Native radio buttons, selects, buttons and labelled inputs are used.

Next: Phase 4 — In College. First read docx 367–522 and tables 7–8, then build the page, quiz results, student practices and one-semester plan.

### Phase 4 — In College + check + one-semester plan — DONE

Source: docx paragraphs 660–857; tables 7–8.

Delivered:
- `src/pages/in-college.html`: landing, what-you-get card, five-question check shell, five practice cards, “When college gets hard,” “Questions students ask,” the one-semester plan form, closing and end point.
- `src/data/in-college.json`: five scored questions (Strong 2, Partway 1, Not yet 0), the optional question and its five version priorities, all three result bands, and plan-card labels. The build emits it as `preview/scripts/in-college-data.js`.
- `src/scripts/in-college.js`: shuffled answer order; all three result bands; optional-practice priority ordering; cards sorted lowest-scoring first and opened; the first-generation shortcut that opens “When college gets hard”; and the account-free plan tool with local save, copy, email and print controls.
- `src/styles/in-college.css`: practice accordions, support and question disclosures, the plan cards/forms, mobile stacking and print rules.
- `build.js`, `src/partials/header.html` and `src/pages/home.html`: new page, scripts/data emission and working In College links. `README.md` lists the page.

Checks run:
- `node build.js`; `node --check src/scripts/in-college.js`.
- Scoring test exhausts all 243 valid combinations of five answers and confirms the three bands at 0–3, 4–7 and 8–10; incomplete or invalid answers produce no result.
- Docx audit: every quiz question and option, the optional question/options, all three result headings, leads, questions and actions, and the plan card labels match the source.
- Static copy audit: practice cards, support items, student questions, plan instructions and fields, example, closing and end point are present; one `h1`; unique IDs; no unresolved placeholders or inline styles.
- Browser at the available 736 CSS px viewport: all three result bands, optional version priorities, card sorting/opening, the first-generation shortcut, skipping the optional question, plan save and reload, and no horizontal overflow. Console is clear.

Not checked:
- 375 and 1440 CSS px visual passes. The available full-browser viewport was 736 px; the responsive rules are present but the narrower and wider layouts were not rendered.
- A real print dialog/PDF. The plan print rules are present, but print output was not visually confirmed.
- Copy and email controls were not run end-to-end; their handlers are present.
- Full keyboard/screen-reader pass. Native details, radio/checkbox, select, date and textarea controls are used.

Next: Phase 5 — Parents. Read the Parents source range and quiz table before copying anything; do not invent missing Figures or aid claims. Mark the phase **PARTIAL** if the copy/assets are incomplete.

### Phase 5 — Parents — DONE

Source: docx 859–1005 in the extraction that includes table paragraphs.

Delivered:
- `src/pages/parents.html`: landing, cost guidance, first-time-parent timeline, loans, other paths, liberal-arts note, “What you get,” quiz shell, “For every parent,” conversation prompt, closing and end point. The timeline, loans and other-paths sections collapse behind “Read more” on phones.
- `src/data/parents.json`: five scored questions, the optional multi-select list and its seven panels, the unscored Q4 “not sure” option with the “Where to find the numbers” panel, and all three result blocks.
- `src/scripts/parents.js`: shuffled answers, one- or two-result rendering, Q4 exclusion from scoring, selected optional panels at the top of the result, and mobile disclosure collapse.
- `src/styles/parents.css`, `build.js`, header/Home links and `README.md` updated.

Checks run:
- `node build.js`; `node --check src/scripts/parents.js`.
- Scoring tests cover all three outcomes, all three two-way pairs, the Q4 “not sure” path (including a 2–2 tie decided by the other four), and no result from an incomplete or empty answer set.
- Docx audit: landing, cost, timeline, loans, other paths, liberal arts, “What you get,” all quiz copy, the three result blocks, all optional panels, “For every parent,” conversation, closing and end point match the source.
- Static copy and structure checks: one `h1`, unique IDs, no unresolved placeholders, no inline styles; local links resolve.
- Browser checks at the available 736 CSS px viewport: all three results, a two-way tie, Q4 “not sure” panel, optional panels, mobile collapsed sections, and no horizontal overflow; console clear.

Not checked:
- 375 and 1440 CSS px visual passes. The available full-browser viewport was 736 px; responsive rules are present but those exact widths were not rendered.
- Full keyboard/screen-reader pass. Native radios, checkboxes, details, buttons and links are used.
- The external College Scorecard link was not opened end-to-end.

Next: Phase 7 — Faculty. Phase 6 was blocked at this point; it was later built from the supplied Counselor Kit.

### Phase 6 — Counselors — DONE

Source: the supplied `counselor-kit (1).pdf`, an eight-section Counselor Kit published by HigherEdImpact. It is not in the 12 October docx; it was attached on 7 November 2026 and is now the copy of record for this page. The kit has no separate counselor quiz; its group session uses the existing Choosing a College and Parents quizzes, so none was invented.

Delivered:
- `src/pages/counselors.html`: hero and contents, the study in one page, the student handout, “Can’t visit?”, the family handout, first-in-family steps, the 30-minute group session, the glossary, links, sources and publisher line.
- `src/styles/counselors.css` and `src/scripts/counselors.js` (print control); print styles hide site chrome and start each section on a new page.
- `build.js`, the header (“I’m a counselor” is now a real link), the footer and `README.md` updated.

Checks run:
- `node build.js`; `node --check src/scripts/counselors.js`.
- Copy/structure audit: 83 source checks; one `h1`; 20 unique ids; eight sections; four tables (7 handout questions, 4 timeline rows, 5 session rows, 5 link rows); 19 glossary terms; two print buttons; no broken local links, inline styles or placeholders.
- Browser at the available 721 CSS px viewport: the counselor nav link is active with no disabled state, the footer link works, the print handler fires, the mobile table cards switch correctly, and there is no horizontal overflow; console clear.

Not checked:
- 375 and 1440 CSS px visual passes. The available full-browser viewport is 721–736 px; responsive rules are present but those exact widths were not rendered.
- A real print dialog/PDF. The print styles and both print buttons are present, but print output was not visually verified.
- Full keyboard/screen-reader pass. Native headings, tables, definition lists, links and buttons are used.
- The kit’s QR codes are not generated; the print version’s QR-code line was omitted.
- The kit’s heading says “six questions” but the handout lists seven; kept verbatim.
- The kit’s long-career 72% success / 75% higher-income figures for lower-income graduates differ from the 24%/33% current-income figures used on the College Leaders and Research pages. Both are published as sourced; Rick should confirm the distinction.

Next: Phase 9 — Policymakers.

### Phase 7 — Faculty — DONE

Source: docx 1007–1198 in the extraction that includes table paragraphs; tables 9–10.

Delivered:
- `src/pages/faculty.html`: landing, what-you-get card, quiz shell, five practice cards with small/large/work/part-time and humanities/STEM/professional variants, the “big questions” and “who carries this work” notes, a six-group course self-audit form, closing and end point.
- `src/data/faculty.json`: five scored questions, the six optional course-context choices, and all three result bands.
- `src/scripts/faculty.js`: all 243 score combinations, lowest-scoring-card-first ordering, context-specific primary variants with every version under “Other settings,” and self-audit copy/email/print controls.
- `src/styles/faculty.css`, `build.js`, header/Home links and `README.md` updated.

Checks run:
- `node build.js`; `node --check src/scripts/faculty.js`; JSON parse check.
- Scoring test exhausts all 243 valid combinations and confirms the 0–3, 4–7 and 8–10 bands; incomplete and invalid answers return no result.
- Docx audit: 147 source paragraphs/labels match; one `h1`; 48 unique ids; all 29 local links resolve; no unresolved placeholders or inline styles.
- Browser at the available 736 CSS px viewport: all three result bands, lowest-first card order and first-card opening, large/small/part-time/STEM/professional variants, Back retention, “Other settings,” and the audit Copy action. No horizontal overflow; one `h1`; console clear.

Not checked:
- 375 and 1440 CSS px visual passes. The available full-browser viewport was 736 px; responsive rules are present but those exact widths were not rendered.
- A real print dialog/PDF; the audit print stylesheet and button are present but print output was not visually verified.
- Email was not run end-to-end; the `mailto:` handler is present. Clipboard contents were not inspected beyond the success status.
- Full keyboard/screen-reader pass. Native radios, checkboxes, details, fields, buttons and links are used.

Next: Phase 8 — College Leaders. Phase 6 was later built from the supplied Counselor Kit.

### Phase 8 — College Leaders — DONE

Source: docx 1200–1437; tables 11–12 (institutional checklist). An earlier 802–956 range came from a superseded extraction.

Delivered:
- `src/pages/college-leaders.html`: landing, what-you-get card, five-question quiz shell, three results, retention case, other research, “It has been done,” enrollment/admissions block, eight-practice checklist with data-source table and form, one-page board summary, legislator/donor message, alumni survey template, sample promotion/tenure language, closing and end point.
- `src/data/college-leaders.json`: five questions and the three result blocks. Scoring is the most-chosen priority; a two-way tie shows both; no three-way tie is possible with five questions.
- `src/scripts/college-leaders.js`: quiz flow with option shuffling, Back retention, all 243 answer combinations, two-way tie rendering, checklist copy/email/print, and board-summary print.
- `src/styles/college-leaders.css`, `build.js`, header/Home links and `README.md` updated.

The shared “shown under every result” blocks appear once directly beneath the quiz rather than being duplicated under each result. The checklist form is a table above 760px and eight labelled cards below it.

Checks run:
- `node build.js`; `node --check src/scripts/college-leaders.js`; JSON parse check.
- Audit: 197 source paragraphs/labels/table cells present; title and search description match; one `h1`; 33 unique ids; no duplicate ids, inline styles or unresolved placeholders; 8 checklist rows and 8 data-source rows; all local links resolve.
- Scoring test exhausts all 243 valid combinations: 153 single results, 90 two-way ties, 0 three-way ties; incomplete or invalid answers produce no result.
- Browser at the available 721 CSS px viewport: Market-first and Experience-first results, a Market/Mission two-way tie, Back retention, checklist row entry and Copy (“Checklist copied.”), eight rows, five board fields, header active state, no horizontal overflow; console clear.

Not checked:
- 375 and 1440 CSS px visual passes. The available full-browser viewport is 721–736 px; the responsive card rules are present but those exact widths were not rendered.
- A real print dialog/PDF for the checklist or board summary. The print styles and buttons are present but print output was not visually verified.
- Email was not run end-to-end; the `mailto:` handler is present.
- Full keyboard/screen-reader pass. Native radios, selects, inputs, buttons and links are used.
- The institutional examples (Ursinus, Kansas, Alverno and the other named institutions) are exactly as the docx describes them. The docx has an internal note asking for them to be checked against *Student Success in College* (2005) before publishing; that note is not rendered, and the examples remain unverified against the book.
- The P6 College Leaders landing photo from the docx photo plan was not added; no licensed image exists in the repository.

Next: Phase 9 — Policymakers. Phase 6 is now built from the supplied Counselor Kit.

### Phase 9 — Policymakers — DONE

Source: docx 1439–1590; table 13 (five-measure brief). Understanding College begins at 1592.

Delivered:
- `src/pages/policymakers.html`: landing, optional five-question emphasis quiz with “Skip to the questions” and an all-three-results view, three results, completion case, study coverage and limits, other research, In Washington, the one-page brief with the five-measure form, request, report language and hearing statement, closing and end links.
- `src/data/policymakers.json`: five questions and three result sets. Scoring is the most-chosen emphasis; a two-way tie shows both; no three-way tie is possible with five questions.
- `src/scripts/policymakers.js`: quiz flow with Back retention and option shuffling, all 243 answer combinations, two-way tie rendering, all-three-results view, and brief copy/email/print.
- `src/styles/policymakers.css`, `build.js`, the header (“I make policy” is now a real preview link), Home card, footer, the College Leaders cross-link and `README.md` updated.

The source’s optional-quiz wording is preserved: the quiz is not required; “Skip to the questions” shows all three sets. The brief’s two-page leave-behind PDF is not rendered because no PDF exists in the repository; Copy, Email and Print operate on the one-page brief.

Checks run:
- `node build.js`; `node --check src/scripts/policymakers.js`; JSON parse.
- Source audit: 135 copy/table checks; one `h1`; 23 unique ids; ten sections; no inline styles or placeholders; five brief rows (5 collected selects, 5 collector fields, 5 priority fields), four request fields and three brief actions; no broken local links.
- Quiz audit: 5 questions, 15 options; all 243 valid combinations (153 single results, 90 two-way ties, 0 three-way); invalid and incomplete answers rejected.
- Browser at the available 721 CSS px viewport: skip view shows all three results and 12 questions; a Workforce/Civic two-way tie shows both; “See all three sets” returns all three; Back retains the previous answer; the five-row brief becomes labelled cards; generated brief text includes the selected row, request and both quotations; Copy reports “Brief copied.”; Print triggers the print class; no horizontal overflow; console clear.

Not checked:
- 375 and 1440 CSS px visual passes. The available full-browser viewport is 721–736 px; responsive rules are present but those exact widths were not rendered.
- A real print dialog/PDF. The print handler and print-only styles are present, but print output was not visually verified.
- Email was not run end-to-end; the `mailto:` handler is present.
- Full keyboard/screen-reader pass. Native headings, tables, selects, inputs, buttons and links are used.
- The two-page leave-behind PDF, still missing after Phase 11 (Open decisions 10).
- The “In Washington” details (the 2025 federal budget law, the early-2027 test and the College Transparency Act) are the 12 October 2026 source text. Re-check them before launch.

Next: Phase 10 — Understanding College.

### Phase 10 — Understanding College — DONE

Source: docx 1592–1759; The Research begins at 1761. Tables 14 (kinds of colleges) and 15 (content/context); graphics G2–G4 in table 20. Table 19 specifies an opening P8 photo.

Delivered:
- `src/pages/understanding-college.html`: opening, contents, the six kinds of colleges, the history timeline and full-history disclosure, “What ‘liberal arts’ means,” the pressure to pay off fast, the liberal arts college case, employer evidence, seven quotations, prestige/rankings, long-term outcomes, five misconceptions, the ten-minute college checklist and the closing.
- `src/styles/understanding.css`: the editorial layout, responsive college/context tables, horizontal-to-vertical timeline, direct-labelled G3/G4 bars, quotation grid, research cards and dark closing.
- `src/scripts/understanding.js`: collapses the full history on phones while leaving it open on wider screens. G3 and G4 each have a visible “See the numbers” table; the timeline is its own text list.
- `build.js`, the header/footer links, the College Leaders and Policymakers end links, and `README.md` updated. The old `../understanding-college.html` links are gone from the preview source.

Checks run:
- `node build.js`; `node --check src/scripts/understanding.js`; HTML structure parse.
- Source audit: 214 copy/table/chart checks. Structure: one `h1`, 12 `h2`, 14 sections, 30 unique ids, 6 college-type rows, 6 content/context rows plus 2 group rows, 5 timeline points, 5 chart bars, 2 chart figures, 2 data tables, 7 quotations, 5 misconceptions, 5 checklist questions, 12 contents links, no broken local links, no inline styles or placeholders.
- Chart audit: G2 years and labels; G3 45/24; G4 64/62/60; all three source lines.
- Browser at 736 CSS px: history starts collapsed and opens; college tables become labelled cards; timeline stacks to one column; bars render at 45/24/64/62/60%; the first “See the numbers” table opens; no horizontal overflow; console clear.
- 375 and 1440 CSS px measured in same-origin iframes because the cloud browser viewport is fixed at 736 and Playwright returns a platform `options.mode` error. At 375: no overflow, cards, one-column timeline, one-column contents, one-column quotes/steps, history closed. At 1440: no overflow, table layout, five-column timeline, three-column contents, two-column quotes, three-column steps, history open.
- The Phase 9 Policymakers, Phase 8 College Leaders and Phase 6 Counselor audits still pass.

Not checked / open:
- Top-level 375 and 1440 browser viewports, real screenshots and a real print pass. The exact-width layout measurements are iframe-based, not a top-level visual review.
- Full keyboard and screen-reader pass. Native `details`/`summary`, tables, headings and links are used.
- The chapter’s Word endnotes are not attached. The page uses the source’s inline source lines and named studies, but a full Notes list still needs to be added with the Phase 11/12 source work.
- The P8 three-campus opening photo from table 19 is not added; no licensed asset is in the repository.
- Docx note 1593 says “Page heading on the site: Understanding American Higher Education,” while 1597–1598 give the label “Understanding college” and the H1 “Four thousand colleges…”. The build follows 1597–1598; confirm the intended page heading with Rick.

Next: Phase 11 — About, Privacy, resources and PDFs.

### Phase 11 — About, Privacy, resources and PDFs — PARTIAL

Source: docx 1878–1907 (“About the Author”). The docx has no Privacy section, so Privacy describes the site’s actual behaviour.

Delivered:
- `src/pages/about.html`: rebuilt from the source. Opening with the P9 portrait, heading, tagline and lede; biography; “About the author and the study”; seven career milestones; “The book” with the P10 cover and “Get the book”; contact; credit line.
- `src/pages/privacy.html`: rewritten to match what the site does. No analytics is installed and the page says so; it states that the site sets no cookies and loads no third-party code, and limits local storage to the Choosing scorecard and the In College plan.
- `build.js`: About title and search description now use docx 1879–1880; About notes cut to the *Forbes* citation and the book.
- `src/styles/pages.css`: About reading column, tagline, study block and milestone list; the portrait is no longer cropped to 4:5.
- `README.md` and this file updated.

Corrections and removals: Hartwick’s **eighth** president (docx 1894 says tenth); the old draft’s unsourced press/talk list, “Work with us” band, fact box and third photo are gone; the image paths now use the real high-resolution portrait and book cover in `src/assets/images`.

Checks run:
- `node build.js` succeeds; `node --check src/scripts/ui.js`.
- `artifacts/about-audit.js` passes: every published paragraph from 1878–1907, the 1879 title and 1880 description, the eighth-president correction, the omission of the Peace Corps line, the seven role/detail pairs, the book and contact copy, and the removal of the press list and Eastern photo.
- Structure: one `h1`, four `h2`, two `h3`, unique ids, two images with alt text and dimensions, two notes, no inline styles, no unresolved placeholders, every local link and asset resolves.
- Privacy: one `h1`, nine `h2`, three choice bullets, no “analytics service” or “measurement is enabled” claim, and no analytics or cookie code in `src/scripts`.
- The existing Understanding College, College Leaders and Policymakers audits still pass.
- Browser at 375 and 1440 CSS px in same-origin iframes: no horizontal overflow (360/360 and 1425/1425); 375 stacks the hero, milestones and book; 1440 gives a 300+844 hero, 320+384 milestones and 160+966 book band; the cover loads at 711 px natural width. Privacy has no overflow at either width.
- Notes: opens with both notes and focus on Close; Escape closes it, hides the overlay and returns focus to the button.

Not checked:
- Top-level 375 and 1440 screenshots. The cloud browser viewport is fixed near 736 px and the proxied tab resolved to the workspace root, so the exact-width checks are iframe measurements, not a top-level visual review.
- A full keyboard and screen-reader pass; Escape, focus move and focus return were checked in the browser.
- Print styling for About; the page is not a print deliverable.

Not done, which is why the phase is PARTIAL:
- **PDFs and resources.** The docx names exactly one downloadable, the Policymakers two-page leave-behind (1580). It contains no list of six PDFs, and there are no PDF files in the repository. No resources page was created because the docx has no resources copy.
- **Peace Corps** (docx 1900): omitted until Rick verifies it.
- **Photos P1–P8**: still absent, including the P8 Understanding College opening photo.
- **Understanding College endnotes**: 2077–2078 says the endnotes exist, but the document contains only that note, not the list.

Next: Phase 12 — QA, accessibility, performance, SEO, analytics, domain, deployment.

### Phase 12 — QA, accessibility, performance, SEO, analytics, deployment — PARTIAL

Delivered:
- `artifacts/qa-audit.js`: a zero-dependency static audit of every built page. It checks titles, descriptions, one `h1`, heading order, duplicate ids, every local link and anchor, image alt/width/height, form labelling, button types, link names, `th` scope, table captions, details/summary parity, nav names, SVG hiding, inline styles, placeholders, third-party requests, focus-visible, reduced motion and `font-display`.
- `src/pages/404.html`, built to `preview/404.html` with `noindex,follow`.
- `src/partials/head.html`: robots meta, Open Graph site/locale tags, Twitter card tags, and preloads for the Lora 700 and Inter 400 WOFF2 faces. The foundation reference page is now `noindex,nofollow`.
- `src/styles/base.css`: mobile text-size adjustment; `main` keeps a visible gold focus ring for keyboard users while suppressing it for pointer focus.
- `src/scripts/ui.js`: Escape now closes the mobile menu and returns focus to the toggle.
- Accessibility fixes from the audit: Home’s six audience cards are `h2` rather than skipping from `h1` to `h3`, with their card size preserved at 1.35rem; the six outcome icons are `aria-hidden`; two Understanding College group headers use `scope="colgroup"`; the Choosing rating scale and the two Understanding chart-data tables have visually hidden captions.
- `README.md` and this file updated.

Checks run:
- `node build.js`; `node --check src/scripts/ui.js`.
- `artifacts/qa-audit.js` passes on 15 pages (14 final + the foundation reference): 18 tables, all captioned; no duplicate ids, broken local links or anchors, heading jumps, unlabelled controls, `th` without scope, inline styles, placeholders or third-party scripts.
- The About, Understanding College, College Leaders and Policymakers copy audits still pass.
- Browser: `404.html` at 375 and 1440 CSS px has one `h1`, `noindex,follow`, six main links and no horizontal overflow. Home at 375 has one `h1` and nine `h2`, six cards and no overflow; at 1440 the audience grid is three columns and there is no overflow. The mobile menu opens with `aria-expanded="true"`; Escape closes it, sets `aria-expanded="false"` and returns focus to the toggle. The Phase 11 notes-panel checks still hold.
- Transfer sizes: `styles.css` 145.7 KB raw / 18.8 KB gzip; `ui.js` 4.7 KB / 1.3 KB; the Choosing page’s quiz scripts total 71 KB raw; `preview/` is 1.45 MB, of which 429 KB is images. Fonts are self-hosted WOFF2 with `font-display: swap`.

Not checked:
- Lighthouse, axe or any automated accessibility engine: no dependency or local browser harness is installed here. The audit is static; browser checks cover layout plus the menu and notes interactions, not a full keyboard traversal of every quiz and form.
- A screen-reader pass and real-device testing.

Blocked, which is why the phase is PARTIAL:
- **Domain, canonical URLs, sitemap and robots.txt**: build support is complete. Set `SITE_URL=https://…` (or `url` in `src/data/site.json`) and the same build emits canonical/`og:url` tags, JSON-LD, a sharing image and `sitemap.xml`; without an origin those absolute-URL tags are skipped, any stale `sitemap.xml` is deleted, and `robots.txt` is still written. No domain was invented.
- **OG image**: no 1200×630 asset exists and there is no absolute origin for `og:image`. The card tags are in place; the image needs a designed asset and the domain.
- **Analytics**: none is installed by decision, and the Privacy page says so. Adding it needs a provider/account choice and a privacy update in the same change.
- **Deployment**: not authorized. No commit, push or host configuration was made.
- **Search descriptions**: five exceed 160 characters (College Leaders 179, Counselors 212, In College 172, Home 162, Policymakers 184). They are the docx wording and were left verbatim; Rick may want them shortened.

Next: launch decisions — analytics, domain, OG image and deployment.

### Revision 6 completion — 13 November 2026

The Revision 6 document and the six PDFs were uploaded to the repository on this date, so the three gaps recorded in `artifacts/handoff/` are built. `rev6-audit.js` now reports 55 PASS, 0 FAIL, 0 BLOCKED.

Delivered:
- Four tool pages, joining the scorecard: `tools/semester-plan.html`, `tools/course-self-audit.html`, `tools/leaders-checklist.html`, `tools/policy-brief.html`, each with labelled fields, browser storage, Print, Copy text, Download as PDF and Reset, and a one-page print stylesheet.
- Six downloads in `preview/downloads/`, copied from `src/downloads/` and linked from Parents, Counselors, Faculty, College Leaders and Policymakers.
- The Counselors quiz: five scored questions, an optional setting question, a tie-breaker and four results, plus the Home card link.
- Counselors page rebuilt around the quiz, with the Revision 6 title and search description, the ten numbered source notes and the kit download.
- `artifacts/counselors-quiz-audit.js` and `artifacts/downloads-audit.js` added; `rev6-audit.js` and `feature-audit.js` updated from blocked to enforcing.

Checks run: `node build.js`; `qa-audit`, `rev6-audit`, `feature-audit`, `quiz-audit`, `seo-audit`, `data-html-audit`, `downloads-audit`, `counselors-audit`, `leaders-audit`, `policymakers-audit`, `understanding-audit`, `about-audit` — all pass. `counselors-quiz-audit` covers all 1,024 answer paths (664 single results, 360 tie-breakers).

Not done, and why: the leaders checklist's “From your quiz” marking and the policy brief's result-driven ordering were not derivable from the Revision 6 text or the data files, so neither was invented. The self-audit's format-dependent examples are the same case. 375/768/1440 visual passes and a real print pass were not run in this chat.

### Cross-phase audit — 7 November 2026

Added three zero-dependency audits:
- `artifacts/spec-audit.js` follows the corrected source map and checks every content paragraph in the built HTML plus engine-rendered copy. It reports **1,283 paragraphs checked and 0 missing** across the ten content pages.
- `artifacts/quiz-audit.js` walks every answer path in all six quizzes (9,072 in total), checks that every path produces a written result, that empty answers produce none, and that the Choosing tie-break resolves. It also checks every result has its required fields.
- `artifacts/feature-audit.js` checks the per-phase feature inventory: Home 6 cards, 3 findings and 6 outcomes; Choosing 5 questions, 6 results and the scorecard; In College 5 practice cards, 6 hard blocks and 5 plan cards; Parents cost and check blocks; Faculty 5 practice cards, 6 audit items and 5 variant sets; College Leaders 8 checklist rows, 8 data rows and 2 quotations; Counselors 8 sections, 4 tables and 19 glossary terms; Policymakers 3 findings, 4 Washington blocks, 5 brief rows and 4 request fields; Understanding College 7 quotations, 5 misconceptions, 5 questions, 5 timeline points, 5 bars and 4 tables; The Research 5 findings, 3 G1 bars and 4 tables; About 7 milestones and 2 images. It passes.

Fixed in the audit:
- **Choosing a College:** the closing now uses source paragraph 651 instead of Home’s closing; added the missing end block (652–658) with five next steps, including Understanding College and The Research.
- **In College:** added the missing final next step (857).
- **College Leaders:** restored the quotation marks around both blockquotes.
- **All six quiz results:** the exact shared honesty line (194–195); **Copy my questions** and **Email this to me** controls with a hidden plain-text source and one shared handler in `ui.js`.
- **All six quizzes:** the missing shared instruction (“Pick the answer that is true for you…”) is now rendered under every question, optional question and tie-break. Pointer selection now advances to the next question automatically; Next remains for keyboard users.
- **Parents scoring:** question 4 was meant to be unscored but was counting its Security/Growth/Purpose answers. It is now forced to `null`, and the exhaustive audit covers the corrected behavior.
- **End points:** In College, Parents and Faculty now link the phrase “Understanding College” to the page; all six end blocks have five steps and the required Understanding College link.
- **Closing blocks:** all seven “A meaningful life in a world of change” closings now place their paragraphs behind a “Read more” disclosure closed at 760px and below; the heading, section label and any call to action remain visible.
- **What Matters in College:** removed the public “preview of one section / full page will…” promise; the linked page now stands as a complete one-chart evidence overview with its caveat and sources. Its title now follows the site brand.
- **Understanding College:** quotations three through seven now sit in a “Read more quotations” disclosure, closed at 760px and below; the first two stay open.
- **Counselors:** the 19-term “Words colleges use” glossary now sits in a “Read all 19 terms” disclosure, closed at 760px and below.

Checks run:
- `node build.js`.
- `node artifacts/spec-audit.js` — 0 missing.
- `node artifacts/feature-audit.js` — pass.
- `node artifacts/quiz-audit.js` — pass: 9,072 answer paths, all six quizzes, no default result.
- `node artifacts/qa-audit.js` — pass on 15 pages; 18 tables, all captioned.
- The About, Understanding College, College Leaders, Policymakers and Counselors copy audits still pass.
- Browser at the available 736px viewport: Choosing’s first-option path reached “The Leader”; the exact honesty line and both new controls rendered; the copied question text held 598 characters; the copy button reported “Copied.” A real click on the first answer rendered the instruction and auto-advanced Question 1 to Question 2 without pressing Next. College Leaders reached “Mission-first” with both controls and a 529-character source. Understanding’s quotation disclosure was closed and the last five figures were not visible (`checkVisibility` false); the history was closed.
- Closing disclosures at 736px in same-origin iframes: all seven pages load with the closing paragraphs hidden, “Read more” visible, and the heading visible; Home’s “Find your questions” CTA remains visible. Clicking the summary opens the paragraphs. At 1200px the closing is open, the paragraphs are visible and the summary is hidden.
- Breakpoint sync in same-origin iframes: at 736px the closing, Understanding history and Parents disclosures are closed; resizing to 1200px reopens them; resizing back to 736px closes them again. The mobile menu changes its accessible label to “Close menu” when opened and back to “Open menu” after Escape. What Matters has no preview promise, one chart figure with six table rows, and a sources panel with two notes.

Not checked:
- Playwright was unavailable in the workspace, so there was no scripted 375/1440 pass and no automated accessibility engine. The new result buttons are native buttons and were clicked at 736px; a full keyboard traversal is still recommended.
- The other four quiz flows were not re-driven in this browser session. They share the same result markup and handler, pass the static audits, and their original phase browser checks still stand.
- The Counselors glossary disclosure was verified statically and through the shared `ui.js` breakpoint handler, not opened in the browser.

## Source map (docx paragraph ranges)

| Section | Paragraphs |
|---|---|
| Contents | 0–136 |
| How to use / shared elements | 137–212 |
| Home | 213–261 |
| Choosing a College | 263–658 |
| In College | 660–857 |
| Parents | 859–1005 |
| Faculty | 1007–1198 |
| Counselors | supplied Counselor Kit PDF (8 sections); not in the docx |
| College Leaders | 1200–1437 |
| Policymakers | 1439–1590 |
| Understanding College | 1592–1759 |
| The Research | 1761–1876 |
| About the Author | 1878–1907 |
| Photo and graphics plan | 1909–2018 |
| Appendices A–B (corrections, verify list) | 2019–2076 |
| Endnotes note | 2077–2078 |

Useful tables: 2 audience cards; 3 rating scale; 4–6 scorecard; 7–8 semester plan; 9–10 course audit; 11–12 institutional checklist; 13 policy brief; 14 kinds of colleges; 15 content/context; 16 outcomes; 17 experiences; 18 other research; 19 photos; 20 graphics; 21 corrections.

Ranges above were corrected on 7 November 2026 from the actual H1 positions in the 12 October docx during the cross-phase audit. Earlier per-phase ranges for Home, Choosing, In College, Faculty and The Research were stale and are superseded by this table. The Research page was built from an earlier extraction; its future copy checks should use 1761–1876.

## Open decisions and missing inputs

1. **Is the 12 October docx still the copy of record?** The earlier plan refers to a newer Rev6 text, but that document is not in the repository. If Rev6 exists, attach it before Phase 3 copy work; otherwise use the docx and mark the difference.
2. **What Matters in College**: the linked page is now a complete one-chart overview (chart, how to read it, what it says, limits, sources), and the abandoned “full page” promise is gone. There is still no Rev6 outcome-by-outcome prose in the repository, so any expansion needs Rick’s copy.
3. **Chart verification**: confirm figure 10.1, especially “A major not tied to one occupation” → 44% **fulfillment** (not personal success), and “Intellectual skills” → three linked outcomes.
4. **Counselors**: resolved on 7 November 2026 by the supplied Counselor Kit PDF, now published as `preview/counselors.html`. Before launch, confirm three things with Rick: (a) the kit’s long-career 72%/75% lower-income figures versus the 24%/33% current-income figures used elsewhere; (b) the “six questions” heading, which lists seven questions; (c) the missing QR codes for the print version. The kit has no separate quiz; the group session uses the Choosing and Parents quizzes.
5. **About facts**: the unsourced press/talk list, “Work with us” band and fact box were removed in Phase 11, and the page now follows docx 1878–1907. Still to confirm: the Peace Corps line (docx 1900, currently unpublished) and whether the portrait should carry a named photographer credit. The old “10th president” error is corrected to eighth.
6. **Footer/copyright**: the docx says “© 2026 Richard A. Detweiler. All rights reserved.” The earlier plan says “© 2026 HigherEdImpact. Research findings © Richard A. Detweiler.” Confirm before launch.
7. **Photos**: P1–P8 are not in the repository; identifiable people need releases. P9 portrait and P10 book cover are available and are the only photos About uses. `src/assets/images` also holds an Eastern Connecticut State University photo, but the docx gives no caption, date or permission, so it is not published. Do not use AI-generated people.
8. **Domain and analytics**: deferred by the user. Phase 12 added the meta groundwork but no canonical URLs, sitemap, robots.txt or `og:image` until a domain exists. Do not buy, configure or deploy without explicit approval.
9. **Dean’s Briefing**: the supplied `deans-briefing (1).pdf` is a College Leaders companion (one-page summary plus a 10-slide outline). It is not published. Its long-career figures and some percentages differ from the current College Leaders page; reconcile them with Rick before building a deans page or PDF download.
10. **Policymakers two-page leave-behind PDF**: the source lists a download of the two-page leave-behind. No PDF exists in the repository, so the button is not rendered; the one-page brief copies, emails and prints. Still open after Phase 11.
11. **Understanding College endnotes**: the chapter’s Word endnotes are not attached. The page names its sources inline and gives chart source lines, but a full Notes list should be added with the Phase 11/12 source work.
12. **Understanding College P8 photo**: table 19 calls for a three-campus photo at the opening. No licensed asset is in the repository; add it with the other photo assets.
13. **Understanding College page heading**: docx note 1593 says the site page heading is “Understanding American Higher Education,” while 1597–1598 give the label “Understanding college” and the H1 “Four thousand colleges…”. The build follows 1597–1598; confirm the intended page heading with Rick.
14. **PDFs and a resources page**: PHASES previously said Phase 11 would “add the six PDFs,” but the 12 October docx names only the Policymakers two-page leave-behind and the repository contains no PDF files. There is also no resources-page copy in the docx. Provide the PDFs (or a list of them) and the intended resources copy, or drop both from the plan.
15. **Search descriptions**: five docx descriptions are longer than the roughly 160 characters search engines show (College Leaders 179, Counselors 212, In College 172, Home 162, Policymakers 184). They are published verbatim; Rick can shorten them if he wants the full text in results.

## Phase handoff template

When finishing a phase, add or replace its status note with:

- What was built (files).
- Source ranges used.
- Checks run and their results.
- What was not checked or is blocked.
- The next phase and its first concrete action.

That is how “start next phase” stays predictable.
