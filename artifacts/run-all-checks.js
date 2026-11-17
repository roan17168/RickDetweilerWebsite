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
  ['about-audit', 'artifacts/about-audit.js'],
  // Browser check for the refinement layer. It needs a Chromium binary; when
  // none is available it reports SKIP and exits 77, which is counted as a
  // skip rather than a failure so the suite still runs on a bare machine.
  ['visual-audit', 'artifacts/visual-audit.js', { optional: true }]
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
  const skipped = code === 77 && entry[2] && entry[2].optional;
  if (code !== 0 && !skipped) failed += 1;
  results.push({ name: entry[0], code: code, output: output, skipped: skipped });

  const tail = output.trim().split('\n').slice(-2).join(' | ');
  const label = skipped ? 'SKIP  ' : (code === 0 ? 'PASS  ' : 'FAIL  ');
  console.log(label + entry[0].padEnd(24) + tail.slice(0, 120));
});

const skippedCount = results.filter(function (item) { return item.skipped; }).length;
console.log('\n' + results.length + ' checks run, ' + (results.length - failed - skippedCount) +
  ' passed, ' + failed + ' failed' + (skippedCount ? ', ' + skippedCount + ' skipped' : '') + '.');

const failedNames = results.filter(function (item) { return item.code !== 0 && !item.skipped; }).map(function (item) { return item.name; });
if (failedNames.length) {
  console.log('Failing: ' + failedNames.join(', '));
  console.log('Run each with `node <path>` to see its detail; the docx suite prints every deviation.');
}

process.exit(failed ? 1 : 0);
