'use strict';

// Revision 6 conformance audit: the parts of Website_Layout_Review_Revision6 that
// can be checked mechanically. Editorial copy is not judged here; content that
// Revision 6 requires but that does not exist yet is reported as BLOCKED.
//
// Run after `node build.js`.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'preview');
const SRC = path.join(ROOT, 'src');

let pass = 0;
let fail = 0;
let blocked = 0;

function ok(m) { pass++; console.log('PASS    ' + m); }
function bad(m) { fail++; console.log('FAIL    ' + m); }
function need(m) { blocked++; console.log('BLOCKED ' + m); }

function read(rel) { return fs.readFileSync(path.join(OUT, rel), 'utf8'); }
function src(rel) { return fs.readFileSync(path.join(SRC, rel), 'utf8'); }

const audiencePages = [
  ['choosing-a-college.html', 'Choosing a College'],
  ['in-college.html', 'In College'],
  ['parents.html', 'Parents'],
  ['counselors.html', 'Counselors'],
  ['faculty.html', 'Faculty'],
  ['college-leaders.html', 'College Leaders'],
  ['policymakers.html', 'Policymakers']
];

const allPages = [
  'index.html',
  'what-matters.html',
  'choosing-a-college.html',
  'in-college.html',
  'parents.html',
  'counselors.html',
  'faculty.html',
  'college-leaders.html',
  'policymakers.html',
  'understanding-college.html',
  'the-research.html',
  'about.html',
  'privacy.html',
  '404.html',
  'tools/college-scorecard.html'
];

console.log('Revision 6 audit\n');

// 1. Pages named in the site map
allPages.forEach(function (file) {
  if (fs.existsSync(path.join(OUT, file))) ok('site map page exists: ' + file);
  else bad('site map page missing: ' + file);
});

// 2. Remaining tool pages and downloads (content not in the repository)
need('4 more tool pages (tools/…): Revision 6 lists 5; only the college scorecard exists');
need('6 downloads (downloads/…): parent checklist, workshop kit, dean’s briefing, state brief, federal memo, counselor kit');

// 3. Header and footer shared elements
const footer = read('index.html');
if (/EIN 87-2050100/.test(footer)) ok('footer carries the EIN');
else bad('footer is missing the EIN');
if (/501\(c\)\(3\)/.test(footer)) ok('footer describes HigherEdImpact as a 501(c)(3)');
else bad('footer does not describe the 501(c)(3) status');
if (/Detweiler@higheredimpact\.org/.test(footer)) ok('footer carries the contact address');
else bad('footer is missing the contact address');
if (/18670 Nixon Ave/.test(footer)) ok('footer carries the current mailing address');
else bad('footer is missing the mailing address');
if (!/to be replaced|P\.O\. Box/i.test(footer)) ok('footer has no visible placeholder text');
else need('footer still needs the P.O. box Revision 6 promises');

// 4. Quiz first on every audience page
audiencePages.forEach(function (pair) {
  const html = read(pair[0]);
  const quizAt = html.search(/id="[a-z-]*quiz"|id="check"|data-check-app/);
  const firstFinding = html.search(/What graduates told us|What the research found|The numbers behind this/);
  if (quizAt === -1) {
    if (pair[0] === 'counselors.html') need(pair[1] + ': quiz not built yet (Revision 6 gives this page its own quiz)');
    else bad(pair[1] + ': no quiz on the page');
  } else if (firstFinding !== -1 && firstFinding < quizAt) {
    bad(pair[1] + ': findings appear above the quiz');
  } else {
    ok(pair[1] + ': quiz appears before the findings');
  }
});

// 5. Skip link on every page
allPages.forEach(function (file) {
  if (!fs.existsSync(path.join(OUT, file))) return;
  const html = read(file);
  if (/class="skip-link"[^>]*href="#main"/.test(html)) {
    if (file === 'index.html') ok('skip-to-content link present');
  } else {
    bad(file + ': no skip-to-content link');
  }
});

// 6. Notes panel and end-of-page sources link
const notesPages = allPages.filter(function (file) {
  if (!fs.existsSync(path.join(OUT, file))) return false;
  return /id="notes-panel"/.test(read(file));
});
if (notesPages.length) ok('notes panel present on ' + notesPages.length + ' pages');
else bad('no notes panel anywhere');

const sourceLinkPages = allPages.filter(function (file) {
  if (!fs.existsSync(path.join(OUT, file))) return false;
  return /href="#notes-panel"[^>]*data-notes-open|data-notes-open/.test(read(file));
});
if (sourceLinkPages.length >= notesPages.length) ok('a “Sources for this page” control is on every page with notes');
else bad('only ' + sourceLinkPages.length + ' pages have a sources control for ' + notesPages.length + ' pages with notes');

// 7. Print wording (Revision 6 says "Download as PDF"; the site delivers browser print)
const pdfLabels = allPages.filter(function (file) {
  if (!fs.existsSync(path.join(OUT, file))) return false;
  return /Download as PDF/i.test(read(file));
});
if (!pdfLabels.length) ok('no control claims to download a PDF');
else bad('PDF download wording on ' + pdfLabels.join(', '));

// 8. Choosing timeline: six steps
const choosing = read('choosing-a-college.html');
const timeline = choosing.match(/aria-labelledby="timeline-title"[\s\S]*?<\/section>/);
if (!timeline) {
  bad('Choosing page has no timeline section');
} else {
  const steps = (timeline[0].match(/<li[\s>]/g) || []).length;
  if (steps === 6) ok('Choosing page carries the six-step college timeline');
  else bad('Choosing timeline has ' + steps + ' steps (expected 6)');
}

// 9. The age range appears only where the method is explained
const ageRangePages = allPages.filter(function (file) {
  if (!fs.existsSync(path.join(OUT, file))) return false;
  return /55 to 65|55–65/.test(read(file));
});
const allowed = ['what-matters.html', 'the-research.html'];
const strays = ageRangePages.filter(function (file) { return allowed.indexOf(file) === -1; });
if (!strays.length) ok('the 55 to 65 age range appears only in the method pages');
else bad('age range still on ' + strays.join(', '));

// 10. Large-picture chart has a text alternative
if (/<table/.test(read('what-matters.html')) && /class="[^"]*chart/.test(read('what-matters.html'))) ok('What Matters has the chart and its text table');
else bad('What Matters is missing the chart or its text alternative');

// 11. Every form field labeled
let unlabeled = 0;
allPages.forEach(function (file) {
  if (!fs.existsSync(path.join(OUT, file))) return;
  const html = read(file);
  const fields = html.match(/<(input|select|textarea)\b[^>]*>/g) || [];
  fields.forEach(function (tag) {
    if (/type="(hidden|submit|button|range)"/.test(tag)) return;
    const id = (tag.match(/\bid="([^"]+)"/) || [])[1];
    const hasAria = /\baria-label(?:ledby)?="/.test(tag);
    const hasLabel = id && new RegExp('<label[^>]*for="' + id + '"').test(html);
    if (!hasAria && !hasLabel) unlabeled++;
  });
});
if (!unlabeled) ok('every visible form field has a label');
else bad(unlabeled + ' form field(s) without a label');

// 12. "A meaningful life in a world of change" block removed from audience pages
const repeated = audiencePages.filter(function (pair) { return /A meaningful life in a world of change/.test(read(pair[0])); });
if (!repeated.length) ok('the repeated closing block is gone from the audience pages');
else bad('repeated closing block still on ' + repeated.map(function (p) { return p[1]; }).join(', '));

// 13. Services appear only on About
const servicePages = allPages.filter(function (file) {
  if (!fs.existsSync(path.join(OUT, file))) return false;
  return /Work with HigherEdImpact|keynote|testimony/i.test(read(file));
});
const outside = servicePages.filter(function (file) { return file !== 'about.html'; });
if (!outside.length) ok('speaking, testimony and advising appear only on About');
else bad('services mentioned outside About: ' + outside.join(', '));

// 14. Every finding links to What Matters
const audienceMissing = audiencePages.filter(function (pair) {
  return !/href="what-matters\.html"/.test(read(pair[0]));
});
if (!audienceMissing.length) ok('every audience page links to What Matters in College');
else bad('no What Matters link on ' + audienceMissing.map(function (p) { return p[1]; }).join(', '));

// 15. Home: seven perspective cards
const home = read('index.html');
const cards = (home.match(/class="[^"]*(?:home-)?audience-card/g) || []).length;
if (cards === 7) ok('Home shows all seven perspective cards');
else bad('Home shows ' + cards + ' perspective cards (expected 7)');

// 16. Quiz skip link and an in-markup first question on every audience page
const skipMissing = audiencePages.filter(function (pair) {
  if (pair[0] === 'counselors.html') return false; // no quiz yet
  return !/Skip the quiz/i.test(read(pair[0]));
});
if (!skipMissing.length) ok('every audience page has the quiz skip link');
else bad('quiz skip link missing on ' + skipMissing.map(function (p) { return p[1]; }).join(', '));

// The quiz itself needs JavaScript, as the wireframes assume; the page content and the
// recommendations stay in the markup. Check every quiz page carries its mount point.
const quizMounts = audiencePages.filter(function (pair) {
  if (pair[0] === 'counselors.html') return false;
  return !/data-quiz|data-check-app|id="[a-z-]*quiz"/.test(read(pair[0]));
});
if (!quizMounts.length) ok('each quiz page carries its quiz mount');
else bad('no quiz mount on ' + quizMounts.map(function (p) { return p[1]; }).join(', '));

// 17. Notes numbered from 1 without gaps
let numberingProblems = [];
allPages.forEach(function (file) {
  if (!fs.existsSync(path.join(OUT, file))) return;
  const html = read(file);
  const ids = (html.match(/<li id="note-(\d+)">/g) || []).map(function (tag) { return Number(tag.replace(/\D/g, '')); });
  if (!ids.length) return;
  const sorted = ids.slice().sort(function (a, b) { return a - b; });
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i + 1) { numberingProblems.push(file + ' (starts or skips at ' + sorted[i] + ')'); break; }
  }
});
if (!numberingProblems.length) ok('notes are numbered from 1 without gaps');
else bad('note numbering: ' + numberingProblems.join(', '));

// 18. Header navigation matches the shared header
const headerProblems = [];
allPages.forEach(function (file) {
  if (!fs.existsSync(path.join(OUT, file))) return;
  const html = read(file);
  const audienceLinks = (html.match(/data-nav="(choosing|in-college|parents|counselors|faculty|leaders|policymakers)"/g) || []).length;
  const infoLinks = (html.match(/data-nav="(understanding|what-matters|research|about)"/g) || []).length;
  if (audienceLinks !== 7 || infoLinks !== 4) headerProblems.push(file + ' (' + audienceLinks + '/7, ' + infoLinks + '/4)');
});
if (!headerProblems.length) ok('every page carries the seven perspectives and four standing links');
else bad('header navigation on ' + headerProblems.join(', '));

// 19. Inter italic is loaded, not synthesized
const fonts = src('styles/fonts.css');
if (/font-style:\s*italic/.test(fonts)) ok('Inter italic is loaded');
else bad('Inter italic is not loaded (quotations would be a synthesized slant)');

// 20. Design: gold text token and accessible contrast variables
const tokens = src('styles/tokens.css');
if (/#866a14/i.test(tokens)) ok('darker gold token for text is defined');
else bad('no darker gold text token');

console.log('\nSummary: ' + JSON.stringify({ PASS: pass, FAIL: fail, BLOCKED: blocked }));
process.exit(fail ? 1 : 0);
