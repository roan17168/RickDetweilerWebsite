'use strict';

const fs = require('fs');
const path = require('path');

const source = fs.readFileSync('artifacts/policymakers-source.txt', 'utf8');
const page = fs.readFileSync('policymakers.html', 'utf8');
const data = JSON.parse(fs.readFileSync('src/data/policymakers.json', 'utf8'));
const api = require('../src/scripts/policymakers.js');

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
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '*')
    .replace(/&copy;/g, '(c)');
}

function norm(text) {
  return decode(text)
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
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

function flatten(value, out) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach(function (item) { flatten(item, out); });
  else if (value && typeof value === 'object') Object.keys(value).forEach(function (key) { flatten(value[key], out); });
  return out;
}

const dataText = norm(flatten(data, []).join(' '));

const lines = source.split('\n');
const sourceLines = new Map();
let tableLines = [];
let inTables = false;

lines.forEach(function (line) {
  if (line === 'TABLES') {
    inTables = true;
    return;
  }
  if (!inTables) {
    const match = line.match(/^(\d+): (.*)$/);
    if (match) sourceLines.set(Number(match[1]), match[2]);
  } else if (line.trim().startsWith('TABLE 13')) {
    tableLines.push(line.trim());
  } else if (inTables && line.trim()) {
    tableLines.push(line.trim());
  }
});

const skip = new Set([1439, 1440, 1441, 1442, 1450, 1451, 1452, 1478, 1575, 1580, 1581]);

function stripMarkers(text) {
  return text
    .replace(/ \(shown under every result\)$/i, '')
    .replace(/ \(tool\)$/i, '')
    .replace(/^Result: /i, '')
    .replace(/^(Label|Heading|Button): /i, '')
    .replace(/\s+→\s+\w+$/, '')
    .replace(/^What the research says to you\. /i, '')
    .replace(/^Try this one thing\. /i, '');
}

const missing = [];
let checked = 0;

sourceLines.forEach(function (text, index) {
  if (skip.has(index) || !text.trim()) return;
  const expected = norm(stripMarkers(text));
  if (!expected) return;
  checked += 1;
  if (pageText.indexOf(expected) === -1 && dataText.indexOf(expected) === -1) {
    missing.push(index + ': ' + stripMarkers(text));
  }
});

const splitChecks = [
  'Find your emphasis (optional)',
  '5 questions, two minutes. Most policymakers hold all three priorities in the quiz; your answers show which one you lead with and tailor the questions you get.',
  'Take the quiz',
  'Questions to ask',
  'One-page brief',
  'In Washington',
  'Copy the brief',
  'Email this to me',
  'Print',
  'alongside the completion and early-earnings data already reported, so that the state can see the long-term return on its investment.'
];

splitChecks.forEach(function (text) {
  checked += 1;
  if (pageText.indexOf(norm(text)) === -1) missing.push('split check: ' + text);
});

const h1Count = (page.match(/<h1\b/g) || []).length;
const idMatches = Array.from(page.matchAll(/\bid="([^"]+)"/g)).map(function (match) { return match[1]; });
const duplicateIds = Array.from(new Set(idMatches.filter(function (id, index) { return idMatches.indexOf(id) !== index; })));
const inlineStyles = (page.match(/\sstyle="/g) || []).length;
const sections = (page.match(/<section\b/g) || []).length;
const placeholders = (pageText.match(/\b(todo|tbd|lorem ipsum|placeholder text)\b/g) || []).length;
const printButtons = (page.match(/data-brief-print/g) || []).length;
const briefRows = (page.match(/data-brief-row/g) || []).length;
const briefWhy = (page.match(/data-brief-why/g) || []).length;
const briefFields = (page.match(/data-brief-field="/g) || []).length;
const briefCollected = (page.match(/data-brief-field="collected"/g) || []).length;
const briefCollectors = (page.match(/data-brief-field="collector"/g) || []).length;
const briefPriorities = (page.match(/data-brief-field="priority"/g) || []).length;
const requestInputs = (page.match(/data-brief-request="/g) || []).length;
const briefActions = (page.match(/data-brief-(copy|email|print)/g) || []).length;
const pdfLinks = (page.match(/two-page leave-behind|\.pdf["']/gi) || []).length;
const title = (page.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
const description = (page.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
const pageKey = (page.match(/<body data-page="([^"]+)"/) || [])[1] || '';

const brokenLinks = [];
const hrefs = Array.from(page.matchAll(/href="([^"]+)"/g)).map(function (match) { return match[1]; });
hrefs.forEach(function (href) {
  if (!href || href.startsWith('mailto:') || href.startsWith('http') || href.startsWith('tel:')) return;
  if (href.startsWith('#')) {
    const id = href.slice(1);
    if (id && idMatches.indexOf(id) === -1) brokenLinks.push(href);
    return;
  }
  const file = href.split('#')[0];
  if (!file) return;
  const target = path.resolve('.', file);
  if (!fs.existsSync(target)) brokenLinks.push(href);
});

const quiz = { questions: data.quiz.questions.length, options: 0, results: data.quiz.results.length, singles: 0, ties: 0, threeWay: 0, invalidRejected: true };
data.quiz.questions.forEach(function (question) { quiz.options += question.options.length; });

const values = ['workforce', 'civic', 'resilience'];
for (let i = 0; i < 243; i += 1) {
  let remainder = i;
  const answers = [];
  for (let question = 0; question < 5; question += 1) {
    answers.push(values[remainder % 3]);
    remainder = Math.floor(remainder / 3);
  }
  const scored = api.scoreQuiz(answers, data);
  if (!scored.complete) throw new Error('Valid combination failed: ' + answers.join(','));
  if (scored.results.length === 1) quiz.singles += 1;
  else if (scored.results.length === 2) quiz.ties += 1;
  else if (scored.results.length === 3) quiz.threeWay += 1;
  else throw new Error('Unexpected result count for ' + answers.join(','));
}

[
  ['workforce'],
  ['workforce', 'civic'],
  ['workforce', 'civic', 'resilience', 'workforce'],
  ['workforce', 'civic', 'resilience', 'workforce', 'other'],
  ['workforce', 'civic', 'resilience', 'workforce', null]
].forEach(function (answers) {
  if (api.scoreQuiz(answers, data).complete) quiz.invalidRejected = false;
});

const nav = {
  headerLink: /<a href="policymakers\.html" data-nav="policymakers">/.test(page),
  homeLink: /href="policymakers\.html"[^>]*>Start</.test(fs.readFileSync('index.html', 'utf8')),
  footerLink: /<a href="policymakers\.html">For Policymakers<\/a>/.test(page),
  staleLiveLinks: (fs.readFileSync('index.html', 'utf8') + page).includes('../policymakers.html')
};

const required = {
  title: title === 'Policymakers | What College Is Really For',
  description: description === 'For legislators, members of Congress, board members and policy staff. What the research says about measuring the value of a college, questions to ask in hearings, and a one-page brief.',
  pageKey: pageKey === 'policymakers',
  h1: h1Count === 1,
  sections: sections === 10,
  ids: duplicateIds.length === 0,
  inlineStyles: inlineStyles === 0,
  placeholders: placeholders === 0,
  printButtons: printButtons === 1,
  briefRows: briefRows === 5,
  briefWhy: briefWhy === 5,
  briefFields: briefFields === 15,
  briefCollected: briefCollected === 5,
  briefCollectors: briefCollectors === 5,
  briefPriorities: briefPriorities === 5,
  requestInputs: requestInputs === 4,
  briefActions: briefActions === 3,
  pdfLinks: pdfLinks === 0,
  brokenLinks: brokenLinks.length === 0,
  quizQuestions: quiz.questions === 5,
  quizOptions: quiz.options === 15,
  quizResults: quiz.results === 3,
  quizCombinations: quiz.singles === 153 && quiz.ties === 90 && quiz.threeWay === 0,
  quizInvalid: quiz.invalidRejected,
  nav: nav.headerLink && nav.homeLink && nav.footerLink && !nav.staleLiveLinks
};

const result = {
  copy: { checked: checked, missing: missing },
  structure: {
    h1Count: h1Count,
    sections: sections,
    ids: idMatches.length,
    duplicateIds: duplicateIds,
    inlineStyles: inlineStyles,
    placeholders: placeholders,
    printButtons: printButtons,
    briefRows: briefRows,
    briefWhy: briefWhy,
    briefFields: briefFields,
    requestInputs: requestInputs,
    briefActions: briefActions,
    pdfLinks: pdfLinks,
    brokenLinks: brokenLinks
  },
  quiz: quiz,
  navigation: nav,
  metadata: { title: title, description: description, pageKey: pageKey },
  required: required,
  pass: Object.keys(required).every(function (key) { return required[key]; }) && missing.length === 0
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.pass ? 0 : 1);
