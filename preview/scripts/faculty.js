(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(root);
  } else {
    var api = factory(root);
    root.WCIRFFaculty = api;
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
    var total = 0;

    (values || []).forEach(function (value) {
      if (value !== 0 && value !== 1 && value !== 2) valid = false;
      else total += value;
    });

    var result = null;
    if (valid && data && data.quiz && Array.isArray(data.quiz.results)) {
      result = data.quiz.results.filter(function (item) {
        return total >= item.min && total <= item.max;
      })[0] || null;
    }

    return {
      values: (values || []).slice(),
      total: valid ? total : null,
      result: result,
      complete: valid && !!result
    };
  }

  function list(items, className) {
    return '<ul class="' + (className || 'quiz-list') + '">' + items.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('') + '</ul>';
  }

  function resultHtml(result) {
    var copyText = result.heading + '\n\nEssential questions:\n' + result.questions.map(function (question) {
      return '- ' + question;
    }).join('\n');
    var html = '<div class="faculty-result">';
    html += '<p class="quiz-step">Your result</p>';
    html += '<h3 class="result-profile" tabindex="-1">' + escapeHtml(result.heading) + '</h3>';
    html += '<p class="result-description">' + escapeHtml(result.lead) + '</p>';
    html += '<h4>Essential questions</h4>' + list(result.questions);
    html += '<div class="result-try"><strong>This term.</strong><p>' + escapeHtml(result.term) + '</p></div>';
    if (result.case) {
      html += '<div class="result-case"><strong>Making the case.</strong> ' + escapeHtml(result.case) + '</div>';
    }
    html += HONESTY;
    html += '<div class="result-copy-source" hidden>' + escapeHtml(copyText) + '</div>';
    html += '<div class="result-tools">' +
      '<button class="btn btn-outline" type="button" data-result-copy>Copy my questions</button>' +
      '<button class="btn btn-outline" type="button" data-result-email>Email this to me</button>' +
      '<span class="result-tool-status" role="status" aria-live="polite"></span>' +
      '</div>';
    html += '<div class="quiz-actions">' +
      '<button class="btn btn-outline" type="button" data-faculty-retake>Take the check again</button>' +
      '<a class="btn btn-primary" href="#faculty-practices">See the five practice cards</a>' +
      '</div></div>';
    return html;
  }

  function Quiz(app, data) {
    this.app = app;
    this.data = data;
    this.questions = [];
    this.answers = [];
    this.optionalSelections = [];
    this.contexts = [];
    this.index = 0;
    this.phase = 'questions';
  }

  Quiz.prototype.start = function () {
    this.questions = this.data.quiz.questions.map(function (question) {
      return {
        id: question.id,
        practice: question.practice,
        text: question.text,
        options: shuffle(question.options)
      };
    });
    this.answers = [];
    this.optionalSelections = [];
    this.contexts = [];
    this.index = 0;
    this.phase = 'questions';
    resetPracticeCards();
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
        '<input type="radio" name="faculty-answer" value="' + index + '"' + (index === selectedIndex ? ' checked' : '') + '>' +
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
      (this.index > 0 ? '<button class="btn btn-outline" type="button" data-faculty-back>Back</button>' : '<span></span>') +
      '<button class="btn btn-primary" type="submit" data-faculty-next' + (selectedIndex === -1 ? ' disabled' : '') + '>' + (this.index === this.questions.length - 1 ? 'Continue' : 'Next question') + '</button>' +
      '</div></form>';

    var form = this.app.querySelector('form');
    var next = this.app.querySelector('[data-faculty-next]');
    var back = this.app.querySelector('[data-faculty-back]');
    var radios = this.app.querySelectorAll('input[name="faculty-answer"]');

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
      var checked = self.app.querySelector('input[name="faculty-answer"]:checked');
      if (!checked) return;
      self.answers[self.index] = question.options[Number(checked.value)];
      if (self.index < self.questions.length - 1) {
        self.index += 1;
        self.renderQuestion();
      } else {
        self.renderOptional();
      }
    });

    if (shouldFocus !== false) this.focusQuestion(true);
  };

  Quiz.prototype.renderOptional = function () {
    var self = this;
    var optional = this.data.quiz.optional;
    var choices = optional.options.map(function (option, index) {
      return '<label class="quiz-choice quiz-choice-check">' +
        '<input type="checkbox" name="faculty-optional" value="' + index + '"' + (self.optionalSelections.indexOf(index) !== -1 ? ' checked' : '') + '>' +
        '<span>' + escapeHtml(option.text) + '</span>' +
        '</label>';
    }).join('');

    this.phase = 'optional';
    this.app.innerHTML =
      '<div class="quiz-step">One optional question</div>' +
      '<progress class="quiz-progress" value="' + this.questions.length + '" max="' + (this.questions.length + 1) + '" aria-label="Quiz progress">Optional</progress>' +
      '<h3 class="quiz-question" tabindex="-1">' + escapeHtml(optional.text) + '</h3>' +
      '<p class="quiz-instruction">Pick the answer that is true for you, even if it is not the one you think you should pick.</p>' +
      '<form class="quiz-form">' +
      '<fieldset><legend class="visually-hidden">' + escapeHtml(optional.text) + '</legend>' +
      '<div class="quiz-choice-list">' + choices + '</div>' +
      '</fieldset>' +
      '<div class="quiz-nav">' +
      '<button class="btn btn-outline" type="button" data-faculty-back>Back</button>' +
      '<button class="btn btn-primary" type="submit">See my result</button>' +
      '</div></form>';

    var boxes = this.app.querySelectorAll('input[name="faculty-optional"]');

    Array.prototype.forEach.call(boxes, function (box) {
      box.addEventListener('change', function () {
        self.optionalSelections = [];
        Array.prototype.forEach.call(boxes, function (other) {
          if (other.checked) self.optionalSelections.push(Number(other.value));
        });
      });
    });

    this.app.querySelector('[data-faculty-back]').addEventListener('click', function () {
      self.index = self.questions.length - 1;
      self.renderQuestion();
    });

    this.app.querySelector('form').addEventListener('submit', function (event) {
      event.preventDefault();
      var values = self.answers.map(function (answer) {
        return answer ? answer.value : null;
      });
      var scored = scoreQuiz(values, self.data);
      if (!scored.complete) return;
      self.contexts = self.optionalSelections.map(function (index) {
        return optional.options[index] ? optional.options[index].context : '';
      }).filter(Boolean);
      self.showResults(scored);
    });

    this.focusQuestion(true);
  };

  Quiz.prototype.showResults = function (scored) {
    var self = this;
    var result = scored.result;
    if (!result) return;

    this.phase = 'results';
    this.app.innerHTML = resultHtml(result);

    var values = scored.values;
    var scores = {};
    this.questions.forEach(function (question, index) {
      scores[question.practice] = values[index];
    });
    sortPracticeCards(scores);
    setupPracticeCards(this.contexts);

    this.app.querySelector('[data-faculty-retake]').addEventListener('click', function () {
      self.start();
    });

    var heading = this.app.querySelector('.result-profile');
    if (heading) {
      heading.focus({ preventScroll: true });
      this.app.scrollIntoView({ behavior: motionBehavior(), block: 'start' });
    }
  };

  var cardOrder = [];

  function captureCardOrder() {
    var grid = document.querySelector('[data-faculty-practices]');
    if (!grid) return;
    if (!cardOrder.length) {
      cardOrder = Array.prototype.slice.call(grid.querySelectorAll('[data-faculty-card]'));
    }
  }

  function setupPracticeCards(contexts) {
    contexts = contexts || [];
    Array.prototype.forEach.call(document.querySelectorAll('[data-faculty-card]'), function (card) {
      var source = card.querySelector('[data-faculty-variants]');
      if (!card.facultyVariants) {
        card.facultyVariants = Array.prototype.map.call(
          source.querySelectorAll('[data-faculty-variant], [data-variant]'),
          function (variant) { return variant.cloneNode(true); }
        );
        source.hidden = true;
        source.innerHTML = '';
      }

      var kind = card.getAttribute('data-faculty-kind');
      var selected;
      if (kind === 'teaching') {
        selected = ['small', 'large', 'work', 'adjunct'].filter(function (key) {
          return contexts.indexOf(key) !== -1;
        })[0] || 'small';
      } else {
        selected = contexts.indexOf('stem') !== -1 ? 'stem' :
          contexts.indexOf('professional') !== -1 ? 'professional' : 'humanities';
      }

      var primary = card.querySelector('[data-faculty-primary]');
      var otherBody = card.querySelector('[data-faculty-other-body]');
      var other = card.querySelector('[data-faculty-other]');
      primary.innerHTML = '';
      otherBody.innerHTML = '';

      card.facultyVariants.forEach(function (template) {
        var variant = template.cloneNode(true);
        if (variant.getAttribute('data-variant') === selected) primary.appendChild(variant);
        else otherBody.appendChild(variant);
      });
      if (other) {
        other.hidden = otherBody.children.length === 0;
        other.open = false;
      }
    });
  }

  function resetPracticeCards() {
    captureCardOrder();
    var grid = document.querySelector('[data-faculty-practices]');
    if (!grid) return;
    cardOrder.forEach(function (card) {
      grid.appendChild(card);
      card.open = false;
    });
    setupPracticeCards([]);
  }

  function sortPracticeCards(scores) {
    var grid = document.querySelector('[data-faculty-practices]');
    if (!grid) return;
    captureCardOrder();
    var sorted = cardOrder.slice().sort(function (a, b) {
      var aScore = scores[a.getAttribute('data-faculty-card')] || 0;
      var bScore = scores[b.getAttribute('data-faculty-card')] || 0;
      return aScore - bScore || cardOrder.indexOf(a) - cardOrder.indexOf(b);
    });
    sorted.forEach(function (card, index) {
      grid.appendChild(card);
      card.open = index === 0;
    });
  }

  function fieldValue(field) {
    return (field.value || '').trim() || 'Not filled in';
  }

  function buildAuditText(form) {
    var lines = ['Course self-audit', ''];
    Array.prototype.forEach.call(form.querySelectorAll('[data-audit-field]'), function (field) {
      var group = field.closest('[data-audit-group]');
      var legend = group ? group.querySelector('legend') : null;
      var prefix = legend ? legend.textContent.trim().replace(/\s+/g, ' ') + ' — ' : '';
      lines.push(prefix + (field.getAttribute('data-audit-label') || 'Field') + ': ' + fieldValue(field));
    });
    return lines.join('\n');
  }

  function setAuditStatus(form, message) {
    var status = form.querySelector('[data-audit-status]');
    if (status) status.textContent = message;
  }

  function setupAudit() {
    var form = document.querySelector('[data-faculty-audit]');
    if (!form) return;

    var copy = form.querySelector('[data-audit-copy]');
    var email = form.querySelector('[data-audit-email]');
    var print = form.querySelector('[data-audit-print]');

    if (copy) {
      copy.addEventListener('click', function () {
        var text = buildAuditText(form);
        var fallback = function () {
          var area = document.createElement('textarea');
          area.className = 'clipboard-fallback';
          area.value = text;
          document.body.appendChild(area);
          area.select();
          var ok = false;
          try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
          document.body.removeChild(area);
          setAuditStatus(form, ok ? 'Audit copied.' : 'Could not copy automatically. Select the form and copy it.');
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            setAuditStatus(form, 'Audit copied.');
          }).catch(fallback);
        } else {
          fallback();
        }
      });
    }

    if (email) {
      email.addEventListener('click', function () {
        window.location.href = 'mailto:?subject=' + encodeURIComponent('My course self-audit') +
          '&body=' + encodeURIComponent(buildAuditText(form));
        setAuditStatus(form, 'If your email app does not open, use Copy instead.');
      });
    }

    if (print) {
      print.addEventListener('click', function () {
        document.body.classList.add('printing-faculty-audit');
        window.print();
        window.setTimeout(function () {
          document.body.classList.remove('printing-faculty-audit');
        }, 800);
      });
    }

    window.addEventListener('afterprint', function () {
      document.body.classList.remove('printing-faculty-audit');
    });
  }

  function init() {
    if (initialized) return;
    var data = root.WCIRF_FACULTY;
    if (!data) {
      if (root.console) root.console.warn('[WCIRF] Faculty data was not loaded.');
      return;
    }
    initialized = true;

    captureCardOrder();
    setupPracticeCards([]);
    setupAudit();

    var app = document.querySelector('[data-faculty-quiz]');
    if (app) {
      var quiz = new Quiz(app, data);
      quiz.start();
    }
  }

  return {
    init: init,
    scoreQuiz: scoreQuiz,
    shuffle: shuffle
  };
});
