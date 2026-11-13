'use strict';

// Exhaustive scoring audit: every answer combination for all six quizzes.
const path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = global;

function load(name) {
  const file = path.join(ROOT, 'preview', 'scripts', name);
  delete require.cache[require.resolve(file)];
  return require(file);
}

['choosing', 'parents', 'in-college', 'faculty', 'college-leaders', 'policymakers'].forEach(function (name) {
  require(path.join(ROOT, 'preview', 'scripts', name + '-data.js'));
});
const data = {
  choosing: global.WCIRF_CHOOSING,
  parents: global.WCIRF_PARENTS,
  inCollege: global.WCIRF_IN_COLLEGE,
  faculty: global.WCIRF_FACULTY,
  leaders: global.WCIRF_LEADERS,
  policymakers: global.WCIRF_POLICYMAKERS
};

const engines = {
  choosing: load('choosing.js'),
  parents: load('parents.js'),
  inCollege: load('in-college.js'),
  faculty: load('faculty.js'),
  leaders: load('college-leaders.js'),
  policymakers: load('policymakers.js')
};

const failures = [];
function check(ok, message) { if (!ok) failures.push(message); }
function combos(lists, visit) {
  const pick = new Array(lists.length);
  (function walk(index) {
    if (index === lists.length) { visit(pick.slice()); return; }
    lists[index].forEach(function (value) {
      pick[index] = value;
      walk(index + 1);
    });
  })(0);
}

// Choosing: 6 outcomes, 6 options per question; any tie goes to a tie-break question.
const choosing = data.choosing;
check(choosing && choosing.quiz && choosing.quiz.questions.length === 5, 'Choosing: question count');
check(Object.keys(choosing.quiz.results).length === 6, 'Choosing: result count');
check(choosing.quiz.tieBreaker && choosing.quiz.tieBreaker.options.length === 6, 'Choosing: tie-break');
let choosingPaths = 0;
combos(choosing.quiz.questions.map(function (q) { return q.options.map(function (o) { return o.outcome; }); }), function (answers) {
  choosingPaths += 1;
  const scored = engines.choosing.scoreQuiz(answers, choosing);
  if (scored.needsTieBreak) {
    check(scored.result.length === 0, 'Choosing: unresolved tie should not show a result: ' + answers.join(','));
    scored.top.forEach(function (outcome) {
      const tied = engines.choosing.scoreQuiz(answers, choosing, outcome);
      check(!tied.needsTieBreak && tied.result.length === 1 && tied.result[0] === outcome,
        'Choosing: tie-break failed for ' + outcome);
    });
  } else {
    check(scored.result.length >= 1, 'Choosing: path without a result: ' + answers.join(','));
    scored.result.forEach(function (key) { check(!!choosing.quiz.results[key], 'Choosing: unknown result ' + key); });
  }
});
check(engines.choosing.scoreQuiz([], choosing).result.length === 0, 'Choosing: empty answers produced a default result');
console.log('ok  Choosing: ' + choosingPaths + ' answer paths, tie-break and no-default');

const fs = require('fs');
const parentsSource = fs.readFileSync(path.join(ROOT, 'src', 'scripts', 'parents.js'), 'utf8');
check(/if \(index === 3\) return null;/.test(parentsSource), 'Parents: question 4 is not excluded from scoring');

// Three-outcome quizzes.
[
  ['Parents', 'parents', function (answers) { return engines.parents.scoreQuiz(answers.map(function (o, index) { return index === 3 ? null : (o ? o.outcome : null); })); }, function (s) { return s.complete && s.result.length >= 1; }],
  ['Faculty', 'faculty', function (answers) { return engines.faculty.scoreQuiz(answers.map(function (o) { return o.value; }), data.faculty); }, function (s) { return s.complete && !!s.result; }],
  ['College Leaders', 'leaders', function (answers) { return engines.leaders.scoreQuiz(answers.map(function (o) { return o.value; }), data.leaders); }, function (s) { return s.complete && s.results.length >= 1; }],
  ['Policymakers', 'policymakers', function (answers) { return engines.policymakers.scoreQuiz(answers.map(function (o) { return o.value; }), data.policymakers); }, function (s) { return s.complete && s.results.length >= 1; }]
].forEach(function (entry) {
  const label = entry[0];
  const key = entry[1];
  const score = entry[2];
  const valid = entry[3];
  const quiz = data[key].quiz;
  let paths = 0;
  combos(quiz.questions.map(function (q) { return q.options; }), function (answers) {
    paths += 1;
    check(valid(score(answers)), label + ': path without a result: ' + answers.map(function (o) { return o.text; }).join(' / '));
  });
  const empty = key === 'parents' ? score([null, null, null, null, null]) : score([]);
  check(!valid(empty), label + ': empty answers produced a default result');
  console.log('ok  ' + label + ': ' + paths + ' answer paths and no-default');
});

// In College: score bands 0-10.
let collegePaths = 0;
combos(data.inCollege.quiz.questions.map(function (q) { return q.options; }), function (answers) {
  collegePaths += 1;
  const scored = engines.inCollege.scoreQuiz(answers.map(function (o) { return o.score; }), data.inCollege);
  check(scored.complete && scored.result, 'In College: path without a band: ' + answers.map(function (o) { return o.text; }).join(' / '));
});
check(!engines.inCollege.scoreQuiz([], data.inCollege).complete, 'In College: empty answers produced a default result');
console.log('ok  In College: ' + collegePaths + ' answer paths and no-default');

// Required result fields.
[
  ['Choosing', choosing.quiz.results, ['profile', 'lead', 'finding', 'numbers', 'ask', 'find', 'cant', 'try', 'list', 'support', 'closing']],
  ['Parents', data.parents.quiz.results, ['heading', 'lead', 'research', 'ask', 'child', 'other', 'try']],
  ['In College', data.inCollege.quiz.results, ['heading', 'lead', 'questions', 'action']],
  ['Faculty', data.faculty.quiz.results, ['heading', 'lead', 'questions', 'term']],
  ['College Leaders', data.leaders.quiz.results, ['heading', 'lead', 'research', 'questions', 'action']],
  ['Policymakers', data.policymakers.quiz.results, ['heading', 'lead', 'research', 'questions', 'action']]
].forEach(function (entry) {
  const label = entry[0];
  const results = Array.isArray(entry[1]) ? entry[1] : Object.keys(entry[1]).map(function (k) { return entry[1][k]; });
  results.forEach(function (result) {
    entry[2].forEach(function (field) {
      const value = result[field];
      check(value !== undefined && value !== null && (!Array.isArray(value) || value.length > 0), label + ': result "' + (result.profile || result.heading) + '" missing ' + field);
    });
  });
});

if (failures.length) {
  console.error('\nFAIL: quiz audit');
  failures.slice(0, 20).forEach(function (f) { console.error(' - ' + f); });
  process.exit(1);
}
console.log('\nPASS: every answer path in all six quizzes');
