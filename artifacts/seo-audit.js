'use strict';

// Search optimization audit: titles, descriptions, canonicals, sharing cards,
// structured data, sitemap and robots. Run after `node build.js`.
//
// Canonical URLs, structured data and sitemap.xml are only produced when a
// production origin is configured (SITE_URL=... node build.js or "url" in
// src/data/site.json). Without one, those checks report NOTE, not PASS.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'preview');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'site.json'), 'utf8'));
let siteUrl = String(process.env.SITE_URL || site.url || '').replace(/\/+$/, '');
if (!siteUrl) {
  // Fall back to the origin the build actually used, read from the sitemap or a canonical tag.
  const sitemapFile = path.join(OUT, 'sitemap.xml');
  const homeFile = path.join(OUT, 'index.html');
  if (fs.existsSync(sitemapFile)) {
    const match = fs.readFileSync(sitemapFile, 'utf8').match(/<loc>(https?:\/\/[^/<]+)/);
    if (match) siteUrl = match[1];
  }
  if (!siteUrl && fs.existsSync(homeFile)) {
    const match = fs.readFileSync(homeFile, 'utf8').match(/<link rel="canonical" href="(https?:\/\/[^/<]+)/);
    if (match) siteUrl = match[1];
  }
}

let pass = 0;
let fail = 0;
let note = 0;
function ok(message) { pass++; console.log('PASS  ' + message); }
function bad(message) { fail++; console.log('FAIL  ' + message); }
function warn(message) { note++; console.log('NOTE  ' + message); }

function walk(dir, list) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === 'scripts') return;
      walk(full, list);
    } else if (entry.name.endsWith('.html')) {
      list.push(full);
    }
  });
  return list;
}

const files = walk(OUT, []).sort();
const pages = files.map(function (file) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(OUT, file).split(path.sep).join('/');
  function attr(pattern) {
    const m = html.match(pattern);
    return m ? m[1] : null;
  }
  const title = attr(/<title>([\s\S]*?)<\/title>/);
  const description = attr(/<meta name="description" content="([^"]*)">/);
  const robots = attr(/<meta name="robots" content="([^"]*)">/);
  const canonical = attr(/<link rel="canonical" href="([^"]*)">/);
  return {
    file: file,
    rel: rel,
    html: html,
    title: title ? title.replace(/&amp;/g, '&') : '',
    description: description || '',
    robots: robots || '',
    canonical: canonical || '',
    noindex: /noindex/.test(robots || '')
  };
});

console.log('SEO audit: ' + pages.length + ' pages\n');

const seenTitles = {};
const seenDescriptions = {};

pages.forEach(function (page) {
  const label = page.rel;

  // Title
  if (!page.title) bad(label + ': missing <title>');
  else if (page.title.length > 65) warn(label + ': title is ' + page.title.length + ' characters (may be truncated: “' + page.title + '”)');
  else ok(label + ': title ' + page.title.length + ' characters');
  if (page.title) {
    if (seenTitles[page.title]) bad(label + ': duplicate title, also used by ' + seenTitles[page.title]);
    else seenTitles[page.title] = label;
  }

  // Description
  if (!page.description) bad(label + ': missing meta description');
  else {
    if (seenDescriptions[page.description]) bad(label + ': duplicate meta description, also used by ' + seenDescriptions[page.description]);
    else seenDescriptions[page.description] = label;
    if (page.description.length > 170) warn(label + ': description is ' + page.description.length + ' characters (search engines cut around 160)');
    else if (page.description.length < 70) warn(label + ': description is only ' + page.description.length + ' characters');
  }

  // Robots and indexability
  if (page.noindex) {
    ok(label + ': noindex (not for search)');
  } else if (!page.robots) {
    bad(label + ': no robots meta');
  } else if (!page.robots.includes('max-image-preview:large')) {
    warn(label + ': robots meta omits max-image-preview:large');
  }

  // Canonical / url / image
  if (siteUrl) {
    const expected = siteUrl + '/' + (page.rel === 'index.html' ? '' : page.rel);
    if (page.canonical !== expected) bad(label + ': canonical is “' + page.canonical + '”, expected “' + expected + '”');
    else ok(label + ': canonical matches the page address');
    const ogUrl = (page.html.match(/<meta property="og:url" content="([^"]*)">/) || [])[1] || '';
    if (ogUrl !== expected) bad(label + ': og:url is “' + ogUrl + '”, expected “' + expected + '”');
    const ogImage = (page.html.match(/<meta property="og:image" content="([^"]*)">/) || [])[1] || '';
    if (!/^https:\/\//.test(ogImage)) bad(label + ': og:image missing or not absolute');
    else {
      const imagePath = ogImage.slice(siteUrl.length).replace(/^\//, '');
      if (!fs.existsSync(path.join(OUT, imagePath))) bad(label + ': og:image file not found: ' + imagePath);
    }
  } else if (!page.noindex) {
    warn(label + ': canonical, og:url and og:image wait on a production domain');
  }

  // Sharing card completeness
  const needs = [
    ['og:title', /<meta property="og:title" content="[^"]+">/],
    ['og:description', /<meta property="og:description" content="[^"]+">/],
    ['og:type', /<meta property="og:type" content="[^"]+">/],
    ['og:site_name', /<meta property="og:site_name" content="[^"]+">/],
    ['twitter:card', /<meta name="twitter:card" content="[^"]+">/],
    ['twitter:title', /<meta name="twitter:title" content="[^"]+">/],
    ['twitter:description', /<meta name="twitter:description" content="[^"]+">/]
  ];
  const missing = needs.filter(function (pair) { return !pair[1].test(page.html); }).map(function (pair) { return pair[0]; });
  if (missing.length) bad(label + ': sharing card missing ' + missing.join(', '));
  else ok(label + ': sharing card complete');

  // Language, viewport
  if (!/<html lang="en">/.test(page.html)) bad(label + ': missing lang="en"');

  // One h1
  const h1s = (page.html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) bad(label + ': ' + h1s + ' h1 elements (expected 1)');
  else ok(label + ': exactly one h1');

  // Images have alt
  const images = page.html.match(/<img\b[^>]*>/g) || [];
  const noAlt = images.filter(function (tag) { return !/\balt=/.test(tag); });
  if (noAlt.length) bad(label + ': ' + noAlt.length + ' image(s) without alt');
  else if (images.length) ok(label + ': all ' + images.length + ' images have alt text');

  // Structured data
  const ld = page.html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (ld) {
    let data;
    try { data = JSON.parse(ld[1]); } catch (error) { bad(label + ': JSON-LD does not parse (' + error.message + ')'); }
    if (data) {
      if (data['@context'] !== 'https://schema.org') bad(label + ': JSON-LD @context is not schema.org');
      else if (!Array.isArray(data['@graph']) || data['@graph'].length < 3) bad(label + ': JSON-LD graph is incomplete');
      else ok(label + ': JSON-LD parses (' + data['@graph'].map(function (n) { return n['@type']; }).join(', ') + ')');
    }
  } else if (siteUrl && !page.noindex) {
    bad(label + ': no structured data');
  } else if (siteUrl) {
    ok(label + ': no structured data on a noindex page');
  }

  // Unresolved template or placeholder text
  if (/\{\{[A-Z_]+\}\}/.test(page.html)) bad(label + ': unresolved template token');
  const withoutConfiguredOrigin = (siteUrl ? page.html.split(siteUrl).join('') : page.html);
  if (/example\.(org|com)/.test(withoutConfiguredOrigin)) bad(label + ': placeholder domain in output');

  // Weak anchor text (links only, not buttons or disclosure controls)
  const anchors = page.html.match(/<a\b[^>]*>([\s\S]*?)<\/a>/g) || [];
  const weak = anchors.filter(function (anchor) {
    const text = anchor.replace(/<[^>]+>/g, '').trim();
    return /^(click here|read more|here|learn more)$/i.test(text);
  });
  if (weak.length) warn(label + ': ' + weak.length + ' link(s) with weak text: ' + weak.join(' '));
});

// Titles should not be duplicated; descriptions too (checked per page above).

// Sitemap and robots
const sitemapPath = path.join(OUT, 'sitemap.xml');
if (siteUrl) {
  if (!fs.existsSync(sitemapPath)) {
    bad('sitemap.xml missing although a domain is configured');
  } else {
    const xml = fs.readFileSync(sitemapPath, 'utf8');
    const locs = (xml.match(/<loc>([^<]+)<\/loc>/g) || []).map(function (tag) {
      return tag.replace(/<\/?loc>/g, '');
    });
    ok('sitemap.xml lists ' + locs.length + ' URLs');
    const indexable = pages.filter(function (page) { return !page.noindex; });
    indexable.forEach(function (page) {
      const expected = siteUrl + '/' + (page.rel === 'index.html' ? '' : page.rel);
      if (locs.indexOf(expected) === -1) bad('sitemap.xml is missing ' + page.rel);
    });
    locs.forEach(function (loc) {
      if (loc.indexOf(siteUrl) !== 0) bad('sitemap.xml contains a foreign origin: ' + loc);
      const rel = loc.slice(siteUrl.length).replace(/^\//, '');
      if (rel && !fs.existsSync(path.join(OUT, rel))) bad('sitemap.xml points at a missing file: ' + rel);
    });
    pages.forEach(function (page) {
      if (page.noindex && locs.some(function (loc) { return loc.indexOf('/' + page.rel) !== -1; })) {
        bad('sitemap.xml includes the noindex page ' + page.rel);
      }
    });
    if (locs.length !== indexable.length) bad('sitemap.xml has ' + locs.length + ' URLs for ' + indexable.length + ' indexable pages');
    else ok('sitemap.xml matches the indexable pages exactly');
  }
} else {
  warn('sitemap.xml not built because no production domain is configured');
}

const robotsPath = path.join(OUT, 'robots.txt');
if (!fs.existsSync(robotsPath)) bad('robots.txt missing');
else {
  const robotsTxt = fs.readFileSync(robotsPath, 'utf8');
  if (!/User-agent:\s*\*/i.test(robotsTxt)) bad('robots.txt does not address all crawlers');
  else ok('robots.txt allows crawlers');
  if (siteUrl && !/Sitemap:\s*https?:\/\//i.test(robotsTxt)) bad('robots.txt has no Sitemap line');
  if (/Disallow:\s*\/\s*$/m.test(robotsTxt)) bad('robots.txt blocks the whole site');
  if (!siteUrl) warn('robots.txt has no Sitemap line until the domain exists');
}

console.log('\nSummary: ' + JSON.stringify({ PASS: pass, FAIL: fail, NOTE: note }));
process.exit(fail ? 1 : 0);
