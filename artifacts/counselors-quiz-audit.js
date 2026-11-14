'use strict';

// Counselors quiz audit (Revision 6): every answer path either produces a written
// result or a single tie-breaker, every tie-breaker resolves, and the page mounts
// the quiz the engine expects.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/counselors.json'), 'utf8'));
const api = require(path.join(ROOT, 'src/scripts/counselors.js'));
const page = fs.readFileSync(path.join(ROOT, 'counselors.html'), 'utf8');

const quiz = data.quiz;
const values = quiz.results.map(function (item) { return item.key; });
const problems = [];
let combinations = 0;
let singles = 0;
let ties = 0;

function product(options, length) {
  let rows = [[]];
  for (let i = 0; i < length; i += 1) {
    const next = [];
    rows.forEach(function (row) {
      options.forEach(function (option) { next.push(row.concat(option)); });
    });
    rows = next;
  }
  return rows;
}

product(values, quiz.questions.length).forEach(function (answers) {
  combinations += 1;
  const scored = api.scoreQuiz(answers, data);
  if (scored.complete) {
    singles += 1;
    if (!scored.results.length || scored.results.length !== 1) {
      problems.push('single result missing for ' + answers.join(','));
    }
    return;
  }
  if (!scored.tied || scored.results.length < 2) {
    problems.push('no result and no tie for ' + answers.join(','));
    return;
  }
  ties += 1;
  values.forEach(function (tieValue) {
    const resolved = api.resolveTie(scored, tieValue, data);
    if (!resolved || values.indexOf(resolved.key) === -1) {
      problems.push('tie-break did not resolve for ' + answers.join(',') + ' / ' + tieValue);
    }
  });
});

if (api.scoreQuiz([], data).complete || api.scoreQuiz([null, null, null, null, null], data).complete) {
  problems.push('an empty or incomplete answer set produced a result');
}

if (Object.keys(quiz.results.reduce(function (map, item) { map[item.key] = true; return map; }, {})).length !== 4) {
  problems.push('expected four results');
}
if (quiz.questions.length !== 5) problems.push('expected five scored questions');
if (!quiz.tieBreak || quiz.tieBreak.options.length !== 4) problems.push('expected a four-option tie-breaker');
if (!quiz.optional || quiz.optional.options.length !== 4) problems.push('expected the four-option optional question');
if (quiz.advice.length !== 4) problems.push('expected four situation-advice blocks');

quiz.results.forEach(function (result) {
  ['heading', 'lead', 'research', 'questions', 'tryThis', 'kit'].forEach(function (field) {
    if (!result[field] || (Array.isArray(result[field]) && !result[field].length)) {
      problems.push(result.key + ' is missing ' + field);
    }
  });
});

if (page.indexOf('data-counselors-quiz') === -1) problems.push('counselors.html has no quiz mount');
if (page.indexOf('Skip the quiz and go to the recommendations') === -1) problems.push('counselors.html has no quiz skip link');
if (!fs.existsSync(path.join(ROOT, 'scripts/counselors-data.js'))) problems.push('counselors-data.js was not emitted');
if (!fs.existsSync(path.join(ROOT, 'scripts/counselors.js'))) problems.push('counselors.js was not emitted');

console.log('Counselors quiz\n');
console.log('answer combinations: ' + combinations);
console.log('single results:      ' + singles);
console.log('tie-breakers:        ' + ties);

if (problems.length) {
  console.error('\nFAIL: counselors quiz (' + problems.length + ')');
  problems.slice(0, 20).forEach(function (problem) { console.error(' - ' + problem); });
  process.exit(1);
}

console.log('\nPASS: every answer path produces a result, and every tie resolves.');
