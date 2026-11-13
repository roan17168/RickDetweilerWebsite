# 01 — Current-state audit of the three gaps

Measured against the build in this chat on 13 November 2026. All counts below come from the
repository, not from memory.

## Where the site stands

- 15 HTML pages build from `src/pages/`; Revision 6's site map lists 15, of which 14 are
  indexable (`foundation.html` is a design fixture and `404.html` is noindex).
- Seven audience pages exist: Choosing a College, In College, Parents, Counselors, Faculty,
  College Leaders, Policymakers.
- One tool page exists: `tools/college-scorecard.html`, about 1,100 lines of markup plus
  `src/scripts/choosing.js` (scorecard app) and `src/data/choosing.json` (`scorecard` key).
- No `downloads/` directory exists anywhere, source or preview; no page links to one.
- `src/pages/counselors.html` is 314 lines with **eight sections** (study, student handout,
  can't visit, family handout, first-in-family, group session, words, links) and a hero whose
  only actions are “Print this kit” and “Start with the student handout”.
  `src/scripts/counselors.js` is **12 lines** and only handles the print button.
- The Home page's counselor card links to the Counselor Kit page and is labelled
  “Open the Counselor Kit” — a deliberate placeholder because no counselor quiz exists.

## Gap 1 — four missing tool pages

Revision 6, Site map: “Tool pages (5) | tools/… | Each audience | Template; filled in from the
quiz; labeled fields; Download as PDF”.

Evidence:

- `src/pages/tools/` contains exactly one file, `college-scorecard.html`.
- No other `tools/*.html` source, no data file, no script, no audit, no build entry.
- Revision 6 names only the scorecard explicitly (“[Button: Open the College Scorecard]
  _(tools/college-scorecard.html)_”). The other four are described only as “template; filled in
  from the quiz”, so their names, fields and copy must come from the attachments.

Consequence: this chat could only have invented four page names and forty-odd fields. That is why
it is blocked, not because the build cannot host them.

## Gap 2 — six missing downloads

Revision 6, Site map: “Downloads (6) | downloads/… | Each audience | Parent checklist, workshop
kit, dean's briefing, state brief, federal memo, counselor kit”.

Evidence:

- `find src preview -type d -name downloads` returns nothing.
- No page contains `downloads/` in any `href`.
- Every current print-style control (six of them) calls `window.print()` and adds a body class
  such as `printing-leaders-checklist`; the label is **Print**, never “Download as PDF”, because
  no PDF exists.
- `artifacts/feature-audit.js` asserts zero “Download as PDF” labels, so adding one without a
  real file would fail the suite.

Consequence: the site currently promises a printable page, not a PDF. Revision 6 wants both a
tool/checklist on the page and a PDF to download. Only the PDF side is missing.

## Gap 3 — the Counselors quiz

Revision 6 references it four times:

1. Summary of tracked changes: “Choosing; Counselors; **the Counselors quiz**; Understanding
   College and the counselor kit … the Dale and Krueger and Chetty wording now reads the same”.
2. “Choosing; Counselors; **Counselors quiz (Matchmaker)**; Understanding College; counselor kit |
   Chetty: … 88.4% of Fortune 500 CEOs”.
3. “**Counselors quiz: Door Opener** | ‘such as’ | In place”.
4. Site map: “Counselors (new audience) | counselors.html | School counselors and college
   advisers | **Whole page with its own quiz**; counselor kit PDF”.

Evidence in the repository:

- `src/pages/counselors.html` has no quiz markup, no `id="…quiz"`, no result card, no script.
- `src/scripts/counselors.js` only binds the print button.
- No `src/data/counselors.json`, no quiz data, no audit.
- The Revision 6 document itself contains no question text, answer options, scoring or result
  copy for this quiz — only the two result names and one wording fix. The full quiz must be in
  the attachments the owner holds.

Consequence: Rev6's requirement is unambiguous, the content is absent from the document. Building
it here would have meant writing questions in Rick's voice.

## What is already correct and must not be disturbed

- **Notes and sources:** every page with citations has a native `<dialog id="notes-panel">`;
  note references use
  `<sup><a class="source-note" href="#note-1" data-note="note-1" title="See source">1</a></sup>`;
  notes are numbered from 1 per page and come from the `siteNotes` object in `build.js`.
- **Print:** six controls, each adds a `printing-*` class to `<body>`, calls `window.print()`,
  and removes the class on `afterprint`; print CSS lives at the bottom of each page stylesheet
  and in `src/styles/pages.css`. The scorecard's generic print path shows all four columns even
  at phone width.
- **Quiz mechanics:** five working quizzes, each with its own data file, script, result card,
  Copy / Email / Share / Retake controls, local persistence and a reduced-motion-aware scroll
  helper (`motionBehavior()`).
- **SEO:** titles/descriptions in the `pages` array, canonical/OG/JSON-LD/sitemap generated when
  `SITE_URL` is set, `robots.txt` always; audited by `artifacts/seo-audit.js`.
- **Accessibility:** skip link, one `h1`, labelled fields (audit reports zero unlabelled),
  native dialog, keyboard-operable disclosures, reduced-motion support.

## Audit baseline to preserve

| Audit | Baseline |
| --- | --- |
| `node build.js` | exit 0, 15 pages + 14-URL sitemap when a domain is set |
| `qa-audit.js` | 0 |
| `quiz-audit.js` | 0 (7,776 Choosing answer paths) |
| `feature-audit.js` | 0 |
| `data-html-audit.js` | 0 |
| `spec-audit.js` | 0 (historical mode) |
| `seo-audit.js` | 53 PASS / 0 FAIL / 17 NOTE without a domain; 87 PASS / 0 FAIL / 1 NOTE with one |
| `rev6-audit.js` | 44 PASS / 0 FAIL / 3 BLOCKED — the three items in this pack |
| `browser-audit.mjs` | 42 PASS / 0 FAIL / 32 NOTE (Playwright, outside the repo) |
