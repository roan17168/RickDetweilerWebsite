'use strict';

// Content-HTML allowlist audit for the JSON data files.
// Quiz, result and support copy is inserted into the page as HTML, so every such
// string is checked here instead of trusting the data blindly.
// Run after `node build.js` (the audit reads src/data, not the generated pages).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');

const ALLOWED_TAGS = new Set(['a', 'em', 'strong', 'sup', 'sub', 'br']);
const ALLOWED_ATTRS = new Set(['href', 'class', 'data-note', 'title']);
const ALLOWED_HREF = /^(?:[a-z0-9-]+(?:\.html)?(?:#[A-Za-z0-9_-]+)?|#[A-Za-z0-9_-]+)$/;

const failures = [];

function fail(file, where, message) {
  failures.push(file + ' > ' + where + ': ' + message);
}

function checkMarkup(file, where, value) {
  if (typeof value !== 'string' || value.indexOf('<') === -1) return;

  if (/<\s*(script|style|iframe|object|embed|svg|img|form|input|button)\b/i.test(value)) {
    fail(file, where, 'disallowed element');
  }

  const tagRe = /<\s*(\/?)\s*([a-zA-Z0-9]+)([^>]*)>/g;
  let match;
  while ((match = tagRe.exec(value))) {
    const closing = match[1] === '/';
    const tag = match[2].toLowerCase();
    const attrs = match[3];
    if (!ALLOWED_TAGS.has(tag)) fail(file, where, 'tag <' + tag + '> is not allowlisted');
    if (closing) {
      if (attrs.trim()) fail(file, where, 'closing </' + tag + '> carries attributes');
      continue;
    }
    if (/\/\s*$/.test(attrs)) fail(file, where, 'self-closing <' + tag + '> is not expected');
    const attrRe = /([a-zA-Z-:]+)\s*=\s*"([^"]*)"/g;
    let attr;
    while ((attr = attrRe.exec(attrs))) {
      const name = attr[1].toLowerCase();
      const val = attr[2];
      if (!ALLOWED_ATTRS.has(name)) fail(file, where, 'attribute ' + name + ' is not allowlisted');
      if (name === 'href' && !ALLOWED_HREF.test(val)) fail(file, where, 'href is not an approved internal link: ' + val);
      if (name === 'class' && !/^[a-z0-9 _-]+$/.test(val)) fail(file, where, 'unexpected class value: ' + val);
      if (name === 'data-note' && !/^note-[0-9]+$/.test(val)) fail(file, where, 'data-note must be note-N: ' + val);
      if (name === 'title' && (!val.trim() || /[<>]/.test(val))) fail(file, where, 'unexpected title value');
    }
    const stripped = attrs.replace(/([a-zA-Z-:]+)\s*=\s*"[^"]*"/g, '').trim();
    if (stripped) fail(file, where, 'unparsed attribute text: ' + stripped.slice(0, 60));
  }

  // Bare ampersands and stray angle brackets are markup bugs in the source copy.
  if (/&(?!(?:amp|lt|gt|quot|apos|nbsp|rsquo|lsquo|ldquo|rdquo|mdash|ndash|hellip|middot|copy|reg|trade|#\d+|#x[0-9a-fA-F]+);)/.test(value)) {
    fail(file, where, 'raw ampersand in content HTML');
  }
}

function walk(file, value, trail) {
  if (typeof value === 'string') {
    checkMarkup(file, trail, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach(function (item, index) { walk(file, item, trail + '[' + index + ']'); });
    return;
  }
  if (value && typeof value === 'object') {
    Object.keys(value).forEach(function (key) { walk(file, value[key], trail ? trail + '.' + key : key); });
  }
}

fs.readdirSync(DATA).filter(function (name) { return name.endsWith('.json'); }).sort().forEach(function (name) {
  const data = JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));
  walk(name, data, '');
});

if (failures.length) {
  console.error('FAIL (' + failures.length + ')');
  failures.forEach(function (f) { console.error('  - ' + f); });
  process.exit(1);
}
console.log('PASS: every data-file HTML string uses only allowlisted markup');
