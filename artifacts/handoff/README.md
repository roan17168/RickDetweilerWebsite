# Handoff pack: the three Revision 6 content gaps

This folder is a self-contained brief for another coding agent working in a **new chat** of the
`roan17168/RickDetweilerWebsite` project, with the Revision 6 attachments available.

It covers exactly three deliverables that could not be built in this chat because the copy,
questions and PDF designs were not in the repository:

1. The **four missing tool pages** (`tools/…`) — Revision 6 says there are five; only
   `tools/college-scorecard.html` exists.
2. The **six downloads** (`downloads/…`) — parent checklist, workshop kit, dean's briefing,
   state brief, federal memo, counselor kit.
3. The **Counselors quiz** (Revision 6 calls its results “Matchmaker” and “Door Opener”) and the
   Home card that should point at it.

Read in this order:

| File | Purpose |
| --- | --- |
| [01-audit.md](01-audit.md) | What exists today, what is missing, and the evidence for each gap |
| [02-plan.md](02-plan.md) | Ordered work plan, dependencies, effort and verification gates |
| [03-agent-brief.md](03-agent-brief.md) | Technical rules, architecture, exact integration points and acceptance tests |
| [04-content-checklist.md](04-content-checklist.md) | Per-deliverable list of what to extract from the attachments |

## Ground rules in one paragraph

Revision 6 is the controlling source; the site's job is to present Rick Detweiler's copy, not to
rewrite it. No invented statistics, quotations, PDFs, page names, questions or answer options. No
frameworks, dependencies or third-party scripts. The build is `node build.js`; `preview/` is
generated and must never be hand-edited. Legacy root pages (`index.html`, `about.html`, … at the
repository root) are not part of this work. Nothing is committed, pushed or deployed without the
owner's say-so.

## Before the new chat starts

This chat's work is **uncommitted**. A different chat gets its own worktree from the branch, so it
will not see `src/`, `build.js`, the audits or the SEO layer unless they are committed and pushed
(or the files are copied in). Confirm the starting point contains:

- `build.js` with the `SITE_URL` / structured-data layer
- `src/partials/head.html` with `{{SEO_TAGS}}`, `{{JSON_LD}}`, `{{TWITTER_IMAGE}}`
- `src/data/site.json`
- `artifacts/{qa,quiz,feature,spec,data-html,seo,rev6}-audit.js`
- `artifacts/browser-audit.mjs`

If any are missing, stop and ask the owner to commit or copy this branch first.
