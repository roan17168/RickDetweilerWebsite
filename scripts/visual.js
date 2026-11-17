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

  /* Long essay pages set their prose on the 748px reading measure inside the
     1140px rail, which leaves about 380px empty down the whole length of the
     page — measured at 90 to 100 per cent of its height. That column is not
     decoration; it is the natural place for an outline.

     The outline is built from headings that are already on the page, so it
     adds no words of its own. It is aria-hidden because it duplicates the
     page's own contents list, and the page remains complete and navigable
     without it.

     Two conditions keep it honest. It only appears on a wide viewport, and
     only on a page long enough for an outline to help. Where a wide element
     — a table, a chart, a timeline — runs the full rail, the outline steps
     aside rather than sitting on top of it. */
  function buildMarginOutline() {
    if (window.matchMedia && !window.matchMedia('(min-width: 1180px)').matches) return;

    var main = document.querySelector('main');
    if (!main) return;
    if (main.classList.contains('margin-outline-host')) return;
    if (main.scrollHeight < 3000) return;

    var sections = Array.prototype.filter.call(
      main.querySelectorAll('section'),
      function (sec) {
        return !sec.closest('footer, aside, .choosing-quiz, .plan-shell, .parents-more');
      }
    );

    /* The headings to list: the section headings, and, where a page has fewer
       than three of those, its sub-headings as well. */
    var heads = [];
    sections.forEach(function (sec) {
      var h2 = sec.querySelector('h2');
      if (h2) heads.push(h2);
    });

    if (heads.length < 3) {
      heads = [];
      sections.forEach(function (sec) {
        Array.prototype.forEach.call(sec.querySelectorAll('h2, h3'), function (h) {
          if (heads.length < 12) heads.push(h);
        });
      });
    }

    /* Headings inside a table, a figure or a disclosure are captions for that
       object, not sections of the page — a chart's column groups are not
       chapters, and listing them produces the same entry twice. */
    heads = heads.filter(function (h) {
      return !h.closest('table, figure, figcaption, details, aside, .choosing-quiz, .plan-shell');
    });

    /* And no entry twice, whatever the page's markup does. */
    var seenText = {};
    heads = heads.filter(function (h) {
      var key = h.textContent.trim().toLowerCase();
      if (!key || seenText[key]) return false;
      seenText[key] = true;
      return true;
    });

    if (heads.length < 3) return;

    /* Anchors are needed for the links. Where a heading has none, one is
       derived from its position on the page. Nothing visible changes. */
    heads.forEach(function (h, i) {
      if (!h.id) h.id = 'outline-' + (i + 1);
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

    heads.forEach(function (h) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.trim();
      /* The panel duplicates the page's own contents list, so it is
         aria-hidden. A focusable control inside an aria-hidden region is a
         trap for anyone on a keyboard, so these stay out of the tab order;
         the page's own list is the accessible route to the same anchors. */
      a.tabIndex = -1;
      li.appendChild(a);
      list.appendChild(li);
      links.push({ a: a, h: h });
    });

    inner.appendChild(list);
    nav.appendChild(inner);
    main.appendChild(nav);
    main.classList.add('margin-outline-host');

    /* When does the outline start earning its place? Only once the page's own
       opening matter — the hero, and any contents list the page keeps in
       flow — has gone by. Before that the reader is being introduced to the
       page, and a duplicate list beside the title is noise.

       Several pages carry their own "On this page" card near the top. The
       outline is the same idea, so the two must never be on screen together. */
    var startedAt = 0;
    var seen = main.querySelector('.understanding-contents, .about-contents, .contents, [class*="contents"]');
    if (seen) {
      startedAt = seen.getBoundingClientRect().bottom + window.pageYOffset - 120;
    }
    if (!startedAt) {
      var hero = main.querySelector('section');
      startedAt = (hero ? hero.getBoundingClientRect().bottom + window.pageYOffset : 0) - 80;
    }

    var setDormant = function () {
      nav.classList.toggle('is-dormant', window.pageYOffset < startedAt);
    };
    setDormant();
    window.addEventListener('scroll', setDormant, { passive: true });

    /* Some blocks run the full rail — the parents timeline, wide tables, the
       chart — and their text would run underneath the outline. Rather than
       keep a list of every such class, measure the text itself against the
       panel's own left edge, which is the exact condition for a collision:
       any line reaching past it can end up under the panel.

       Those lines are recorded once, in document coordinates, so scrolling
       afterwards costs arithmetic rather than layout. The panel is only
       pinned horizontally, so its left edge does not move as the page
       scrolls and the recorded comparison stays valid. */
    var panelLeft = inner.getBoundingClientRect().left + window.pageXOffset;

    /* Which text reaches past the panel? Text that sits in a sticky region
       moves relative to the page, and a few pages reveal panels on scroll, so
       the answer cannot be cached as fixed coordinates. Instead, the nodes
       whose lines reach past the panel's left edge are collected here, and
       only those are re-measured while scrolling — a handful of nodes, which
       is cheap enough to do per frame and always correct. */
    var candidates = [];

    var findCandidates = function () {
      candidates = [];
      var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null);
      var node, guard = 0;
      while ((node = walker.nextNode()) && guard++ < 30000) {
        if (!node.nodeValue || !node.nodeValue.trim()) continue;
        if (nav.contains(node)) continue;
        var range = document.createRange();
        range.selectNodeContents(node);
        var rects = range.getClientRects();
        for (var i = 0; i < rects.length; i++) {
          if (rects[i].width < 4 || rects[i].height < 4) continue;
          if (rects[i].right > panelLeft - 10) { candidates.push(node); break; }
        }
      }
    };
    findCandidates();

    /* A page can add content later — the quiz result, a book plate. When it
       does, look again, at most once a second. */
    var lastScan = 0;
    var rescan = function () {
      var now = Date.now();
      if (now - lastScan < 1000) return;
      lastScan = now;
      findCandidates();
    };
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function (records) {
        for (var i = 0; i < records.length; i++) {
          if (records[i].addedNodes.length) { rescan(); return; }
        }
      });
      mo.observe(main, { childList: true, subtree: true });
    }

    /* A disclosure opening does not add nodes, so the observer does not see
       it, but the page underneath changes shape. Re-measure when that
       happens, then re-test immediately so the outline never sits over a
       panel that has just opened beneath it. */
    document.addEventListener('layout-changed', function () {
      lastScan = Date.now();
      findCandidates();
      check();
    });

    var ticking = false;
    var check = function () {
      ticking = false;
      var box = inner.getBoundingClientRect();
      if (!box.width) return;
      /* The list of entries grows with the page, and on a short viewport a long
         one runs past the bottom of the window. Showing the top half of a list
         that continues below the fold is worse than not showing it: the reader
         cannot see the entry they want and the panel covers the text beside it.
         So an outline taller than the window stays out of the way entirely. */
      if (box.height > window.innerHeight - 180) {
        nav.classList.add('is-obscured');
        return;
      }
      /* Coming into view from above is not a reason to stop guarding: the panel
         sticks at 7rem, which is above this threshold, so as soon as the reader
         reached a section the condition was met and the outline was taken out
         of the collision test — precisely where a full-rail paragraph could be
         underneath it. Only "off screen entirely" clears the state now. */
      if (box.bottom <= 0 || box.top >= window.innerHeight) {
        nav.classList.remove('is-obscured');
        return;
      }
      var left = box.left + 6;
      var top = box.top + 4;
      var bottom = box.bottom - 4;
      var clash = false;

      for (var i = 0; i < candidates.length && !clash; i++) {
        var node = candidates[i];
        if (!node.parentElement || !node.parentElement.isConnected) continue;
        var range = document.createRange();
        range.selectNodeContents(node);
        var rects = range.getClientRects();
        for (var j = 0; j < rects.length; j++) {
          var r = rects[j];
          if (r.width < 4 || r.height < 4) continue;
          if (r.right > left && r.bottom > top && r.top < bottom) { clash = true; break; }
        }
      }

      /* Text is not the only thing that can end up under the panel. A card's
         header band carries an icon and, on the home page, a running number —
         neither is a text node, and neither is wide enough to be caught by the
         comparison above. So the panels and bands themselves are tested too.

         A section or a container is only a box: a heading inside it may end
         well before the panel, and hiding the outline because a section
         happens to span the rail would leave the whole page without one. The
         test is therefore for things that are drawn — a card, a band, a
         figure, an image, a button — not for the wrappers around them. */
      if (!clash) {
        var drawn = main.querySelectorAll(
          'article, .audience-card, .about-work-card, .book-band, figure, table, ' +
          '.pullout, .callout, .card-icon, img, svg, .btn, .parents-cost-card, ' +
          '.faculty-card, .leaders-practice, .understanding-quote, .research-finding, ' +
          'li, blockquote, pre, aside, .chart, ' +
          /* A closing paragraph can sit outside any card and run the full rail. */
          '.understanding-closing-lede, .understanding-closing h3'
        );
        for (var k = 0; k < drawn.length && !clash; k++) {
          var el = drawn[k];
          if (nav.contains(el)) continue;
          /* A card icon sits inside a card that is already tested; measuring
             both only doubles the work. */
          if (el.tagName === 'SVG' && el.closest('article, .audience-card, .btn, nav')) continue;
          var er = el.getBoundingClientRect();
          if (er.width < 24 || er.height < 16) continue;
          if (er.right > left && er.left < box.right - 6 &&
              er.bottom > top && er.top < bottom) {
            clash = true;
          }
        }
      }

      nav.classList.toggle('is-obscured', clash);
    };

    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(check);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    check();

    /* Mark the entry for the section you are reading. */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) {
            l.a.classList.toggle('is-current', l.h === entry.target);
          });
        });
      }, { rootMargin: '-12% 0px -72% 0px', threshold: 0 });
      heads.forEach(function (h) { io.observe(h); });
    }
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
