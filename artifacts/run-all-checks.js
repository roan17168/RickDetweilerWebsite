'use strict';

// One command for every local check: build, then every audit, with a summary.
//
//   node artifacts/run-all-checks.js
//
// Exits non-zero if the build or any audit fails.

const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const CHECKS = [
  ['build', 'build.js'],
  ['qa-audit', 'artifacts/qa-audit.js'],
  ['rev6-audit', 'artifacts/rev6-audit.js'],
  ['rev6-docx-audit', 'artifacts/rev6-docx-audit.js'],
  ['feature-audit', 'artifacts/feature-audit.js'],
  ['quiz-audit', 'artifacts/quiz-audit.js'],
  ['counselors-quiz-audit', 'artifacts/counselors-quiz-audit.js'],
  ['downloads-audit', 'artifacts/downloads-audit.js'],
  ['seo-audit', 'artifacts/seo-audit.js'],
  ['data-html-audit', 'artifacts/data-html-audit.js'],
  ['counselors-audit', 'artifacts/counselors-audit.js'],
  ['leaders-audit', 'artifacts/leaders-audit.js'],
  ['policymakers-audit', 'artifacts/policymakers-audit.js'],
  ['understanding-audit', 'artifacts/understanding-audit.js'],
  ['about-audit', 'artifacts/about-audit.js']
];

const results = [];
let failed = 0;

CHECKS.forEach(function (entry) {
  const run = spawnSync(process.execPath, [entry[1]], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024
  });
  const output = (run.stdout || '') + (run.stderr || '');
  const code = typeof run.status === 'number' ? run.status : 1;
  if (code !== 0) failed += 1;
  results.push({ name: entry[0], code: code, output: output });

  const tail = output.trim().split('\n').slice(-2).join(' | ');
  console.log((code === 0 ? 'PASS  ' : 'FAIL  ') + entry[0].padEnd(24) + tail.slice(0, 120));
});

console.log('\n' + results.length + ' checks run, ' + (results.length - failed) + ' passed, ' + failed + ' failed.');

const failedNames = results.filter(function (item) { return item.code !== 0; }).map(function (item) { return item.name; });
if (failedNames.length) {
  console.log('Failing: ' + failedNames.join(', '));
  console.log('Run each with `node <path>` to see its detail; the docx suite prints every deviation.');
}

process.exit(failed ? 1 : 0);
