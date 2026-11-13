// Browser audit for the Revision 6 preview.
// Requires Playwright installed outside the project (this repository has no dependencies):
//   mkdir -p /tmp/pw && cd /tmp/pw && npm i playwright && npx playwright install chromium
// ESM resolution ignores NODE_PATH, so copy this file next to the install and run it there:
//   cd /path/to/repo && python3 -m http.server 8321 &
//   cp artifacts/browser-audit.mjs /tmp/pw/audit.mjs && cd /tmp/pw && node audit.mjs
// The suite expects the preview to be served under /preview/ on port 8321 and exits non-zero on any FAIL.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8321/preview/';
const PAGES = ['index.html', 'what-matters.html', 'the-research.html', 'choosing-a-college.html', 'tools/college-scorecard.html',
  'in-college.html', 'parents.html', 'faculty.html', 'college-leaders.html', 'counselors.html', 'policymakers.html',
  'understanding-college.html', 'about.html', 'privacy.html', '404.html', 'foundation.html'];

const results = [];
const record = (level, m) => { results.push([level, m]); console.log(level.padEnd(5) + ' ' + m); };
const pass = (m) => record('PASS', m);
const fail = (m) => record('FAIL', m);
const note = (m) => record('NOTE', m);

// Dump what has already been checked if a step throws.
for (const event of ['uncaughtException', 'unhandledRejection']) {
  process.on(event, (error) => {
    console.log('\nABORTED: ' + (error && error.message ? error.message.split('\n')[0] : error));
    const counts = results.reduce((a, [s]) => { a[s] = (a[s] || 0) + 1; return a; }, {});
    console.log('Summary so far: ' + JSON.stringify(counts));
    process.exit(1);
  });
}

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });

async function newPage(viewport = { width: 1280, height: 900 }, opts = {}) {
  const ctx = await browser.newContext({ viewport, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url()));
  page.on('response', (r) => { if (r.status() >= 400) errors.push('http ' + r.status() + ': ' + r.url()); });
  await page.addInitScript(() => {
    window.__printed = 0;
    window.print = () => { window.__printed += 1; };
    window.__scrolls = [];
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (arg) {
      window.__scrolls.push(arg && arg.behavior ? arg.behavior : 'auto');
      return original.call(this, arg);
    };
  });
  return { ctx, page, errors };
}

// ---------- static page health + overflow ----------
const shared = await newPage();
for (const file of PAGES) {
  const { page, errors } = shared;
  errors.length = 0;
  await page.goto(BASE + file, { waitUntil: 'load' });
  await page.waitForTimeout(150);

  const info = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    return {
      h1: document.querySelectorAll('h1').length,
      dupes: [...new Set(dupes)],
      lang: document.documentElement.lang,
      main: !!document.getElementById('main'),
      skip: !!document.querySelector('.skip-link'),
      oldOverlay: document.querySelectorAll('.notes-overlay, [data-notes-overlay]').length,
      ariaCurrent: [...document.querySelectorAll('[aria-current]')].map((el) => el.getAttribute('aria-current')),
      inlineStyles: document.querySelectorAll('[style]').length,
      thirdParty: [...document.querySelectorAll('script[src],link[href]')].filter((el) => /^https?:/.test(el.getAttribute('src') || el.getAttribute('href') || '')).length,
      canonical: !!document.querySelector('link[rel="canonical"]'),
      ogImage: !!document.querySelector('meta[property="og:image"]'),
      width: document.documentElement.scrollWidth,
      inner: window.innerWidth,
    };
  });

  if (info.h1 !== 1) fail(`${file}: h1 count ${info.h1}`);
  if (info.dupes.length) fail(`${file}: duplicate ids ${info.dupes.join(',')}`);
  if (info.lang !== 'en') fail(`${file}: html lang ${info.lang}`);
  if (!info.main) fail(`${file}: no #main`);
  if (!info.skip) fail(`${file}: no skip link`);
  if (info.inlineStyles && file !== 'foundation.html') fail(`${file}: ${info.inlineStyles} inline style attribute(s)`);
  if (info.thirdParty) fail(`${file}: ${info.thirdParty} third-party script/style request(s)`);
  if (info.oldOverlay) fail(`${file}: legacy notes overlay still present`);
  if (!info.canonical) note(`${file}: no rel=canonical (blocked: production domain)`);
  if (!info.ogImage) note(`${file}: no og:image (blocked: sharing asset)`);
  if (info.ariaCurrent.some((v) => !['page', 'step', 'location', 'date', 'time', 'true', 'false'].includes(v))) {
    fail(`${file}: invalid aria-current ${info.ariaCurrent.join(',')}`);
  }
  if (info.width > info.inner + 1) fail(`${file}: horizontal overflow at 1280 (${info.width} > ${info.inner})`);

  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(120);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 1) fail(`${file}: horizontal overflow at ${width}px by ${over}px`);
  }
  await page.setViewportSize({ width: 1280, height: 900 });

  const real = errors.filter((e) => !/favicon|\.map$/.test(e));
  if (real.length) fail(`${file}: console/network errors ${real.slice(0, 3).join(' | ')}`);
  pass(`${file}: structure, overflow 375/768/1440, no console errors, no third-party requests`);
}
await shared.ctx.close();

// ---------- sources dialog: mouse, keyboard, focus, backdrop ----------
{
  const { ctx, page } = await newPage();
  await page.goto(BASE + 'what-matters.html');
  const opener = page.locator('[data-notes-open]').first();
  await opener.click();
  await page.waitForTimeout(200);
  const state = await page.evaluate(() => {
    const d = document.getElementById('notes-panel');
    return { open: d.open, modal: d.matches(':modal'), tag: d.tagName, focusInside: d.contains(document.activeElement), role: d.getAttribute('role'), notes: d.querySelectorAll('.notes-list li').length };
  });
  if (!state.open || !state.modal) fail('dialog: did not open as a modal');
  if (state.tag !== 'DIALOG' || state.role) fail('dialog: not a native dialog');
  if (!state.focusInside) fail('dialog: focus not moved inside');
  if (state.notes < 1) fail('dialog: no sources rendered');
  if (state.open && state.modal && state.tag === 'DIALOG' && !state.role && state.focusInside && state.notes > 0) {
    pass('dialog: opens modally from Sources button, focus moves inside, sources present');
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const afterEsc = await page.evaluate(() => ({ open: document.getElementById('notes-panel').open, focusBack: document.activeElement.hasAttribute('data-notes-open') }));
  if (afterEsc.open) fail('dialog: Escape did not close it');
  if (!afterEsc.focusBack) fail('dialog: focus did not return to opener after Escape');
  else pass('dialog: Escape closes and returns focus to the opener');

  await opener.click();
  await page.waitForTimeout(150);
  for (let i = 0; i < 12; i += 1) await page.keyboard.press('Tab');
  const stillInside = await page.evaluate(() => document.getElementById('notes-panel').contains(document.activeElement));
  if (!stillInside) fail('dialog: Tab escapes the modal');
  else pass('dialog: Tab is contained inside the modal');

  await page.locator('[data-notes-close]').click();
  await page.waitForTimeout(150);
  if (await page.evaluate(() => document.getElementById('notes-panel').open)) fail('dialog: close button did not close');
  else pass('dialog: close button closes it');

  await page.locator('.source-note').first().click();
  await page.waitForTimeout(400);
  const highlighted = await page.evaluate(() => !!document.querySelector('.notes-list li.is-highlighted'));
  if (!highlighted) fail('dialog: source-note link did not highlight its note');
  else pass('dialog: inline source note opens and highlights the matching note');
  await ctx.close();
}

// ---------- reduced motion ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__scrolls = [];
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (arg) {
      window.__scrolls.push(arg && arg.behavior ? arg.behavior : 'auto');
      return original.call(this, arg);
    };
  });
  await page.goto(BASE + 'choosing-a-college.html');
  await page.locator('#quiz input[type=radio]').first().check();
  await page.locator('[data-quiz-next]').click();
  await page.waitForTimeout(250);
  const scrolls = await page.evaluate(() => window.__scrolls);
  if (scrolls.length && scrolls.every((b) => b === 'auto')) pass('reduced motion: quiz scrolling uses instant behaviour (' + scrolls.join(',') + ')');
  else fail('reduced motion: scroll behaviour ' + JSON.stringify(scrolls));
  await ctx.close();
}
{
  const { ctx, page } = await newPage();
  await page.goto(BASE + 'choosing-a-college.html');
  await page.locator('#quiz input[type=radio]').first().check();
  await page.locator('[data-quiz-next]').click();
  await page.waitForTimeout(250);
  const scrolls = await page.evaluate(() => window.__scrolls);
  if (scrolls.includes('smooth')) pass('normal motion: quiz scrolling still smooth');
  else fail('normal motion: expected smooth scroll, got ' + JSON.stringify(scrolls));
  await ctx.close();
}

// ---------- choosing quiz end to end ----------
{
  const { ctx, page } = await newPage();
  await page.goto(BASE + 'choosing-a-college.html');
  for (let i = 0; i < 5; i += 1) {
    await page.locator('#quiz input[type=radio]').first().check();
    await page.locator('[data-quiz-next]').click();
    await page.waitForTimeout(180);
  }
  const optionalShown = await page.locator('text=One optional question').count();
  if (!optionalShown) fail('choosing: optional question step not reached');
  await page.locator('[data-quiz-app] form button[type=submit]').click();
  await page.waitForTimeout(400);
  if (await page.locator('input[name="quiz-tie"]').count()) {
    await page.locator('input[name="quiz-tie"]').first().check();
    await page.locator('[data-quiz-app] form button[type=submit]').click();
    await page.waitForTimeout(400);
    pass('choosing: tie-break question appears and resolves to a result');
  }
  const res = await page.evaluate(() => ({
    result: !!document.querySelector('#result .result-profile'),
    sidebar: (document.querySelector('[data-sidebar-result] a')?.textContent || '').trim(),
    stored: !!localStorage.getItem('wcirf_choosing_result_v2'),
    controls: ['[data-result-share]', '[data-result-copy]', '[data-result-email]', '[data-quiz-retake]'].map((s) => !!document.querySelector('#result ' + s)),
    tools: !!document.querySelector('#result a[href="#recommendations"]'),
    ariaCurrent: [...document.querySelectorAll('[aria-current]')].map((e) => e.getAttribute('aria-current')),
  }));
  if (!res.result) fail('choosing: no result rendered');
  if (!res.stored) fail('choosing: result not persisted');
  if (res.sidebar === 'Take the two-minute quiz') fail('choosing: sidebar result not updated');
  if (!res.controls.every(Boolean)) fail('choosing: missing result controls ' + JSON.stringify(res.controls));
  if (!res.tools) fail('choosing: recommendations link missing');
  if (res.ariaCurrent.some((v) => !['page', 'step', 'location', 'date', 'time', 'true', 'false'].includes(v))) fail('choosing: invalid aria-current at runtime ' + res.ariaCurrent.join(','));
  if (res.result && res.stored && res.sidebar !== 'Take the two-minute quiz' && res.controls.every(Boolean) && res.tools) {
    pass('choosing: 5 questions + optional produce a result, persist it, update sidebar, expose the result controls');
  }

  await page.locator('[data-result-share]').click();
  await page.waitForTimeout(250);
  const hash = await page.evaluate(() => location.hash);
  const status = await page.locator('#result .result-tool-status').textContent();
  if (!/result=/.test(hash)) fail('choosing: share did not write a result hash');
  else pass('choosing: share writes ' + hash);
  if (/answers|a=|q=/.test(hash)) fail('choosing: share hash leaks answers');
  if (!/copied|Copy this link/i.test(status || '')) note('choosing: share status text "' + (status || '').trim() + '"');

  await page.reload();
  await page.waitForTimeout(300);
  if (!(await page.locator('#result .result-profile').count())) fail('choosing: result not restored after reload');
  else pass('choosing: stored result restored after reload');

  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE + 'choosing-a-college.html#result=leadership&advice=paying');
  await page.waitForTimeout(300);
  const shared = await page.evaluate(() => ({ profile: document.querySelector('#result .result-profile')?.textContent.trim() || '', panel: !!document.querySelector('#result .result-panel') }));
  if (!shared.profile) fail('choosing: shared hash did not open a result');
  else pass('choosing: shared hash opens result "' + shared.profile + '"' + (shared.panel ? ' with advice panel' : ''));

  await page.locator('[data-quiz-retake]').click();
  await page.waitForTimeout(250);
  const retake = await page.evaluate(() => ({ quiz: !!document.querySelector('#quiz input[type=radio]'), stored: localStorage.getItem('wcirf_choosing_result_v2'), hash: location.hash }));
  if (!retake.quiz) fail('choosing: retake did not restart quiz');
  if (retake.stored) fail('choosing: retake left the stored result');
  if (retake.hash && /result=/.test(retake.hash)) fail('choosing: retake left a result hash');
  if (retake.quiz && !retake.stored) pass('choosing: retake restarts quiz and clears storage');
  await ctx.close();
}

// ---------- tie-break (through the exported scorer) ----------
{
  const { ctx, page } = await newPage();
  await page.goto(BASE + 'choosing-a-college.html');
  const tie = await page.evaluate(() => {
    const data = window.WCIRF_CHOOSING;
    const api = window.WCIRFChoosing;
    const answers = ['Leadership', 'Leadership', 'Fulfillment', 'Fulfillment', 'Civic Involvement'];
    const scored = api.scoreQuiz(answers, data);
    const resolved = scored.top.map((o) => api.scoreQuiz(answers, data, o));
    return { needs: scored.needsTieBreak, top: scored.top, resolved: resolved.map((r) => ({ needs: r.needsTieBreak, result: r.result })) };
  });
  if (!tie.needs) fail('choosing: tie not detected by scorer');
  else if (tie.resolved.some((r) => r.needs || r.result.length !== 1)) fail('choosing: tie-break does not resolve to a single tied outcome');
  else pass('choosing: two-way tie detected and each tie answer resolves to exactly one tied outcome');
  await ctx.close();
}

// ---------- scorecard tool ----------
{
  const { ctx, page } = await newPage();
  await page.goto(BASE + 'tools/college-scorecard.html');
  await page.evaluate(() => localStorage.setItem('wcirf_choosing_result_v2', JSON.stringify({ outcome: 'Leadership', panels: [] })));
  await page.reload();
  await page.waitForTimeout(300);
  const pre = await page.evaluate(() => ({
    app: !!document.querySelector('[data-scorecard-app] table'),
    stars: document.querySelectorAll('.scorecard-star[aria-pressed="true"]').length,
    tabs: document.querySelectorAll('[data-scorecard-tab]').length,
    print: document.querySelector('[data-scorecard-print]')?.textContent.trim(),
    caption: !!document.querySelector('.scorecard-table caption'),
  }));
  if (!pre.app) fail('scorecard: table did not render');
  if (pre.stars < 1) fail('scorecard: quiz result not starred');
  if (pre.tabs !== 4) fail('scorecard: expected 4 college tabs, found ' + pre.tabs);
  if (pre.print !== 'Print') fail('scorecard: print control label is "' + pre.print + '"');
  if (!pre.caption) fail('scorecard: table has no caption');

  await page.fill('[data-scorecard-name="1"]', 'Alpha College');
  await page.locator('[data-scorecard-rating][data-col="1"][data-row="0"]').first().click();
  await page.locator('[data-scorecard-star]').first().click();
  await page.fill('[data-scorecard-note="example"][data-col="1"]', 'Student named a specific mentor');
  await page.fill('[data-scorecard-leading]', 'Alpha, because of the mentor story');
  // The compare control is intentionally only available at narrow widths.
  await page.setViewportSize({ width: 800, height: 900 });
  await page.waitForTimeout(150);
  await page.locator('[data-scorecard-compare]').click();
  const compare = await page.evaluate(() => ({
    expanded: document.querySelector('[data-scorecard-compare]').getAttribute('aria-expanded'),
    isCompare: document.querySelector('.scorecard-table-wrap').classList.contains('is-compare'),
  }));
  if (compare.expanded !== 'true' || !compare.isCompare) fail('scorecard: compare toggle broken');
  await page.reload();
  await page.waitForTimeout(300);
  const persisted = await page.evaluate(() => ({
    name: document.querySelector('[data-scorecard-name="1"]').value,
    rating: document.querySelector('[data-scorecard-rating][data-col="1"][data-row="0"][aria-pressed="true"]')?.getAttribute('data-scorecard-rating') || '',
    star: document.querySelectorAll('.scorecard-star[aria-pressed="true"]').length,
    note: document.querySelector('[data-scorecard-note="example"][data-col="1"]').value,
    leading: document.querySelector('[data-scorecard-leading]').value,
  }));
  if (persisted.name !== 'Alpha College' || !persisted.rating || !persisted.note || !persisted.leading) fail('scorecard: data not persisted ' + JSON.stringify(persisted));
  else pass('scorecard: names, ratings, stars, notes and leading choice persist across reload (' + persisted.star + ' starred rows)');
  if (pre.app && pre.stars >= 1 && pre.tabs === 4 && pre.print === 'Print' && compare.expanded === 'true') {
    pass('scorecard: renders, stars quiz result, 4 tabs, caption, Print label, compare toggle');
  }
  await ctx.close();
}

// ---------- parents links ----------
{
  const { ctx, page } = await newPage();
  await page.goto(BASE + 'parents.html');
  const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href^="tools/college-scorecard"], a[href*="#scorecard"]')].map((a) => a.getAttribute('href')));
  const stale = await page.evaluate(() => [...document.querySelectorAll('a[href*="choosing-a-college.html#scorecard"]')].map((a) => a.getAttribute('href')));
  if (stale.length) fail('parents: dead anchors to ' + stale.join(','));
  if (!hrefs.length) fail('parents: no scorecard link found');
  if (hrefs.some((h) => !h.startsWith('tools/college-scorecard.html'))) fail('parents: wrong scorecard link(s) ' + hrefs.join(','));
  else pass('parents: ' + hrefs.length + ' scorecard link(s) all point to the tool page, none to the removed #scorecard anchor');
  const bad = [];
  for (const h of hrefs) {
    const res = await page.request.get(new URL(h, BASE + 'parents.html').toString());
    if (res.status() !== 200) bad.push(h + ' -> ' + res.status());
  }
  if (bad.length) fail('parents: scorecard link targets ' + bad.join(','));
  await ctx.close();
}

// ---------- print styles ----------
{
  const { ctx, page } = await newPage();
  for (const [file, action, bodyClass] of [
    ['tools/college-scorecard.html', '[data-scorecard-print]', 'printing-scorecard'],
    ['in-college.html', '[data-plan-print]', 'printing-plan'],
    ['faculty.html', '[data-audit-print]', 'printing-faculty-audit'],
    ['college-leaders.html', '[data-checklist-print]', 'printing-leaders-checklist'],
    ['policymakers.html', '[data-brief-print]', 'printing-policymakers-brief'],
    ['counselors.html', '[data-counselors-print]', null],
  ]) {
    await page.goto(BASE + file);
    await page.waitForTimeout(250);
    const btn = page.locator(action).first();
    if (!(await btn.count())) { fail('print: ' + file + ' missing ' + action); continue; }
    const label = (await btn.textContent())?.trim();
    await btn.click();
    await page.waitForTimeout(120);
    const state = await page.evaluate((cls) => ({
      printed: window.__printed,
      cls: cls ? document.body.classList.contains(cls) : null,
    }), bodyClass);
    if (state.printed !== 1) fail('print: ' + file + ' did not call window.print()');
    else if (bodyClass && !state.cls) fail('print: ' + file + ' did not apply ' + bodyClass);
    else pass('print: ' + file + ' opens print dialog' + (bodyClass ? ' with ' + bodyClass + ' print styling' : '') + ' ("' + label + '")');
    if (/download/i.test(label || '')) fail('print: ' + file + ' control still labeled "' + label + '"');
  }
  await ctx.close();
}

// ---------- mobile scorecard single-column ----------
{
  const { ctx, page } = await newPage({ width: 375, height: 800 });
  await page.goto(BASE + 'tools/college-scorecard.html');
  await page.waitForTimeout(300);
  const mobile = await page.evaluate(() => {
    const wrap = document.querySelector('.scorecard-table-wrap');
    const visible = [...document.querySelectorAll('[data-scorecard-col]')].filter((el) => getComputedStyle(el).display !== 'none').map((el) => el.getAttribute('data-scorecard-col'));
    return { active: wrap.getAttribute('data-active-col'), visible: [...new Set(visible)], tabs: getComputedStyle(document.querySelector('.scorecard-tabs')).display };
  });
  if (mobile.visible.length !== 1 || mobile.visible[0] !== mobile.active) fail('scorecard mobile: expected one visible column, got ' + JSON.stringify(mobile.visible));
  else pass('scorecard mobile: one college column visible (' + mobile.visible[0] + '), tabs shown (' + mobile.tabs + ')');
  await ctx.close();
}

// ---------- no-JavaScript fallbacks ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE + 'index.html');
  const sources = await page.evaluate(() => {
    const d = document.getElementById('notes-panel');
    if (!d) return null;
    return { display: getComputedStyle(d).display, height: Math.round(d.getBoundingClientRect().height) };
  });
  if (!sources || sources.display === 'none' || sources.height === 0) fail('no-JS: sources panel is not readable without JavaScript');
  else pass('no-JS: sources panel renders in the page (' + sources.display + ', ' + sources.height + 'px tall)');

  await page.goto(BASE + 'choosing-a-college.html');
  const fallback = await page.evaluate(() => (document.querySelector('noscript')?.textContent || '').trim());
  if (!/needs JavaScript/i.test(fallback)) fail('no-JS: Choosing page has no fallback notice');
  else pass('no-JS: quiz fallback notice present');
  await ctx.close();
}

// ---------- print: all four scorecard columns ----------
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE + 'tools/college-scorecard.html');
  await page.waitForTimeout(300);
  await page.emulateMedia({ media: 'print' });
  const print = await page.evaluate(() => {
    const cols = [...document.querySelectorAll('.scorecard-table [data-scorecard-col]')]
      .filter((el) => getComputedStyle(el).display !== 'none')
      .map((el) => el.getAttribute('data-scorecard-col'));
    const where = [...document.querySelectorAll('.scorecard-table .scorecard-where')]
      .filter((el) => getComputedStyle(el).display !== 'none').length;
    return { cols: [...new Set(cols)], where };
  });
  if (print.cols.length !== 4) fail('print: scorecard print view shows ' + print.cols.length + ' of 4 colleges');
  else pass('print: all four colleges visible in print at phone width, “where to find out” column shown (' + print.where + ' cells)');
  await ctx.close();
}

await browser.close();

const counts = results.reduce((acc, [s]) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {});
console.log('\n=== RESULTS ===');
for (const [s, m] of results) console.log(s.padEnd(5), m);
console.log('\nSummary: ' + JSON.stringify(counts));
process.exit(counts.FAIL ? 1 : 0);
