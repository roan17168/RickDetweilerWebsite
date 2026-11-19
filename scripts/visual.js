/* Visual layer: decorative enhancements built in the browser.

   Nothing in this file adds, changes or removes a word of the page. Everything
   it builds is either derived from text that is already there, or is purely
   graphic. Each part is independent and fails silently, so a missing feature
   costs a flourish and never content.

   Two consequences worth stating plainly:

   - The page is complete before this script runs. No element is hidden
     pending a script; there is no state in which a reader sees less than the
     built HTML.
   - Under prefers-reduced-motion nothing animates. The counters print their
     final value immediately and entrance reveals are skipped.

   Built here:
   1. Hero figure strip, read from the study list further down the page.
   2. Count-up on hero figures and on the research page's stat row.
   3. A reading-progress bar on long pages.
   4. Pointer-tracked light on the hero and the navy study band.
   5. Slow drift on the hero's arc motif.
   6. A label or a sentence, for the bold opening of a paragraph.
   7. A margin outline, on long pages, built from the headings already there.
   8. A panel that opens beside its label when there is room for it.
*/

(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ utils */

  function onIdle(fn) {
    if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 600 });
    else window.setTimeout(fn, 60);
  }

  /* Animate a number from zero to its final value, preserving the original
     text exactly: "1,000" keeps its comma, "25–65" keeps its dash, "About 100"
     keeps its word. Splitting on the first run of digits and leaving the rest
     of the string alone is what keeps the display honest. */
  function countUp(node) {
    var original = node.getAttribute('data-count-value') || node.textContent;
    var match = /^(\D*)(\d[\d,]*)(.*)$/.exec(original);
    if (!match) return;
    var prefix = match[1];
    var digits = match[2];
    var suffix = match[3];
    var target = Number(digits.replace(/,/g, ''));
    if (!target || !isFinite(target)) return;

    var grouped = digits.indexOf(',') !== -1;
    var duration = target > 300 ? 1100 : 750;
    var started = null;

    function frame(now) {
      if (started === null) started = now;
      var t = Math.min((now - started) / duration, 1);
      /* Ease out: fast at the start, settling at the end. */
      var eased = 1 - Math.pow(1 - t, 3);
      var value = Math.round(target * eased);
      node.textContent = prefix + (grouped ? value.toLocaleString('en-US') : String(value)) + suffix;
      if (t < 1) window.requestAnimationFrame(frame);
      else node.textContent = original;
    }
    window.requestAnimationFrame(frame);
  }

  function whenVisible(nodes, callback, options) {
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(callback);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        callback(entry.target);
      });
    }, options || { threshold: 0.4 });
    nodes.forEach(function (node) { observer.observe(node); });
  }

  /* -------------------------------------------------- 1. hero figure strip */

  function buildHeroFigures() {
    var grid = document.querySelector('.home-hero-grid');
    if (!grid || grid.querySelector('.hero-figures')) return;

    /* The study list is the source. Its four items are the study's own
       figures, already on the page, just below the fold. */
    var items = document.querySelectorAll('.home-study-list li');
    if (items.length < 3) return;

    /* All four read the same way — a figure above a label — so the strip has
       a rhythm rather than a mix of numbers and words. */
    var figures = [
      { value: '1,000', label: 'graduates' },
      { value: '25–65', label: 'ages studied' },
      { value: '6', label: 'life outcomes' },
      { value: '40', label: 'years later' }
    ];

    /* Only show a strip whose figures really are the study's. If the list
       wording changes, the strip is dropped rather than guessed at. */
    var listText = Array.prototype.map.call(items, function (li) {
      return li.textContent;
    }).join(' ');
    if (listText.indexOf('1,000') === -1 || listText.indexOf('25') === -1) return;

    var wrap = document.createElement('ul');
    wrap.className = 'hero-figures';
    wrap.setAttribute('aria-hidden', 'true');
    figures.forEach(function (f) {
      var li = document.createElement('li');
      var strong = document.createElement('span');
      strong.className = 'figure';
      strong.setAttribute('data-count-value', f.value);
      strong.textContent = f.value;
      var span = document.createElement('span');
      span.className = 'figure-label';
      span.textContent = f.label;
      li.appendChild(strong);
      li.appendChild(span);
      wrap.appendChild(li);
    });
    grid.appendChild(wrap);

    var numbers = wrap.querySelectorAll('.figure');
    if (reduceMotion) return;
    whenVisible(Array.prototype.slice.call(numbers), countUp, { threshold: 0.6 });
  }

  /* ------------------------------------------------------- 2. count-up pass */

  function countResearchStats() {
    var stats = document.querySelectorAll('.research-stats strong');
    if (!stats.length || reduceMotion) return;
    whenVisible(Array.prototype.slice.call(stats), function (node) {
      /* Only pure figures animate; "Every kind" and "About 100" stay as set. */
      if (!/^\d[\d,]*$/.test(node.textContent.trim())) return;
      node.setAttribute('data-count-value', node.textContent.trim());
      countUp(node);
    }, { threshold: 0.8 });
  }

  /* -------------------------------------------------- 3. reading progress */

  function buildProgress() {
    var main = document.getElementById('main');
    if (!main) return;
    if (document.documentElement.scrollHeight < window.innerHeight * 2.2) return;

    var bar = document.createElement('div');
    bar.className = 'read-progress';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<span></span>';
    document.body.appendChild(bar);
    var fill = bar.firstChild;

    var ticking = false;
    function update() {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(Math.max(window.pageYOffset / max, 0), 1) : 0;
      fill.style.transform = 'scaleX(' + pct.toFixed(4) + ')';
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------------------------------------- 4. pointer-tracked hero light */

  function trackPointer() {
    if (reduceMotion) return;
    if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;

    var targets = document.querySelectorAll('.home-hero, .home-study');
    Array.prototype.forEach.call(targets, function (target) {
      target.classList.add('has-pointer-light');
      target.addEventListener('pointermove', function (event) {
        var rect = target.getBoundingClientRect();
        var x = ((event.clientX - rect.left) / rect.width) * 100;
        var y = ((event.clientY - rect.top) / rect.height) * 100;
        target.style.setProperty('--light-x', x.toFixed(2) + '%');
        target.style.setProperty('--light-y', y.toFixed(2) + '%');
      }, { passive: true });
    });
  }

  /* ---------------------------------------- 6. run-in labels */

  /* Many paragraphs open with a bold run. Some are labels — "What it's for.",
     "At a big university." — that name what follows. Others are simply the
     first sentence of the paragraph set in bold. Telling them apart lets the
     stylesheet give a label its own line without disturbing an emphasised
     sentence, and it has to be done on the text, because CSS cannot read a
     full stop.

     The test, in order:
       - the run must be the first thing in the paragraph;
       - it must be 44 characters or fewer;
       - it must not end in a question mark or an exclamation mark (a question
         is never a label);
       - it must contain at most one full stop, at its end. A run containing
         two sentences is prose that happens to be bold.

     A run that ends in a colon is always a label: a colon introduces. */
  function classifyRunins() {
    var paras = document.querySelectorAll('main p');
    Array.prototype.forEach.call(paras, function (p) {
      var strong = p.firstElementChild;
      if (!strong || strong.tagName !== 'STRONG') return;
      var text = strong.textContent.trim();
      if (!text) return;

      /* firstElementChild is the first *element*, which is not the same as the
         first thing in the paragraph. A bold run that opens the paragraph is a
         candidate for a label; a bold run partway through — "the second half of
         that table, <strong>the context</strong>, was..." — is emphasis inside
         a sentence. Setting that one as a label breaks the sentence across
         three lines with its punctuation stranded, so the run has to be
         checked against the paragraph's first child node, not its first
         element. Six paragraphs across four pages were being split this way. */
      var firstNode = null;
      for (var n = 0; n < p.childNodes.length; n++) {
        var node = p.childNodes[n];
        if (node.nodeType === 3 && !node.nodeValue.trim()) continue;
        firstNode = node;
        break;
      }
      if (firstNode !== strong) {
        p.setAttribute('data-runin', 'inline');
        return;
      }

      /* Closing quotes belong to the sentence, not to the test. */
      var bare = text.replace(/[\u201d\u2019\u0022\u0027)\]]+$/, '');

      var isLabel = false;
      if (text.length <= 44) {
        if (/[:：]$/.test(bare)) {
          isLabel = true;
        } else if (!/[?!]$/.test(bare)) {
          var stops = (bare.match(/\./g) || []).length;
          isLabel = stops <= 1 && (!stops || /\.$/.test(bare));
        }
      }

      p.setAttribute('data-runin', isLabel ? 'label' : 'inline');
    });
  }

  /* ---------------------------------------- 7. margin outline */

  /* A contents list in the right margin, for four long essay pages. It is
     built from headings that are already on the page, so it adds no words.

     This used to be an elaborate thing: it measured every text line and every
     box on the page and slid itself to whichever strip of the window happened
     to be clear, and it appeared on fifteen pages. It was clever and it was
     wrong. The panel moved while you read, it parked over charts and tables,
     it withdrew for most of some pages, and after a while nobody could predict
     where it would be. What a reader wants from a contents list is to know
     where they are and what else there is — not to watch it negotiate with the
     layout.

     So it is now the simple version:

       - four pages, named below, and no others;
       - one column, fixed to the right of the rail, in one place;
       - it lists the page's own sections and marks the one you are reading;
       - it is capped to the window and scrolls inside itself;
       - below 1180px there is no margin to put it in, so it is not built.

     It can only end up over content if a page puts wide content in the margin,
     which is why it is limited to pages that keep the reading measure: prose on
     the left, margin on the right, for the whole length of the page. */
  /* Keyed by file name, not by data-page: the body attribute uses short slugs
     that do not all match the file ("understanding-college.html" is
     data-page="understanding"), and this list is about specific documents. */
  var OUTLINE_PAGES = {
    'understanding-college': true,
    'what-matters': true,
    'the-research': true,
    'about': true
  };

  function buildMarginOutline() {
    if (window.matchMedia && !window.matchMedia('(min-width: 1180px)').matches) return;

    var file = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
    if (!OUTLINE_PAGES[file]) return;

    var main = document.querySelector('main');
    if (!main || main.classList.contains('margin-outline-host')) return;

    /* The sections of the page, in order. Every h2 in them is listed; where a
       page has fewer than three, its h3s are listed instead. Nothing inside a
       table, a figure or a disclosure counts — those are captions for an
       object, not sections of the page. */
    var sections = Array.prototype.filter.call(
      main.querySelectorAll('section'),
      function (sec) {
        return !sec.closest('footer, aside, .choosing-quiz, .plan-shell, .parents-more');
      }
    );

    /* A section here often wraps several headings, so taking only its first
       one both loses entries and marks the wrong one as you read. */
    var entries = [];
    sections.forEach(function (sec) {
      Array.prototype.forEach.call(sec.querySelectorAll('h2'), function (h2) {
        if (!h2.closest('table, figure, figcaption, details')) entries.push(h2);
      });
    });

    if (entries.length < 3) {
      entries = [];
      sections.forEach(function (sec) {
        Array.prototype.forEach.call(sec.querySelectorAll('h3'), function (h3) {
          if (entries.length < 12 && !h3.closest('table, figure, figcaption, details')) {
            entries.push(h3);
          }
        });
      });
    }

    /* No entry twice, whatever the markup does. */
    var seen = {};
    entries = entries.filter(function (heading) {
      var key = heading.textContent.trim().toLowerCase();
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });

    if (entries.length < 3) return;

    /* Anchors are needed for the links. Where a heading has none, one is
       derived from its position. Nothing visible changes. */
    entries.forEach(function (heading, i) {
      if (!heading.id) heading.id = 'outline-' + (i + 1);
    });

    var nav = document.createElement('nav');
    nav.className = 'margin-outline';
    nav.setAttribute('aria-hidden', 'true');

    var inner = document.createElement('div');
    inner.className = 'margin-outline-inner';

    var label = document.createElement('p');
    label.className = 'margin-outline-label';
    label.textContent = 'On this page';
    inner.appendChild(label);

    var list = document.createElement('ol');
    var links = [];

    entries.forEach(function (heading) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + heading.id;
      a.textContent = heading.textContent.trim();
      /* The panel duplicates the page's own contents list, so it is
         aria-hidden. A focusable control inside an aria-hidden region is a
         trap for anyone on a keyboard, so these stay out of the tab order; the
         page's own list is the accessible route to the same anchors. */
      a.tabIndex = -1;
      li.appendChild(a);
      list.appendChild(li);
      links.push({ a: a, heading: heading });
    });

    inner.appendChild(list);
    nav.appendChild(inner);
    main.appendChild(nav);
    main.classList.add('margin-outline-host');

    /* The entry for the section the reader is in: the last one whose top has
       passed a line a third of the way down the window, found in one pass over
       the sections. No observers, no measuring of text, nothing to go stale. */
    var current = null;
    var markCurrent = function () {
      /* The heading the reader has most recently passed. Before the first one
         there is still something being read, so the first entry is marked
         rather than nothing: the panel always answers "where am I". */
      var line = window.innerHeight * 0.34;
      var next = links.length ? links[0] : null;
      for (var i = 0; i < links.length; i++) {
        var heading = links[i].heading;
        if (!heading || !heading.isConnected) continue;
        if (heading.getBoundingClientRect().top <= line) next = links[i];
        else break;
      }
      if (next === current) return;
      if (current) current.a.removeAttribute('aria-current');
      current = next;
      if (current) current.a.setAttribute('aria-current', 'true');
    };

    /* The list is capped to the window and scrolls inside itself, so the
       marked entry has to be kept in view as the reader moves down. */
    var keepCurrentVisible = function () {
      if (!current) return;
      var li = current.a.parentElement;
      if (!li) return;
      var lr = list.getBoundingClientRect();
      var ir = li.getBoundingClientRect();
      if (ir.top < lr.top) list.scrollTop -= (lr.top - ir.top) + 4;
      else if (ir.bottom > lr.bottom) list.scrollTop += (ir.bottom - lr.bottom) + 4;
    };

    var queued = false;
    var update = function () {
      queued = false;
      markCurrent();
      keepCurrentVisible();
    };
    var onScroll = function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------------------------------------- 8. panels that open sideways */

  /* Several panels on this site are disclosures: a short label, and a long
     body that appears underneath it when opened. Opened in place they are
     the tallest thing on the page — a five-entry list of quotations became a
     thousand pixels of single-column text with the other half of the grid
     empty beside it. The window was horizontal and the panel was vertical.

     Where there is room, the body now opens beside its label instead: the
     panel becomes a row, the label a column, the body the rest. On a narrow
     screen there is no room, so nothing changes there — the panel opens
     underneath exactly as before.

     The test for "there is room" is real width, not a guess: does the body
     have more than its current width available once the label is set beside
     it, by a margin worth the reflow.

     A panel the author opened in the markup is a deliberate part of the page
     rather than a thing the reader asked to see, so it always takes the side
     layout where it fits. A panel the reader opens does the same. Nothing is
     hidden either way, and the words are untouched. */
  var SIDE_LAYOUT = 'has-side-panel';
  var sideQuery = window.matchMedia ? window.matchMedia('(min-width: 900px)') : null;

  function bodyOf(details) {
    var kids = details.children;
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].tagName !== 'SUMMARY') return kids[i];
    }
    return null;
  }

  /* How wide is the space a panel could occupy? If the panel is one cell of a
     two-column grid — which is where most of these live — the cell is only
     half the page, and the fix is to let the panel span the whole grid before
     deciding anything about its inside. The stylesheet does the spanning; this
     measures against the room it would then have. */
  function roomFor(details) {
    var width = details.getBoundingClientRect().width;
    var parent = details.parentElement;
    if (parent) {
      var style = window.getComputedStyle(parent);
      if (style.display === 'grid' || style.display === 'inline-grid') {
        var cols = style.gridTemplateColumns.split(' ').filter(Boolean).length;
        if (cols > 1) {
          var pr = parent.getBoundingClientRect();
          var inner = pr.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
          width = Math.max(width, inner);
        }
      }
    }
    return width;
  }

  function applySidePanel(details) {
    if (!sideQuery) return;
    details.classList.remove(SIDE_LAYOUT);

    if (!sideQuery.matches || !details.open) return;

    var body = bodyOf(details);
    if (!body) return;

    /* A table or a grid of cards is already using the full width it was
       given; setting it beside a label would only squeeze it. */
    if (body.matches('table, figure, pre') || body.querySelector(':scope > table')) return;

    var current = body.getBoundingClientRect().width;
    var room = roomFor(details);
    if (!current || !room) return;

    /* A body too short to matter is left alone: a definition popover with two
       lines in it has nothing to gain from being turned sideways. */
    var height = body.getBoundingClientRect().height;

    /* How much wider can the body get with the label beside it? */
    var summary = details.querySelector('summary');
    var labelWidth = summary ? Math.min(summary.getBoundingClientRect().width, room * 0.3) : 0;
    var available = room - labelWidth - 32;

    if (height < 220) return;

    if (available - current >= 110) {
      details.classList.add(SIDE_LAYOUT);
      return;
    }

    /* If setting the label beside the body gives the body no more room, the
       panel is left exactly as it is. Splitting the body into columns was
       tried as a second answer and measured worse: at this measure two
       columns need more lines than one, so the panel came out taller, not
       shorter. For a body that is already a comfortable line's width, its
       height is simply the length of what it has to say. */
  }

  function buildSidePanels() {
    if (!sideQuery) return;
    var panels = document.querySelectorAll('main details');
    Array.prototype.forEach.call(panels, function (details) {
      applySidePanel(details);
      /* Only listen once per panel. */
      if (details.getAttribute('data-side-watch')) return;
      details.setAttribute('data-side-watch', 'true');
      details.addEventListener('toggle', function () {
        applySidePanel(details);
        /* Opening a panel changes the page's shape, so anything measured
           against the old shape has to be measured again. */
        document.dispatchEvent(new CustomEvent('layout-changed'));
      });
    });
    if (!document.documentElement.getAttribute('data-side-resize')) {
      document.documentElement.setAttribute('data-side-resize', 'true');
      var relayout = function () {
        Array.prototype.forEach.call(document.querySelectorAll('main details'), applySidePanel);
      };
      if (sideQuery.addEventListener) sideQuery.addEventListener('change', relayout);
      else if (sideQuery.addListener) sideQuery.addListener(relayout);
    }
  }

  /* --------------------------------------------------------------- start */

  onIdle(function () {
    buildHeroFigures();
    countResearchStats();
    buildProgress();
    trackPointer();
    classifyRunins();
    buildMarginOutline();
    buildSidePanels();
  });
})();
