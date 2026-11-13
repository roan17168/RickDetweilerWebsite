# 04 — Content extraction checklist

Fill this in from the attachments before writing code. Anything left blank is a blocker, not a
prompt to improvise. Put the source files under `artifacts/source/` and cite the page or slide in
the notes column.

## A. Tool pages (four missing, one existing)

For **each** of the four tools the attachments describe:

| Field | What to record | Notes |
| --- | --- | --- |
| Tool name (as shown) | exact heading | must match attachment wording |
| Output slug | `tools/<slug>.html` | lower-case, hyphens; confirm with owner if unspecified |
| Owning audience | choosing / in-college / parents / faculty / leaders / policymakers | determines the card that links to it |
| Page title | “<Tool> \| What College Is Really For” | ≤ 65 characters |
| Search description | 70–165 characters | no invented claims |
| “What it's for” | exact paragraph | |
| “When to use it” | exact paragraph | |
| Instructions | numbered steps, verbatim | |
| Fields | label, control type (text, select, radio, textarea, number), options, default, help text | every field needs a label |
| Rating scale / legend | labels and meanings | include a `<caption>` on tables |
| Rows / items | the fixed content the tool displays | |
| Sources | any study named and its citation | becomes a numbered note |
| Print requirement | what must appear on paper | default: everything, header/footer hidden |
| Saved data | which fields persist | propose `wcirf_<slug>_v1` |
| Relationship to existing controls | does this replace a print button or a card on the audience page? | keep one primary action |

Existing reference: `tools/college-scorecard.html` (4 college columns, 14 rows, star-your-result,
three tabs at phone width, localStorage `wcirf_choosing_scorecard_v1`, Print).

Open questions to resolve with the owner:

- Are the four tools one per remaining audience, or a different split?
- Do any of them share data with the scorecard?
- Are they public, indexable pages or linked only from their audience page?
- Does Revision 6's “Download as PDF” mean a real PDF per tool, or the browser's print-to-PDF?

## B. Downloads (six)

| Download | Source attachment / page | File name | Linked from | Also printed on page? |
| --- | --- | --- | --- | --- |
| Parent checklist | | `parent-checklist.pdf` | Parents | yes, today's print card |
| Workshop kit | | `workshop-kit.pdf` | Faculty | yes |
| Dean's briefing | | `deans-briefing.pdf` | College Leaders | yes |
| State brief | | `state-brief.pdf` | Policymakers | yes |
| Federal memo | | `federal-memo.pdf` | Policymakers | yes |
| Counselor kit | | `counselor-kit.pdf` | Counselors | yes |

For each, record: exact title, one-sentence description for the link, page/section where the link
belongs, whether the PDF is supplied or must be produced, and the “Sources” line at the end of the
download (Revision 6 requires each download to end with a short sources line).

Rules: lower-case hyphenated filenames; PDFs must not be generated from unaudited page copy;
no analytics or tracking parameters on download links.

## C. Counselors quiz

| Field | What to record |
| --- | --- |
| Number of questions | |
| Question text | verbatim, in order |
| Answer options | verbatim, in order |
| What each answer counts toward | only if the attachment says; otherwise ask |
| Optional question (if any) | |
| Result names | Revision 6 confirms at least **Matchmaker** and **Door Opener** |
| Result copy | heading, lead, finding, questions to ask, “check without asking”, “try this one thing”, research line |
| Scoring / mapping | how answers produce a result; ties |
| Citations | studies named and their full references |
| Intro and honesty lines | Revision 6 gives the shared wording; reuse it |
| Result persistence | confirm it should be saved (`wcirf_counselors_result_v1`) |

Revision 6 wording checks to apply verbatim where the quiz quotes research:

- Dale and Krueger: “followed earnings for more than 20 years. The earnings advantage of a more
  selective college was small once their own abilities were taken into account.”
- Chetty, Deming and Friedman: “rather than a flagship public university”; “prestigious finance or
  consulting firm”; **88.4%** of Fortune 500 CEOs (not 88.45%).
- Door Opener result uses “such as”.

## D. Cross-cutting content updates caused by the above

- **Home counselor card**: Revision 6's Home text is “Start the 2-minute quiz”, linking to the
  counselor quiz. Change it only once the quiz exists.
- **Counselors page hero**: quiz first; the “Print this kit” button moves below the quiz or into
  the kit section. Confirm with the wireframe.
- **Privacy page**: add every new localStorage key. Today it names
  `wcirf_choosing_result_v2`, `wcirf_choosing_scorecard_v1`, `wcirf_in_college_plan_v1`.
- **README / PHASES / ledger**: page count, download count, quiz count, audit numbers.
- **Sitemap**: new HTML pages appear automatically; PDFs must not.

## E. Blockers to raise before building

1. Any tool page whose name or fields are not in the attachments.
2. Any quiz result without supplied copy.
3. Any PDF that does not exist and has no approved source.
4. Any conflict between an attachment and Revision 6 (Revision 6 wins; flag the difference).
5. Any request to deploy, publish or commit.
