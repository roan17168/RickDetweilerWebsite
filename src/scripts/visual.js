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

    /* A page that already stands its own contents card in the right-hand
       column does not need a second one. The choosing page keeps a sticky
       sidebar of results there from the top of the page to the bottom, so the
       column is never free: the outline could only appear by covering that
       card, and the card is the page's own, working, visible version of the
       same idea. One contents list per page, and it is the page's own. */
    if (main.querySelector('.audience-sidebar, .choosing-sidebar')) return;

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

    /* The panel has three states, and the reader should see one of them
       change, never a state that blinks.
         is-dormant   the page is still introducing itself
         is-lifted    a wide element has come alongside; the list rises above
                      it rather than being withdrawn
         is-obscured  only for a genuine impossibility: a window too short to
                      hold the list at all */
    var LIFT_GAP = 24;

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
      /* The hero is the page's opening block. Where the page calls its own
         sections something else and the first <section> is the whole sheet, a
         fallback is needed or the outline never wakes up: the tools pages have
         one section wrapping every block, so `startedAt` came out at the very
         bottom of the page and the list stayed dormant throughout. */
      var hero = main.querySelector(
        'section.understanding-hero, section.home-hero, section.choosing-hero, ' +
        'section[class*="hero"], main > section:first-of-type'
      );
      startedAt = (hero ? hero.getBoundingClientRect().bottom + window.pageYOffset : 0) - 80;
      /* Never wait for more than the first screen. */
      startedAt = Math.min(startedAt, window.innerHeight * 0.9);
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
      /* The list is capped and scrolls inside itself, so a long one is no
         longer a reason to withdraw the panel. Only a window with no room for
         even a few entries is. */
      if (window.innerHeight < 320) {
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

      /* Wide content has come alongside. Two ways to respond are wrong: leave
         the panel where it is and let the list sit over the chart, or take it
         off the page entirely, which is what made it vanish for 80 per cent of
         the pages that carry one. The panel moves to the clearest band of the
         window instead — one move, on one axis, and it never leaves the page.
         (`clash` above is no longer consulted for that decision; the band
         search below measures the whole column and is the authority.) */
      void clash;
      nav.classList.remove('is-obscured');
      nav.classList.add('is-lifted');
      applyLift();
    };

    /* Where can the list sit without touching anything?

       This has to be measured live. Two earlier attempts cached the answer and
       both were wrong: cards on these pages fade and rise into place as they
       scroll in, so a box recorded at load time is not where the box is now.
       The panel's own offset was mishandled too — the lift is an absolute
       translate, so the search has to start from the panel's natural top, not
       from where the previous frame left it.

       The search runs from the panel's resting place outwards and takes the
       nearest band tall enough for the whole list and clear of every text line
       and every wide box. Nearest matters: a panel that leaps to the far side
       of the window on every scroll reads as broken even when it is legible. */
    var headerBottom = function () {
      var head = document.querySelector('.site-header, header');
      if (!head) return 0;
      var r = head.getBoundingClientRect();
      return r.bottom > 0 ? r.bottom : 0;
    };

    var currentLift = 0;

    /* Every obstacle that shares the panel's column, as a list of vertical
       spans in viewport coordinates. Text lines are included wherever they
       reach past the panel's left edge, because a short line ending under the
       list collides exactly as a long paragraph does. */
    var obstacleSpans = function (panelLeft, panelRight) {
      var spans = [];

      var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null);
      var node, guard = 0;
      while ((node = walker.nextNode()) && guard++ < 30000) {
        if (!node.nodeValue || !node.nodeValue.trim()) continue;
        if (nav.contains(node)) continue;
        var pe = node.parentElement;
        if (!pe) continue;
        var pcs = window.getComputedStyle(pe);
        if (pcs.visibility === 'hidden' || pcs.display === 'none' || parseFloat(pcs.opacity) < 0.05) continue;
        var rg = document.createRange();
        rg.selectNodeContents(node);
        var rs = rg.getClientRects();
        for (var q = 0; q < rs.length; q++) {
          var rr = rs[q];
          /* Only genuinely empty rects are skipped. The earlier 6px floor
             discarded a table cell whose text box measured just under it, so a
             cell showing "Describing life..." was never recorded and the panel
             settled across it. */
          if (rr.width < 1 || rr.height < 1) continue;
          if (rr.right <= panelLeft + 6) continue;
          spans.push([rr.top, rr.bottom]);
        }
      }

      var wide = main.querySelectorAll(
        'figure, table, img, svg, video, canvas, .research-chart, .understanding-chart, ' +
        '.data-table, .chart-table-wrap, .research-table-wrap, .callout, .pullout, ' +
        '.research-finding, .understanding-quote, .book-band, .about-work-card, ' +
        '.audience-card, .faculty-card, .parents-cost-card, .leaders-practice, ' +
        'button, .btn, a.btn, input, select, textarea, [role="button"], ' +
        /* A quiz is a live control surface, not prose: radio rows, a Next
           button and a progress bar that the reader is looking at. Treat the
           whole shell as an object so the outline never sits on it. */
        '.choosing-quiz, .quiz-card, .choosing-quiz-shell, [class*="quiz"]'
      );
      for (var k = 0; k < wide.length; k++) {
        var el = wide[k];
        if (nav.contains(el)) continue;
        var ecs = window.getComputedStyle(el);
        if (ecs.visibility === 'hidden' || ecs.display === 'none' || parseFloat(ecs.opacity) < 0.05) continue;
        var er = el.getBoundingClientRect();
        if (er.width < 24 || er.height < 16) continue;
        /* Does this box reach the panel's column? Its own right edge is not the
           test for a table: a narrow header cell stops well short of the
           column while the table it sits in runs underneath. The table's own
           width is the one that matters. */
        /* Any part of the box inside the panel's column counts, not only a
           box that crosses the panel's left edge. The button on the quiz was
           998-1215: wide enough to sit under the list, narrow enough that its
           left edge was past it, so it was skipped and the outline settled on
           top of it. The panel's own label starts at its left edge, and the
           label is text a reader is meant to read. */
        var reaches = er.right > panelLeft + 6 && er.left < panelRight - 6;
        if (!reaches && (el.tagName === 'TABLE' || el.tagName === 'TABLE'.toLowerCase())) {
          reaches = true;   /* a table is a block; its box is the collision */
        }
        if (!reaches && el.closest && el.closest('table')) {
          var hostTable = el.closest('table');
          var tr = hostTable.getBoundingClientRect();
          if (tr.right > panelLeft + 6) reaches = true;
        }
        if (!reaches) continue;
        spans.push([er.top, er.bottom]);
      }
      return spans;
    };

    /* Choose a top for the panel: the free band nearest to where the panel
       already rests, preferring the one it is already in so an unchanged
       window leaves it untouched.

       This is arithmetic on two sorted lists rather than a scan over candidate
       offsets. The panel is tall, so a 16px offset grid almost always steps
       over the one free band that exists; merging the spans gives every gap
       exactly. */
    var lastGaps = [];
    var chooseTop = function (spans, height, natural, boundsTop, boundsBottom) {
      var room = boundsBottom - height;
      if (room < boundsTop) return null;

      /* Only the window is of interest. Obstacles further away than one window
         above or below can never affect a placement, and dropping them matters:
         an obstacle that ended far above the window used to push the one free
         band out of the candidate list, so a band the reader could plainly see
         was never offered. */
      spans = spans.filter(function (sp) {
        return sp[1] > boundsTop - 400 && sp[0] < boundsBottom + 400;
      }).sort(function (a, b) { return a[0] - b[0]; });
      var merged = [];
      for (var i = 0; i < spans.length; i++) {
        var last = merged[merged.length - 1];
        if (last && spans[i][0] <= last[1] + 6) {
          if (spans[i][1] > last[1]) last[1] = spans[i][1];
        } else {
          merged.push([spans[i][0], spans[i][1]]);
        }
      }

      /* Every gap between successive obstacles, clipped to the window. Each
         gap that can hold the panel is where the top may go: either at the
         gap's start or, if the gap is taller than the panel, as low as the
         gap allows — both are tried so the nearest one wins. */
      var best = null;
      var consider = function (top) {
        if (top < boundsTop || top + height > boundsBottom) return;
        if (best === null || Math.abs(top - natural) < Math.abs(best - natural)) best = top;
      };

      var gaps = [];
      lastGaps = gaps;
      for (var m = 0; m <= merged.length; m++) {
        var gapStart = m === 0 ? -100000 : merged[m - 1][1] + 8;
        var gapEnd = m === merged.length ? 100000 : merged[m][0] - 8;
        gaps.push([gapStart, gapEnd]);
        /* The usable tops are the part of this gap that is inside the window
           and leaves room for the whole panel. Clamping only to the gap's
           start let a top outside the gap through: the first obstacle was a
           "Next question" label at the top of the window, and the panel was
           placed at the window edge as if the gap extended from it, landing on
           two lines of text further down. Both ends have to be respected. */
        var lo = Math.max(gapStart, boundsTop);
        var hi = Math.min(gapEnd, boundsBottom) - height;
        if (hi < lo) continue;
        if (lo >= natural) {
          /* A gap that starts at or below the resting place. Only the very top
             of it: a panel that slides down to the last centimetre of the
             window is half off the fold and reads as broken, and the bottom
             strip of a viewport is the first thing clipped on a phone or a
             short laptop window. */
          consider(lo);
        } else if (hi <= natural) {
          /* A gap entirely above the resting place: its lowest usable top is
             the move that keeps the panel as near as possible. */
          consider(hi);
        } else {
          /* The resting place is inside this gap already. */
          consider(natural);
        }
      }
      return best;
    };

    var applyLift = function () {
      var panel = inner.getBoundingClientRect();
      var height = panel.height;

      var boundsTop = Math.max(headerBottom() + 16, 12);
      var boundsBottom = window.innerHeight - 12;

      if (height > boundsBottom - boundsTop) {
        /* The window cannot hold the list. That is the one honest reason for
           the panel to stand down. */
        nav.classList.add('is-obscured');
        return;
      }
      nav.classList.remove('is-obscured');

      /* Every one of the three numbers below is absolute, and the lift applied
         is the difference between two absolutes rather than an increment.
         Accumulating an offset was the source of the panel's worst behaviour:
         while the 260ms transition was still running the measured top was a
         moving number, the next frame treated it as the resting place and
         added another delta on top, and the panel climbed out of the window. */
      /* The resting place is the sticky offset itself: the panel sticks at
         `top: 7rem` inside a container that spans the whole page, so with no
         transform it sits 7rem below the window's top edge. offsetTop cannot
         be used for this — the panel's offsetParent is the tall positioned
         container, so offsetTop measures from the top of the document's
         outline track, not from the window. */
      var stickyTop = parseFloat(window.getComputedStyle(inner).top) || 112;
      var target = stickyTop;

      /* How tall may the list be? Not a fixed cap: the gutter beside a figure
         or a table is often only a few hundred pixels, and a list that insists
         on its full height can then only sit over the figure. So the list is
         shown at the height of the tallest free band in the window — the rest
         of its entries are a scroll inside the panel — and the band search runs
         again against that height. A contents list showing five entries is
         useful; a contents list lying across a chart is not. */
      var fullHeight = inner.scrollHeight || height;
      var spans = obstacleSpans(panel.left, panel.right);

      /* Try full height; if that finds nowhere clear, shrink to the tallest
         band that exists and try again. */
      var chosen = chooseTop(spans, height, target, boundsTop, boundsBottom);
      if (chosen === null) {
        var tallest = 0;
        for (var gi = 0; gi < lastGaps.length; gi++) {
          var band = Math.min(lastGaps[gi][1], boundsBottom) - Math.max(lastGaps[gi][0], boundsTop);
          if (band > tallest) tallest = band;
        }
        var floor = 96;                        /* label plus two entries */
        if (tallest >= floor && tallest < height) {
          inner.style.setProperty('--outline-fit', Math.floor(tallest) + 'px');
          /* The panel is now shorter; measure and place it again. */
          var shrunk = inner.getBoundingClientRect().height;
          chosen = chooseTop(spans, shrunk, target, boundsTop, boundsBottom);
          if (chosen !== null) {
            height = shrunk;
            panel = inner.getBoundingClientRect();
          }
        }
      } else {
        /* It fits at full height again, so the cap goes back. */
        if (fullHeight > height) inner.style.removeProperty('--outline-fit');
      }

      if (chosen === null) {
        /* No free band anywhere in this window, even at the smallest useful
           height. That happens when a single object owns the whole fold — a
           table of fifty rows, a long figure. There is no honest place for the
           list then, so it stands down for those few hundred pixels and comes
           back when the object has passed. Covering rows of a table is worse
           than a panel that waits; the page's own contents list remains the
           route to the same sections meanwhile. */
        nav.classList.add('is-obscured');
        return;
      }

      var delta = chosen - target;
      if (Math.abs(delta - currentLift) < 1.5) return;
      currentLift = delta;
      inner.style.setProperty('--outline-lift', delta.toFixed(1) + 'px');
    };

    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        check();
        markCurrent();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Pages here fade and rise their cards in as they come into view, so a
       measurement taken on the scroll frame describes a layout that is still
       moving: the panel would settle into a gap that closed underneath it.
       The browser tells us when that motion ends, which is the only moment the
       geometry can be trusted. */
    main.addEventListener('animationend', function () {
      if (!nav.classList.contains('is-lifted')) return;
      check();
    }, true);
    main.addEventListener('transitionend', function (event) {
      if (!nav.classList.contains('is-lifted')) return;
      if (event.propertyName === 'transform' || event.propertyName === 'opacity') check();
    }, true);

    /* The entry for the section the reader is in. Sections are already in
       document order, so this is a binary search over their tops; the marked
       entry tells the reader where they are between scroll events. */
    var sectionTops = [];
    var measureSections = function () {
      sectionTops = [];
      for (var i = 0; i < links.length; i++) {
        var host = links[i].h.closest('section') || links[i].h.parentElement;
        sectionTops.push({ el: host, link: links[i].a });
      }
    };
    measureSections();

    var markCurrent = function () {
      if (!sectionTops.length) return;
      var line = window.innerHeight * 0.35;
      var current = null;
      for (var i = 0; i < sectionTops.length; i++) {
        var host = sectionTops[i].el;
        if (!host || !host.isConnected) continue;
        var r = host.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) { current = sectionTops[i]; break; }
        if (r.top <= line) current = sectionTops[i];
      }
      for (var j = 0; j < sectionTops.length; j++) {
        var a = sectionTops[j].link;
        if (sectionTops[j] === current) {
          a.setAttribute('aria-current', 'true');
        } else {
          a.removeAttribute('aria-current');
        }
      }
    };
    markCurrent();
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
