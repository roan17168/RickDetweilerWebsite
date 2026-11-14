# 02 — Build plan

Order is deliberate: the quiz unblocks an existing Rev6 requirement and touches fewer unknowns;
tool pages depend on attachment specs; PDFs are last because they are binary assets that must be
supplied or produced from supplied source.

## Phase 0 — Set up and prove the baseline (30 min)

1. Confirm the branch contains this chat's uncommitted work (see [README.md](README.md)).
2. Put every attachment under `artifacts/source/` with descriptive names; never edit them.
3. Run the eight audits and record the numbers in a scratch file. They must match the baseline in
   [01-audit.md](01-audit.md). If they do not, stop: the starting point is wrong.
4. Read `src/pages/counselors.html`, `src/scripts/faculty.js`, `src/data/faculty.json`,
   `src/pages/tools/college-scorecard.html` and `src/scripts/choosing.js` before writing anything.

Gate: build and all eight audits at baseline; no uncommitted surprise edits.

## Phase 1 — Counselors quiz + Home card (half day to a day)

Deliverables:

- `src/data/counselors.json` — quiz questions, options, results, any optional question.
- Quiz logic in `src/scripts/counselors.js` (keep the existing print handler).
- Quiz block in the hero of `src/pages/counselors.html`, first question visible, skip link under
  it, result card with Copy / Email / Share / Retake.
- Build entry for `counselors-data.js` in `build.js`.
- Notes for any study named in the quiz, added to the `counselors` list in `siteNotes`.
- Home counselor card returns to Revision 6's label and target: “Start the 2-minute quiz”, linking
  to `counselors.html#quiz` (Rev6 Home card copy).
- Remove the `counselors.html` exemptions in `artifacts/rev6-audit.js` for “quiz mount” and
  “skip the quiz” so the audit starts enforcing them.
- Extend `artifacts/counselors-audit.js` with quiz checks, or add
  `artifacts/counselors-quiz-audit.js` in the same style.

Gate: quiz reachable in the hero, keyboard-complete, result persists, share hash works on reload,
notes panel opens from quiz citations, `rev6-audit` shows the counselors quiz as PASS (BLOCKED
count drops to 2).

## Phase 2 — Four tool pages (one to two days, depends on attachment specs)

For each tool named in the attachments:

- `src/pages/tools/<slug>.html`
- `src/data/<tool>.json` if it needs structured fields
- `src/scripts/<tool>.js` for persistence, Copy / Email / Print
- build entry + `siteNotes` if the page cites studies
- one “Open the …” card on the owning audience page, replacing the current print-button card if
  the attachment says the tool page replaces it
- SEO title and description
- audit additions

Use `tools/college-scorecard.html` as the template and the scorecard app in `choosing.js` as the
reference implementation for table state, localStorage, Copy/Email/Print and print CSS.

Gate: every tool page loads with no console errors at 375/768/1440, all fields labelled, state
survives reload, Print shows the complete tool, no “Download as PDF” label unless a real PDF
exists and is linked.

## Phase 3 — Six downloads (depends on supplied PDFs or print-ready source)

1. Place the final PDFs in `src/downloads/` with lower-case hyphens, e.g.
   `parent-checklist.pdf`.
2. Copy them to `downloads/` in `build.js` (`fs.cpSync`), and log the count.
3. Link them from the owning page and from the matching tool page where Rev6 says so, with
   `<a href="…" download>` and descriptive link text.
4. Keep the existing on-page print controls; they are not a substitute for the PDF link and the
   PDF link is not a substitute for them.
5. Update `src/pages/privacy.html` only if a download starts collecting anything — it should not.
6. Add `artifacts/downloads-audit.js`: six files exist, each is a valid PDF header (`%PDF-`), each
   is linked from at least one page, no 404s, no link labelled “Download as PDF” without a file.

Gate: six files in `downloads/`, every link resolves, audit passes, `seo-audit` still
passes (PDFs are not pages and must not appear in `sitemap.xml`).

## Phase 4 — Alignment and handover (2–3 hours)

- Update `README.md` (page list, downloads, quiz count), `PHASES.md` and
  `artifacts/revision-6-input-ledger.md`.
- Re-run every audit and the browser suite; record counts in the ledger.
- Confirm `rev6-audit` reports 0 BLOCKED and 0 FAIL.
- Report changed files, commands run, and anything still impossible.

## Effort and risk

| Work | Effort | Main risk |
| --- | --- | --- |
| Counselors quiz | 0.5–1 day | Attachment may not contain full scoring/result copy; stop and ask rather than improvise |
| Tool pages | 1–2 days | Page names/fields may be ambiguous; confirm before building four of them |
| Downloads | 0.5 day + asset production | PDFs may not exist yet; do not fabricate them from page copy without approval |
| Alignment | 2–3 hours | Audit expectations must move with the content, never be weakened to pass |

## Definition of done

1. `node build.js` and all audits exit 0 (browser suite 0 FAIL).
2. `rev6-audit` reports 0 FAIL and 0 BLOCKED.
3. No invented copy anywhere: every sentence traces to Revision 6 or a supplied attachment.
4. New pages appear in the sitemap and have unique titles/descriptions.
5. Privacy page lists every localStorage key the site now writes.
6. Nothing committed, pushed or deployed without the owner's instruction.
