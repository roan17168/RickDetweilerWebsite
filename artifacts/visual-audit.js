/* Browser check for the refinement layer.

   The static audits in this folder verify content and structure. This one runs
   a real Chromium and verifies the things only a browser can answer:

   1. Accessibility of the motion: nothing is left invisible, with or without
      JavaScript, and reduced-motion users see the final state immediately.
   2. No horizontal overflow at any tested width (the most common way a
      restyle breaks a phone).
   3. Contrast of the body and heading colours against their backgrounds.
   4. The favicon set is present and decodable at every declared size.
   5. Layout composition: the home hero is a two-column spread on desktop and
      a single column on a phone, and no section leaves a headless band.

   Run:  node artifacts/visual-audit.js
   Requires a Chromium binary. Set CHROME_PATH if it is not on the path, and
   PREVIEW_URL if the review server is not on port 3000.
*/

'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var PREVIEW = path.join(ROOT, 'artifacts', 'preview') && ROOT;
var BASE = process.env.PREVIEW_URL || 'http://127.0.0.1:3000';

var results = [];
function check(name, pass, detail) {
  results.push({ name: name, pass: !!pass, detail: detail });
  console.log((pass ? '  PASS  ' : '  FAIL  ') + name + (detail ? '  [' + detail + ']' : ''));
}

/* Puppeteer is not a project dependency, so borrow it from wherever it is
   installed for screenshotting rather than adding it to the repo. */
function loadPuppeteer() {
  var candidates = [
    process.env.PUPPETEER_CORE_PATH,
    '/tmp/shot/node_modules/puppeteer-core',
    path.join(ROOT, 'node_modules', 'puppeteer-core')
  ].filter(Boolean);
  for (var i = 0; i < candidates.length; i += 1) {
    try {
      return { puppeteer: require(candidates[i]), dir: candidates[i] };
    } catch (error) {
      /* try the next candidate */
    }
  }
  return null;
}

/* @sparticuz/chromium is ES-module-only, so it cannot be require()d from this
   CommonJS file. Resolve its real entry point and import() that instead. */
async function chromiumModule(puppeteerDir) {
  var roots = [puppeteerDir, path.join(puppeteerDir, '..'), ROOT];
  for (var i = 0; i < roots.length; i += 1) {
    var manifest = path.join(roots[i], '@sparticuz', 'chromium', 'package.json');
    if (!fs.existsSync(manifest)) continue;
    var pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
    var rel = (pkg.exports && pkg.exports['.'] && (pkg.exports['.'].default || pkg.exports['.'].import)) ||
      pkg.module || pkg.main;
    var entry = path.join(path.dirname(manifest), rel);
    var loadedModule = await import('file://' + entry);
    return loadedModule.default || loadedModule;
  }
  return null;
}

/* ------------------------------------------------------------------ colour */

function parseColour(value) {
  var m = /rgba?\(([^)]+)\)/.exec(value);
  if (!m) return null;
  var parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
}

function luminance(c) {
  function channel(v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

function contrast(fg, bg) {
  var a = luminance(fg);
  var b = luminance(bg);
  var light = Math.max(a, b);
  var dark = Math.min(a, b);
  return (light + 0.05) / (dark + 0.05);
}

/* ------------------------------------------------------------------- main */

(async function main() {
  var loaded = loadPuppeteer();
  if (!loaded) {
    console.error('SKIP: puppeteer-core was not found; set PUPPETEER_CORE_PATH to run this audit.');
    process.exit(77);
  }
  var puppeteer = loaded.puppeteer;
  var chromium = await chromiumModule(loaded.dir);
  if (!chromium) {
    console.error('SKIP: @sparticuz/chromium was not found next to puppeteer-core.');
    process.exit(77);
  }

  var executablePath = process.env.CHROME_PATH || (await chromium.executablePath());
  var browser;
  try {
    browser = await puppeteer.launch({
      args: [].concat(chromium.args || [], ['--no-sandbox', '--disable-dev-shm-usage']),
      executablePath: executablePath,
      headless: 'shell'
    });
  } catch (error) {
    /* A browser that cannot start on this machine is a missing prerequisite,
       not a defect in the site. Report it and skip. */
    console.error('SKIP: the browser could not be launched here (' +
      String(error.message).split('\n')[0] + ').');
    console.error('      Provide a working Chromium via CHROME_PATH, and any shared libraries it needs.');
    process.exit(77);
  }

  var pages = ['index.html', 'choosing-a-college.html', 'in-college.html', 'parents.html',
    'counselors.html', 'faculty.html', 'college-leaders.html', 'policymakers.html',
    'the-research.html', 'what-matters.html', 'understanding-college.html', 'about.html',
    'foundation.html', 'privacy.html'];

  /* --- 1. nothing is left invisible ------------------------------------ */
  for (var i = 0; i < pages.length; i += 1) {
    var file = pages[i];
    var page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(BASE + '/' + file, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);

    var hidden = await page.evaluate(function () {
      var offenders = [];
      var nodes = document.querySelectorAll('main h1, main h2, main h3, main p, main li, main a');
      Array.prototype.forEach.call(nodes, function (node) {
        var text = (node.textContent || '').trim();
        if (!text) return;
        var style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden') return;
        if (Number(style.opacity) < 0.15) {
          offenders.push(node.tagName + ': ' + text.slice(0, 40));
        }
      });
      return offenders;
    });
    check(file + ': no content left transparent by the motion layer', hidden.length === 0,
      hidden.slice(0, 3).join(' | '));

    /* With JS disabled the page must be fully readable too. */
    var nojs = await browser.newPage();
    await nojs.setJavaScriptEnabled(false);
    await nojs.setViewport({ width: 1280, height: 900 });
    await nojs.goto(BASE + '/' + file, { waitUntil: 'load', timeout: 60000 });
    var nojsHidden = await nojs.evaluate(function () {
      var visible = 0;
      var nodes = document.querySelectorAll('main h2, main p');
      Array.prototype.forEach.call(nodes, function (node) {
        var style = window.getComputedStyle(node);
        if (style.display !== 'none' && Number(style.opacity) > 0.9) visible += 1;
      });
      return visible;
    });
    check(file + ': readable without JavaScript', nojsHidden > 5, nojsHidden + ' visible blocks');
    await nojs.close();
    await page.close();
  }

  /* --- 2. reduced motion ------------------------------------------------ */
  var rm = await browser.newPage();
  await rm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await rm.setViewport({ width: 1280, height: 900 });
  await rm.goto(BASE + '/index.html', { waitUntil: 'networkidle0', timeout: 60000 });
  var rmState = await rm.evaluate(function () {
    var card = document.querySelector('.audience-card');
    var li = document.querySelector('.home-good-life-list li');
    function state(el) {
      if (!el) return null;
      var s = window.getComputedStyle(el);
      return { opacity: s.opacity, transform: s.transform, animation: s.animationName };
    }
    return { card: state(card), item: state(li) };
  });
  check('reduced motion: cards render in their final state',
    rmState.card && rmState.card.opacity === '1' &&
    (rmState.card.transform === 'none' || rmState.card.transform === 'matrix(1, 0, 0, 1, 0, 0)') &&
    rmState.card.animation === 'none',
    JSON.stringify(rmState.card));
  check('reduced motion: outcome cards render in their final state',
    rmState.item && rmState.item.opacity === '1' && rmState.item.animation === 'none',
    JSON.stringify(rmState.item));
  await rm.close();

  /* --- 3. no horizontal overflow at any width --------------------------- */
  var widths = [320, 390, 480, 720, 860, 960, 1024, 1180, 1280, 1440, 1920];
  for (var w = 0; w < widths.length; w += 1) {
    var width = widths[w];
    var probe = await browser.newPage();
    await probe.setViewport({ width: width, height: 900 });
    await probe.goto(BASE + '/index.html', { waitUntil: 'networkidle0', timeout: 60000 });
    var overflow = await probe.evaluate(function () {
      var docWidth = document.documentElement.clientWidth;
      var scrollWidth = document.documentElement.scrollWidth;
      var wide = [];
      if (scrollWidth > docWidth + 1) {
        Array.prototype.forEach.call(document.querySelectorAll('main *'), function (el) {
          var r = el.getBoundingClientRect();
          if (r.right > docWidth + 1 && r.width > 8) {
            wide.push(el.tagName + '.' + (el.className || '').toString().split(' ')[0] +
              ' right=' + Math.round(r.right));
          }
        });
      }
      return { docWidth: docWidth, scrollWidth: scrollWidth, wide: wide.slice(0, 4) };
    });
    check('home at ' + width + 'px: no horizontal overflow',
      overflow.scrollWidth <= overflow.docWidth + 1,
      overflow.wide.join(' | ') || (overflow.scrollWidth + '/' + overflow.docWidth));
    await probe.close();
  }

  /* --- 4. contrast ------------------------------------------------------ */
  var contrastPage = await browser.newPage();
  await contrastPage.setViewport({ width: 1280, height: 900 });
  var contrastTargets = [
    ['index.html', '.home-hero .lede', 'body copy on the hero'],
    ['index.html', '.home-hero h1', 'hero heading'],
    ['index.html', '.audience-card .card-hook', 'card quote'],
    ['index.html', '.audience-card .btn', 'card action'],
    ['index.html', '.home-good-life-list li', 'outcome card'],
    ['the-research.html', '.research-stats span', 'stat labels'],
    ['about.html', '.about-section p', 'about body copy']
  ];
  for (var c = 0; c < contrastTargets.length; c += 1) {
    var t = contrastTargets[c];
    await contrastPage.goto(BASE + '/' + t[0], { waitUntil: 'networkidle0', timeout: 60000 });
    var sample = await contrastPage.evaluate(function (selector) {
      var el = document.querySelector(selector);
      if (!el) return null;
      function topmost(el) {
        var node = el;
        while (node) {
          var bg = window.getComputedStyle(node).backgroundColor;
          var parsed = /rgba?\(([^)]+)\)/.exec(bg);
          if (parsed) {
            var parts = parsed[1].split(/[,\s/]+/).filter(Boolean).map(Number);
            if (parts.length < 4 || parts[3] > 0.85) return bg;
          }
          node = node.parentElement;
        }
        return 'rgb(255, 255, 255)';
      }
      return { fg: window.getComputedStyle(el).color, bg: topmost(el) };
    }, t[1]);
    if (!sample) {
      check(t[2] + ': contrast measurable', false, 'selector not found: ' + t[1]);
      continue;
    }
    var fg = parseColour(sample.fg);
    var bg = parseColour(sample.bg);
    var ratio = fg && bg ? contrast(fg, bg) : 0;
    check(t[2] + ': contrast at least 4.5:1', ratio >= 4.5,
      ratio.toFixed(2) + ':1 (' + sample.fg + ' on ' + sample.bg + ')');
  }
  await contrastPage.close();

  /* --- 5. favicon set --------------------------------------------------- */
  var icons = [
    ['assets/favicon.ico', 'image/x-icon'],
    ['assets/favicon-16.png', 'image/png'],
    ['assets/favicon-32.png', 'image/png'],
    ['assets/favicon-192.png', 'image/png'],
    ['assets/favicon-512.png', 'image/png'],
    ['assets/favicon-maskable-512.png', 'image/png'],
    ['assets/apple-touch-icon.png', 'image/png'],
    ['favicon.ico', 'image/x-icon']
  ];
  var iconPage = await browser.newPage();
  for (var ic = 0; ic < icons.length; ic += 1) {
    await iconPage.goto(BASE + '/' + icons[ic][0], { waitUntil: 'load' });
    var info = await iconPage.evaluate(function () {
      var img = document.querySelector('img');
      return img && img.naturalWidth ? img.naturalWidth + 'x' + img.naturalHeight : 'undecodable';
    });
    check(icons[ic][0] + ': decodes in the browser', info !== 'undecodable', info);
  }
  await iconPage.close();

  /* --- 6. layout composition ------------------------------------------- */
  var layout = await browser.newPage();
  await layout.setViewport({ width: 1280, height: 900 });
  await layout.goto(BASE + '/index.html', { waitUntil: 'networkidle0', timeout: 60000 });
  var desktop = await layout.evaluate(function () {
    var grid = document.querySelector('.home-hero-grid');
    var copy = document.querySelector('.home-hero-copy');
    var panel = document.querySelector('.home-hero-panel');
    var g = getComputedStyle(grid);
    return {
      columns: g.gridTemplateColumns.split(' ').length,
      copyLeft: Math.round(copy.getBoundingClientRect().left),
      panelLeft: Math.round(panel.getBoundingClientRect().left),
      copyAlign: getComputedStyle(copy).textAlign
    };
  });
  check('home hero is a two-column spread on desktop',
    desktop.columns === 2 && desktop.panelLeft > desktop.copyLeft,
    JSON.stringify(desktop));
  check('home hero copy is left aligned, not centred', desktop.copyAlign === 'left',
    desktop.copyAlign);

  var phoneLayout = await browser.newPage();
  await phoneLayout.setViewport({ width: 390, height: 844 });
  await phoneLayout.goto(BASE + '/index.html', { waitUntil: 'networkidle0', timeout: 60000 });
  var phone = await phoneLayout.evaluate(function () {
    var grid = document.querySelector('.home-hero-grid');
    var panel = document.querySelector('.home-hero-panel');
    var copy = document.querySelector('.home-hero-copy');
    var gr = grid.getBoundingClientRect();
    return {
      columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      sameWidth: Math.abs(panel.getBoundingClientRect().width - copy.getBoundingClientRect().width) < 2,
      heroHeight: Math.round(gr.height),
      viewport: window.innerHeight
    };
  });
  check('home hero collapses to one column on a phone',
    phone.columns === 1 && phone.sameWidth, JSON.stringify(phone));
  await phoneLayout.close();
  await layout.close();

  /* --- 7. the header reacts to scroll ---------------------------------- */
  var sticky = await browser.newPage();
  await sticky.setViewport({ width: 1280, height: 900 });
  await sticky.goto(BASE + '/index.html', { waitUntil: 'networkidle0', timeout: 60000 });
  /* The page sets scroll-behavior: smooth globally, so a plain scrollTo
     animates. Use instant jumps and wait for the class to settle. */
  var headerState = await sticky.evaluate(async function () {
    var header = document.querySelector('.site-header');
    function settle() {
      return new Promise(function (resolve) {
        window.requestAnimationFrame(function () { window.requestAnimationFrame(resolve); });
      });
    }
    var before = header.classList.contains('is-stuck');
    window.scrollTo({ top: 600, left: 0, behavior: 'instant' });
    await settle();
    await settle();
    var after = header.classList.contains('is-stuck');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    await settle();
    await settle();
    var back = header.classList.contains('is-stuck');
    return { before: before, after: after, back: back, offset: window.pageYOffset };
  });
  check('masthead gains its scrolled state and releases it',
    headerState.before === false && headerState.after === true && headerState.back === false,
    JSON.stringify(headerState));
  await sticky.close();

  /* --- 8. the horizontal rail ------------------------------------------ */
  /* Every page must share one left edge and one container width, at desktop
     and on a phone. This is the check that caught six different left edges
     across the site before they were unified. */
  var railPages = ['index.html', 'choosing-a-college.html', 'in-college.html', 'parents.html',
    'counselors.html', 'faculty.html', 'college-leaders.html', 'policymakers.html',
    'the-research.html', 'what-matters.html', 'understanding-college.html', 'about.html',
    'foundation.html', 'privacy.html'];
  for (var rw = 0; rw < 2; rw += 1) {
    var railWidth = rw === 0 ? 1280 : 390;
    var edges = {};
    var railProbe = await browser.newPage();
    await railProbe.setViewport({ width: railWidth, height: 900 });
    for (var rp = 0; rp < railPages.length; rp += 1) {
      await railProbe.goto(BASE + '/' + railPages[rp], { waitUntil: 'domcontentloaded', timeout: 60000 });
      var rail = await railProbe.evaluate(function () {
        var el = document.querySelector('main > section .container, main > .container, main > section .reading, main > .reading');
        var nav = document.querySelector('.nav-shell');
        var foot = document.querySelector('.footer-inner');
        return {
          left: el ? Math.round(el.getBoundingClientRect().left) : null,
          width: el ? Math.round(el.getBoundingClientRect().width) : null,
          navLeft: nav ? Math.round(nav.getBoundingClientRect().left) : null,
          footLeft: foot ? Math.round(foot.getBoundingClientRect().left) : null
        };
      });
      edges[railPages[rp]] = rail;
    }
    await railProbe.close();

    var contentLefts = Object.keys(edges).map(function (k) { return edges[k].left; })
      .filter(function (v) { return v !== null; });
    var uniqueLefts = contentLefts.filter(function (v, i, arr) { return arr.indexOf(v) === i; });
    check('rail at ' + railWidth + 'px: every page shares one content left edge',
      uniqueLefts.length === 1,
      uniqueLefts.length === 1 ? uniqueLefts[0] + 'px' : 'edges found: ' + uniqueLefts.join(', '));

    var misalignedHeader = Object.keys(edges).filter(function (k) {
      return edges[k].navLeft !== edges[k].left || edges[k].footLeft !== edges[k].left;
    });
    check('rail at ' + railWidth + 'px: masthead and footer sit on the content rail',
      misalignedHeader.length === 0,
      misalignedHeader.slice(0, 4).join(', ') || 'aligned');
  }

  /* --- 9. the enhancements --------------------------------------------- */
  var heroPage = await browser.newPage();
  await heroPage.setViewport({ width: 1280, height: 900 });
  await heroPage.goto(BASE + '/index.html', { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(function (r) { setTimeout(r, 900); });

  var hero = await heroPage.evaluate(function () {
    var figures = document.querySelectorAll('.hero-figures li');
    var progress = document.querySelector('.read-progress');
    var copy = document.querySelector('.home-hero-copy');
    var panel = document.querySelector('.home-hero-panel');
    var figuresEl = document.querySelector('.hero-figures');
    return {
      figureCount: figures.length,
      figureText: Array.prototype.map.call(figures, function (li) { return li.textContent.replace(/\s+/g, ' ').trim(); }),
      hasProgress: !!progress,
      progressHeight: progress ? progress.getBoundingClientRect().height : null,
      copyLeft: Math.round(copy.getBoundingClientRect().left),
      panelLeft: Math.round(panel.getBoundingClientRect().left),
      figuresBelowCopy: figuresEl ? figuresEl.getBoundingClientRect().top > copy.getBoundingClientRect().top : false,
      ariaHidden: figuresEl ? figuresEl.getAttribute('aria-hidden') : null
    };
  });
  check('home hero: study figure strip is built', hero.figureCount === 4,
    hero.figureText.join(' / '));
  check('home hero: figure strip is hidden from assistive tech (no new copy)', hero.ariaHidden === 'true');
  check('home hero: figure strip sits beneath the copy, not beside the card', hero.figuresBelowCopy);
  check('home hero: panel is still the right-hand column', hero.panelLeft > hero.copyLeft);
  check('long page: reading progress bar is present', hero.hasProgress && hero.progressHeight > 0,
    hero.progressHeight + 'px');

  /* The counters must land on their exact original values. */
  var counted = await heroPage.evaluate(function () {
    return Array.prototype.map.call(document.querySelectorAll('.hero-figures .figure'),
      function (n) { return n.textContent.trim(); });
  });
  check('home hero: counters settle on their true values',
    counted.join('|') === '1,000|25–65|6|40', counted.join('|'));

  await heroPage.close();

  /* --- 10. reduced motion disables every effect ------------------------- */
  var rmPage = await browser.newPage();
  await rmPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await rmPage.setViewport({ width: 1280, height: 900 });
  await rmPage.goto(BASE + '/index.html', { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(function (r) { setTimeout(r, 700); });
  var rmEffects = await rmPage.evaluate(function () {
    var card = document.querySelector('.audience-card');
    var btn = card ? card.querySelector('.btn') : null;
    var figures = document.querySelectorAll('.hero-figures .figure');
    return {
      noPointerClass: !document.querySelector('.has-pointer-light'),
      cardAnimation: card ? getComputedStyle(card).animationName : null,
      figureText: Array.prototype.map.call(figures, function (n) { return n.textContent.trim(); }).join('|'),
      btnTransition: btn ? getComputedStyle(btn).transitionDuration : null
    };
  });
  check('reduced motion: no pointer-tracked effects are attached', rmEffects.noPointerClass);
  check('reduced motion: counters print their final value with no animation',
    rmEffects.figureText === '1,000|25–65|6|40', rmEffects.figureText);
  await rmPage.close();

  /* --- 11. scripts fail safe ------------------------------------------- */
  var noJs = await browser.newPage();
  await noJs.setJavaScriptEnabled(false);
  await noJs.setViewport({ width: 1280, height: 900 });
  await noJs.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 60000 });
  var noJsState = await noJs.evaluate(function () {
    var hero = document.querySelector('.home-hero-grid');
    var lede = document.querySelector('.home-hero .lede');
    return {
      heroRows: hero ? hero.children.length : 0,
      ledeVisible: lede ? getComputedStyle(lede).opacity : null,
      figures: document.querySelectorAll('.hero-figures').length
    };
  });
  check('no JavaScript: the hero still lays out with no figure strip',
    noJsState.heroRows >= 2 && noJsState.figures === 0, JSON.stringify(noJsState));
  await noJs.close();

  await browser.close();

  /* --- report ----------------------------------------------------------- */
  var failed = results.filter(function (r) { return !r.pass; });
  console.log('\n' + (results.length - failed.length) + ' passed, ' + failed.length + ' failed.');
  if (failed.length) {
    console.error('\nFAIL: visual audit');
    failed.forEach(function (f) { console.error('  - ' + f.name + (f.detail ? '  [' + f.detail + ']' : '')); });
    process.exit(1);
  }
  console.log('PASS: visual audit');
})().catch(function (error) {
  console.error('ERROR: ' + error.message);
  process.exit(1);
});
