(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(root);
  } else {
    var api = factory(root);
    root.WCIRFLeaders = api;
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', api.init);
      } else {
        api.init();
      }
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function motionBehavior() {
    return root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }
  var HONESTY = '<p class="quiz-honesty">This study looked at graduates&rsquo; adult lives and the college experiences linked to life outcomes. The results held for graduates of all types of colleges, big and small, private and public, prestigious and not, and they are supported by many other research studies. <a href="the-research.html">The Research page</a> explains what the study can and cannot show.</p>';

  var initialized = false;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function shuffle(items) {
    var copy = items.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    return copy;
  }

  function scoreQuiz(values, data) {
    var valid = Array.isArray(values) && values.length === 5;
    var allowed = ['market', 'mission', 'experience'];
    var counts = { market: 0, mission: 0, experience: 0 };

    (values || []).forEach(function (value) {
      if (allowed.indexOf(value) === -1) valid = false;
      else counts[value] += 1;
    });

    var results = [];
    var complete = false;

    if (valid && data && data.quiz && Array.isArray(data.quiz.results)) {
      var maximum = Math.max(counts.market, counts.mission, counts.experience);
      results = data.quiz.results.filter(function (item) {
        return counts[item.key] === maximum;
      });
      complete = results.length > 0;
    }

    return {
      values: (values || []).slice(),
      counts: counts,
      results: results,
      complete: complete
    };
  }

  function list(items, className) {
    return '<ul class="' + (className || 'quiz-list') + '">' + items.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('') + '</ul>';
  }

  function resultHtml(results) {
    var copyText = results.map(function (result) {
      return result.heading + '\n\nEssential questions:\n' + result.questions.map(function (question) {
        return '- ' + question;
      }).join('\n');
    }).join('\n\n');
    var html = '<div class="leaders-results">';
    html += '<p class="quiz-step">Your result</p>';
    if (results.length > 1) {
      html += '<p class="leaders-tie-note">Two priorities are tied, so both results are shown.</p>';
    }
    results.forEach(function (result, index) {
      html += '<div class="leaders-result">';
      html += '<h3 class="result-profile"' + (index === 0 ? ' tabindex="-1"' : '') + '>' + escapeHtml(result.heading) + '</h3>';
      html += '<p class="result-description">' + escapeHtml(result.lead) + '</p>';
      html += '<p class="result-research"><strong>What the research says to you.</strong> ' + escapeHtml(result.research) + '</p>';
      html += '<h4>Essential questions</h4>' + list(result.questions);
      html += '<div class="result-try"><strong>This year.</strong><p>' + escapeHtml(result.action) + '</p></div>';
      html += '</div>';
    });
    html += HONESTY;
    html += '<div class="result-copy-source" hidden>' + escapeHtml(copyText) + '</div>';
    html += '<div class="result-tools">' +
      '<button class="btn btn-outline" type="button" data-result-copy>Copy my questions</button>' +
      '<button class="btn btn-outline" type="button" data-result-email>Email this to me</button>' +
      '<span class="result-tool-status" role="status" aria-live="polite"></span>' +
      '</div>';
    html += '<div class="quiz-actions">' +
      '<button class="btn btn-outline" type="button" data-leaders-retake>Take the check again</button>' +
      '<a class="btn btn-primary" href="#institutional-checklist">Go to the checklist</a>' +
      '</div></div>';
    return html;
  }

  function Quiz(app, data) {
    this.app = app;
    this.data = data;
    this.questions = [];
    this.answers = [];
    this.index = 0;
  }

  Quiz.prototype.start = function () {
    this.questions = this.data.quiz.questions.map(function (question) {
      return {
        id: question.id,
        text: question.text,
        options: shuffle(question.options)
      };
    });
    this.answers = [];
    this.index = 0;
    this.renderQuestion(false);
  };

  Quiz.prototype.stepLabel = function () {
    return 'Question ' + (this.index + 1) + ' of ' + this.questions.length;
  };

  Quiz.prototype.focusQuestion = function (shouldScroll) {
    var heading = this.app.querySelector('.quiz-question');
    if (heading) {
      heading.focus({ preventScroll: true });
      if (shouldScroll) this.app.scrollIntoView({ behavior: motionBehavior(), block: 'start' });
    }
  };

  Quiz.prototype.renderQuestion = function (shouldFocus) {
    var question = this.questions[this.index];
    var previous = this.answers[this.index];
    var self = this;
    var selectedIndex = -1;

    if (previous) {
      question.options.some(function (option, index) {
        if (option.text === previous.text) {
          selectedIndex = index;
          return true;
        }
        return false;
      });
    }

    var choices = question.options.map(function (option, index) {
      return '<label class="quiz-choice">' +
        '<input type="radio" name="leaders-answer" value="' + index + '"' + (index === selectedIndex ? ' checked' : '') + '>' +
        '<span>' + escapeHtml(option.text) + '</span>' +
        '</label>';
    }).join('');

    this.app.innerHTML =
      '<div class="quiz-step">' + this.stepLabel() + '</div>' +
      '<progress class="quiz-progress" value="' + (this.index + 1) + '" max="' + this.questions.length + '" aria-label="Quiz progress">' + (this.index + 1) + ' of ' + this.questions.length + '</progress>' +
      '<h3 class="quiz-question" tabindex="-1">' + escapeHtml(question.text) + '</h3>' +
      '<p class="quiz-instruction">Pick the answer that is true for you, even if it is not the one you think you should pick.</p>' +
      '<form class="quiz-form">' +
      '<fieldset><legend class="visually-hidden">' + escapeHtml(question.text) + '</legend>' +
      '<div class="quiz-choice-list">' + choices + '</div>' +
      '</fieldset>' +
      '<div class="quiz-nav">' +
      (this.index > 0 ? '<button class="btn btn-outline" type="button" data-leaders-back>Back</button>' : '<span></span>') +
      '<button class="btn btn-primary" type="submit" data-leaders-next' + (selectedIndex === -1 ? ' disabled' : '') + '>' + (this.index === this.questions.length - 1 ? 'See my result' : 'Next question') + '</button>' +
      '</div></form>';

    var form = this.app.querySelector('form');
    var next = this.app.querySelector('[data-leaders-next]');
    var back = this.app.querySelector('[data-leaders-back]');
    var radios = this.app.querySelectorAll('input[name="leaders-answer"]');

    Array.prototype.forEach.call(radios, function (radio) {
      radio.addEventListener('change', function () {
        next.disabled = false;
      });
    });

    if (back) {
      back.addEventListener('click', function () {
        if (self.index > 0) {
          self.index -= 1;
          self.renderQuestion();
        }
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var checked = self.app.querySelector('input[name="leaders-answer"]:checked');
      if (!checked) return;
      self.answers[self.index] = question.options[Number(checked.value)];
      if (self.index < self.questions.length - 1) {
        self.index += 1;
        self.renderQuestion();
      } else {
        var values = self.answers.map(function (answer) {
          return answer ? answer.value : null;
        });
        var scored = scoreQuiz(values, self.data);
        if (!scored.complete) return;
        self.showResults(scored);
      }
    });

    if (shouldFocus !== false) this.focusQuestion(true);
  };

  Quiz.prototype.showResults = function (scored) {
    var self = this;
    this.app.innerHTML = resultHtml(scored.results);

    this.app.querySelector('[data-leaders-retake]').addEventListener('click', function () {
      self.start();
    });

    var heading = this.app.querySelector('.result-profile');
    if (heading) {
      heading.focus({ preventScroll: true });
      this.app.scrollIntoView({ behavior: motionBehavior(), block: 'start' });
    }
  };

  function fieldValue(field) {
    return (field.value || '').trim() || 'Not filled in';
  }

  function buildChecklistText(form) {
    var lines = ['Institutional checklist', ''];

    Array.prototype.forEach.call(form.querySelectorAll('[data-checklist-row]'), function (row) {
      var practice = row.querySelector('th');
      lines.push((practice ? practice.textContent.trim().replace(/\s+/g, ' ') : 'Practice') + ':');
      Array.prototype.forEach.call(row.querySelectorAll('[data-checklist-field]'), function (field) {
        lines.push('  ' + field.getAttribute('data-checklist-label') + ': ' + fieldValue(field));
      });
      lines.push('');
    });

    Array.prototype.forEach.call(form.querySelectorAll('[data-checklist-note]'), function (note) {
      lines.push(note.getAttribute('data-checklist-label') + ' ' + fieldValue(note));
    });

    return lines.join('\n').trim();
  }

  function setStatus(form, selector, message) {
    var status = form.querySelector(selector);
    if (status) status.textContent = message;
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

  function printing(className) {
    document.body.classList.add(className);
    window.print();
    window.setTimeout(function () {
      document.body.classList.remove(className);
    }, 800);
  }

  function setupChecklist() {
    var form = document.querySelector('[data-leaders-checklist]');
    if (!form) return;

    var copy = form.querySelector('[data-checklist-copy]');
    var email = form.querySelector('[data-checklist-email]');
    var print = form.querySelector('[data-checklist-print]');

    if (copy) {
      copy.addEventListener('click', function () {
        copyText(
          buildChecklistText(form),
          function () { setStatus(form, '[data-checklist-status]', 'Checklist copied.'); },
          function () { setStatus(form, '[data-checklist-status]', 'Could not copy automatically. Select the form and copy it.'); }
        );
      });
    }

    if (email) {
      email.addEventListener('click', function () {
        window.location.href = 'mailto:?subject=' + encodeURIComponent('Institutional checklist') +
          '&body=' + encodeURIComponent(buildChecklistText(form));
        setStatus(form, '[data-checklist-status]', 'If your email app does not open, use Copy instead.');
      });
    }

    if (print) {
      print.addEventListener('click', function () {
        printing('printing-leaders-checklist');
      });
    }
  }

  function setupBoard() {
    var button = document.querySelector('[data-board-print]');
    if (!button) return;
    var status = document.querySelector('[data-board-status]');
    button.addEventListener('click', function () {
      if (status) status.textContent = 'Opening the print dialog.';
      printing('printing-leaders-board');
    });
    window.addEventListener('afterprint', function () {
      document.body.classList.remove('printing-leaders-checklist', 'printing-leaders-board');
    });
  }

  function init() {
    if (initialized) return;
    var data = root.WCIRF_LEADERS;
    if (!data) {
      if (root.console) root.console.warn('[WCIRF] College Leaders data was not loaded.');
      return;
    }
    initialized = true;

    setupChecklist();
    setupBoard();

    var app = document.querySelector('[data-leaders-quiz]');
    if (app) {
      var quiz = new Quiz(app, data);
      quiz.start();
    }
  }

  return {
    init: init,
    scoreQuiz: scoreQuiz,
    shuffle: shuffle,
    buildChecklistText: buildChecklistText
  };
});
