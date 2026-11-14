'use strict';

// Download audit for Revision 6: six PDFs under downloads/, each a real PDF,
// each linked from the page Revision 6 names, with no tracking parameters.
//
// Run after `node build.js`.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '');

const expected = [
  { file: 'parent-checklist.pdf', pages: ['parents.html', 'counselors.html'] },
  { file: 'faculty-workshop-kit.pdf', pages: ['faculty.html'] },
  { file: 'deans-briefing.pdf', pages: ['college-leaders.html'] },
  { file: 'state-brief.pdf', pages: ['policymakers.html'] },
  { file: 'federal-staff-memo.pdf', pages: ['policymakers.html'] },
  { file: 'counselor-kit.pdf', pages: ['counselors.html'] }
];

let pass = 0;
const failures = [];

function ok(message) { pass++; console.log('PASS  ' + message); }
function bad(message) { failures.push(message); console.log('FAIL  ' + message); }

expected.forEach(function (item) {
  const file = path.join(OUT, 'downloads', item.file);
  if (!fs.existsSync(file)) {
    bad(item.file + ' does not exist in downloads/');
    return;
  }
  if (fs.readFileSync(file).slice(0, 5).toString('latin1') !== '%PDF-') {
    bad(item.file + ' does not start with a PDF header');
  } else {
    ok(item.file + ' is a valid PDF');
  }

  item.pages.forEach(function (page) {
    const html = fs.readFileSync(path.join(OUT, page), 'utf8');
    if (html.indexOf('downloads/' + item.file) === -1) {
      bad(item.file + ' is not linked from ' + page);
    } else {
      ok(item.file + ' is linked from ' + page);
    }
  });
});

const pages = fs.readdirSync(OUT).filter(function (name) { return /\.html$/.test(name); });
let trackingLinks = 0;
pages.forEach(function (name) {
  const html = fs.readFileSync(path.join(OUT, name), 'utf8');
  const links = html.match(/href="[^"]*downloads\/[^"]*"/g) || [];
  links.forEach(function (link) {
    if (/utm_|fbclid|gclid/i.test(link)) trackingLinks++;
  });
});
if (!trackingLinks) ok('no tracking parameters on download links');
else bad(trackingLinks + ' download link(s) carry tracking parameters');

if (failures.length) {
  console.error('\nFAIL: downloads audit (' + failures.length + ')');
  process.exit(1);
}
console.log('\nPASS: ' + pass + ' download checks');
