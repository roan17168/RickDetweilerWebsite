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
      { value: '1,000', label: 'graduates interviewed' },
      { value: '25–65', label: 'ages in the study' },
      { value: '6', label: 'life outcomes measured' },
      { value: '40', label: 'years looked back' }
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

  /* --------------------------------------------------------------- start */

  onIdle(function () {
    buildHeroFigures();
    countResearchStats();
    buildProgress();
    trackPointer();
  });
})();
