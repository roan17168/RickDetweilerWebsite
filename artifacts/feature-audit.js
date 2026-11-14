'use strict';

// Feature inventory for every phase. Counts come from the 12 October 2026 source.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PREVIEW = path.join(ROOT, '');
const failures = [];

function html(name) {
  return fs.readFileSync(path.join(PREVIEW, name), 'utf8');
}

function count(text, re) {
  return (text.match(re) || []).length;
}

function expect(label, actual, wanted) {
  if (actual !== wanted) failures.push(label + ': expected ' + wanted + ', found ' + actual);
  else console.log('ok  ' + label + ' = ' + actual);
}

const index = html('index.html');
expect('Home audience cards', count(index, /class="[^"]*\baudience-card\b[^"]*"/g), 7);
expect('Home outcome items', (index.match(/<ul class="home-good-life-list">([\s\S]*?)<\/ul>/) || ['', ''])[1].split('<li>').length - 1, 6);

const choosing = html('choosing-a-college.html');
const scorecardTool = html('tools/college-scorecard.html');
expect('Choosing quiz shell', count(choosing, /data-quiz-app/g), 1);
expect('Choosing quiz skip link', count(choosing, /Skip the quiz and go to the recommendations/g), 1);
expect('Choosing result sidebar', count(choosing, /data-sidebar-result/g), 1);
expect('Choosing tool card', count(choosing, /tools\/college-scorecard\.html/g), 2);
expect('Choosing sidebar sources links', count(choosing, /Sources for this page/g), 3);
expect('Choosing embedded scorecard', count(choosing, /data-scorecard-app/g), 0);
expect('Scorecard tool shell', count(scorecardTool, /data-scorecard-app/g), 1);
expect('Scorecard print wording', count(scorecardTool, /use Print to print the page/g), 1);
expect('Scorecard invented PDF label', count(scorecardTool, /Download as PDF/g), 0);

const inCollege = html('in-college.html');
expect('In College practice cards', count(inCollege, /class="[^"]*\bpractice-card(?:\s|")/g), 5);
expect('In College hard blocks', count(inCollege, /class="hard-item"/g), 6);
expect('In College end items', (inCollege.match(/<ul class="in-college-next">([\s\S]*?)<\/ul>/) || ['', ''])[1].split('<li>').length - 1, 5);

const parents = html('parents.html');
expect('Parents cost cards', count(parents, /parents-cost-card/g), 2);
expect('Parents check cards', count(parents, /parents-check-card/g), 3);
expect('Parents phone disclosures', count(parents, /data-parent-more/g), 3);

const faculty = html('faculty.html');
expect('Faculty practice cards', count(faculty, /class="faculty-card"/g), 5);
expect('Faculty audit items', count(faculty, /class="audit-item"/g), 6);
expect('Faculty variant sets', count(faculty, /class="faculty-variants"/g), 5);

const leaders = html('college-leaders.html');
expect('Leaders checklist rows', count(leaders, /data-checklist-row/g), 8);
expect('Leaders data rows', count(leaders, /class="leaders-data-table"[\s\S]*?<\/table>/g) && (leaders.match(/<table[^>]*class="leaders-data-table"[\s\S]*?<\/table>/) || [''])[0].split('<tr').length - 2, 8);
expect('Leaders quotations', count(leaders, /class="leaders-quote"/g), 2);
expect('Leaders survey lists', count(leaders, /class="leaders-survey-list"/g), 2);

const counselors = html('counselors.html');
expect('Counselor tables', count(counselors, /<table/g), 4);
expect('Counselor glossary terms', count(counselors, /<dt>/g), 19);
expect('Counselor sections', count(counselors, /class="[^"]*\bcounselors-section\b/g), 8);
expect('Counselor glossary disclosure', count(counselors, /class="counselors-glossary-more" data-mobile-close open/g), 1);

const policymakers = html('policymakers.html');
expect('Policymaker findings', count(policymakers, /class="policymakers-thing"/g), 3);
expect('Policymaker Washington blocks', count(policymakers, /policymakers-washington-item/g), 4);
expect('Policymaker brief rows', count(policymakers, /data-brief-row/g), 5);
expect('Policymaker request inputs', count(policymakers, /data-brief-request=/g), 4);

const understanding = html('understanding-college.html');
const voices = (understanding.match(/class="understanding-quotes"([\s\S]*?)<p>Scott Hartley/) || ['', ''])[1];
expect('Understanding quotations', count(voices, /<figure>/g), 7);
expect('Understanding quote disclosure', count(voices, /data-mobile-close/g), 1);
expect('Understanding misconceptions', (understanding.match(/class="understanding-misconceptions"([\s\S]*?)<\/ol>/) || ['', ''])[1].split('<li>').length - 1, 5);
expect('Understanding questions', (understanding.match(/class="understanding-questions"([\s\S]*?)<\/ol>/) || ['', ''])[1].split('<li>').length - 1, 5);
expect('Understanding timeline years', count(understanding, /class="understanding-year"/g), 5);
expect('Understanding bars', count(understanding, /class="understanding-bar-row"/g), 5);
expect('Understanding tables', count(understanding, /<table/g), 4);

const research = html('the-research.html');
expect('Research findings', count(research, /class="[^"]*\bresearch-finding(?:\s|")/g), 5);
expect('Research G1 bars', count(research, /class="g1-row"/g), 3);
expect('Research tables', count(research, /<table/g), 4);

const whatMatters = html('what-matters.html');
expect('What Matters chart figure', count(whatMatters, /class="chart-figure"/g), 1);
expect('What Matters unfinished copy', count(whatMatters, /preview of one section|full page will|coming soon/gi), 0);

// Revision 6 removes the repeated “A meaningful life in a world of change” closing block
// from every audience page, so no closing disclosure should survive.
let closingDisclosures = 0;
['index.html', 'choosing-a-college.html', 'in-college.html', 'parents.html', 'faculty.html',
  'college-leaders.html', 'policymakers.html'].forEach(function (name) {
  closingDisclosures += count(html(name), /class="closing-more" data-mobile-close open/g);
});
expect('Closing block removed', closingDisclosures, 0);

const about = html('about.html');
expect('About milestones', count(about, /<dt>/g), 7);
expect('About images', count(about, /<img/g), 2);

const quizPages = ['choosing.js', 'parents.js', 'in-college.js', 'faculty.js', 'college-leaders.js', 'policymakers.js'];
quizPages.forEach(function (file) {
  const js = fs.readFileSync(path.join(ROOT, 'src', 'scripts', file), 'utf8');
  if (js.indexOf('Pick the answer that is true for you, even if it is not the one you think you should pick.') === -1) {
    failures.push(file + ': missing the shared quiz instruction');
  } else {
    console.log('ok  ' + file + ' quiz instruction');
  }
});

[['in-college.html', 'in-college-next'],
  ['parents.html', 'parents-next'], ['faculty.html', 'faculty-next'],
  ['college-leaders.html', 'leaders-next'], ['policymakers.html', 'policymakers-next']]
  .forEach(function (entry) {
    const source = html(entry[0]);
    const match = source.match(new RegExp('<ul class="' + entry[1] + '">([\\s\\S]*?)</ul>'));
    if (!match) {
      failures.push(entry[0] + ': missing end list');
      return;
    }
    const items = (match[1].match(/<li>/g) || []).length;
    if (items < 3 || items > 5) failures.push(entry[0] + ': end list has ' + items + ' steps');
    if (match[1].indexOf('understanding-college.html') === -1) failures.push(entry[0] + ': end list does not link Understanding College');
    if (items >= 3 && items <= 5 && match[1].indexOf('understanding-college.html') !== -1) {
      console.log('ok  ' + entry[0] + ' end point (' + items + ' steps, Understanding link)');
    }
  });
quizPages.forEach(function (file) {
  const js = fs.readFileSync(path.join(ROOT, 'src', 'scripts', file), 'utf8');
  const needles = file === 'choosing.js'
    ? ['How to read these numbers', 'This study compared graduates', 'Copy my questions', 'Email this to me', 'data-result-copy', 'data-result-email']
    : ['This study looked at graduates', 'results held for graduates of all types of colleges', 'Copy my questions', 'Email this to me', 'data-result-copy', 'data-result-email'];
  needles.forEach(function (needle) {
    if (js.indexOf(needle) === -1) failures.push(file + ': missing "' + needle + '"');
  });
  if (failures.some(function (f) { return f.indexOf(file) === 0; })) return;
  console.log('ok  ' + file + ' shared result controls and honesty line');
});

if (failures.length) {
  console.error('\nFAIL: feature audit');
  failures.forEach(function (f) { console.error(' - ' + f); });
  process.exit(1);
}
console.log('\nPASS: every phase feature inventory');
