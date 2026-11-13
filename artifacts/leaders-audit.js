'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(ROOT, 'artifacts/college-leaders-source.txt'), 'utf8');
const page = fs.readFileSync(path.join(ROOT, 'preview/college-leaders.html'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/college-leaders.json'), 'utf8'));
const engine = require(path.join(ROOT, 'src/scripts/college-leaders.js'));

function decode(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;|&#39;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...')
    .replace(/&copy;/g, '(c)');
}

function normalize(text) {
  return decode(String(text))
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

const pageText = normalize(stripTags(page));
const jsonStrings = [];
(function collect(value) {
  if (typeof value === 'string') jsonStrings.push(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.keys(value).forEach(function (key) { collect(value[key]); });
})(data);
const jsonText = normalize(jsonStrings.join(' \n '));
const haystack = pageText + '\n' + jsonText;

const paragraphs = {};
source.split('\n').forEach(function (line) {
  const match = line.match(/^(\d+): (.*)$/);
  if (match) paragraphs[Number(match[1])] = match[2];
});

function auditLine(number) {
  let text = paragraphs[number];
  if (!text) return null;
  text = text.replace(/^(Label|Heading|Button|Result|Note|Page title|Search description):\s*/, '');
  text = text.replace(/\s+→\s+(Market|Mission|Experience)\.?\s*$/, '');
  text = text.replace(/\s*\((shown under every result|tool|one page)\)\s*/g, ' ');
  text = text.replace(/^This year\.\s*/, '');
  text = text.replace(/^What the research says to you\.\s*/, '');
  text = text.replace(/^"|"$/g, '');
  text = text.replace(/_{2,}/g, ' ');
  return normalize(text);
}

const skip = new Set([1234, 1238, 1247, 1256, 1278, 1296, 1384, 1400]);
const missing = [];
let checked = 0;

for (let n = 1204; n <= 1437; n += 1) {
  if (skip.has(n) || !paragraphs[n]) continue;
  const text = auditLine(n);
  if (!text) continue;
  checked += 1;
  if (haystack.indexOf(text) === -1) missing.push(n + ': ' + text);
}

// 1400 is a three-part line rendered as labelled fields.
['what it will cost', 'budget neutral', 'reallocation', 'new investment'].forEach(function (piece) {
  checked += 1;
  if (haystack.indexOf(piece) === -1) missing.push('1400 piece: ' + piece);
});

// 1384 is rendered as three separate controls.
['copy the checklist', 'email this to me', 'print'].forEach(function (piece) {
  checked += 1;
  if (haystack.indexOf(piece) === -1) missing.push('1384 piece: ' + piece);
});

// The result subheading is added by the quiz engine.
checked += 1;
if (fs.readFileSync(path.join(ROOT, 'src/scripts/college-leaders.js'), 'utf8').indexOf('Essential questions') === -1) {
  missing.push('engine: Essential questions heading');
}

// 1296 and 1385/1407 notes are rendered.
[1296, 1385, 1407].forEach(function (n) {
  const text = auditLine(n);
  checked += 1;
  if (haystack.indexOf(text) === -1) missing.push(n + ': ' + text);
});

// Metadata
const titleMatch = page.match(/<title>([^<]+)<\/title>/);
const descMatch = page.match(/<meta name="description" content="([^"]+)"/);
const meta = [
  ['title', titleMatch ? titleMatch[1] : ''],
  ['description', descMatch ? descMatch[1] : '']
];
meta.forEach(function (pair) {
  const expected = normalize(paragraphs[pair[0] === 'title' ? 1201 : 1202].replace(/^(Page title|Search description):\s*/, ''));
  checked += 1;
  if (normalize(pair[1]) !== expected) missing.push(pair[0] + ' mismatch');
});

// Quiz scoring: all 243 combinations.
const keys = ['market', 'mission', 'experience'];
let combinations = 0;
let singles = 0;
let ties = 0;
let threeWay = 0;
let scoringProblems = [];

for (let a = 0; a < 3; a += 1) {
  for (let b = 0; b < 3; b += 1) {
    for (let c = 0; c < 3; c += 1) {
      for (let d = 0; d < 3; d += 1) {
        for (let e = 0; e < 3; e += 1) {
          const values = [keys[a], keys[b], keys[c], keys[d], keys[e]];
          const counts = { market: 0, mission: 0, experience: 0 };
          values.forEach(function (value) { counts[value] += 1; });
          const maximum = Math.max(counts.market, counts.mission, counts.experience);
          const expected = keys.filter(function (key) { return counts[key] === maximum; }).sort();
          const scored = engine.scoreQuiz(values, data);
          const actual = scored.results.map(function (result) { return result.key; }).sort();
          combinations += 1;
          if (!scored.complete) scoringProblems.push('incomplete: ' + values.join(','));
          if (actual.join(',') !== expected.join(',')) scoringProblems.push('mismatch: ' + values.join(',') + ' -> ' + actual);
          if (actual.length === 1) singles += 1;
          if (actual.length === 2) ties += 1;
          if (actual.length === 3) threeWay += 1;
        }
      }
    }
  }
}

[[], ['market'], ['market', 'market', 'market', 'market'], ['market', 'mission', 'experience', 'market', 'bogus'], null].forEach(function (values) {
  if (engine.scoreQuiz(values, data).complete) scoringProblems.push('invalid accepted: ' + JSON.stringify(values));
});

// Structure
const ids = [];
const idMatches = page.match(/\sid="([^"]+)"/g) || [];
idMatches.forEach(function (item) { ids.push(item.replace(/^\sid="|"$/g, '')); });
const duplicateIds = ids.filter(function (id, index) { return ids.indexOf(id) !== index; });
const h1Count = (page.match(/<h1[\s>]/g) || []).length;
const inlineStyles = (page.match(/\sstyle="/g) || []).length;
const placeholders = (page.match(/\{\{[A-Z0-9_]+\}\}/g) || []).length;
const checklistRows = (page.match(/data-checklist-row/g) || []).length;
const dataRows = (page.match(/<tbody>[\s\S]*?<\/tbody>/g) || []).reduce(function (count, block) {
  return count + (block.match(/<tr>/g) || []).length;
}, 0);

const links = [];
(page.match(/(?:href|src)="([^"]+)"/g) || []).forEach(function (item) {
  links.push(item.replace(/^(?:href|src)="|"$/g, ''));
});
const brokenLinks = [];
links.forEach(function (link) {
  if (/^(#|https?:|mailto:|data:|tel:)/.test(link)) return;
  const clean = link.split('#')[0].split('?')[0];
  if (!clean) return;
  const resolved = path.resolve(path.join(ROOT, 'preview'), clean);
  if (!fs.existsSync(resolved)) brokenLinks.push(link);
});

// Duplicate copy check: the three results are in the data, not the page.
const pageHasResultHeads = ['Market-first', 'Mission-first', 'Experience-first'].every(function (heading) {
  return pageText.indexOf(normalize(heading)) !== -1 || jsonText.indexOf(normalize(heading)) !== -1;
});

const report = {
  copy: { checked: checked, missing: missing },
  scoring: {
    combinations: combinations,
    singles: singles,
    twoWayTies: ties,
    threeWayTies: threeWay,
    problems: scoringProblems
  },
  structure: {
    h1Count: h1Count,
    ids: ids.length,
    duplicateIds: Array.from(new Set(duplicateIds)),
    inlineStyles: inlineStyles,
    placeholders: placeholders,
    checklistRows: checklistRows,
    totalTbodyRows: dataRows,
    brokenLinks: brokenLinks,
    resultHeadsPresent: pageHasResultHeads
  }
};

console.log(JSON.stringify(report, null, 2));
if (missing.length || scoringProblems.length || h1Count !== 1 || duplicateIds.length || inlineStyles || placeholders || checklistRows !== 8 || brokenLinks.length || !pageHasResultHeads || threeWay > 0) {
  process.exitCode = 1;
}
