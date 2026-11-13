'use strict';

// Phase 12 QA: static checks across every built page.
// No dependencies. Run after `node build.js`.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PREVIEW = path.join(ROOT, 'preview');
function listHtml(dir, base) {
  let found = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    const full = path.join(dir, entry.name);
    const relative = base ? base + '/' + entry.name : entry.name;
    if (entry.isDirectory()) found = found.concat(listHtml(full, relative));
    else if (entry.isFile() && entry.name.endsWith('.html')) found.push(relative);
  });
  return found;
}
const pages = listHtml(PREVIEW, '').sort();

const failures = [];
const notes = [];
const tables = { total: 0, noCaption: 0 };

function fail(page, message) {
  failures.push(page + ': ' + message);
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ');
}

function visibleText(html) {
  return stripTags(
    html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  ).replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function attr(tag, name) {
  const m = tag.match(new RegExp('\\s' + name + '="([^"]*)"'));
  return m ? m[1] : null;
}

function all(html, regex) {
  const out = [];
  let m;
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  while ((m = re.exec(html))) out.push(m);
  return out;
}

const KNOWN_PAGES = pages.filter(function (f) { return f !== 'foundation.html'; });

pages.forEach(function (file) {
  const html = fs.readFileSync(path.join(PREVIEW, file), 'utf8');
  const isFoundation = file === 'foundation.html';
  const is404 = file === '404.html';
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  const main = mainMatch ? mainMatch[1] : '';

  // --- document basics ---------------------------------------------------
  if (!/<html lang="en">/.test(html)) fail(file, 'missing html lang="en"');
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (!title) fail(file, 'missing title');
  if (title.length > 75) fail(file, 'title is ' + title.length + ' chars');
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (!desc) fail(file, 'missing meta description');
  if (desc.length < 50 || desc.length > 230) fail(file, 'description is ' + desc.length + ' chars');
  else if (desc.length > 160) notes.push(file + ': description is ' + desc.length + ' chars (search engines may truncate)');
  if (!/name="viewport"/.test(html)) fail(file, 'missing viewport meta');
  if (!/<main[^>]*id="main"/.test(html)) fail(file, 'missing main#main');
  if (!/class="skip-link" href="#main"/.test(html)) fail(file, 'missing skip link to #main');
  if (!is404 && !isFoundation && /name="robots" content="noindex/.test(html)) fail(file, 'indexable page marked noindex');
  if (is404 && !/name="robots" content="noindex/.test(html)) fail(file, '404 page is not noindex');

  // --- headings ----------------------------------------------------------
  const h1s = (main.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(file, 'expected one h1, found ' + h1s);
  const headings = all(main, /<h([1-6])[\s>]/g).map(function (m) { return Number(m[1]); });
  let previous = 0;
  headings.forEach(function (level) {
    if (previous && level > previous + 1) fail(file, 'heading jump h' + previous + ' to h' + level);
    previous = level;
  });

  // --- ids and anchors ---------------------------------------------------
  const ids = all(html, /\sid="([^"]+)"/g).map(function (m) { return m[1]; });
  const seen = new Set();
  ids.forEach(function (id) {
    if (seen.has(id)) fail(file, 'duplicate id "' + id + '"');
    seen.add(id);
  });
  if (!ids.length) fail(file, 'no ids at all');

  all(html, /href="#([^"]+)"/g).forEach(function (m) {
    if (!seen.has(m[1])) fail(file, 'anchor #' + m[1] + ' has no target');
  });
  all(html, /href="#"/g).forEach(function () { fail(file, 'empty href="#"'); });

  // --- links and local assets -------------------------------------------
  all(html, /(?:href|src)="([^"]+)"/g).forEach(function (m) {
    const href = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(href)) {
      if (/^javascript:/i.test(href)) fail(file, 'javascript: URL');
      return;
    }
    if (href.charAt(0) === '#') return;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) return;
    let target = path.join(PREVIEW, path.dirname(file), clean);
    if (clean.charAt(clean.length - 1) === '/') target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) fail(file, 'missing local target "' + clean + '"');
    if (clean.indexOf('\\') !== -1) fail(file, 'backslash path "' + clean + '"');
  });

  // --- cross-page fragments ----------------------------------------------
  // page.html#fragment must exist on the destination page, including nested tool pages.
  all(html, /href="([^"]*#[^"]+)"/g).forEach(function (m) {
    const href = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(href)) return;
    const parts = href.split('#');
    const pagePart = parts[0].split('?')[0];
    const fragment = parts[1];
    if (!pagePart || !fragment) return;
    const target = path.join(PREVIEW, path.dirname(file), pagePart);
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) return;
    const targetIds = all(fs.readFileSync(target, 'utf8'), /\sid="([^"]+)"/g).map(function (mm) { return mm[1]; });
    if (targetIds.indexOf(fragment) === -1) {
      fail(file, 'cross-page anchor "' + href + '" has no target in ' + pagePart);
    }
  });

  // --- ARIA state ---------------------------------------------------------
  const ARIA_CURRENT = /^(page|step|location|date|time|true|false)$/;
  all(html, /aria-current="([^"]*)"/g).forEach(function (m) {
    if (!ARIA_CURRENT.test(m[1])) fail(file, 'invalid aria-current="' + m[1] + '"');
  });

  // The sources panel must be a native modal dialog, not role="dialog" on a plain element.
  if (/id="notes-panel"/.test(html)) {
    if (!/<dialog[^>]*id="notes-panel"/.test(html)) fail(file, 'notes panel is not a native dialog');
    if (/role="dialog"/.test(html)) fail(file, 'notes panel uses a custom role="dialog"');
  }

  // --- images ------------------------------------------------------------
  all(html, /<img\b[^>]*>/g).forEach(function (m) {
    const tag = m[0];
    if (!/\salt=/.test(tag)) fail(file, 'image without alt: ' + (attr(tag, 'src') || '?'));
    if (!attr(tag, 'src')) fail(file, 'image without src');
    if (!attr(tag, 'width') || !attr(tag, 'height')) {
      fail(file, 'image without width/height: ' + (attr(tag, 'src') || '?'));
    }
    if (attr(tag, 'alt') === '') notes.push(file + ': decorative image ' + attr(tag, 'src'));
  });

  // --- forms -------------------------------------------------------------
  all(html, /<(?:input|select|textarea)\b[^>]*>/g).forEach(function (m) {
    const tag = m[0];
    if (/\stype="hidden"/.test(tag)) return;
    const id = attr(tag, 'id');
    const hasLabel = id && new RegExp('<label[^>]*for="' + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"').test(html);
    const hasAria = /\saria-label=|\saria-labelledby=/.test(tag);
    if (!hasLabel && !hasAria) fail(file, 'form control without label: ' + (id || tag.slice(0, 60)));
    if (id && !hasLabel && !hasAria && /<fieldset/.test(html)) {
      // grouped radios still need a legend; labelled-by ids are checked by the aria test above.
    }
  });
  all(html, /<button\b[^>]*>/g).forEach(function (m) {
    if (!/\stype="/.test(m[0])) fail(file, 'button without type: ' + stripTags(m[0]).trim().slice(0, 40));
  });

  // --- links need an accessible name ------------------------------------
  all(html, /<a\b([^>]*)>([\s\S]*?)<\/a>/g).forEach(function (m) {
    const attrs = m[1];
    const inner = m[2];
    const name = (attr(attrs, 'aria-label') || '') + visibleText(inner) + (inner.match(/alt="([^"]*)"/) || ['', ''])[1];
    if (!name.replace(/\s+/g, '')) fail(file, 'link without accessible name: ' + attrs.slice(0, 60));
    if (attr(attrs, 'target') === '_blank' && !/noopener/.test(attr(attrs, 'rel') || '')) {
      fail(file, 'target=_blank without rel=noopener');
    }
  });

  // --- tables ------------------------------------------------------------
  tables.total += (html.match(/<table\b/g) || []).length;
  if (/<table\b/.test(html)) {
    const tableCount = (html.match(/<table\b/g) || []).length;
    const captionCount = (html.match(/<caption\b/g) || []).length;
    if (captionCount < tableCount) {
      tables.noCaption += tableCount - captionCount;
      notes.push(file + ': ' + (tableCount - captionCount) + ' table(s) without caption');
    }
  }
  all(html, /<th\b[^>]*>/g).forEach(function (m) {
    if (!/\sscope="/.test(m[0])) fail(file, 'th without scope');
  });

  // --- details, nav, svg -------------------------------------------------
  const details = (html.match(/<details\b/g) || []).length;
  const summaries = (html.match(/<summary\b/g) || []).length;
  if (details !== summaries) fail(file, 'details/summary mismatch: ' + details + '/' + summaries);
  all(html, /<nav\b[^>]*>/g).forEach(function (m) {
    if (!/\saria-label=|\saria-labelledby=/.test(m[0])) fail(file, 'nav without an accessible name');
  });
  all(html, /<svg\b[^>]*>/g).forEach(function (m) {
    if (!/aria-hidden="true"|role="img"|focusable="false"/.test(m[0])) {
      fail(file, 'svg without aria-hidden/role: ' + m[0].slice(0, 60));
    }
  });

  // --- hygiene -----------------------------------------------------------
  if (!isFoundation && /\sstyle="/.test(html)) fail(file, 'inline style');
  if (/\{\{[A-Z0-9_]+\}\}/.test(html)) fail(file, 'unresolved placeholder');
  if (/<script[^>]+src="https?:/.test(html)) fail(file, 'third-party script');
  if (/<link[^>]+href="https?:/.test(html)) fail(file, 'third-party stylesheet or font');
});

// --- shared CSS and fonts ------------------------------------------------
const css = fs.readFileSync(path.join(PREVIEW, 'styles.css'), 'utf8');
const fonts = fs.readFileSync(path.join(ROOT, 'src', 'styles', 'fonts.css'), 'utf8');

if (!/:focus-visible/.test(css)) failures.push('styles.css: no :focus-visible rule');
if (!/prefers-reduced-motion/.test(css)) failures.push('styles.css: no prefers-reduced-motion rule');
// An outline:none is acceptable only when a :focus-visible rule restores an outline.
const focusVisibleOutline = /:focus-visible[^{]*\{[^}]*outline:\s*(?!none)[^;}]+/i.test(css);
if (!focusVisibleOutline) failures.push('styles.css: focus-visible does not restore an outline');

// --- generated script markup --------------------------------------------
fs.readdirSync(path.join(PREVIEW, 'scripts')).forEach(function (name) {
  if (!name.endsWith('.js')) return;
  const js = fs.readFileSync(path.join(PREVIEW, 'scripts', name), 'utf8');
  all(js, /aria-current="([^"]*)"/g).forEach(function (m) {
    if (!ARIA_CURRENT.test(m[1])) failures.push('scripts/' + name + ': invalid aria-current="' + m[1] + '"');
  });
  if (/behavior:\s*'smooth'/.test(js)) {
    failures.push('scripts/' + name + ': smooth scrolling is not gated on prefers-reduced-motion');
  }
});
if (!/font-display:\s*swap/.test(fonts)) failures.push('fonts.css: missing font-display: swap');
if (!/text-size-adjust/.test(css)) notes.push('styles.css: no text-size-adjust (mobile text scaling)');

// --- report --------------------------------------------------------------
console.log('Pages audited: ' + pages.length + ' (' + (pages.length - 1) + ' final + foundation reference)');
console.log('Tables: ' + tables.total + '; without caption: ' + tables.noCaption);
notes.forEach(function (n) { console.log('note: ' + n); });

if (failures.length) {
  console.error('\nFAIL (' + failures.length + ')');
  failures.forEach(function (f) { console.error('  - ' + f); });
  process.exit(1);
}
console.log('\nPASS: Phase 12 static QA');
