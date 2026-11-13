(function () {
  'use strict';

  var STATUS_TIMEOUT = 2600;

  function readStored(key) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (error) {
      return null;
    }
  }

  function writeStored(key, value) {
    try {
      if (window.localStorage) window.localStorage.setItem(key, value);
    } catch (error) {
      return false;
    }
    return true;
  }

  function removeStored(key) {
    try {
      if (window.localStorage) window.localStorage.removeItem(key);
    } catch (error) {
      // Nothing else to do.
    }
  }

  function fieldElements(root) {
    return Array.prototype.slice.call(root.querySelectorAll('[data-tool-field]'));
  }

  function fieldKey(field) {
    return field.getAttribute('data-tool-field');
  }

  function fieldLabel(field) {
    var explicit = field.getAttribute('data-tool-label');
    if (explicit) return explicit;
    if (field.id) {
      var label = document.querySelector('label[for="' + field.id + '"]');
      if (label) return label.textContent.replace(/\s+/g, ' ').trim();
    }
    return fieldKey(field);
  }

  function fieldValue(field) {
    if (field.type === 'checkbox') return field.checked ? 'Yes' : 'No';
    if (field.tagName === 'SELECT') {
      var option = field.options[field.selectedIndex];
      return option && option.value ? option.textContent.trim() : '';
    }
    return String(field.value || '').trim();
  }

  function collect(root) {
    var state = {};
    fieldElements(root).forEach(function (field) {
      if (field.type === 'radio') {
        if (field.checked) state[fieldKey(field)] = field.value;
        return;
      }
      state[fieldKey(field)] = field.type === 'checkbox' ? field.checked : field.value;
    });
    return state;
  }

  function apply(root, state) {
    fieldElements(root).forEach(function (field) {
      var key = fieldKey(field);
      if (!Object.prototype.hasOwnProperty.call(state, key)) return;
      if (field.type === 'radio') {
        field.checked = field.value === state[key];
      } else if (field.type === 'checkbox') {
        field.checked = !!state[key];
      } else {
        field.value = state[key];
      }
    });
  }

  function buildText(root) {
    var title = root.getAttribute('data-tool-title') || document.title.split('|')[0].trim();
    var lines = [title, ''];

    Array.prototype.forEach.call(root.querySelectorAll('[data-tool-row]'), function (row) {
      var rowLabel = row.getAttribute('data-tool-row-label');
      if (rowLabel) lines.push(rowLabel);
      fieldElements(row).forEach(function (field) {
        var value = fieldValue(field);
        lines.push('  ' + fieldLabel(field) + ': ' + (value || 'Not filled in'));
      });
      lines.push('');
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-tool-extra]'), function (block) {
      fieldElements(block).forEach(function (field) {
        var value = fieldValue(field);
        lines.push(fieldLabel(field) + ': ' + (value || 'Not filled in'));
      });
    });

    return lines.join('\n').trim();
  }

  function setStatus(root, message) {
    var status = root.querySelector('[data-tool-status]');
    if (!status) return;
    status.textContent = message;
    window.clearTimeout(root._statusTimer);
    root._statusTimer = window.setTimeout(function () {
      status.textContent = '';
    }, STATUS_TIMEOUT);
  }

  function copyText(text, onSuccess, onFailure) {
    var fallback = function () {
      var area = document.createElement('textarea');
      area.className = 'clipboard-fallback';
      area.value = text;
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
      document.body.removeChild(area);
      if (ok) onSuccess();
      else onFailure();
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(fallback);
    } else {
      fallback();
    }
  }

  function readResult(key) {
    try {
      return JSON.parse(readStored(key) || 'null');
    } catch (error) {
      return null;
    }
  }

  var MOVE_NAMES = [
    '1: Time with a professor',
    '2: Broad elective',
    '3: Classes that make you think',
    '4: Campus group',
    '5: Conversation across difference'
  ];

  var FACULTY_RATINGS = ['Not yet', 'Partway', 'Strong'];

  function prefillInCollege(root) {
    var stored = readResult('wcirf_in_college_result_v1');
    if (!stored || !Array.isArray(stored.values) || stored.values.length !== 5) return false;

    var weakest = stored.values
      .map(function (value, index) { return { index: index, value: Number(value) }; })
      .filter(function (item) { return item.value < 2; })
      .sort(function (a, b) { return a.value - b.value || a.index - b.index; });

    if (!weakest.length) return false;

    weakest.slice(0, 3).forEach(function (item, position) {
      var select = root.querySelector('[data-tool-field="move-' + (position + 1) + '"]');
      if (!select) return;
      select.value = MOVE_NAMES[item.index];
    });
    return true;
  }

  function prefillFaculty(root) {
    var stored = readResult('wcirf_faculty_result_v1');
    if (!stored || !Array.isArray(stored.values) || stored.values.length !== 5) return false;

    stored.values.forEach(function (value, index) {
      var select = root.querySelector('[data-tool-field="rating-' + (index + 1) + '"]');
      if (!select) return;
      select.value = FACULTY_RATINGS[Number(value)] || '';
    });
    return true;
  }

  function setup(root) {
    var key = root.getAttribute('data-tool-key');
    if (!key) return;
    var saved = readResult(key);
    if (saved) apply(root, saved);

    var prefillKind = root.getAttribute('data-tool-prefill');
    var prefillNote = root.querySelector('[data-tool-prefill-note]');
    if (prefillKind && !saved) {
      var prefilled = prefillKind === 'in-college' ? prefillInCollege(root) : prefillFaculty(root);
      if (prefilled) {
        if (prefillNote) prefillNote.hidden = false;
        writeStored(key, JSON.stringify(collect(root)));
        Array.prototype.forEach.call(root.querySelectorAll('[data-tool-field]'), function (field) {
          field.dispatchEvent(new Event('input', { bubbles: true }));
        });
      }
    }

    var undo = root.querySelector('[data-tool-prefill-undo]');
    if (undo) {
      undo.addEventListener('click', function (event) {
        event.preventDefault();
        fieldElements(root).forEach(function (field) {
          if (field.type === 'checkbox' || field.type === 'radio') field.checked = false;
          else field.value = '';
        });
        if (prefillNote) prefillNote.hidden = true;
        removeStored(key);
        setStatus(root, 'Quiz answers removed. The form is blank.');
      });
    }

    root.addEventListener('input', function (event) {
      if (!event.target.closest('[data-tool-field]')) return;
      writeStored(key, JSON.stringify(collect(root)));
    });

    root.addEventListener('change', function (event) {
      if (!event.target.closest('[data-tool-field]')) return;
      writeStored(key, JSON.stringify(collect(root)));
      setStatus(root, 'Saved on this device.');
    });

    var print = root.querySelector('[data-tool-print]');
    if (print) {
      print.addEventListener('click', function () {
        setStatus(root, 'Opening the print dialog.');
        window.print();
      });
    }

    var pdf = root.querySelector('[data-tool-pdf]');
    if (pdf) {
      pdf.addEventListener('click', function () {
        setStatus(root, 'Choose “Save as PDF” as the printer in the dialog.');
        window.print();
      });
    }

    var copy = root.querySelector('[data-tool-copy]');
    if (copy) {
      copy.addEventListener('click', function () {
        copyText(
          buildText(root),
          function () { setStatus(root, 'Copied.'); },
          function () { setStatus(root, 'Could not copy automatically. Select the text and copy it.'); }
        );
      });
    }

    var reset = root.querySelector('[data-tool-reset]');
    if (reset) {
      reset.addEventListener('click', function () {
        resetFields(root);
        if (prefillNote) prefillNote.hidden = true;
        removeStored(key);
        setStatus(root, 'Form cleared.');
      });
    }
  }

  function resetFields(root) {
    fieldElements(root).forEach(function (field) {
      if (field.type === 'checkbox' || field.type === 'radio') field.checked = false;
      else field.value = '';
    });
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-tool]'), setup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
