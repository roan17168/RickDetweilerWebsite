# Revision 6 conformance audit — 17 November 2026

Independent audit of the built site against `Revision6.pdf` (156 pages, uploaded by the
owner 17 November 2026) and the six take-away PDFs.

## 0. What was reviewed, and one important finding about the inputs

| Input | Finding |
| --- | --- |
| `Revision6.pdf` | **The same document as `Website_Layout_Review_Revision6.docx`, which is already in the repository.** Word-for-word similarity of the extracted text is 0.992. The only differences are PDF extraction artefacts (line-wrap hyphens, table-cell ordering, XML leaked by indented list items). No newer revision was uploaded. |
| `counselor-kit.pdf`, `deans-briefing.pdf`, `faculty-workshop-kit.pdf`, `federal-staff-memo.pdf`, `parent-checklist.pdf`, `state-brief.pdf` | **Byte-for-byte identical (MD5) to the six PDFs already in `downloads/`.** Nothing to change. |

So the audit below is measured against exactly the specification the repository's own
`rev6-docx-audit.js` reads, plus my own independent checks where that suite's coverage
turned out to be thin.

## 1. Automated suite status

`node artifacts/run-all-checks.js` → **14 of 15 pass.** The only failing suite is
`rev6-docx-audit.js` (515 PASS, 17 FAIL). Its 17 failures are four root causes, all
independently confirmed below, plus three uncovered by any suite (section 3).

## 2. The four root causes — confirmed, all still open

### 2.1 Five audience pages have no notes panel and no note numbers (10 of the 17 failures)

`siteNotes` is empty for `in-college`, `parents`, `faculty`, `college-leaders` and
`policymakers`, so `build.js` emits no panel; no page carries `data-notes-open`; and
`node /tmp/orphans.js`-style inspection shows **0 `source-note` superscripts** on all five.

Revision 6 lists 7, 10, 8, 10 and 10 citations for those pages respectively
(paragraphs 711, 908, 1297, 1548, 1700) — 45 citations in total.

**But adding notes alone will not close this.** Comparing each required citation list
against what the pages actually contain, more than 20 of the 45 cited studies are named
nowhere in the page copy — not in the HTML and not in the quiz JSON. Examples:
Pew Research Center (Parents), GMAC Corporate Recruiters Survey (In College, Parents,
Policymakers), Freeman's PNAS active-learning study (In College, Faculty), Guarino and
Borden (Faculty), Bureau of Labor Statistics (College Leaders, Policymakers), Gallup and
Strada (College Leaders), the Department of Education "Working Families" fact sheet
(Policymakers), World Economic Forum (College Leaders, Policymakers), Tinto (Parents).

A notes panel listing studies the page never mentions would be worse than no panel —
it would invent citations. **This needs a decision (question 2).**

### 2.2 "Share my result" is missing from five quiz results (5 failures)

Specified at paragraph 150 ("Every result has Copy, Email, Share my result and Retake")
and 192–193, and repeated for In College (616), Parents (801), Faculty (1193), College
Leaders (1405) and Policymakers (1640). Choosing and Counselors have it; the other five
have Copy, Email and Retake only. Confirmed by grep: `share` count is 0 in all five
scripts. Pure feature gap, no missing input — fixable now.

### 2.3 College Scorecard has 7 experience rows; Revision 6 specifies 5

`src/data/choosing.json` defines professors, leadership, civic, continued, cultural,
fulfillment and personal success. Revision 6 (paragraphs 2316–2377) lists faculty contact,
breadth, classroom discussion, community and finishing, plus four "My own" rows.

**This is a design change, not a copy fix** — the star mapping from quiz outcomes and the
strength counts are built around the current seven. Recommend confirming before touching a
working tool (question 3).

### 2.4 Course self-audit omits one sentence

Paragraph 2406 ends "…and commit to one change for next term. **The examples change with
the format chosen.**" The page has the first sentence but not the last, because the five
evidence placeholders do not vary by in-person / hybrid / online. The workshop kit's own
adaptations supply the wording. Fixable now.

## 3. Three gaps no existing suite catches

These were found by reading the document section by section rather than by running the
repository's suites. They are the largest defects on the site.

### 3.1 Understanding College has no notes panel, no note numbers, no sources control

Revision 6 specifies all three for this page (paragraphs 1935–1937) and a **32-entry**
citation list (paragraph 1937). The page has no panel, no `source-note` superscripts and
no "Sources for this page" control. It names Astin, Pascarella, Terenzini, Tinto, Gallup,
Light and Chetty in the body with no numbers. `siteNotes.understanding` is `[]`.

### 3.2 The Research page has no notes panel, no note numbers, no sources control

Revision 6 specifies all three (paragraphs 2181–2183) and a **14-entry** citation list
(paragraph 2183). `siteNotes.research` is `[]`. The page cites [1]–[11] in its own copy.

### 3.3 What Matters in College is missing three sections and has orphaned notes

The page stops after the chart and its table. Revision 6 specifies, in addition:

- **"What stands out"** (paragraph 2009)
- **"An authentic learning community"** — the seven-bullet explainer (2016–2023)
- **"The detail, outcome by outcome"** — six sections carrying the specific figures such as
  "36% for majors other than business or accounting", 45%, 47%, 49%, 56%, 149% (2025–2062)
- **"Where to go next"** (2069–2072)

It also has notes 1 and 2 in its panel but **only note 1 is ever cited**; note 2 is orphaned.
The spec's notes list for this page (paragraph 2074) has **four** entries — the panel is
missing Tinto [2] and both Walton studies [3][4], which correspond to the missing
"A major not starting in college / belonging" material.

### 3.4 About page is missing the entire "Work with HigherEdImpact" section and "Our other programs"

- **"Our other programs"** — four cards (Research; Speaking and workshops; Testimony and
  briefings; Advising), paragraph 2199–2204. Absent: 0 matches for "Our other programs".
- **"Work with HigherEdImpact"** — `id="work"`, "linked from every audience page"
  (paragraph 2244). The section does **not exist** on About (0 matches for `id="work"`,
  "Testimony", "briefings", "fees"; "Advising" appears once only by coincidence), and
  **no page links to `about.html#work`** (0 of 8 pages checked).
- Two brief items: the HigherEdImpact **website link** (`higheredimpact.org`, present only
  in the footer) and the **annual summary** link, explicitly marked "to be added".

Note: the spec's own note 3 and note 5 for Understanding College read "Detweiler,
Detweiler, The Evidence…" — a duplicated word in the source. If those citations are
transcribed, that typo should not be copied.

## 4. Verified correct — no action

- **Your seven Revision 6 items.** All seven present: the Choosing timeline is there with
  six steps in the right place and open, not collapsed (paragraph 12, page line 231).
  88.45% is corrected to **88.4% everywhere** (4 occurrences, zero of 88.45%). Chetty,
  Deming and Friedman NBER 31492 is the citation used. Dale and Krueger wording is
  consistent across Choosing, Counselors and the quizzes.
- **Six PDFs** byte-identical to the spec pack, linked with descriptive text and `download`.
- **Five tool pages** exist, each with back link, "What it's for", "How to use it", the four
  controls and labelled fields. Notes panels on the two tools that cite the study.
- **Counselors quiz** — five questions, four results, tie-breaker, all 1,024 answer paths
  resolve; 37 text strings verified.
- **Choosing quiz and scorecard, In College, Parents, Faculty, College Leaders,
  Policymakers quizzes** — all answer paths resolve.
- Home has its seven cards; the 55–65 age range appears only on method pages; services are
  described only on About (once the section is added); no unfinished promises elsewhere.
- Titles, descriptions, Open Graph, structured data and 18-page sitemap all pass.
- Design tokens, typography, focus states and reduced motion pass.
- No third-party code, no cookies, no analytics — and Privacy says exactly that.

## 5. Remediation completed (17 November 2026, same session)

After the audit above, the owner answered four questions and the work was done:

| Item | Status |
| --- | --- |
| "Share my result" on In College, Parents, Faculty, College Leaders, Policymakers | **DONE** — button on every result; `#result=<key>` reopens the result without the reader's answers; verified in jsdom (button renders, link reopens, no answers leak) |
| Five audience-page notes panels + 45 citations | **DONE** — every required study now has a home; missing passages written from the spec's own wording |
| Understanding College notes (32) | **DONE** — all 32 cited, none orphaned |
| Research page notes (14) | **DONE** — all 14 cited, none orphaned |
| What Matters — 3 sections + 2 notes | **DONE** — What stands out, What is an authentic learning community?, The detail outcome by outcome, Where to go next; panel now the spec's four |
| About — About HigherEdImpact + Our other programs + Work with HigherEdImpact | **DONE** — fact box with EIN; three service cards with preset subject lines |
| Scorecard 5 rows + 4 of your own | **DONE** — remapped quiz stars onto the new rows |
| Self-audit closing sentence + format examples | **DONE** — placeholders change with in person / hybrid / online |
| Annual summary link, P.O. box | **OMITTED by owner's decision** (still unsupplied) |

**`node artifacts/run-all-checks.js`: 15 of 15 suites pass.**
`rev6-docx-audit`: 535 PASS / 0 FAIL (was 515 / 17). `rev6-audit`: 55 PASS / 0 FAIL.

Four audit assertions were rewritten because they encoded pre-Revision-6
expectations the spec explicitly supersedes (About must now have a fact box, a
Work section and six headings; the milestone count is scoped to `#milestones`).
Two more were given the same `<sup>`-stripping the main suite already used, so
that citation numbers are not mistaken for prose.

## 6. Scorecard

| Area | Status |
| --- | --- |
| Six PDFs | PASS |
| Your seven items | PASS |
| Five audience-page notes panels + numbers | PASS |
| "Share my result" on five results | PASS |
| Understanding College notes (32) | PASS |
| Research page notes (14) | PASS |
| What Matters — 3 sections + 2 notes | PASS |
| About — "Work with HigherEdImpact" + "Our other programs" | PASS |
| Scorecard 5 rows + 4 of your own | PASS |
| Self-audit closing sentence + format examples | PASS |
| Everything else audited | PASS |

**Revision 6 is now complete against every mechanically verifiable requirement in
the document.** The two items the document itself marks as pending inputs (the
annual summary PDF and the P.O. box) remain open by the owner's decision, and are
recorded in `artifacts/revision-6-input-ledger.md`.
