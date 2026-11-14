/* Local review notes panel.
   Served only by tools/review-server.js from the workspace; notes live in
   localStorage and can be copied back to the assistant as plain text. */

(function () {
  'use strict';

  var STORAGE_KEY = 'wcirf-review-notes-v1';
  var pagePath = location.pathname.replace(/\/index\.html$/, '/') || '/';

  function readNotes() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeNotes(notes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.slice(0, 200)));
    } catch (error) {
      /* storage full or blocked */
    }
  }

  var notes = readNotes();

  var root = document.createElement('div');
  root.id = 'wcirf-review-root';
  root.innerHTML =
    '<button id="wcirf-review-toggle" type="button" aria-expanded="false" aria-controls="wcirf-review-panel">' +
    '<span class="wcirf-dot" aria-hidden="true"></span>Review notes' +
    '<span class="wcirf-count" hidden>0</span>' +
    '</button>' +
    '<section id="wcirf-review-panel" role="region" aria-label="Review notes" data-open="false">' +
    '<div class="wcirf-head"><strong>Review notes</strong>' +
    '<button class="wcirf-close" type="button" aria-label="Close review notes">×</button></div>' +
    '<div class="wcirf-body">' +
    '<p class="wcirf-page"></p>' +
    '<p class="wcirf-hint">Jot down anything that looks wrong. Notes save in this browser; copy them and paste them back to Buffy.</p>' +
    '<label class="wcirf-visually-hidden" for="wcirf-review-text" hidden>Note</label>' +
    '<textarea id="wcirf-review-text" placeholder="e.g. The gap under the audience cards is too big."></textarea>' +
    '<div class="wcirf-actions">' +
    '<button class="wcirf-btn wcirf-save" type="button">Save note</button>' +
    '<button class="wcirf-btn wcirf-copy" type="button">Copy all</button>' +
    '<button class="wcirf-btn wcirf-clear" type="button">Clear</button>' +
    '</div>' +
    '<p class="wcirf-status" role="status"></p>' +
    '<ul class="wcirf-list"></ul>' +
    '</div></section>';

  function ready() {
    document.body.appendChild(root);

    var toggle = root.querySelector('#wcirf-review-toggle');
    var panel = root.querySelector('#wcirf-review-panel');
    var close = root.querySelector('.wcirf-close');
    var textarea = root.querySelector('#wcirf-review-text');
    var save = root.querySelector('.wcirf-save');
    var copy = root.querySelector('.wcirf-copy');
    var clear = root.querySelector('.wcirf-clear');
    var status = root.querySelector('.wcirf-status');
    var list = root.querySelector('.wcirf-list');
    var count = root.querySelector('.wcirf-count');
    var pageLabel = root.querySelector('.wcirf-page');

    pageLabel.textContent = 'Page: ' + pagePath;

    function setStatus(message) {
      status.textContent = message;
      if (message) {
        window.setTimeout(function () {
          if (status.textContent === message) status.textContent = '';
        }, 2400);
      }
    }

    function render() {
      var mine = notes.filter(function (note) { return note.page === pagePath; });
      list.innerHTML = '';
      count.hidden = notes.length === 0;
      count.textContent = String(notes.length);

      if (!mine.length) {
        var empty = document.createElement('li');
        empty.className = 'wcirf-empty';
        empty.textContent = 'No notes on this page yet.';
        list.appendChild(empty);
        return;
      }

      mine.slice().reverse().forEach(function (note) {
        var item = document.createElement('li');
        item.className = 'wcirf-note';
        item.textContent = note.text;
        var meta = document.createElement('small');
        meta.textContent = new Date(note.at).toLocaleString();
        item.appendChild(meta);
        var del = document.createElement('button');
        del.type = 'button';
        del.textContent = '×';
        del.setAttribute('aria-label', 'Delete note');
        del.addEventListener('click', function () {
          notes = notes.filter(function (candidate) { return candidate.id !== note.id; });
          writeNotes(notes);
          render();
        });
        item.appendChild(del);
        list.appendChild(item);
      });
    }

    function open(shouldOpen) {
      panel.dataset.open = shouldOpen ? 'true' : 'false';
      toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      if (shouldOpen) textarea.focus();
    }

    function addNote() {
      var text = textarea.value.trim();
      if (!text) {
        setStatus('Write a note first.');
        textarea.focus();
        return;
      }
      notes.push({
        id: String(Date.now()) + Math.random().toString(16).slice(2),
        page: pagePath,
        text: text,
        at: new Date().toISOString()
      });
      writeNotes(notes);
      textarea.value = '';
      render();
      setStatus('Saved.');
    }

    function formatForBuffy() {
      if (!notes.length) return '';
      var lines = ['Review notes — What College Is Really For', ''];
      var byPage = {};
      notes.forEach(function (note) {
        (byPage[note.page] = byPage[note.page] || []).push(note.text);
      });
      Object.keys(byPage).forEach(function (page) {
        lines.push(page);
        byPage[page].forEach(function (text) {
          lines.push('  - ' + text.replace(/\n/g, ' '));
        });
        lines.push('');
      });
      return lines.join('\n').trim();
    }

    function copyAll() {
      var text = formatForBuffy();
      if (!text) {
        setStatus('No notes to copy yet.');
        return;
      }
      function fallback() {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', 'readonly');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand('copy');
          setStatus('Copied. Paste it into the chat.');
        } catch (error) {
          setStatus('Select the notes above and copy them.');
        }
        document.body.removeChild(area);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          setStatus('Copied. Paste it into the chat.');
        }, fallback);
      } else {
        fallback();
      }
    }

    toggle.addEventListener('click', function () {
      open(panel.dataset.open !== 'true');
    });

    close.addEventListener('click', function () {
      open(false);
      toggle.focus();
    });

    save.addEventListener('click', addNote);
    textarea.addEventListener('keydown', function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        addNote();
      }
    });

    copy.addEventListener('click', copyAll);

    clear.addEventListener('click', function () {
      if (!notes.length) {
        setStatus('No notes to clear.');
        return;
      }
      if (window.confirm('Delete all review notes in this browser?')) {
        notes = [];
        writeNotes(notes);
        render();
        setStatus('Cleared.');
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.dataset.open === 'true') {
        open(false);
        toggle.focus();
      }
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();
