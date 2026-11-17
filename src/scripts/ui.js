(function () {
  'use strict';

  function motionBehavior() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }

  document.documentElement.classList.add('js');

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
    if (id) {
      var target = document.getElementById(id);
      if (target) {
        window.setTimeout(function () {
          target.scrollIntoView({ block: 'center', behavior: motionBehavior() });
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

  if (panel) {
    panel.addEventListener('close', restoreNotesFocus);
    panel.addEventListener('click', function (event) {
      if (event.target === panel) closeNotes();
    });
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
