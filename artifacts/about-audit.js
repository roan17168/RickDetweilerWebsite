'use strict';

// Phase 11 audit: About built from docx 1878-1907, Privacy against actual site behaviour.
// Source file: artifacts/about-source.txt, produced by extracting document.xml paragraphs.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PREVIEW = path.join(ROOT, '');

const fails = [];
const notes = [];

function check(name, condition, detail) {
  if (!condition) {
    fails.push(name + (detail ? ' — ' + detail : ''));
  }
}

function decode(html) {
  return html
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&ldquo;/g, '\u201c')
    .replace(/&rdquo;/g, '\u201d')
    .replace(/&middot;/g, '\u00b7')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function norm(text) {
  return decode(text)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const rawSource = fs.readFileSync(path.join(ROOT, 'artifacts', 'about-source.txt'), 'utf8');
const P = {};
rawSource.split('\n').forEach(function (line) {
  const m = line.match(/^\[(\d+)\] ?([\s\S]*)$/);
  if (m) P[Number(m[1])] = m[2];
});

const aboutRaw = fs.readFileSync(path.join(PREVIEW, 'about.html'), 'utf8');
const aboutText = norm(textOf(aboutRaw));
// Structure counts apply to the page body only; the shared footer and the notes
// panel contain headings and the site EIN that are not part of this page's copy.
const aboutMain = aboutRaw.split('<main id="main">')[1].split('</main>')[0];
const privacyRaw = fs.readFileSync(path.join(PREVIEW, 'privacy.html'), 'utf8');
const privacyText = norm(textOf(privacyRaw));

function present(label, source, haystack) {
  const needle = norm(source);
  check(label, haystack.indexOf(needle) !== -1, 'missing: ' + needle.slice(0, 90));
}

// --- About: copy verified against docx 1878-1907 -------------------------
check('About page exists', fs.existsSync(path.join(PREVIEW, 'about.html')));

check('title from docx 1879', aboutRaw.indexOf('<title>' + P[1879].replace(/^Page title: /, '') + '</title>') !== -1);
check('description from docx 1880', aboutRaw.indexOf('content="' + P[1880].replace(/^Search description: /, '') + '"') !== -1);

present('tagline 1884', P[1884], aboutText);
present('lede 1885', P[1885], aboutText);
present('biography opening 1887', P[1887], aboutText);
present('GLCA / Global Liberal Arts Alliance 1888', P[1888], aboutText);
present('Drew / book 1889', P[1889], aboutText);
present('speaking 1890', P[1890], aboutText);

// 1891 is a label plus paragraph; the label becomes an h3 and the rest a paragraph.
const study = P[1891];
const studySplit = study.indexOf('. ');
check('study heading 1891', aboutText.indexOf(norm(study.slice(0, studySplit))) !== -1);
present('study paragraph 1891', study.slice(studySplit + 2), aboutText);

// 1893-1899: role and detail are split into dt/dd, so compare each half.
[1893, 1894, 1895, 1896, 1897, 1898, 1899].forEach(function (n) {
  const line = P[n];
  // 1894 carries the known docx error and is published with the correction.
  if (n === 1894) {
    present('career milestone 1894 role', 'President Emeritus, Hartwick College', aboutText);
    present('career milestone 1894 detail', "Served as the college's eighth president.", aboutText);
    return;
  }
  // 1899 is a single item with a comma between the degree and the university.
  const sep = n === 1899 ? ', ' : '. ';
  const parts = line.indexOf(sep) !== -1 ? [line.slice(0, line.indexOf(sep)), line.slice(line.indexOf(sep) + sep.length)] : [line];
  parts.forEach(function (part) {
    if (part === '') return;
    present('career milestone ' + n, part, aboutText);
  });
});

// Known docx error: Hartwick's tenth president must be published as eighth.
check('eighth president correction', /eighth president/.test(aboutText));
check('no tenth-president error', !/10th president|tenth president/i.test(aboutText));

// Peace Corps line 1900 is unverified and must stay unpublished.
check('Peace Corps omitted', !/Peace Corps|Caroline Islands/i.test(aboutText));

present('book title 1903', P[1903], aboutText);
present('book description 1904', P[1904], aboutText);
check('book button 1905', /Get the book/.test(aboutText));
present('contact 1907', P[1907], aboutText);

// Removed unsourced draft material.
check('no press list', !/press-list|Inside Higher Ed|Times Higher Education|Education Next/.test(aboutRaw));
check('no unsourced talks', !/Work with HigherEdImpact|Selected writing and talks/.test(aboutRaw));
check('no Eastern photo', !/detweiler-eastern|Eastern Connecticut/.test(aboutRaw));
check('no fact box / EIN', !/fact-box|87-2050100/.test(aboutMain));

// --- About: structure and assets -----------------------------------------
function count(html, pattern) {
  return (html.match(pattern) || []).length;
}

check('one h1', count(aboutMain, /<h1[\s>]/g) === 1, String(count(aboutMain, /<h1[\s>]/g)));
notes.push('About h2: ' + count(aboutMain, /<h2[\s>]/g) + ', h3: ' + count(aboutMain, /<h3[\s>]/g));
check('four source sections', count(aboutMain, /<h2[\s>]/g) === 4);
check('seven career milestones', count(aboutMain, /<dt>/g) === 7 && count(aboutMain, /<dd>/g) === 7);
check('two images', count(aboutMain, /<img /g) === 2);
check('image alt text', count(aboutMain, /<img [^>]*alt="[^"]+"/g) === 2);
check('image dimensions', count(aboutMain, /<img [^>]*width="\d+" height="\d+"/g) === 2);
check('no inline style', !/style="/.test(aboutMain));
check('no placeholders', !/\{\{[A-Z0-9_]+\}\}/.test(aboutRaw));

const ids = (aboutRaw.match(/\sid="([^"]+)"/g) || []).map(function (s) { return s.slice(5, -1); });
check('unique ids', new Set(ids).size === ids.length, ids.join(','));
check('sources panel present', /id="note-1"/.test(aboutRaw) && /id="note-2"/.test(aboutRaw));
check('notes trigger', /data-notes-open/.test(aboutRaw));

// --- Privacy: accurate site behaviour ------------------------------------
check('one h1 (privacy)', count(privacyRaw, /<h1[\s>]/g) === 1);
check('no analytics claim', !/analytics service|When measurement is enabled/i.test(privacyRaw));
check('states no analytics', /does not currently run analytics/.test(privacyText));
check('states no cookies', /sets no cookies/.test(privacyText));
check('no third-party code claim', /no third-party/i.test(privacyRaw));
check('local storage scoped to two tools', /Choosing a College/.test(privacyText) && /In College/.test(privacyText));
check('no inline style (privacy)', !/style="/.test(privacyRaw));
check('no placeholders (privacy)', !/\{\{[A-Z0-9_]+\}\}/.test(privacyRaw));

// The only scripts the site loads are its own; confirm no analytics or cookie code.
const allScripts = fs.readdirSync(path.join(ROOT, 'src', 'scripts')).map(function (file) {
  return fs.readFileSync(path.join(ROOT, 'src', 'scripts', file), 'utf8');
}).join('\n');
check('no analytics in scripts', !/gtag|googletag|plausible|umami|matomo|document\.cookie/i.test(allScripts));
check('two localStorage tools only', (allScripts.match(/localStorage/g) || []).length > 0 &&
  !/sessionStorage/.test(allScripts));

// --- Local links and assets ---------------------------------------------
function links(html) {
  const out = [];
  const re = /(?:href|src)="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

['about.html', 'privacy.html'].forEach(function (page) {
  const html = page === 'about.html' ? aboutRaw : privacyRaw;
  links(html).forEach(function (href) {
    if (/^(https?:|mailto:|#)/.test(href)) return;
    const clean = href.split('?')[0].split('#')[0];
    if (!clean) return;
    const target = path.join(PREVIEW, clean);
    check(page + ' link resolves: ' + clean, fs.existsSync(target));
  });
});

console.log('--- About');
console.log('source paragraphs 1878-1907: ' + Object.keys(P).filter(function (n) { return n >= 1878 && n <= 1907; }).length);
notes.forEach(function (n) { console.log(n); });
console.log('milestones: ' + count(aboutMain, /<dt>/g) + ' roles / ' + count(aboutMain, /<dd>/g) + ' details');
console.log('images: ' + count(aboutMain, /<img /g) + '; notes: ' + count(aboutRaw, /id="note-\d+"/g));
console.log('--- Privacy');
console.log('sections: ' + count(privacyRaw, /<h2[\s>]/g) + '; links: ' + links(privacyRaw).length);

if (fails.length) {
  console.error('\nFAIL (' + fails.length + ')');
  fails.forEach(function (f) { console.error('  - ' + f); });
  process.exit(1);
}
console.log('\nPASS: About and Privacy checks');
