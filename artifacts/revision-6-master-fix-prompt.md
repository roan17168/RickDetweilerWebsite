# Revision 6 Master Fix Prompt — What College Is Really For

Use this file as the complete instruction set for a coding agent. Follow it literally. Do not redesign the site, modernize its appearance, substitute copy, invent statistics, add features, add dependencies, or publish anything.

## 1. Controlling authority

1. The controlling source is the attached file:

   `Website_Layout_Review_Revision6 (1).docx`

   Call it **Revision 6**.
2. Locate and open the attached Revision 6 document before changing anything.
3. If the agent cannot access or read that attachment, **stop immediately** and report the whole task as **PARTIAL/blocked**. Do not reconstruct Revision 6 from memory.
4. Revision 6 controls over:
   - the older `What_College_Is_Really_For_Revised_Site_Text_2026-10-12_2.docx`;
   - `artifacts/docx-paragraphs.txt`;
   - prior summaries or phase notes;
   - any existing implementation;
   - any checklist in this prompt.
5. Where Revision 6 does not supply replacement copy, retain the existing approved wording. Do not invent replacement text.
6. The high-level Revision 6 summary supplied with the user request is a checklist cue, not a substitute for the attached document.

## 2. Repository and scope boundaries

Work only in this repository.

### Editable source

- `src/pages/`
- `src/pages/tools/`
- `src/partials/`
- `src/styles/`
- `src/data/`
- `src/scripts/`
- `src/assets/` for already-supplied binary assets
- `build.js`
- `artifacts/` for audits and generated verification reports
- Documentation directly affected by the change: `README.md`, `PHASES.md`

### Generated output

- Generate `preview/` only by running:

  ```sh
  node build.js
  ```

- Do not hand-edit `preview/`.
- Do not treat `preview/` as deployable production output until all production inputs below are supplied and verified.
- Do not edit, move, delete, rename, or restyle legacy root pages or legacy root assets.

### Absolute prohibitions

Do not:

- commit, push, deploy, publish, or alter live production pages;
- add npm packages, build tools, frameworks, fonts, analytics scripts, tracking pixels, widgets, or third-party requests;
- redesign layouts, colors, typography, spacing, icons, or imagery;
- rewrite Rick’s copy to sound better;
- invent quotations, statistics, findings, outcomes, quiz logic, PDF files, image descriptions, canonical URLs, addresses, analytics accounts, or permissions;
- remove an unresolved problem to make an audit pass;
- weaken tests, skip validation, suppress errors, or mark missing material complete.

## 3. Baseline that must not regress

The current build already has important correct behavior. Preserve all of it unless Revision 6 explicitly changes it.

Already verified in the working tree:

- Generated pages generally have one document wrapper:
  - one `<!doctype html>`;
  - one `<html>`;
  - one `<head>`;
  - one `<body>`;
  - one `<main id="main">`;
  - one primary `<h1>`.
- Headings generally do not skip levels in the checked pages.
- Images in `src/` currently have `alt`, `width`, and `height`.
- Buttons generally specify `type`.
- Tables generally use captions or headers and `scope`.
- Interactive SVG icons are hidden from assistive technology.
- There are no inline `style=""` attributes in final generated pages.
- There are no unresolved `{{PLACEHOLDER}}` tokens.
- There are no third-party scripts or stylesheets.
- Font loading uses `font-display: swap`.
- There is a visible `:focus-visible` treatment.
- There is a `prefers-reduced-motion` CSS rule.
- Choosing quiz behavior already includes:
  - five main questions plus one optional question;
  - shuffled answer order;
  - result persistence without putting answers in the shared URL;
  - an always-available tie-break path;
  - hash sharing in the form `#result=leadership[&advice=...]`;
  - five result controls: recommendations, copy, email, share, and retake;
  - a separate scorecard tool page rather than an embedded scorecard.
- `node build.js` supports nested tool pages.
- Existing audits cover static QA, source coverage, quiz paths, and phase features.

Those checks do **not** prove Revision 6 exactness. They are regression guards, not acceptance of Revision 6.

## 4. Required missing-input ledger

Create or update `artifacts/revision-6-input-ledger.md` and keep every unavailable item marked **PARTIAL**, never complete.

### 4.1 Revision 6 attachment

Record:

- exact filename;
- where the agent found it;
- extraction method;
- number of relevant sections/pages checked;
- any unreadable embedded image, table, comment, or attachment.

If any Revision 6 page, image placement, icon, PDF, quotation, statistic, or behavior cannot be extracted cleanly, mark that item **PARTIAL** and identify the exact missing text or object.

### 4.2 Production website identity

Do not invent any of the following:

- production domain;
- canonical URL pattern;
- `www` versus apex-domain rule;
- trailing-slash rule;
- HTTP-to-HTTPS behavior;
- sitemap location;
- `robots.txt` policy;
- search-console or index ownership;
- production preview/indexing policy.

The build already supports `canonical` and sharing-image fields, but generated Revision 6 pages currently have:

- no `rel="canonical"`;
- no `og:url`;
- no `og:image`;
- no `twitter:image`;
- no `sitemap.xml`;
- no production `robots.txt`.

That is a **PARTIAL/blocked** state. Implement the plumbing and validation, but do not fabricate the production domain.

### 4.3 Social and icon assets

Audit and record every icon and social asset separately:

- PNG favicon;
- ICO fallback;
- Apple touch icon;
- requested AVIF favicon;
- Open Graph sharing image;
- Twitter/X sharing image;
- HigherEdImpact logo;
- book cover;
- Detweiler portrait;
- Eastern speech photo;
- any Revision 6 card, UI, contact, footer, or social icon.

Known current issue:

- `src/assets/` contains `favicon-512.png`, `favicon.ico`, and `apple-touch-icon.png`.
- The legacy root has `assets/images/favicon.avif`, but the Revision 6 `src/` and `preview/` pipeline does not use it.
- `src/assets/images/higheredimpact-logo.png` is present but unused.
- `src/assets/images/detweiler-eastern-2026.jpg` and `.webp` are present but unused.
- About uses WebP portrait without an explicit JPG fallback.
- No approved Open Graph sharing image is present.

Do not generate replacement binaries. Use only Rick-approved supplied files. If Revision 6 requires an asset that is absent, mark it **PARTIAL** and identify the exact filename, dimensions, placement, and permission needed.

### 4.4 Analytics, cookies, and legal approval

The current intended posture is:

- no analytics;
- no advertising;
- no third-party scripts, pixels, embeds, or remote fonts;
- no accounts;
- local browser storage only for explicitly disclosed tools.

Do not add analytics unless all of the following are explicitly supplied and approved:

1. analytics provider;
2. account/property owner;
3. legal basis;
4. exact events to collect;
5. IP handling and retention;
6. cookie or local-storage classification;
7. consent/opt-out behavior;
8. Global Privacy Control behavior;
9. California, EU/UK, and other applicable privacy handling;
10. approved Privacy-page wording;
11. confirmation that quiz answers, college names, notes, plans, and other user-entered material are never sent to analytics.

If analytics is not approved, keep the implementation free of third-party measurement and update Privacy accordingly. Do not install a consent banner merely for appearance if no nonessential tracking exists.

### 4.5 Contact, organization, and permissions

The footer currently contains this unresolved placeholder:

> `HigherEdImpact · 18670 Nixon Ave., West Linn, Oregon 97068 (to be replaced with the P.O. box)`

Mark this **PARTIAL** until Rick supplies the P.O. box.

Also verify and record permission/consent for:

- every displayed photograph;
- every reviewer quotation or testimonial;
- every graduate/student quotation;
- every logo;
- every book-cover image;
- every downloadable PDF;
- every newsletter/reviewer/citation excerpt, if Revision 6 includes them.

Credit all approved assets exactly as supplied. Do not infer public-domain status, fair use, MIT Press permission, photographer permission, or subject consent.

### 4.6 Missing PDFs and downloads

There are currently no PDF deliverables in `src/`.

In particular, there is no repository evidence for six final Revision 6 PDFs or for a Policymakers leave-behind PDF asset.

The scorecard’s current **“Download as PDF”** button calls `window.print()`; it does not deliver a PDF file. Likewise, other print buttons open the browser print dialog.

Therefore:

- Label `window.print()` as **Print**, **Print this page**, **Print this summary**, or another accurate Revision 6 label.
- Label an action **Download PDF** only if it supplies an actual PDF file/download.
- If Revision 6 explicitly says **“Download as PDF”**, either:
  - wire that control to the supplied PDF asset or an approved PDF-generation process, or
  - pause and obtain approval to use the accurate print label.
- Do not rename Rick’s exact required button text without approval.
- Do not fabricate a PDF to satisfy the label.

Locate all six Revision 6 PDFs and the Policymakers leave-behind. If they are absent, mark each deliverable **PARTIAL** with its exact expected filename/link text/page/section.

## 5. Page-by-page Revision 6 conformance pass

For every final page, compare the implementation against Revision 6 line by line:

- Home: `index.html`
- Choosing a College: `choosing-a-college.html`
- College Scorecard tool: `tools/college-scorecard.html`
- In College: `in-college.html`
- Parents: `parents.html`
- Faculty: `faculty.html`
- College Leaders: `college-leaders.html`
- Counselors: `counselors.html`
- Policymakers: `policymakers.html`
- Understanding College: `understanding-college.html`
- What Matters in College: `what-matters.html`
- The Research: `the-research.html`
- About: `about.html`
- Privacy: `privacy.html`
- Not found: `404.html`

`foundation.html` is a design reference, not final website content.

For each page, verify and record:

1. exact page title;
2. exact meta description;
3. exact social title/description;
4. exact canonical URL treatment once the domain exists;
5. exact hero, headings, labels, buttons, links, and section order;
6. exact statistics, dates, sample sizes, percentages, methodology, and causal/associational language;
7. exact citations, notes, note order, and source links;
8. exact navigation, sidebar, footer, next-step, and Understanding College links;
9. exact quiz questions, options, result paths, optional panels, tie behavior, and quiz controls;
10. exact downloads, print behavior, copy behavior, email behavior, and share behavior;
11. exact image filename, placement, dimensions, format, alt text, caption/credit, and long description;
12. exact icon use;
13. exact mobile/collapsed/expanded behavior;
14. exact print output;
15. exact no-JavaScript behavior.

### 5.1 Home

Verify the seven-card `4 + 3` arrangement against Revision 6:

- first row: four audience cards;
- second row: three audience cards;
- exact card headings/hooks/questions;
- exact icons;
- exact destination for every card.

Known inconsistency to resolve:

- Home says each choice opens with a two-minute quiz.
- Its counselor card currently says **“Start the 2-minute quiz.”**
- The Counselors page itself is currently a printable kit and group-session resource, not an embedded quiz.
- The kit’s group session uses the existing Choosing and Parents quizzes.

Do not leave the Home claim inaccurate. Either:

- implement the exact Revision 6 counselor-quiz behavior, if Revision 6 requires one; or
- change the counselor card’s CTA/link language to match the approved kit behavior.

Also verify whether Revision 6 requires these qualitative Home additions:

- What Matters in College findings module;
- reviewer/testimonial module;
- newsletter/repository/news module;
- any additional study, book, program, or contact module.

Implement only supplied Revision 6 content. Mark any absent required module **PARTIAL**; do not invent testimonials, reviewer names, findings, newsletter copy, or signup behavior.

### 5.2 Choosing a College

Verify the complete Revision 6 Choosing flow:

- hero and section order;
- five questions;
- one optional question;
- answer behavior/restrictions;
- result calculations;
- six result profiles;
- two-way and larger ties;
- always-available tie-break;
- advice/optional panels;
- “How to read these numbers”;
- supporting-research disclosure;
- result sidebar behavior;
- scorecard tool links;
- next-step links;
- 13 notes in exact order;
- citations and external links.

The separate scorecard tool must remain separate. Do not re-embed it in the Choosing page unless Revision 6 explicitly reverses that decision.

### 5.3 College Scorecard tool

Verify:

- deal-breaker section;
- experience section;
- rating behavior;
- star behavior;
- summary calculations;
- college-name persistence;
- notes and leading-choice persistence;
- copy/email/print behavior;
- one-column mobile behavior;
- compare/all-columns behavior;
- print behavior;
- tool title, description, header/nav treatment, and canonical treatment as a nested page.

Update stale wording that calls the tool part of the Choosing page if Revision 6 treats it as a separate tool.

### 5.4 In College, Parents, Faculty, Leaders, and Policymakers

For each tool/quiz page:

- verify every question and option;
- verify scoring bands/results;
- verify ties and optional behavior;
- verify saved data, reload behavior, clear behavior, and storage keys;
- verify copy/email/print behavior;
- verify next-step and Understanding College links;
- verify exact citations and notes;
- preserve approved no-JavaScript fallback text.

### 5.5 Counselors

Verify the eight supplied sections, four tables, glossary, internal/external links, printable output, student/family handouts, first-in-family steps, group session, and source lines.

Do not claim that the page contains a separate counselor quiz unless Revision 6 supplies one.

The page currently links externally to College Scorecard and Federal Student Aid. Verify every destination and link behavior against Revision 6.

### 5.6 Understanding College, What Matters, Research, About, Privacy, 404

Verify:

- exact college-type tables;
- timeline behavior;
- G3/G4 charts and numeric tables;
- quotation grid and quotation permissions;
- chart data and accessible table equivalence;
- methodology and limits;
- author biography and milestones;
- image credits;
- exact Privacy storage disclosures;
- helpful 404 navigation.

## 6. Known defects that must be fixed

These are concrete defects found in the current implementation. Fix them in a way that remains consistent with Revision 6. If Revision 6 explicitly mandates contrary wording, preserve Revision 6 and document the conflict for Rick.

### 6.1 Broken Parents scorecard anchors

`src/pages/parents.html` contains two links to:

```text
choosing-a-college.html#scorecard
```

That fragment no longer exists because the scorecard is now separate.

Change both links to:

```text
tools/college-scorecard.html
```

Then verify:

- no remaining `#scorecard` link points to the Choosing page;
- every page-to-page fragment target exists;
- the nested scorecard path, styles, scripts, fonts, favicon, and storage behavior work from `tools/college-scorecard.html`.

### 6.2 Invalid `aria-current="result"`

`src/scripts/choosing.js` dynamically inserts:

```html
<a href="#result" aria-current="result">...</a>
```

`result` is not a valid `aria-current` value.

Valid values include:

- `page`
- `step`
- `location`
- `date`
- `time`
- `true`
- `false`

Fix the code to use a valid value or remove the invalid state. Do not use `aria-current` as a styling hook for a non-navigational result announcement.

Relevant standard:

- [MDN `aria-current`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Reference/Attributes/aria-current)

### 6.3 Sources modal is not truly modal

The sources/notes panel uses:

```html
role="dialog"
aria-modal="true"
```

but does not make the background inert.

`aria-modal="true"` alone does not make the background inert, trap focus correctly, or guarantee focus restoration in all implementations.

Replace the custom modal behavior with native `<dialog>` behavior where practical:

- open with `showModal()`;
- label with `aria-labelledby`;
- use the native close/Escape behavior;
- return focus to the invoking control;
- avoid background interaction while open;
- preserve the exact Sources content and note order.

If native `<dialog>` cannot be used for a documented compatibility reason, implement all missing modal semantics explicitly, including background `inert`, focus containment, Escape handling, and focus restoration.

Relevant standards:

- [W3C HTML H102 dialog technique](https://www.w3.org/WAI/WCAG22/Techniques/html/H102)
- [MDN `<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [MDN `aria-modal`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-modal)

### 6.4 Reduced-motion handling is incomplete

CSS has a reduced-motion rule, but JavaScript still calls smooth scrolling unconditionally.

Gate JS motion and scrolling on:

```js
window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

Use instant behavior when reduced motion is requested. This applies to quiz focus scrolling, modal scrolling/highlighting, and any other scripted motion.

Relevant standards:

- [W3C CSS reduced-motion technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)
- [W3C JavaScript reduced-motion technique SCR40](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR40)

### 6.5 Unsafe broad HTML insertion

Quiz/support/result rendering inserts JSON-controlled strings as HTML.

Add a build-time or runtime allowlist validation step proving that data-file HTML contains only explicitly approved constructs, such as:

- internal page/anchor links;
- `em`, `strong`, `sup`, `sub`;
- paragraphs/lists already generated by trusted templates.

Reject or escape:

- `<script>`;
- event-handler attributes;
- `javascript:` URLs;
- `data:` URLs;
- external links not explicitly approved;
- unexpected `target`, `rel`, `style`, `class`, or ARIA attributes.

Do not silently strip content. Report any rejected markup as a content bug.

### 6.6 Misleading download/print state

Fix every action whose label promises more than the implementation delivers.

The controlling rule is simple:

- `window.print()` means **Print**.
- **Download PDF** means an actual PDF file/download.

Current research supports this distinction:

- [MDN `window.print()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/print)
- [MDN download links](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#download)

Also verify that Policymakers, Leaders, Faculty, In College, and Counselors print controls produce the intended one-page or tool-only output.

### 6.7 Mailto and clipboard behavior must not overpromise

Current behavior generally:

- copies text with the Clipboard API;
- falls back to a legacy/manual method;
- opens `mailto:` for email actions;
- sets a status message.

Make failure behavior accurate:

- announce clipboard success/failure in a persistent `role="status"` region;
- handle Clipboard API rejection;
- treat deprecated `document.execCommand('copy')` only as a best-effort legacy fallback;
- provide selectable/manual-copy instructions when automatic copying fails;
- never claim that an email was sent;
- do not claim that an email app opened if that cannot be detected;
- keep the destination email address visible and copyable where contact must work;
- offer an HTTPS/contact alternative only if Revision 6 approves one.

Relevant documentation:

- [MDN Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [MDN `writeText()`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)
- [MDN deprecated `execCommand()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)
- [MDN `<a>` and `mailto:`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a)

### 6.8 Stale Privacy and documentation language

Update:

- `src/pages/privacy.html`;
- `src/partials/footer.html`, if Revision 6 changes it;
- `README.md`;
- `PHASES.md`;
- any audit or help text that still describes the old architecture.

Known stale/incorrect statements include:

- Privacy says the scorecard is on the Choosing page, but it is now a separate tool.
- README and related docs may still describe the old embedded scorecard.
- README’s counselor/Home quiz language needs reconciliation with the actual kit behavior.
- Privacy must enumerate all persistent browser-storage tools and keys, not merely give examples.
- Privacy’s cookie language must accurately distinguish cookies from local storage.
- Any claim of “no analytics” must remain true in the code, or be changed through the analytics approval process first.

### 6.9 Supplied images are unused or lack fallbacks

Resolve all three current portrait/book files intentionally:

- `detweiler-portrait.webp`
- `detweiler-portrait.jpg`
- `book-cover.jpg`

And resolve the unused supplied files:

- `detweiler-eastern-2026.jpg`
- `detweiler-eastern-2026.webp`
- `higheredimpact-logo.png`

Requirements:

- Use `<picture>`/format fallback where Revision 6 supplies both modern and fallback files.
- Preserve intrinsic dimensions.
- Preserve exact supplied alt text.
- Do not upscale images.
- Add an explicit long description or adjacent detailed description only where Revision 6 requires one.
- Mark decorative images as decorative only where Revision 6 says they are decorative.
- Do not delete unused supplied binaries without Rick’s direction; record them as unused/pending placement.

Relevant documentation:

- [MDN responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)
- [MDN `<img>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img)

### 6.10 Invalid nested-page validation gap

The existing QA checks same-file anchors and local file existence but did not catch the stale cross-page Parents fragment before manual inspection.

Add or extend an audit that checks every page-to-page URL with a fragment:

```text
page.html#fragment
```

against the destination page’s IDs. Include nested paths such as:

```text
tools/college-scorecard.html
```

## 7. Metadata, SEO, and social implementation

### 7.1 Exact Revision 6 metadata

Use Revision 6’s exact title, description, social title, and social description for every page, including the nested scorecard page.

Do not shorten or normalize exact copy merely to satisfy the repository’s old QA length thresholds. If Revision 6 requires a longer title/description, update the audit threshold and document why.

Google does not publish a fixed title/description character maximum; display truncation varies by device and Google may rewrite titles/snippets.

Relevant documentation:

- [Google title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google snippets and descriptions](https://developers.google.com/search/docs/appearance/snippet)

### 7.2 Canonical URLs

Once Rick supplies the production domain:

- use one absolute HTTPS canonical URL per indexable page;
- make the canonical self-referencing;
- align internal links, sitemap entries, redirects, and `og:url`;
- use the correct nested canonical for `tools/college-scorecard.html`;
- preserve query/hash behavior for quiz-result sharing without creating duplicate canonicals.

Do not use `robots.txt` as a canonicalization mechanism.

Relevant documentation:

- [Google canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

### 7.3 Sitemap and robots

Implement these only after domain/indexing approval:

- production `/sitemap.xml`;
- production `/robots.txt`;
- search-console submission instructions/documentation, without credentials;
- correct handling of nested tool URLs;
- no sitemap entries for nonindexable or blocked pages.

For a public preview/staging copy:

- prefer access control;
- otherwise apply `noindex` so crawlers can see the directive;
- do not expose production canonicals from a nonproduction preview;
- do not publish the production sitemap from a preview;
- remember that `Disallow: /` alone is not a reliable way to keep URLs out of search results.

Relevant documentation:

- [Google sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google `robots.txt`](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google `noindex`](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

### 7.4 Social sharing images

Add production sharing metadata only after the approved image exists:

- absolute HTTPS `og:image`;
- matching `twitter:image` or supported Open Graph fallback;
- `og:url`;
- meaningful image alt text;
- correct image dimensions and file size;
- publicly fetchable production image URL.

A practical default is a `1200 × 630` JPG or PNG unless Revision 6 supplies a different approved image.

Relevant documentation:

- [Meta link-share images](https://developers.facebook.com/documentation/sharing/webmasters/images)
- [X card markup](https://web.archive.org/web/2025/https://developer.x.com/en/docs/x-for-websites/cards/overview/markup)
- [X Open Graph fallback](https://developer.x.com/en/docs/x-for-websites/cards/guides/getting-started)

### 7.5 Favicons and touch icons

Implement Revision 6’s exact icon set. Verify:

- file format;
- dimensions;
- MIME type;
- path from root and nested pages;
- browser fallback behavior;
- Apple touch-icon behavior;
- search-display behavior.

Do not assume that legacy AVIF handling is correct. Verify the Revision 6-mandated icon bundle explicitly.

Relevant documentation:

- [Google favicon requirements](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Apple website icons](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)

### 7.6 External links and link qualification

Inventory every external link with:

- source page;
- exact link text;
- exact destination;
- whether it opens in the same tab or a new tab;
- exact `rel`;
- HTTP result;
- final redirected destination, if any;
- whether the destination matches the linked label.

Preserve secure new-tab behavior:

- `target="_blank"` must retain `rel="noopener"` or a stronger approved value.

Do not blanket-apply `rel="nofollow"` to ordinary editorial citations. Use:

- `sponsored` for paid placements;
- `ugc` for user-generated content;
- `nofollow` only where non-endorsement/non-association is actually intended;
- `noopener` for opener isolation on new-tab links.

Relevant documentation:

- [Google outbound-link qualification](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)
- [Google crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)

## 8. Accessibility, responsive behavior, keyboard behavior, and print

### 8.1 Keyboard matrix

Verify by keyboard alone, without a mouse:

- skip link;
- header navigation;
- perspectives dropdown;
- mobile menu open/close/Escape;
- all quiz radios, checkboxes, back/next, optional, tie-break, retake, and result controls;
- scorecard tabs, ratings, stars, compare control, copy/email/print/clear;
- forms, selects, textareas, disclosures, and print controls;
- notes open, focus, tab containment, Escape, close, and focus return;
- visible focus on every interactive control;
- no keyboard trap;
- logical focus order;
- focus moved to quiz/result headings where Revision 6 requires it;
- reduced-motion behavior respected.

### 8.2 Screen-reader and semantic checks

Verify:

- one H1 per final page;
- no skipped heading levels;
- landmark roles;
- nav labels;
- table captions/headers/scope;
- form labels;
- button names;
- link names;
- image alt;
- status announcements;
- quiz progress announcements;
- disclosure state;
- tab state;
- modal naming and behavior.

Use valid ARIA only. Do not use ARIA as a styling hook and do not add redundant roles where native HTML already expresses the semantics.

Relevant standards:

- [W3C tables tutorial](https://www.w3.org/WAI/tutorials/tables/)
- [W3C responsive tables](https://www.design-system.w3.org/styles/tables.html)
- [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [W3C form labels](https://www.w3.org/WAI/tutorials/forms/labels/)
- [W3C error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [W3C status messages](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22)
- [W3C `:focus-visible` technique C45](https://www.w3.org/WAI/WCAG22/Techniques/css/C45)

### 8.3 Responsive and print checks

Verify every changed template and tool at representative narrow, tablet, and wide widths, including at least:

- small phone;
- large phone;
- tablet;
- laptop/desktop;
- wide desktop.

Verify:

- no horizontal overflow;
- no clipped focus or controls;
- no unreadable overlapped text;
- mobile tab disclosure behavior;
- collapsed/expanded behavior;
- print styles for every printable deliverable;
- 200% browser zoom without loss of essential content or controls.

Check the scorecard specifically:

- one college at a time on narrow screens;
- all four columns available through the approved compare/print path;
- row labels and “where to find out” remain understandable;
- inputs remain usable and labeled;
- printed output contains all needed columns and user entries.

### 8.4 Visual-fidelity rules

Match Revision 6 exactly. Do not normalize, simplify, or “improve” the design while auditing it.

Preserve:

- body grid and page rhythm;
- flex/grid behavior;
- typography;
- link underlines and affordances;
- focus-ring treatment;
- chart labels, colors, spacing, and readability;
- global base styles;
- iconography;
- image placement and scale.

If text/background contrast is suspect, measure it and report actual ratios. Do not change approved colors without Rick’s approval; mark the conflict **PARTIAL** if Revision 6 mandates a noncompliant combination.

## 9. Data fidelity and quiz-logic proof

### 9.1 Statistics and citations

For every statistic:

- verify percentage;
- verify direction of effect;
- verify sample;
- verify age/time range;
- verify college scope;
- verify causal versus associational wording;
- verify source line;
- verify note number and note order;
- verify chart/table equivalence.

Do not alter methodology language. The study looks back and shows association, not proof of causation, unless Revision 6 supplies different exact approved wording.

### 9.2 Quiz-path proof

Run and preserve exhaustive path coverage for all quizzes.

For Choosing, verify all answer combinations and tie behavior. Ensure that:

- every path resolves to a valid result path;
- ties invoke the tie-break;
- tie-break selections resolve to tied outcomes;
- empty answers do not invent a default result;
- optional panels are preserved correctly;
- shared links reopen results without answers;
- retake clears stored results correctly;
- sidebar result and scorecard star behavior stay synchronized.

For the other quizzes, verify every scoring path, result band, optional path, tie path, and empty-input behavior required by Revision 6.

### 9.3 Internal/download-link proof

Verify:

- every internal page link;
- every same-page anchor;
- every cross-page fragment;
- every PDF/download link;
- every print control;
- every scorecard/next-step link;
- every Understanding College link;
- every footer/header/sidebar link;
- every `mailto:` address;
- every external research/government/publisher/organization URL.

Record actual HTTP status for external links. Do not replace an exact Revision 6 URL merely because a destination redirects; record the redirect and seek approval for any replacement.

## 10. Audits and acceptance commands

Update the audits before treating them as Revision 6 acceptance tests.

The October 12 source is obsolete. Therefore:

- replace or supplement `artifacts/spec-audit.js` with a Revision 6 source-mapping audit;
- preserve the old October mapping only as historical context, not as a pass/fail authority;
- update `artifacts/qa-audit.js`, `artifacts/quiz-audit.js`, and `artifacts/feature-audit.js` for nested tool pages and Revision 6 behavior;
- add the cross-page fragment audit from section 6.10;
- add explicit checks for invalid ARIA, modal behavior, reduced-motion JS behavior, actual PDF delivery, canonical/social metadata, and storage disclosures.

Then run at least:

```sh
node build.js
node artifacts/qa-audit.js
node artifacts/quiz-audit.js
node artifacts/feature-audit.js
node artifacts/spec-audit.js
```

Also syntax-check changed JavaScript, for example:

```sh
node --check src/scripts/choosing.js
node --check src/scripts/ui.js
```

Run checks for the other changed scripts as applicable.

Start a local static server and verify navigation, storage, responsive behavior, keyboard behavior, and print behavior. Do not use `file://` URLs as acceptance evidence.

## 11. Final report format

Finish with a self-contained report. Do not rely on earlier chat context.

Include:

1. Revision 6 source location and extraction status.
2. Files changed, with reasons.
3. Exact defects fixed.
4. Exact defects remaining.
5. `PARTIAL` ledger:
   - missing domain;
   - missing canonical/sitemap/robots inputs;
   - missing social image;
   - missing icon set;
   - missing address;
   - missing PDFs;
   - missing photographs/permissions;
   - missing reviewer/newsletter content;
   - missing analytics decision/account;
   - any unreadable Revision 6 section.
6. Blocked items requiring Rick.
7. Commands run and exact results.
8. Pass/fail status for every audit.
9. Responsive/keyboard/print behavior actually checked.
10. Behavior explicitly not checked.
11. No commit, push, deployment, publication, or live-root change.

The final answer must distinguish:

- **PASS:** implemented and verified;
- **PARTIAL:** implemented incompletely because a required input is missing;
- **BLOCKED:** cannot proceed without Rick;
- **FAILED:** checked and still incorrect.

Do not call the site complete while any required Revision 6 text, image, PDF, metadata input, permission, statistic, quiz path, tool, download, or link remains missing or unverified.
