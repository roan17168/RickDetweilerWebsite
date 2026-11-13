# Revision 6 deviation register

Measured 13 November 2026 by `node artifacts/rev6-docx-audit.js`, which unzips
`Website_Layout_Review_Revision6.docx`, reads `word/document.xml`, extracts all 3,189
paragraphs and checks the built site against them.

**Result: 515 checks pass, 17 fail — four root causes.** Every other audit in
`node artifacts/run-all-checks.js` passes (14 of 15 scripts; only this suite fails).

The four causes, in remediation order:

## 1. The five audience pages have no notes panel (10 failed checks)

| Page | Revision 6 citation list | Numbers in the page today |
| --- | --- | --- |
| In College | paragraph 711, 7 notes | 0 |
| Parents | paragraph 908, 10 notes | 0 |
| Faculty | paragraph 1297, 8 notes | 0 |
| College Leaders | paragraph 1548, 10 notes | 0 |
| Policymakers | paragraph 1700, 10 notes | 0 |

Revision 6 requires that every page citing research has a notes panel, that every study named
in the text carries a note number, and that readers can reach the panel from a superscript,
a sidebar link and a visible “Sources for this page” link (paragraphs 20, 154, 201).
Choosing a College and Counselors already meet this. The other five carry named studies but no
numbers and no panel, so `siteNotes` is empty for them in `build.js`.

Remediation: add the five citation lists from the paragraphs above to `siteNotes`, add the
“Sources for this page” control to each page, and place `source-note` superscripts at each
study mention in the page copy, numbered from 1 in order of first appearance. The copy audits
and `rev6-audit.js` will then enforce contiguity.

## 2. “Share my result” is missing from five quiz results (5 failed checks)

Choosing a College and Counselors have Copy, Email, Share my result and Retake. In College,
Parents, Faculty, College Leaders and Policymakers have Copy, Email and a retake control but no
share (Revision 6 paragraph 150, and 192–193 for the behaviour).

Remediation: add a `data-result-share` control to each result card, copy
`page.html#result=<key>`, and reopen that result from the hash so the promise holds — the
result markup is already data-driven in all five scripts.

## 3. The scorecard's experience rows differ from Revision 6 (1 failed check)

Revision 6's College Scorecard (paragraphs 2316–2377) lists five experience rows — faculty
contact, breadth, classroom discussion, community, finishing — plus four “My own” rows, four
college columns and a pass/fail dealbreaker band.

`src/data/choosing.json` currently defines seven experience rows (the six adult outcomes plus a
professor row). The app, the star mapping from quiz outcomes and the strong counts are built
around those seven.

This is a design decision, not a copy fix: adopting Revision 6's five rows means redefining the
scorecard's model and its quiz-star mapping. It should be confirmed with the owner before
changing a working tool.

## 4. The course self-audit omits one sentence of “How to use it” (1 failed check)

Revision 6 paragraph 2406 ends: “…and commit to one change for next term. **The examples change
with the format chosen.**” The tool page has the first sentence but not the last, because the
example placeholders do not yet vary by in person / hybrid / online.

Remediation: add the sentence and make the five evidence placeholders change with the format
(the workshop kit's own adaptations supply the hybrid and online wording).

## What the suite also checks, and passes

- 26 browser titles and search descriptions compared word-for-word with the document.
- 13 site-map pages exist; `tools/` holds exactly five pages; `downloads/` holds six.
- Five tool pages: address, back link, “What it's for”, “How to use it”, row counts, the four
  controls, labelled fields, one `h1`, print styles, quiz-filled line.
- Six PDFs: real PDF header, page count matching the document (2/4/5/2/2/8), linked from the
  pages it names with descriptive text and a `download` attribute.
- Counselors quiz: 37 question/option/heading strings, 34 result, advice and citation strings,
  five questions, four results, tie-breaker, skip link.
- Seven audience pages: quiz before the findings, skip link, result controls, What Matters link,
  sources control and panel, no repeated closing block, no invented PDF label, one tool card.
- Every page: skip link, seven perspectives, four standing links, Open Graph and Twitter tags,
  PNG + ICO + Apple icons, no inline styles, no placeholders.
- Design: navy/gold/darker-gold tokens, Lora + Inter, Inter italic loaded, 13px section labels,
  focus-visible, reduced motion.
- Privacy: every `wcirf_*` key written by any script is named on the page.
- Cross-cutting: the 55–65 age range only on the method pages, services only on About, Home has
  seven cards, no unfinished promises.
