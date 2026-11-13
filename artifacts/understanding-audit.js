'use strict';

const fs = require('fs');
const path = require('path');

const source = fs.readFileSync('artifacts/understanding-source.txt', 'utf8');
const page = fs.readFileSync('preview/understanding-college.html', 'utf8');

function decode(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;|&ndash;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '*')
    .replace(/&copy;/g, '(c)')
    .replace(/&eacute;/g, 'e');
}

function norm(text) {
  return decode(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[—–]/g, '-')
    .replace(/·/g, '*')
    .replace(/\s+/g, ' ')
    .replace(/"\s+/g, '"')
    .replace(/\s+"/g, '"')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()
    .toLowerCase();
}

const pageText = norm(
  page
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
);

const lines = source.split('\n');
const sourceLines = new Map();
let section = 'paragraphs';
lines.forEach(function (line) {
  if (line === 'TABLES') {
    section = 'tables';
    return;
  }
  if (section === 'paragraphs') {
    const match = line.match(/^(\d+): (.*)$/);
    if (match) sourceLines.set(Number(match[1]), match[2]);
  }
});

const skip = new Set([1593, 1594, 1595, 1596, 1734, 1735, 1736]);

function stripMarkers(text) {
  return text.replace(/^(Label|Heading): /i, '');
}

const missing = [];
let checked = 0;

sourceLines.forEach(function (text, index) {
  if (skip.has(index) || !text.trim()) return;
  const expected = norm(stripMarkers(text));
  if (!expected) return;
  checked += 1;
  if (pageText.indexOf(expected) === -1) missing.push(index + ': ' + stripMarkers(text));
});

const splitChecks = [
  'The study behind this site',
  'Among 1,000 graduates aged 25 to 65, involvement with faculty and other students outside class, broad study, and teaching that demanded thought were linked to all six adult outcomes. Major was not.',
  'Gallup-Purdue',
  'Among nearly 30,000 graduates, those who had a professor who cared about them, made them excited about learning and encouraged their goals more than doubled their odds of being engaged at work.',
  'Fifty years of scholarship',
  'Alexander Astin, Ernest Pascarella and Patrick Terenzini, Richard Light and Vincent Tinto, studying different students with different methods, each concluded that what students do in college, and with whom, outweighs the type or standing of the institution.'
];

splitChecks.forEach(function (text) {
  checked += 1;
  if (pageText.indexOf(norm(text)) === -1) missing.push('split check: ' + text);
});

const sourceTableChecks = [
  'Community college', 'Two-year public college, open to nearly everyone, low cost', 'Start a degree, train for a local career, or transfer to a four-year college', 'Small classes are common. Most students commute and many work, so life outside class takes effort to find.',
  'Liberal arts college', 'Smaller four-year college, usually residential, primarily undergraduate', 'Teach undergraduates broadly, in close contact with professors',
  'Regional or comprehensive university', 'Mid-sized public or private university with bachelor\'s and master\'s programs', 'Educate the region\'s teachers, nurses, managers and other professionals',
  'Research university', 'Large university with doctoral programs, laboratories and professional schools', 'Produce new knowledge as well as teach',
  'Specialized college', 'Art, music, engineering, health sciences, business, religious study, military academies', 'Prepare students deeply for one field', 'The choice of major is largely made before arriving.',
  'Career and for-profit college', 'Programs aimed at a specific job, often short and often online', 'Deliver a credential quickly', 'Outcomes vary widely. Check completion rates and debt.',
  'What is studied (content)', 'How it is studied (context)', 'Not tied to one occupation', 'The full span of knowledge', 'Intellectual skills', 'Engaging teaching', 'Larger perspectives', 'An educational community'
];

sourceTableChecks.forEach(function (text) {
  checked += 1;
  if (pageText.indexOf(norm(text)) === -1) missing.push('table check: ' + text);
});

const chartChecks = [
  '1636', 'Harvard founded', '1810', 'A different model appears', '1828', 'The Yale Report', '1862', 'The Morrill Acts', '1876', 'Johns Hopkins',
  'My professors care about me as a person', 'Colleges under 5,000 students', '45%', 'Larger institutions', '24%',
  'Skills employers weigh most in hiring', 'Communication', '64%', 'Problem-solving', '62%', 'Adaptability', '60%',
  'Source: Detweiler, The Evidence Liberal Arts Needs, ch. 3.',
  'Source: Gallup, 2019, as cited in Detweiler, p. 191.',
  'Source: GMAC Corporate Recruiters Survey 2026.'
];

chartChecks.forEach(function (text) {
  checked += 1;
  if (pageText.indexOf(norm(text)) === -1) missing.push('chart check: ' + text);
});

const h1Count = (page.match(/<h1\b/g) || []).length;
const h2Count = (page.match(/<h2\b/g) || []).length;
const ids = Array.from(page.matchAll(/\bid="([^"]+)"/g)).map(function (match) { return match[1]; });
const duplicateIds = Array.from(new Set(ids.filter(function (id, index) { return ids.indexOf(id) !== index; })));
const inlineStyles = (page.match(/\sstyle="/g) || []).length;
const sections = (page.match(/<section\b/g) || []).length;
const placeholders = (pageText.match(/\b(todo|tbd|lorem ipsum|placeholder text)\b/g) || []).length;
const kindsRows = (page.match(/<tr>\s*<th scope="row" data-label="Kind">/g) || []).length;
const contextRows = (page.match(/data-label="Part"/g) || []).length;
const groupRows = (page.match(/class="understanding-group"/g) || []).length;
const timelineItems = (page.match(/understanding-timeline-list/g) || []).length;
const barRows = (page.match(/understanding-bar-row/g) || []).length;
const chartFigures = (page.match(/class="understanding-chart"/g) || []).length;
const chartData = (page.match(/class="understanding-chart-data"/g) || []).length;
const historyDetails = (page.match(/data-understanding-history/g) || []).length;
const tocLinks = (page.match(/class="understanding-toc"[\s\S]*?<\/nav>/g) || []).join('').match(/href="#/g) || [];
const title = (page.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
const description = (page.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
const pageKey = (page.match(/<body data-page="([^"]+)"/) || [])[1] || '';

const brokenLinks = [];
const hrefs = Array.from(page.matchAll(/href="([^"]+)"/g)).map(function (match) { return match[1]; });
hrefs.forEach(function (href) {
  if (!href || href.startsWith('mailto:') || href.startsWith('http') || href.startsWith('tel:')) return;
  if (href.startsWith('#')) {
    const id = href.slice(1);
    if (id && ids.indexOf(id) === -1) brokenLinks.push(href);
    return;
  }
  const file = href.split('#')[0];
  if (!file) return;
  const target = path.resolve('preview', file);
  if (!fs.existsSync(target)) brokenLinks.push(href);
});

const nav = {
  header: /<a href="understanding-college\.html" data-nav="understanding">/.test(page),
  footer: /<a href="understanding-college\.html">Understanding College<\/a>/.test(page),
  home: /href="understanding-college\.html"[^>]*>Understanding College</.test(fs.readFileSync('preview/index.html', 'utf8')),
  stale: (fs.readFileSync('preview/index.html', 'utf8') + page).includes('../understanding-college.html')
};

const required = {
  title: title === 'Understanding College | What College Is Really For',
  description: description === 'How American colleges differ, where the liberal arts idea came from, why rankings and prestige are weak guides, and how to choose by evidence instead.',
  pageKey: pageKey === 'understanding',
  h1: h1Count === 1,
  h2: h2Count === 12,
  sections: sections === 14,
  ids: duplicateIds.length === 0,
  inlineStyles: inlineStyles === 0,
  placeholders: placeholders === 0,
  kindsRows: kindsRows === 6,
  contextRows: contextRows === 6,
  groupRows: groupRows === 2,
  timeline: timelineItems === 1 && (page.match(/<li><span class="understanding-year">/g) || []).length === 5,
  bars: barRows === 5,
  charts: chartFigures === 2,
  chartData: chartData === 2,
  historyDetails: historyDetails === 1,
  toc: tocLinks.length === 12,
  brokenLinks: brokenLinks.length === 0,
  nav: nav.header && nav.footer && nav.home && !nav.stale
};

const result = {
  copy: { checked: checked, missing: missing },
  structure: {
    h1Count: h1Count,
    h2Count: h2Count,
    sections: sections,
    ids: ids.length,
    duplicateIds: duplicateIds,
    inlineStyles: inlineStyles,
    placeholders: placeholders,
    kindsRows: kindsRows,
    contextRows: contextRows,
    groupRows: groupRows,
    timelineItems: timelineItems,
    barRows: barRows,
    chartFigures: chartFigures,
    chartData: chartData,
    historyDetails: historyDetails,
    tocLinks: tocLinks.length,
    brokenLinks: brokenLinks
  },
  navigation: nav,
  metadata: { title: title, description: description, pageKey: pageKey },
  required: required,
  pass: Object.keys(required).every(function (key) { return required[key]; }) && missing.length === 0
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.pass ? 0 : 1);
