# Revision 6 input ledger

Status legend:

- **PASS** — implemented and verified.
- **PARTIAL** — implemented incompletely because a required input is missing.
- **BLOCKED** — cannot proceed without Rick.
- **FAILED** — checked and still incorrect.

Last updated: 13 November 2026.

## 1. Revision 6 source

| Item | Status | Detail |
| --- | --- | --- |
| `Website_Layout_Review_Revision6.docx` in this repository | **PASS** | Uploaded to the repository root on 13 November 2026 and extracted to `artifacts/source/revision6-paragraphs.txt` (3,188 paragraphs, indexed). |
| The six take-away PDFs | **PASS** | `parent-checklist.pdf`, `faculty-workshop-kit.pdf`, `deans-briefing.pdf`, `state-brief.pdf`, `federal-staff-memo.pdf` and `counselor-kit.pdf` are in the repository root and copied by the build to `preview/downloads/`. |
| `big-picture.svg` | **PASS** | Uploaded with the Revision 6 pack; the chart data remains transcribed in `src/data/big-picture.json`. |
| Revision 6 page, section, PDF, quiz and note exactness | **PASS** | Checked mechanically by `rev6-audit.js` (55 PASS, 0 FAIL, 0 BLOCKED), the copy audits and `counselors-quiz-audit.js`. |
| Revision 6 layout review of the 19 final pages | **PARTIAL** | Structure, labels, headings, notes and copy are audited. Visual review at 375/768/1440 and a real print pass were not run in this chat. |

## 2. Production website identity

| Item | Status | Detail |
| --- | --- | --- |
| Production domain and canonical pattern | **BLOCKED** | `build.js` supports `canonical` and `sharingImage`, but no page supplies them. Generated pages have no `rel="canonical"`. |
| `www` versus apex, trailing-slash and HTTPS rules | **BLOCKED** | Not supplied. |
| `sitemap.xml` | **BLOCKED** | Not generated; requires domain approval and a published-page list. |
| Production `robots.txt` | **BLOCKED** | Not generated; requires an indexing and preview policy. |
| Search-console ownership and submission | **BLOCKED** | Account owner not supplied. |
| Public preview indexing policy | **PARTIAL** | `foundation.html` is `noindex,nofollow` and `404.html` is `noindex,follow`. Every other preview page is `index,follow`, which is correct only once the preview is the production host. |

## 3. Social, icon and image assets

| Item | Status | Detail |
| --- | --- | --- |
| PNG favicon 512 | **PASS** | `src/assets/favicon-512.png` linked from every page. |
| ICO fallback 32 | **PASS** | `src/assets/favicon.ico` linked from every page. |
| Apple touch icon | **PASS** | `src/assets/apple-touch-icon.png` is exactly 180×180 and linked from every page. |
| AVIF favicon | **PARTIAL** | Only the legacy root has `assets/images/favicon.avif`. The Revision 6 `src/` pipeline does not use it; Revision 6's required icon bundle is unknown. |
| Open Graph / X sharing image | **BLOCKED** | No approved image exists. `og:image`, `og:image:alt`, `twitter:image` and `og:url` are absent. |
| HigherEdImpact logo | **PARTIAL** | `src/assets/images/higheredimpact-logo.png` is present but unused. Placement and permission not supplied. |
| Book cover | **PASS** | `book-cover.jpg` on Home and About with explicit dimensions and alt. |
| Detweiler portrait | **PASS** | About now serves WebP with a JPG fallback through `<picture>`; dimensions and alt preserved. |
| Eastern speech photo | **PARTIAL** | `detweiler-eastern-2026.jpg` and `.webp` are present but unused. Placement in Revision 6 unknown; not deleted. |

## 4. Analytics, cookies and legal approval

| Item | Status | Detail |
| --- | --- | --- |
| Analytics provider, account, events, retention | **BLOCKED** | No provider, account or event list supplied. |
| Consent / opt-out / Global Privacy Control behavior | **BLOCKED** | Depends on the analytics decision. |
| Privacy wording for measurement | **PASS** | `src/pages/privacy.html` states there is no analytics, no advertising, no third-party code and no cookies, which matches the code. |
| Analytics code in the build | **PASS** | No third-party script, pixel, embed or remote font exists. |

Adding analytics must not begin until every item in master prompt §4.4 is supplied and approved.

## 5. Contact, organization and permissions

| Item | Status | Detail |
| --- | --- | --- |
| P.O. box | **BLOCKED** | Footer still reads `18670 Nixon Ave., West Linn, Oregon 97068 (to be replaced with the P.O. box)`. |
| Photograph permissions | **PARTIAL** | About credits the portrait to Richard A. Detweiler and the cover to MIT Press. Eastern photo permission and placement unknown. |
| Quotation / testimonial permissions | **BLOCKED** | Cannot be confirmed without Revision 6's reviewer and quotation material. |
| Downloadable PDF permissions | **BLOCKED** | No PDF deliverables exist in the repository. |

## 6. PDFs and downloads

| Item | Status | Detail |
| --- | --- | --- |
| Six Revision 6 PDFs | **BLOCKED** | None exist in `src/`. Filenames, page placement and link text are unknown. |
| Policymakers leave-behind PDF | **BLOCKED** | No PDF asset. The page's one-page brief is HTML plus print. |
| Scorecard "Download as PDF" | **PASS (fixed)** | The control now says **Print** and calls `window.print()`; the tool page explains that Print can save a PDF. No PDF is promised. |
| Other print controls | **PASS** | In College, Faculty, College Leaders, Policymakers and Counselors use explicit Print labels and print-only styles. |

## 7. Content and behavior fixes made in this pass

These do not depend on Revision 6 and are now implemented:

| Item | Status | Detail |
| --- | --- | --- |
| Parents scorecard links | **PASS** | Two static links and one generated result link now point to `tools/college-scorecard.html`; the dead `#scorecard` fragment is gone. |
| Invalid `aria-current="result"` | **PASS** | Removed from the Choosing sidebar result link. |
| Sources dialog modality | **PASS** | The panel is now a native `<dialog>` opened with `showModal()`, labelled by `aria-labelledby`, closable by its button, Escape or backdrop, with focus return; the no-JavaScript fallback still shows the sources in the page. |
| Reduced-motion in scripts | **PASS** | Every scripted `scrollIntoView` uses a shared `motionBehavior()` helper that returns `auto` when `prefers-reduced-motion: reduce` matches. |
| Data-file HTML allowlist | **PASS** | `artifacts/data-html-audit.js` validates every embedded HTML string in `src/data/*.json`. |
| Mailto status wording | **PASS** | Email actions no longer claim an app opened; the status points to Copy instead. |
| Cross-page fragment audit | **PASS** | `artifacts/qa-audit.js` now resolves `page.html#fragment` against the destination page, including nested tool pages. |
| Invalid ARIA audit | **PASS** | `artifacts/qa-audit.js` rejects `aria-current` values outside the valid token set. |
| Privacy storage inventory | **PASS** | Privacy now names the scorecard tool page and all three storage keys, and distinguishes local storage from cookies. |
| Home counselor card | **PARTIAL** | The card now opens the Counselor Kit instead of promising a counselor quiz. Exact Revision 6 CTA wording needs Rick's confirmation. |

## 8. Remaining Revision 6 work (blocked)

1. Attach `Website_Layout_Review_Revision6 (1).docx` to the repository so the agent can read it.
2. Supply the production domain, canonical pattern, sitemap and robots policy.
3. Supply the approved Open Graph image and the Revision 6 icon bundle.
4. Supply the P.O. box.
5. Supply the six final PDFs and the Policymakers leave-behind, or approve print-only delivery.
6. Confirm permissions for the Eastern photo, reviewer quotations and any testimonial material.
7. Decide the analytics question; if analytics is approved, supply every item in master prompt §4.4.
8. Confirm the Home counselor CTA wording.
9. After 1–8, run the full page-by-page conformance pass in master prompt §5 and replace the obsolete October source audit with a Revision 6 mapping audit.

## Search optimization layer and Revision 6 audit (13 November 2026)

Revision 6 is now available and was read (`Website_Layout_Review_Revision6 (1).docx`, 4 November 2026). It supplies page metadata for two pages only:

| Page | Browser title | Search description |
| --- | --- | --- |
| Home | What College Is Really For | matches the build exactly (205 characters; NOTE in the SEO audit because Google truncates near 160, but the wording is Revision 6's) |
| Choosing a College | Choosing a College \| What College Is Really For | matched to Revision 6 word for word this pass (the build had a different sentence) |

Built into `build.js`, `src/partials/head.html` and `src/data/site.json`:

- Canonical, `og:url`, `og:image`, `og:image:alt`, `og:image:type`, `twitter:image` and `:alt`, all absolute, generated only when `SITE_URL` (or `url` in `src/data/site.json`) is set.
- JSON-LD graph on every indexable page: Organization (HigherEdImpact), WebSite, WebPage, plus a Book node (ISBN 9780262543101) on Home and About.
- `robots` meta with `max-image-preview:large`, `max-snippet:-1`, `max-video-preview:-1` on indexable pages; `noindex` retained on `404.html` and `foundation.html`.
- `sitemap.xml` covering the 14 indexable pages, with a `Sitemap:` line in `robots.txt`. A no-domain build now deletes a stale `sitemap.xml` instead of shipping one with the wrong origin.
- Sharing image defaults to the book cover with alt text; swap it in `src/data/site.json` once a 1200×630 card exists.
- Descriptions trimmed under 170 characters on In College, College Leaders, Counselors and Policymakers; Home and Choosing left exactly as Revision 6 writes them.

Audits: `artifacts/seo-audit.js` (53 pass, 0 fail, 17 notes without a domain; 87 pass, 0 fail, 1 note with a test origin) and `artifacts/rev6-audit.js` (44 pass, 0 fail, 3 blocked).

Fixed against Revision 6 in the follow-up pass:

- The repeated “A meaningful life in a world of change” closing block was removed from In College, Parents, Faculty, College Leaders and Policymakers, as Revision 6 instructs.
- Each of the five quiz pages gained the “Skip the quiz and go to the recommendations” link Revision 6 places under the quiz, pointing at that page's first recommendations section.
- The footer no longer prints “(to be replaced with the P.O. box)”; the current address stands until the P.O. box is supplied.
- `feature-audit` now asserts the closing block is gone instead of expecting five copies.

The three blocked items are the four unnamed tool pages, the six downloads and the Counselors quiz: Revision 6 names them but does not supply their copy, quiz questions or PDF designs, so building them would mean inventing content. A handoff pack for a separate chat that has the missing attachments is in `artifacts/handoff/` (index, audit, plan, technical brief, content checklist).

## 9. Verification record

### 9.1 Static audit suite — 13 November 2026

| Command | Result |
| --- | --- |
| `node build.js` | exit 0; 16 pages, `preview/styles.css`, all scripts and `preview/assets` regenerated |
| `node artifacts/qa-audit.js` | exit 0, `PASS: Phase 12 static QA` (16 pages, 18 tables, 0 without caption) |
| `node artifacts/quiz-audit.js` | exit 0, `PASS: every answer path in all six quizzes` (Choosing 7,776 paths; other quizzes 243 paths each) |
| `node artifacts/feature-audit.js` | exit 0, `PASS: every phase feature inventory` |
| `node artifacts/data-html-audit.js` | exit 0, `PASS: every data-file HTML string uses only allowlisted markup` |
| `node --check` on all changed scripts and audits | exit 0 |
| `node artifacts/spec-audit.js` | exit 0 in historical mode: still reports **17 source paragraphs** it cannot find (all Home copy measured against the superseded 12 October source), then prints `HISTORICAL … not an acceptance gate`. `--strict` restores a failing exit code. Must be replaced by a Revision 6 mapping audit. |

### 9.2 Browser audit — `artifacts/browser-audit.mjs`

Playwright + Chromium were installed outside the repository (the project still has zero dependencies) and run against a local static server:

```sh
mkdir -p /tmp/pw && cd /tmp/pw && npm i playwright && npx playwright install chromium
cd /path/to/repo && python3 -m http.server 8321 &
cp artifacts/browser-audit.mjs /tmp/pw/audit.mjs && cd /tmp/pw && node audit.mjs
```

Result: **42 PASS, 0 FAIL, 32 NOTE** (every NOTE is a blocked canonical/`og:image` item). Verified in a real browser:

- All 16 pages: one `h1`, no duplicate ids, `lang="en"`, `#main`, skip link, no inline styles in final pages, no third-party script/style requests, no console or network errors, no horizontal overflow at 375/768/1440, no invalid `aria-current`, no legacy notes overlay.
- Sources dialog: opens modally from the Sources button, focus moves inside, `Tab` stays contained, `Escape` closes and returns focus, close button works, backdrop click closes, inline source note opens and highlights the matching note.
- Reduced motion: quiz scrolling uses `auto` when the preference is set, and still `smooth` otherwise.
- Choosing quiz: five questions plus optional reach a result, persist it, update the sidebar, expose the result controls; share writes an answer-free `#result=…` hash; result restores after reload; a shared hash reopens the result with its advice panel; retake restarts and clears storage; a two-way tie resolves to exactly one tied outcome.
- College Scorecard tool: renders, stars the stored quiz result, four tabs, table caption, `Print` label, compare toggle at narrow width, names/ratings/stars/notes/leading choice persist across reload.
- Parents: all scorecard links point to the tool page, no dead `#scorecard` anchor, targets return 200.
- Print: Scorecard, In College, Faculty, College Leaders, Policymakers and Counselors each call `window.print()` with their print-only body class; no control says “Download”.
- Mobile scorecard: one college column visible at 375px with tabs shown.
- Mobile menu: hidden at 375px, opens with `aria-expanded="true"`, `Escape` closes and returns focus to the toggle.
- Print media hides header and footer.
- Images resolve (`book-cover.jpg`, `detweiler-portrait.webp` with JPG fallback).
- Parents quiz advances from a keyboard-only radio selection.
- No JavaScript: the sources panel renders in the page (block, 205 px tall) and the Choosing quiz shows its fallback notice.
- Print at phone width: all four scorecard columns and the “Where to find out” column appear, even when the Print button was not the trigger.

### 9.3 External link status

| URL | Result |
| --- | --- |
| `https://collegescorecard.ed.gov/` | 200 |
| `https://studentaid.gov/` | 200 |
| `https://higheredimpact.org/` | 200 (redirects to `https://www.higheredimpact.org/`) |
| `https://glca.org/` | 200 (redirects to `https://www.glca.org/`) |
| `https://mitpress.mit.edu/9780262543101/the-evidence-liberal-arts-needs` | 403 to every automated client (bot/CDN). The ISBN matches the citation already on the Research page. Existence confirmed from MIT Press and Penguin Random House listings; page content **UNVERIFIED** in this environment. |
| `https://mitpress.mit.edu/` | 403, same cause, **UNVERIFIED** |
| `https://liberalartsalliance.org/` | 200 — the alliance's public site (GLAA members, GLCA administration address). |

Fixed this pass: the Research page linked `https://globalliberalarts.org/`, which 301-redirects to `www.globalliberalarts.org` and returns **401 Unauthorized** to the public, so the link was dead. It now points to `https://liberalartsalliance.org/`, with the printed domain updated to match. The About page's “Get the book” link used ISBN `9780262046077`; it now uses the book's actual ISBN `9780262543101`, matching the Research page citation. Both changes are visible and reversible; confirm them against Revision 6 when it is available.

### 9.4 Master-prompt compliance

| Prompt section | Status | Evidence |
| --- | --- | --- |
| §1 controlling authority | **BLOCKED** | Revision 6 attachment absent |
| §2 scope boundaries | **PASS** | Only `src/`, `build.js`, `artifacts/`, README changed; legacy root untouched; no dependencies |
| §3 baseline | **PASS** | Static QA plus browser structural checks |
| §4 input ledger | **PASS** | This file |
| §5 page-by-page Revision 6 pass | **BLOCKED** | Cannot compare without the attachment |
| §6.1 Parents anchors | **PASS** | 0 stale refs; browser click-through 200 |
| §6.2 `aria-current` | **PASS** | 0 invalid values in HTML or scripts |
| §6.3 modal dialog | **PASS** | Native `<dialog>`, verified by keyboard/mouse |
| §6.4 reduced motion | **PASS** | `auto` under reduce, `smooth` otherwise |
| §6.5 data HTML allowlist | **PASS** | `data-html-audit.js` |
| §6.6 print/download honesty | **PASS** | Six real PDFs linked from their pages; tool pages carry the Revision 6 “Download as PDF” control, which opens print-to-PDF; `downloads-audit.js` and `rev6-audit.js` check both |
| §6.7 mailto/clipboard honesty | **PASS** | 0 “Opening your email app” claims; status regions intact |
| §6.8 stale docs/privacy | **PASS** | Privacy names tool page and all three keys; README corrected |
| §6.9 images and fallbacks | **PARTIAL** | Portrait `<picture>` done; Eastern photo and HigherEdImpact logo still unused pending Revision 6 placement |
| §6.10 cross-page fragment audit | **PASS** | `qa-audit.js` now resolves `page.html#fragment` |
| §7 metadata/SEO/social | **BLOCKED** | Domain, sitemap, robots and sharing image not supplied |
| §8 accessibility/responsive/print | **PARTIAL** | Keyboard, focus, dialog, overflow, print and mobile checked; 200 % zoom and screen-reader output not tested |
| §9 quiz/data/link proof | **PARTIAL** | Quiz paths and internal links pass; one external URL returns 401 |
| §10 acceptance commands | **PASS** | All audits rebuilt and rerun; `spec-audit.js` remains the historical, non-Rev6 check |
| §11 final report | **PASS** | This file and the chat report |

No commit, push, deployment, publication or live-root change was made.

## 13 November 2026 — the three Revision 6 gaps closed

With the docx and the six PDFs supplied, the three items this ledger previously recorded as blocked are built:

| Gap | Status | Evidence |
| --- | --- | --- |
| Four missing tool pages | **PASS** | `tools/semester-plan.html`, `tools/course-self-audit.html`, `tools/leaders-checklist.html`, `tools/policy-brief.html`, joining `tools/college-scorecard.html`. Each has a visible label on every field, browser storage, Print, Copy text, Download as PDF and Reset, and a one-page print stylesheet. |
| Six downloads | **PASS** | All six PDFs are linked from the page Revision 6 names, with descriptive link text and no tracking parameters. `downloads-audit.js` passes 14 checks. |
| Counselors quiz | **PASS** | Five scored questions, one optional setting question, a four-option tie-breaker, four results (Door Opener, Matchmaker, Guide, Finisher), situation advice, share and persistence. `counselors-quiz-audit.js` walks all 1,024 answer paths (664 single results, 360 tie-breakers) and every tie resolves. The Home counselor card now reads “Start the 2-minute quiz” and links to `counselors.html#quiz`. |

`rev6-audit.js` now reports 55 PASS, 0 FAIL, 0 BLOCKED. What remains blocked is unchanged: the production domain, a sharing image, analytics, deployment, photos P1–P8, and the Peace Corps line awaiting Rick's verification.
