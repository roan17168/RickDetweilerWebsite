(function () {
  'use strict';

  function motionBehavior() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }

  document.documentElement.classList.add('js');

  /* Remember which disclosures the author opened in the markup, before any
     script closes or reorders them. The visual layer uses this to decide
     whether a panel opens beside its label or underneath it. Recorded here
     because this file runs before the page-specific scripts, and it is the
     only point at which the authored state is still true. */
  Array.prototype.forEach.call(document.querySelectorAll('details'), function (details) {
    details.setAttribute('data-authored-open', details.hasAttribute('open') ? 'true' : 'false');
  });

  var page = document.body.getAttribute('data-page');
  if (page) {
    document.querySelectorAll('[data-nav]').forEach(function (link) {
      if (link.getAttribute('data-nav') === page) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* Mobile navigation */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (!open) closeDropdown();
    });
  }

  /* Perspectives dropdown */
  var dropdown = document.querySelector('.nav-dropdown');
  var dropToggle = document.querySelector('.nav-dropdown-toggle');
  var dropMenu = document.querySelector('.nav-dropdown-menu');

  function closeDropdown() {
    if (!dropdown || !dropToggle) return;
    dropdown.classList.remove('is-open');
    dropToggle.setAttribute('aria-expanded', 'false');
  }

  if (dropdown && dropToggle && dropMenu) {
    dropToggle.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = dropdown.classList.toggle('is-open');
      dropToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (event) {
      if (!dropdown.contains(event.target)) closeDropdown();
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    closeDropdown();
    if (nav && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        toggle.focus();
      }
    }
  });

  document.querySelectorAll('[data-unbuilt]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
    });
  });

  /* Masthead: the header gains a shadow and a gold hairline once the page has
     scrolled away from the top, so it separates from the paper beneath it. */
  var header = document.querySelector('.site-header');
  if (header) {
    var lastStuck = null;
    var syncHeader = function () {
      var stuck = (window.pageYOffset || document.documentElement.scrollTop || 0) > 8;
      if (stuck === lastStuck) return;
      lastStuck = stuck;
      header.classList.toggle('is-stuck', stuck);
    };
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  /* Reveal on entry: as an element first comes into view it plays a short
     rise. This is decoration only. The class it sets (.reveal-in) triggers a
     CSS animation and has no hidden resting state, so if this script never
     runs, or IntersectionObserver is missing, every element is simply
     visible. Reduced-motion users are skipped entirely. */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealTargets = document.querySelectorAll(
      '.home-section > .container > h2, .home-section .section-label, .audience-card,' +
      ' .home-study-list li, .home-good-life-list li, .book-band,' +
      ' .choosing-section > .container > h2, .research-section > .container > h2,' +
      ' .understanding-section > .container > h2, .about-section > .container > h2,' +
      ' .study-fact, .chart-card'
    );

    if (revealTargets.length) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('reveal-in');
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

      Array.prototype.forEach.call(revealTargets, function (node) {
        /* Anything already within the first screen arrives with the page, so
           it should not animate after the reader has started reading. */
        if (node.getBoundingClientRect().top < window.innerHeight * 0.85) return;
        revealObserver.observe(node);
      });
    }
  }

  /* Notes panel: a native modal dialog supplies background inertness, focus confinement, Escape and focus return. */
  var panel = document.getElementById('notes-panel');
  var lastFocus = null;
  var closeButton = panel ? panel.querySelector('[data-notes-close]') : null;

  function openNotes(id) {
    if (!panel) return;
    lastFocus = document.activeElement;
    if (!panel.open) {
      if (typeof panel.showModal === 'function') panel.showModal();
      else panel.setAttribute('open', '');
    }
    if (closeButton) closeButton.focus();
    setNotesEdges();
    if (id) {
      var target = document.getElementById(id);
      if (target) {
        window.setTimeout(function () {
          target.scrollIntoView({ block: 'center', behavior: motionBehavior() });
          setNotesEdges();
          target.classList.add('is-highlighted');
          window.setTimeout(function () { target.classList.remove('is-highlighted'); }, 2200);
        }, 220);
      }
    }
  }

  function restoreNotesFocus() {
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    lastFocus = null;
  }

  function closeNotes() {
    if (!panel || !panel.open) return;
    if (typeof panel.close === 'function') panel.close();
    else panel.removeAttribute('open');
    restoreNotesFocus();
  }

  /* The sources list is longer than any window: thirty-two entries against
     roughly eight hundred pixels. The scrollbar in this browser is an overlay
     that fades out, so the drawer gives no sign that it continues past the
     fold, and a reader can reasonably conclude the rest are simply absent.
     The panel carries a class while there is more to reach, and fades the list
     at the edge it continues past. Nothing is added to the page; the class is
     only a state. */
  var notesList = panel ? panel.querySelector('.notes-list') : null;

  function setNotesEdges() {
    if (!notesList) return;
    panel.classList.toggle('has-more-below', notesList.scrollTop + notesList.clientHeight < notesList.scrollHeight - 2);
  }

  if (panel) {
    panel.addEventListener('close', restoreNotesFocus);
    panel.addEventListener('click', function (event) {
      if (event.target === panel) closeNotes();
    });
  }

  if (notesList) {
    notesList.addEventListener('scroll', setNotesEdges, { passive: true });
    window.addEventListener('resize', setNotesEdges);
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(setNotesEdges).observe(notesList);
    }
  }


  function setToolStatus(button, message) {
    var tools = button.closest('.result-tools');
    var status = tools ? tools.querySelector('.result-tool-status') : null;
    if (status) status.textContent = message;
  }

  function copyResultText(text, button) {
    var fallback = function () {
      var area = document.createElement('textarea');
      area.className = 'clipboard-fallback';
      area.value = text;
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
      document.body.removeChild(area);
      setToolStatus(button, ok ? 'Copied.' : 'Could not copy automatically. Select the questions and copy them.');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setToolStatus(button, 'Copied.');
      }).catch(fallback);
    } else {
      fallback();
    }
  }

  document.addEventListener('click', function (event) {
    var copy = event.target.closest('[data-result-copy]');
    var email = event.target.closest('[data-result-email]');
    if (!copy && !email) return;    var button = copy || email;
    var scope = button.closest('.quiz-results, .in-college-result, .faculty-result, .leaders-results, .policymakers-results');
    var source = scope ? scope.querySelector('.result-copy-source') : null;
    if (!source) return;
    var text = source.textContent.trim();
    if (!text) return;
    if (copy) {
      copyResultText(text, button);
      return;
    }
    window.location.href = 'mailto:?subject=' + encodeURIComponent('My questions from What College Is Really For') +
      '&body=' + encodeURIComponent(text);
  });

  /* Share my result: copies a link that reopens the page with the same result showing,
     without the reader's individual answers. The result is stored on this device under
     the page's result key; the link carries only the result name, and on arrival the page
     rebuilds that result from its own data. */
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-result-share]');
    if (!button) return;
    var key = button.getAttribute('data-result-share-key');
    if (!key) return;
    var slug = null;
    try {
      var raw = window.localStorage ? window.localStorage.getItem(key) : null;
      var saved = raw ? JSON.parse(raw) : null;
      slug = saved ? (saved.outcome || saved.result || null) : null;
    } catch (error) {
      slug = null;
    }
    var status = button.parentNode ? button.parentNode.querySelector('.result-tool-status') : null;
    if (!slug) {
      if (status) status.textContent = 'Take the quiz once, then this link will reopen your result.';
      return;
    }
    var link = String(window.location.href).split('#')[0] + '#result=' + encodeURIComponent(slug);
    var done = function (copied) {
      if (status) {
        status.textContent = copied
          ? 'Link copied. It reopens this result without your answers.'
          : 'Copy this link: ' + link;
      }
    };
    try {
      window.history.replaceState(null, '', link);
    } catch (error) {
      // The link is still offered for this page view.
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(function () { done(true); }, function () { done(false); });
    } else {
      var area = document.createElement('textarea');
      area.value = link;
      document.body.appendChild(area);
      area.select();
      var copied = false;
      try { copied = document.execCommand('copy'); } catch (copyError) { copied = false; }
      document.body.removeChild(area);
      done(copied);
    }
  });

  var advancingChoice = null;

  document.addEventListener('click', function (event) {
    if (event.detail === 0) return;
    var choice = event.target.closest('.quiz-choice');
    if (!choice || choice.querySelector('input[type="checkbox"]')) return;
    var form = choice.closest('form.quiz-form');
    if (!form) return;
    var submit = form.querySelector('button[type="submit"]');
    if (!submit) return;
    if (advancingChoice === choice) return;
    advancingChoice = choice;
    window.setTimeout(function () {
      advancingChoice = null;
      if (!submit.disabled && document.documentElement.contains(submit)) submit.click();
    }, 180);
  });

  var mobileDisclosures = document.querySelectorAll('[data-mobile-close]');
  if (mobileDisclosures.length) {
    var mobileQuery = window.matchMedia('(max-width: 760px)');
    var syncMobileDisclosures = function () {
      Array.prototype.forEach.call(mobileDisclosures, function (details) {
        details.open = !mobileQuery.matches;
      });
    };
    syncMobileDisclosures();
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', syncMobileDisclosures);
    else if (mobileQuery.addListener) mobileQuery.addListener(syncMobileDisclosures);
  }

  document.querySelectorAll('[data-notes-open]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      openNotes(button.getAttribute('data-note-target'));
    });
  });

  document.querySelectorAll('[data-note]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      openNotes(link.getAttribute('data-note'));
    });
  });

  if (closeButton) closeButton.addEventListener('click', closeNotes);

  // Fallback only: native <dialog> closes on Escape through its cancel event.
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && panel && panel.open) closeNotes();
  });
})();
