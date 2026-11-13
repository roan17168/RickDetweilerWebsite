'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'preview/counselors.html'), 'utf8');

function decode(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;|&#39;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;|&ndash;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '*')
    .replace(/&copy;/g, '(c)');
}

function normalize(text) {
  return decode(String(text))
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()
    .toLowerCase();
}

const text = normalize(page.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '));

const expected = [
  'Richard A. Detweiler\'s The Evidence Liberal Arts Needs (MIT Press, 2021) reports interviews with 1,000 college graduates, ages 25 to 65, from every kind of college: public and private, large and small, selective and not.',
  'It linked what they experienced in college to six adult outcomes: leadership, civic involvement, continued learning, cultural involvement, fulfillment, and personal success (position and income).',
  'These results are supported by extensive research by others, as documented in the book and on the website\'s What Matters in College page.',
  'What it means for your students: The study compared experiences, not kinds of colleges.',
  'Professors who know students and campus involvement together, an authentic learning community, were linked to all six outcomes.',
  'At small colleges they are often built in; at large universities students may need to seek them out through honors programs, office hours and campus involvement; at community colleges, through small sections and transfer-ready general education.',
  'Lower-income students had the most to gain. Among graduates from lower-income families, over a long career, taking more than half their courses outside their major was associated with being 72% more likely to be successful and 75% more likely to report a higher income.',
  'The posted price is rarely the price. At private nonprofit colleges, 9 in 10 first-year students get grants from the college itself.',
  'On prestige, the research is mixed. For most graduates, less than people think: the earnings advantage of a more selective college was small once students\' own abilities were taken into account (Dale and Krueger).',
  'while Ivy-Plus graduates are overrepresented among Fortune 500 chief executives, 88.4% of these CEOs had not attended an Ivy-Plus college, and attending one had little effect on average earnings (Chetty, Deming and Friedman).',
  'Online tools for students and families: Choosing a College quiz * Parents quiz * College Scorecard * For Counselors page.',
  'Ask in person, in an online session, by email, or find the answer yourself.',
  'A website claim alone counts as "Don\'t know yet." Ask a student, read a syllabus, check the numbers.',
  'Virtual tours and online information sessions: most colleges offer both. Ask the six questions in the chat.',
  'Ask for a current student: many admissions offices will connect you with one by email or video.',
  'What is something students here decided that actually changed?',
  'When did a professor last talk with you outside class?',
  'Watch a class online: some colleges allow it. Count the minutes students speak.',
  'Read what students write: the student newspaper, club pages and student government minutes.',
  'Fly-in programs: some colleges pay travel costs for lower-income students to visit.',
  'Most families pay less than the posted price. Use each college\'s net price calculator to see your price after grants. A grant is money you don\'t pay back.',
  'Meet the school counselor with your child. Try three net price calculators, including one private college you assumed was too expensive.',
  'Make a balanced list: likely and affordable, matches, a few reaches. Ask about fee waivers.',
  'File the FAFSA at studentaid.gov as soon as it opens. Check whether any college also asks for the CSS Profile.',
  'Compare aid offers on net price (cost minus grants), not loans. Ask the aid office for a review if an offer falls short.',
  'How do students and professors spend time together outside class?',
  'How many professors will know my child by name by the end of the first year?',
  'How much of the degree can be taken outside the major?',
  'Where are graduates ten years out?',
  'What share of students from families like ours graduate?',
  'What kind of person do you want to be at 30?',
  'What would you study if jobs were not an immediate concern?',
  'Loans: keep total borrowing below expected first-year earnings; use federal loans before private ones.',
  'The final choice: don\'t decide on cost, reputation or job preparation alone. Go back to your child\'s life goals, and ask which college is most likely to give them the experiences that have a lifelong impact.',
  'You\'re not behind. Many students figure this out without anyone at home who has done it.',
  'Talk to your school counselor this year. Say: "I want to go to college, and I\'m the first in my family. What should I be doing now?"',
  'If you can\'t get time with a counselor, ask a teacher, coach or librarian; look for a free program such as TRIO Upward Bound or Talent Search or College Advising Corps; or email the admissions counselor each college assigns to your area.',
  'Try three net price calculators. Include at least one private college you assumed was too expensive.',
  'Ask about fee waivers. If money is tight, you can usually apply to colleges and take the SAT or ACT for free.',
  'The FAFSA (Free Application for Federal Student Aid) is the free form for federal grants, work-study and loans; most states and colleges use it too.',
  'Keep every path open. Starting at a community college and transferring is a real path. So is a four-year college close to home.',
  '"Since a child, I wanted to become a doctor, but many were not supportive." Her liberal arts education, she writes, "paved the way for me to sustain and ultimately become a physician."',
  'Theressa, physician, in The Evidence Liberal Arts Needs, p. 112',
  'For a junior seminar, an advisory period or a college night.',
  'Ask: "What do you want to be true of your life at 30?" Take a few answers.',
  'Quiz: students take the Choosing a College quiz on their phones (two minutes, no sign-up) and read their result.',
  'Pairs: compare results. Each student picks one question from their result to ask a college.',
  'Whole group: the real price. Show one net price calculator live, at a private college students assume is out of reach.',
  'Exit question: each student writes one college they\'ll ask, and the question they\'ll ask.',
  'Families\' night version: parents take the Parents quiz while students take theirs, then compare results together.',
  'Sources: Detweiler, The Evidence Liberal Arts Needs (MIT Press, 2021), chapters 6-8 and appendix 5; Dale and Krueger, Journal of Human Resources 49 (2014); Chetty, Deming and Friedman, NBER Working Paper 31492 (2023).',
  'Published by HigherEdImpact, a 501(c)(3) nonprofit (EIN 87-2050100) * Detweiler@higheredimpact.org'
];

// The seven handout questions and five link-table rows.
[
  'How many professors will know me by name by the end of my first year?',
  'How much of my degree can I take outside my major and still finish in four years?',
  'In a typical first-year class, who does the talking?',
  'What share of students do research, an internship or a long project, and is there money for those who can\'t work unpaid?',
  'What share of students like me graduate, and what will it cost me each year after grants?',
  'Do students and professors spend time together outside class?',
  'What would I be part of every week?',
  'Student quiz, the real price, first-in-family steps',
  'Parent quiz, timeline, parent checklist',
  'Compare finalists on what students experience',
  'For students already enrolled',
  'This kit and updates'
].forEach(function (item) { expected.push(item); });

// Glossary: term + definition.
[
  ['Major:', 'the subject you study most.'],
  ['Elective:', 'a course you choose, not one your major requires.'],
  ['General education:', 'courses every student takes across different fields.'],
  ['Seminar:', 'a small class built on discussion.'],
  ['Liberal arts:', 'not a list of majors; a way of being educated, with broad study across the arts and sciences, discussion, writing and close contact with professors.'],
  ['Adviser:', 'the person who helps you choose courses and plan.'],
  ['Mentor:', 'an adult who takes a lasting interest in you and your goals.'],
  ['Authentic learning community:', 'a college where professors and students know one another and spend time together outside class as well as in it.'],
  ['Office hours:', 'set times when a professor is available to any student.'],
  ['Internship:', 'a short job in a field you\'re considering.'],
  ['Net price:', 'the published price minus grants and scholarships.'],
  ['Grant:', 'money you don\'t pay back.'],
  ['Loan:', 'money you do.'],
  ['FAFSA:', 'the Free Application for Federal Student Aid, the free form for federal grants, work-study and loans'],
  ['Work-study:', 'a part-time campus job paid partly by federal aid.'],
  ['Fee waiver:', 'lets you skip an application or test fee you can\'t afford.'],
  ['Graduation rate:', 'the share of students who finish, usually within six years.'],
  ['Transfer agreement:', 'says which community-college courses a four-year college will accept.'],
  ['Common Data Set:', 'a standard report most colleges post online, with class sizes, costs and graduation rates.']
].forEach(function (pair) { expected.push(pair[0] + ' ' + pair[1]); });

const missing = [];
expected.forEach(function (item) {
  if (text.indexOf(normalize(item)) === -1) missing.push(item);
});

const ids = [];
(page.match(/\sid="([^"]+)"/g) || []).forEach(function (item) {
  ids.push(item.replace(/^\sid="|"$/g, ''));
});
const duplicateIds = Array.from(new Set(ids.filter(function (id, index) { return ids.indexOf(id) !== index; })));
const h1Count = (page.match(/<h1[\s>]/g) || []).length;
const inlineStyles = (page.match(/\sstyle="/g) || []).length;
const placeholders = (page.match(/\{\{[A-Z0-9_]+\}\}/g) || []).length;
const sectionCount = (page.match(/class="choosing-section counselors-section/g) || []).length;
const printButtons = (page.match(/data-counselors-print/g) || []).length;
const handoutRows = (page.match(/<th scope="row">(?:How many professors will know me|How much of my degree|In a typical first-year|What share of students do research|What share of students like me|Do students and professors|What would I be part)/g) || []).length;
const glossaryTerms = (page.match(/<dt>/g) || []).length;

const links = [];
(page.match(/(?:href|src)="([^"]+)"/g) || []).forEach(function (item) {
  links.push(item.replace(/^(?:href|src)="|"$/g, ''));
});
const brokenLinks = [];
links.forEach(function (link) {
  if (/^(#|https?:|mailto:|data:|tel:)/.test(link)) return;
  const clean = link.split('#')[0].split('?')[0];
  if (!clean) return;
  if (!fs.existsSync(path.resolve(path.join(ROOT, 'preview'), clean))) brokenLinks.push(link);
});

const header = fs.readFileSync(path.join(ROOT, 'src/partials/header.html'), 'utf8');
const footer = fs.readFileSync(path.join(ROOT, 'src/partials/footer.html'), 'utf8');
const navOk = header.indexOf('<a href="counselors.html" data-nav="counselors">I\'m a counselor</a>') !== -1;
const navDisabled = header.indexOf('data-nav="counselors" data-unbuilt') !== -1 || header.indexOf('nav-soon') !== -1;
// The shared footer carries the informational links and contact line; the seven perspectives
// live in the header menu, so there is no per-audience footer link to require.
const footerOk = footer.indexOf('Understanding College') !== -1 && footer.indexOf('Detweiler@higheredimpact.org') !== -1;

const report = {
  copy: { checked: expected.length, missing: missing },
  structure: {
    h1Count: h1Count,
    ids: ids.length,
    duplicateIds: duplicateIds,
    inlineStyles: inlineStyles,
    placeholders: placeholders,
    sections: sectionCount,
    printButtons: printButtons,
    handoutRows: handoutRows,
    glossaryTerms: glossaryTerms,
    brokenLinks: brokenLinks
  },
  navigation: { counselorLink: navOk, disabledItemRemains: navDisabled, footerLink: footerOk },
  metadata: {
    title: (page.match(/<title>([^<]+)<\/title>/) || [])[1] || null,
    description: (page.match(/<meta name="description" content="([^"]+)"/) || [])[1] || null
  }
};

console.log(JSON.stringify(report, null, 2));
if (missing.length || h1Count !== 1 || duplicateIds.length || inlineStyles || placeholders || sectionCount !== 9 || printButtons !== 2 || handoutRows !== 7 || glossaryTerms !== 19 || brokenLinks.length || !navOk || navDisabled || !footerOk) {
  process.exitCode = 1;
}
