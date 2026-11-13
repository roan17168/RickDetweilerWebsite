'use strict';

// Revision 6 conformance suite, driven by the .docx itself.
//
// The audit unzips Website_Layout_Review_Revision6.docx, reads word/document.xml,
// extracts every paragraph, and checks the built site against the exact wording,
// addresses, metadata, tool rows, quiz text and downloads it specifies.
//
// Run after `node build.js`.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'preview');
const SRC = path.join(ROOT, 'src');
const DOCX = path.join(ROOT, 'Website_Layout_Review_Revision6.docx');

let pass = 0;
let fail = 0;
const failures = [];

function ok() { pass++; }
function bad(label, detail) {
  fail++;
  failures.push(label + (detail ? ': ' + detail : ''));
}

function check(label, condition, detail) {
  if (condition) ok();
  else bad(label, detail);
}

/* ---------------------------------------------------------------- document */

function extractParagraphs() {
  const xml = execFileSync('unzip', ['-p', DOCX, 'word/document.xml'], {
    maxBuffer: 128 * 1024 * 1024
  }).toString('utf8');
  const blocks = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) || [];
  return blocks.map(function (block) {
    const runs = block.match(/<w:t[^>]*>[\s\S]*?<\/w:t>/g) || [];
    return runs.map(function (run) {
      return run.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>$/, '');
    }).join('').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&').trim();
  });
}

if (!fs.existsSync(DOCX)) {
  console.error('FAIL: ' + path.basename(DOCX) + ' is not in the repository.');
  process.exit(1);
}

const paragraphs = extractParagraphs();

/* --------------------------------------------------------------- utilities */

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'",
  '&#39;': "'", '&#x27;': "'", '&rsquo;': "'", '&lsquo;': "'", '&apos;': "'",
  '&ldquo;': '"', '&rdquo;': '"', '&mdash;': '-', '&ndash;': '-',
  '&nbsp;': ' ', '&middot;': '*', '&copy;': '(c)', '&hellip;': '...',
  '&times;': 'x', '&deg;': ' degrees', '&frac12;': '1/2',
  '&larr;': '←', '&rarr;': '→', '&#8592;': '←', '&#8594;': '→'
};

function decode(text) {
  return String(text)
    .replace(/&[a-zA-Z#0-9x]+;/g, function (entity) {
      return Object.prototype.hasOwnProperty.call(ENTITIES, entity) ? ENTITIES[entity] : entity;
    });
}

function stripTags(html) {
  return String(html)
    // A superscript note number is a link, not prose; drop its digits.
    .replace(/<sup[\s\S]*?<\/sup>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function norm(text) {
  return decode(text)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pageText(file) {
  return norm(stripTags(read(file)));
}

function read(file) {
  return fs.readFileSync(path.join(OUT, file), 'utf8');
}

function src(file) {
  return fs.readFileSync(path.join(SRC, file), 'utf8');
}

function paragraph(index) {
  return paragraphs[index] || '';
}

function findIndex(pattern, from) {
  for (let i = from || 0; i < paragraphs.length; i += 1) {
    if (pattern.test(paragraphs[i])) return i;
  }
  return -1;
}

function contains(haystack, needle) {
  return norm(haystack).indexOf(norm(needle)) !== -1;
}

const ALL_PAGES = [
  'index.html', 'what-matters.html', 'choosing-a-college.html', 'in-college.html',
  'parents.html', 'counselors.html', 'faculty.html', 'college-leaders.html',
  'policymakers.html', 'understanding-college.html', 'the-research.html',
  'about.html', 'privacy.html', '404.html',
  'tools/college-scorecard.html', 'tools/semester-plan.html', 'tools/course-self-audit.html',
  'tools/leaders-checklist.html', 'tools/policy-brief.html'
];

const AUDIENCE = [
  ['choosing-a-college.html', 'Choosing a College', 'tools/college-scorecard.html'],
  ['in-college.html', 'In College', 'tools/semester-plan.html'],
  ['parents.html', 'Parents', null],
  ['counselors.html', 'Counselors', null],
  ['faculty.html', 'Faculty', 'tools/course-self-audit.html'],
  ['college-leaders.html', 'College Leaders', 'tools/leaders-checklist.html'],
  ['policymakers.html', 'Policymakers', 'tools/policy-brief.html']
];

/* ------------------------------------------------------- 1. source integrity */

check('the docx is present', fs.existsSync(DOCX));
check('the docx yields its full paragraph body', paragraphs.length >= 3180, paragraphs.length + ' paragraphs');
check('the document names the site map', findIndex(/^Site map$/) !== -1);
check('the document carries the tool-page template', findIndex(/^Tool pages \(template and five tools\)$/) !== -1);
check('the document carries the downloads section', findIndex(/^Downloads$/) !== -1);
check('the document carries the Counselors quiz text', findIndex(/^Quiz: full text \(new\)$/) !== -1);

/* --------------------------------------------------------- 2. page metadata */

const ADDRESS_MAP = [
  ['index.html', /^Address: the site's home page/],
  ['choosing-a-college.html', /^Address: choosing-a-college\.html$/],
  ['in-college.html', /^Address: in-college\.html$/],
  ['parents.html', /^Address: parents\.html$/],
  ['counselors.html', /^Address: counselors\.html/],
  ['faculty.html', /^Address: faculty\.html$/],
  ['college-leaders.html', /^Address: college-leaders\.html$/],
  ['policymakers.html', /^Address: policymakers\.html$/],
  ['understanding-college.html', /^Address: understanding-college\.html$/],
  ['what-matters.html', /^Address: what-matters\.html/],
  ['the-research.html', /^Address: the-research\.html$/],
  ['about.html', /^Address: about\.html$/],
  ['privacy.html', /^Address: privacy\.html/]
];

let metadataChecks = 0;
ADDRESS_MAP.forEach(function (pair) {
  const at = findIndex(pair[1]);
  if (at === -1) {
    bad('docx address for ' + pair[0] + ' was not found');
    return;
  }
  const titleIndex = (function () {
    for (let i = at; i < at + 4; i += 1) if (/^Browser title: /.test(paragraph(i))) return i;
    return -1;
  })();
  const descriptionIndex = (function () {
    for (let i = at; i < at + 6; i += 1) if (/^Search description: /.test(paragraph(i))) return i;
    return -1;
  })();

  const built = read(pair[0]);
  const title = norm((built.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
  const description = norm((built.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');

  if (titleIndex !== -1) {
    const expected = norm(paragraph(titleIndex).replace(/^Browser title: /, ''));
    metadataChecks += 1;
    check('title matches Revision 6: ' + pair[0], title === expected, '\n      expected: ' + expected + '\n      built:    ' + title);
  }
  if (descriptionIndex !== -1) {
    const expected = norm(paragraph(descriptionIndex).replace(/^Search description: /, ''));
    metadataChecks += 1;
    check('description matches Revision 6: ' + pair[0], description === expected, '\n      expected: ' + expected + '\n      built:    ' + description);
  }
});
console.log('metadata values compared: ' + metadataChecks);

/* ------------------------------------------------------------- 3. site map */

const SITE_MAP = [
  'index.html', 'what-matters.html', 'choosing-a-college.html', 'in-college.html',
  'parents.html', 'faculty.html', 'college-leaders.html', 'policymakers.html',
  'counselors.html', 'understanding-college.html', 'the-research.html',
  'about.html', 'privacy.html'
];
SITE_MAP.forEach(function (file) {
  check('site-map page is built: ' + file, fs.existsSync(path.join(OUT, file)));
});

const toolFiles = fs.readdirSync(path.join(OUT, 'tools')).filter(function (name) { return /\.html$/.test(name); });
check('tools/ holds the five tool pages Revision 6 lists', toolFiles.length === 5, toolFiles.join(', '));

const downloadFiles = fs.existsSync(path.join(OUT, 'downloads'))
  ? fs.readdirSync(path.join(OUT, 'downloads')).filter(function (name) { return /\.pdf$/i.test(name); })
  : [];
check('downloads/ holds the six take-aways Revision 6 lists', downloadFiles.length === 6, downloadFiles.join(', '));

/* --------------------------------------------------- 4. the five tool pages */

const TOOLS = [
  {
    file: 'tools/college-scorecard.html',
    audience: 'choosing-a-college.html',
    back: '\u2190 Choosing a College',
    forIndex: [2313],
    howIndex: [2314],
    rows: [['dealbreakers', 4]],
    buttons: ['Print', 'Copy text', 'Download as PDF', 'Reset'],
    fill: /data-scorecard-prefill/,
    script: 'src/scripts/choosing.js'
  },
  {
    file: 'tools/semester-plan.html',
    audience: 'in-college.html',
    back: '\u2190 In College',
    forIndex: [2381],
    howIndex: [2382],
    rows: [['data-tool-row-label=', 3]],
    buttons: ['Print', 'Copy text', 'Download as PDF', 'Reset'],
    fill: /data-tool-prefill|data-tool-prefill-note/
  },
  {
    file: 'tools/course-self-audit.html',
    audience: 'faculty.html',
    back: '\u2190 Faculty',
    forIndex: [2405],
    howIndex: [2406],
    rows: [['data-tool-row-label=', 5]],
    buttons: ['Print', 'Copy text', 'Download as PDF', 'Reset'],
    fill: /data-tool-prefill|data-tool-prefill-note/
  },
  {
    file: 'tools/leaders-checklist.html',
    audience: 'college-leaders.html',
    back: '\u2190 College Leaders',
    forIndex: [2437],
    howIndex: [2438],
    rows: [['data-tool-row-label=', 8]],
    buttons: ['Print', 'Copy text', 'Download as PDF', 'Reset'],
    fill: null
  },
  {
    file: 'tools/policy-brief.html',
    audience: 'policymakers.html',
    back: '\u2190 Policymakers',
    forIndex: [2504],
    howIndex: null,
    rows: [['data-tool-row-label=', 5]],
    buttons: ['Print', 'Copy text', 'Download as PDF', 'Reset'],
    fill: null
  }
];

const TOOL_FILE_MAP = {
  'tools/college-scorecard.html': 'choosing-a-college.html',
  'tools/semester-plan.html': 'in-college.html',
  'tools/course-self-audit.html': 'faculty.html',
  'tools/leaders-checklist.html': 'college-leaders.html',
  'tools/policy-brief.html': 'policymakers.html'
};

function docxToolCopy(index) {
  if (index === null) return null;
  const text = paragraph(index);
  return text
    .replace(/^What it's for: /, '')
    .replace(/^How to use it: /, '')
    // A note marker in the source is rendered as a superscript link, not as copy.
    .replace(/\s*\[\d+\]/g, '');
}

TOOLS.forEach(function (tool) {
  if (!fs.existsSync(path.join(OUT, tool.file))) {
    bad('tool page missing: ' + tool.file);
    return;
  }
  const html = read(tool.file);
  const text = pageText(tool.file);

  check(tool.file + ': back link to ' + tool.audience, html.indexOf('href="../' + tool.audience + '"') !== -1);
  check(tool.file + ': back-link label', contains(text, tool.back), tool.back);

  if (tool.forIndex) {
    const expected = docxToolCopy(tool.forIndex[0]);
    check(tool.file + ': "What it\'s for" matches Revision 6', contains(text, expected), expected);
  }
  if (tool.howIndex) {
    const expected = docxToolCopy(tool.howIndex[0]);
    check(tool.file + ': "How to use it" matches Revision 6', contains(text, expected), expected);
  }

  const controlSource = tool.script ? fs.readFileSync(path.join(ROOT, tool.script), 'utf8') : '';
  tool.buttons.forEach(function (label) {
    check(tool.file + ': "' + label + '" control', contains(text, label) || contains(controlSource, label));
  });

  if (tool.fill) {
    check(tool.file + ': says it is filled in from the quiz', tool.fill.test(html));
  }

  if (tool.rows && tool.rows[0][0] === 'dealbreakers') {
    const scorecard = JSON.parse(fs.readFileSync(path.join(SRC, 'data/choosing.json'), 'utf8')).scorecard;
    check(tool.file + ': four dealbreakers', scorecard.dealbreakers.length === 4, scorecard.dealbreakers.length + ' found');
    check(tool.file + ': five experience rows plus four of your own', scorecard.experiences.length === 5, scorecard.experiences.length + ' experience rows');
  }

  // Every visible field labelled.
  const fields = html.match(/<(input|select|textarea)\b[^>]*>/g) || [];
  let unlabeled = 0;
  fields.forEach(function (tag) {
    if (/type="(hidden|submit|button)"/.test(tag)) return;
    const id = (tag.match(/\bid="([^"]+)"/) || [])[1];
    const aria = /\baria-label(?:ledby)?="/.test(tag);
    const label = id ? new RegExp('<label[^>]*for="' + id + '"').test(html) : false;
    if (!aria && !label) unlabeled += 1;
  });

  check(tool.file + ': every field labelled', unlabeled === 0, unlabeled + ' unlabeled');

  check(tool.file + ': one h1', (html.match(/<h1[\s>]/g) || []).length === 1);
  check(tool.file + ': no unresolved placeholder', !/\{\{[A-Z_]+\}\}/.test(html));
  check(tool.file + ': full-width template with no sidebar', /tool-page|choosing-scorecard-section/.test(html) && !/class="[^"]*sidebar/.test(html));
  check(tool.file + ': print styles exist', /@media print/.test(fs.readFileSync(path.join(OUT, 'styles.css'), 'utf8')));
});

/* --------------------------------------------------------- 5. the downloads */

const DOWNLOADS = [
  { file: 'parent-checklist.pdf', pages: 2, linked: ['parents.html', 'counselors.html'] },
  { file: 'faculty-workshop-kit.pdf', pages: 4, linked: ['faculty.html'] },
  { file: 'deans-briefing.pdf', pages: 5, linked: ['college-leaders.html'] },
  { file: 'state-brief.pdf', pages: 2, linked: ['policymakers.html'] },
  { file: 'federal-staff-memo.pdf', pages: 2, linked: ['policymakers.html'] },
  { file: 'counselor-kit.pdf', pages: 8, linked: ['counselors.html'] }
];

function pdfPageCount(buffer) {
  const text = buffer.toString('latin1');
  const matches = text.match(/\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/);
  if (matches) return Number(matches[1]);
  const counts = text.match(/\/Count\s+(\d+)/g) || [];
  return counts.length ? Math.max.apply(null, counts.map(function (item) { return Number(item.replace(/\D/g, '')); })) : 0;
}

DOWNLOADS.forEach(function (item) {
  const file = path.join(OUT, 'downloads', item.file);
  if (!fs.existsSync(file)) {
    bad('download missing: ' + item.file);
    return;
  }
  const buffer = fs.readFileSync(file);
  check(item.file + ' is a PDF', buffer.slice(0, 5).toString('latin1') === '%PDF-');
  const pages = pdfPageCount(buffer);
  check(item.file + ' has the ' + item.pages + ' pages Revision 6 lists', pages === item.pages, pages + ' pages');

  item.linked.forEach(function (page) {
    const html = read(page);
    const pattern = new RegExp('<a[^>]*href="downloads/' + item.file.replace(/\./g, '\\.') + '"[^>]*>([^<]+)<', 'g');
    const match = pattern.exec(html);
    check(item.file + ' is linked from ' + page, !!match);
    if (match) {
      check(item.file + ' has descriptive link text on ' + page, norm(match[1]).length > 8, match[1]);
      check(item.file + ' link carries download on ' + page, /download/.test(match[0].slice(0, match[0].length - match[1].length)));
    }
  });
});

/* ---------------------------------------------------- 6. the Counselors quiz */

const counselors = JSON.parse(fs.readFileSync(path.join(SRC, 'data/counselors.json'), 'utf8')).quiz;

const QUIZ_BLOCK = [
  [1030, null, 'quiz heading on the page'],
  [1031, null, 'quiz lead on the page'],
  [1101, null, 'question 1'],
  [1102, null, 'question 1 option 1'],
  [1103, null, 'question 1 option 2'],
  [1104, null, 'question 1 option 3'],
  [1105, null, 'question 1 option 4'],
  [1106, null, 'question 2'],
  [1107, null, 'question 2 option 1'],
  [1108, null, 'question 2 option 2'],
  [1109, null, 'question 2 option 3'],
  [1110, null, 'question 2 option 4'],
  [1111, null, 'question 3'],
  [1112, null, 'question 3 option 1'],
  [1113, null, 'question 3 option 2'],
  [1114, null, 'question 3 option 3'],
  [1115, null, 'question 3 option 4'],
  [1116, null, 'question 4'],
  [1117, null, 'question 4 option 1'],
  [1118, null, 'question 4 option 2'],
  [1119, null, 'question 4 option 3'],
  [1120, null, 'question 4 option 4'],
  [1121, null, 'question 5'],
  [1122, null, 'question 5 option 1'],
  [1123, null, 'question 5 option 2'],
  [1124, null, 'question 5 option 3'],
  [1125, null, 'question 5 option 4'],
  [1126, null, 'optional question'],
  [1127, null, 'optional note'],
  [1128, null, 'optional option 1'],
  [1129, null, 'optional option 2'],
  [1130, null, 'optional option 3'],
  [1131, null, 'optional option 4'],
  [1132, null, 'tie-breaker'],
  [1133, null, 'tie option 1'],
  [1134, null, 'tie option 2'],
  [1135, null, 'tie option 3'],
  [1136, null, 'tie option 4']
];

const quizJson = norm(JSON.stringify(counselors));
const counselorsText = pageText('counselors.html');

function stripBrackets(text) {
  return norm(String(text).replace(/\s*\[[^\]]*\]\s*$/, ''));
}

QUIZ_BLOCK.forEach(function (entry) {
  const raw = paragraph(entry[0]);
  if (!raw) {
    bad('docx paragraph ' + entry[0] + ' (' + entry[2] + ') is empty');
    return;
  }
  let expected = raw;
  if (entry[1]) {
    const match = raw.match(entry[1]);
    expected = match ? match[1] : raw;
    expected = expected.replace(/^.*?\u2014\s*/, '');
  }
  expected = stripBrackets(expected)
    .replace(/^Question \d+: /, '')
    .replace(/^Optional question: /, '')
    .replace(/^Tie-breaker(?: \(shown whenever two or more results tie\))?: /, '')
    .replace(/^Intro \(shown above question 1\):\s*What's your counseling instinct\?\s*-\s*/, '');
  check('Counselors quiz: ' + entry[2] + ' matches Revision 6', quizJson.indexOf(expected) !== -1, expected);
});

const resultFields = [
  [1139, 'Door Opener heading'], [1140, 'Door Opener lead'],
  [1142, 'Door Opener research'], [1144, 'Door Opener question 1'], [1145, 'Door Opener question 2'],
  [1146, 'Door Opener try-this'], [1147, 'Door Opener kit line'],
  [1148, 'Door Opener research pull-out'],
  [1150, 'Matchmaker heading'], [1151, 'Matchmaker lead'], [1155, 'Matchmaker question 1'],
  [1156, 'Matchmaker question 2'], [1157, 'Matchmaker try-this'], [1158, 'Matchmaker kit line'],
  [1161, 'Guide heading'], [1162, 'Guide lead'], [1166, 'Guide question 1'], [1167, 'Guide question 2'],
  [1168, 'Guide try-this'], [1169, 'Guide kit line'],
  [1172, 'Finisher heading'], [1173, 'Finisher lead'], [1177, 'Finisher question 1'],
  [1178, 'Finisher question 2'], [1179, 'Finisher question 3'], [1180, 'Finisher try-this'],
  [1181, 'Finisher kit line'],
  [1184, 'advice: big caseload heading'], [1185, 'advice: big caseload text'],
  [1186, 'advice: first-generation heading'], [1187, 'advice: first-generation text'],
  [1188, 'advice: independent school heading'], [1189, 'advice: independent school text'],
  [1190, 'advice: access program heading'], [1191, 'advice: access program text']
];

resultFields.forEach(function (entry) {
  const raw = paragraph(entry[0]);
  if (!raw) {
    bad('docx paragraph ' + entry[0] + ' (' + entry[1] + ') is empty');
    return;
  }
  const cleaned = norm(raw)
    .replace(/^The research behind this \(collapsed\): /, '')
    .replace(/^Try this one thing: /, '')
    .replace(/^In the counselor kit: /, '')
    .replace(/\.\s*See all the findings: What Matters in College.*$/, '.')
    .replace(/\s*\[Term: [^\]]*\]/g, '')
    .replace(/\s*\[\d+\]/g, '');
  check('Counselors quiz: ' + entry[1] + ' matches Revision 6', quizJson.indexOf(cleaned) !== -1 || counselorsText.indexOf(cleaned) !== -1, cleaned);
});

check('Counselors quiz: five scored questions', counselors.questions.length === 5);
check('Counselors quiz: four answers per question', counselors.questions.every(function (question) { return question.options.length === 4; }));
check('Counselors quiz: four results', counselors.results.length === 4);
check('Counselors quiz: page mounts the quiz', read('counselors.html').indexOf('data-counselors-quiz') !== -1);
check('Counselors quiz: skip link', contains(pageText('counselors.html'), 'Skip the quiz and go to the recommendations'));

/* ---------------------------------------------------- 7. audience structure */

AUDIENCE.forEach(function (entry) {
  const file = entry[0];
  const label = entry[1];
  const html = read(file);
  const text = pageText(file);

  check(label + ': one h1', (html.match(/<h1[\s>]/g) || []).length === 1);
  check(label + ': quiz mount', /data-.*quiz|data-quiz-app|data-check-app|id="[a-z-]*quiz"/.test(html));
  check(label + ': skip link under the quiz', /Skip the quiz/.test(html));

  const quizAt = html.search(/data-.*quiz|data-quiz-app|data-check-app|id="[a-z-]*quiz"/);
  const findingsAt = html.search(/What graduates told us|What the research found|The numbers behind this|What graduates' lives/);
  check(label + ': quiz appears before the findings', quizAt !== -1 && (findingsAt === -1 || quizAt < findingsAt));

  check(label + ': result offers Share my result', /Share my result/.test(html) || /Share my result/.test(src('scripts/' + scriptFor(file))));
  check(label + ': result offers Copy my questions', /Copy my questions/.test(html) || /Copy my questions/.test(src('scripts/' + scriptFor(file))));
  check(label + ': result offers Email', /Email this to me/.test(html) || /Email this to me/.test(src('scripts/' + scriptFor(file))));
  check(label + ': result offers Retake', /retake/i.test(html) || /retake/i.test(src('scripts/' + scriptFor(file))));

  check(label + ': links to What Matters in College', text.indexOf('What Matters in College') !== -1);
  check(label + ': sources control', /data-notes-open/.test(html));
  check(label + ': notes panel', /id="notes-panel"/.test(html));
  check(label + ': no repeated closing block', text.indexOf('A meaningful life in a world of change') === -1);
  check(label + ': no invented PDF label', !/Download as PDF/i.test(text));
  check(label + ': no unresolved placeholder', !/\{\{[A-Z_]+\}\}/.test(html));

  if (entry[2]) {
    check(label + ': keeps one card linking its tool page', html.indexOf(entry[2]) !== -1);
  }
});

function scriptFor(file) {
  const map = {
    'choosing-a-college.html': 'choosing.js',
    'in-college.html': 'in-college.js',
    'parents.html': 'parents.js',
    'counselors.html': 'counselors.js',
    'faculty.html': 'faculty.js',
    'college-leaders.html': 'college-leaders.js',
    'policymakers.html': 'policymakers.js'
  };
  return map[file];
}

/* ------------------------------------------------- 8. shared elements, meta */

ALL_PAGES.forEach(function (file) {
  if (!fs.existsSync(path.join(OUT, file))) {
    bad('page missing: ' + file);
    return;
  }
  const html = read(file);

  check(file + ': skip-to-content link', /class="skip-link"[^>]*href="#main"/.test(html));
  check(file + ': seven perspectives in the header', (html.match(/data-nav="(choosing|in-college|parents|counselors|faculty|leaders|policymakers)"/g) || []).length === 7);
  check(file + ': four standing links in the header', (html.match(/data-nav="(understanding|what-matters|research|about)"/g) || []).length === 4);
  check(file + ': Open Graph title and description', /property="og:title"/.test(html) && /property="og:description"/.test(html));
  check(file + ': Twitter card', /name="twitter:card"/.test(html));
  check(file + ': PNG and ICO icons', /favicon-512\.png/.test(html) && /favicon\.ico/.test(html));
  check(file + ': apple-touch-icon', /apple-touch-icon/.test(html));
  check(file + ': no inline style attributes', !/<(?!svg)[^>]+style="/i.test(html));
  check(file + ': no unresolved placeholder', !/\{\{[A-Z_]+\}\}/.test(html));
});

const footer = read('index.html');
check('footer: 501(c)(3)', /501\(c\)\(3\)/.test(footer));
check('footer: EIN', /EIN 87-2050100/.test(footer));
check('footer: contact address', /Detweiler@higheredimpact\.org/.test(footer));
check('footer: mailing address', /18670 Nixon Ave/.test(footer));
check('footer: no visible placeholder', !/to be replaced|P\.O\. Box/i.test(footer));

/* ------------------------------------------------------- 9. design and type */

const tokens = src('styles/tokens.css');
check('design: navy #1b365d', /#1b365d/i.test(tokens));
check('design: gold #d4af37', /#d4af37/i.test(tokens));
check('design: darker gold for text #866a14', /#866a14/i.test(tokens));
check('design: Lora for headings', /--font-serif:\s*"Lora"/.test(tokens));
check('design: Inter for text', /--font-sans:\s*"Inter"/.test(tokens));

const fonts = src('styles/fonts.css');
check('type: Inter italic is loaded, not synthesized', /inter-400-italic/.test(fonts) && /font-style:\s*italic/.test(fonts));
check('type: Lora italic is loaded', /lora-400-italic/.test(fonts));
check('type: font-display swap', /font-display:\s*swap/.test(fonts));

const base = src('styles/base.css');
check('accessibility: focus-visible styling', /:focus-visible/.test(base));
check('accessibility: reduced-motion support', /prefers-reduced-motion/.test(base));

const css = fs.readFileSync(path.join(OUT, 'styles.css'), 'utf8');
const labelRule = (css.match(/\.section-label\s*\{[^}]*\}/) || [''])[0];
const labelSize = (labelRule.match(/font-size:\s*([0-9.]+)(rem|px|em)/) || []);
const labelPx = labelSize[2] === 'px' ? Number(labelSize[1]) : Number(labelSize[1]) * 16;
check('design: section labels at least 13px', labelPx >= 13, labelPx + 'px');
check('design: links carry visible underline affordance', /text-decoration/.test(css));

/* ------------------------------------------------------------ 10. privacy */

const scripts = fs.readdirSync(path.join(SRC, 'scripts')).filter(function (name) { return /\.js$/.test(name); });
const keys = new Set();
scripts.forEach(function (name) {
  const text = fs.readFileSync(path.join(SRC, 'scripts', name), 'utf8');
  (text.match(/wcirf_[a-z0-9_]+/g) || []).forEach(function (key) { keys.add(key); });
});
const privacyText = read('privacy.html');
Array.from(keys).sort().forEach(function (key) {
  check('privacy names storage key ' + key, privacyText.indexOf(key) !== -1);
});
check('privacy: no analytics claim that is false', !/analytics service|measurement is enabled/i.test(pageText('privacy.html')));

/* ----------------------------------------------------- 11. cross-cutting rules */

const ageRange = ALL_PAGES.filter(function (file) {
  return fs.existsSync(path.join(OUT, file)) && /55 to 65|55-65/.test(pageText(file));
});
check('the 55 to 65 age range appears only in the method pages', ageRange.every(function (file) {
  return file === 'what-matters.html' || file === 'the-research.html';
}), ageRange.join(', '));

const services = ALL_PAGES.filter(function (file) {
  return fs.existsSync(path.join(OUT, file)) && /Work with HigherEdImpact|keynote|testimony/i.test(pageText(file));
});
check('speaking, testimony and advising appear only on About', services.every(function (file) { return file === 'about.html'; }), services.join(', '));

const home = read('index.html');
check('Home: seven perspective cards', (home.match(/class="[^"]*\baudience-card\b/g) || []).length === 7);
check('Home: counselor card points at the quiz', /href="counselors\.html#quiz">Start the 2-minute quiz/.test(home));

const audienceMissing = AUDIENCE.filter(function (entry) {
  return pageText(entry[0]).indexOf('What Matters in College') === -1;
});
check('every audience page links What Matters in College', audienceMissing.length === 0, audienceMissing.map(function (entry) { return entry[0]; }).join(', '));

const unfinished = ALL_PAGES.filter(function (file) {
  return fs.existsSync(path.join(OUT, file)) && /preview of one section|full page will|coming soon/i.test(pageText(file));
});
check('no unfinished promises left on any page', unfinished.length === 0, unfinished.join(', '));

const pdfLabels = ALL_PAGES.filter(function (file) {
  return file.indexOf('tools/') !== 0 && fs.existsSync(path.join(OUT, file)) && /Download as PDF/i.test(pageText(file));
});
check('audience pages never claim a PDF they do not have', pdfLabels.length === 0, pdfLabels.join(', '));

/* ----------------------------------------------------------------- report */

console.log('\nRevision 6 docx conformance');
console.log('  paragraphs read: ' + paragraphs.length);
console.log('  pages checked:   ' + ALL_PAGES.length);
console.log('  PASS: ' + pass + '   FAIL: ' + fail);

if (fail) {
  console.log('');
  failures.slice(0, 60).forEach(function (item) { console.log('FAIL  ' + item); });
  if (failures.length > 60) console.log('... and ' + (failures.length - 60) + ' more');
  process.exit(1);
}
console.log('\nPASS: the built site matches Website_Layout_Review_Revision6.docx');
