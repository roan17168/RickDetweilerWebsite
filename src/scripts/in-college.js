(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(root);
  } else {
    var api = factory(root);
    root.WCIRFInCollege = api;
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

  var PLAN_STORAGE = 'wcirf_in_college_plan_v1';
  var initialized = false;
  var practiceInitialized = false;
  var practiceList = null;
  var practiceOriginalOrder = [];
  var practiceOriginalVariants = [];

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

  function readStored(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStored(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function removeStored(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // The form still works for this session when storage is unavailable.
    }
  }

  function scoreQuiz(answers, data) {
    var questions = data && data.quiz && data.quiz.questions;
    if (!Array.isArray(questions) || !Array.isArray(answers) || answers.length !== questions.length) {
      return { total: null, result: null, scores: [], complete: false };
    }

    var scores = [];
    var valid = true;
    answers.forEach(function (answer) {
      var score = Number(answer);
      if (score !== 0 && score !== 1 && score !== 2) valid = false;
      scores.push(score);
    });
    if (!valid) return { total: null, result: null, scores: [], complete: false };

    var total = scores.reduce(function (sum, score) { return sum + score; }, 0);
    var result = (data.quiz.results || []).find(function (band) {
      return total >= band.min && total <= band.max;
    }) || null;

    return {
      total: total,
      result: result,
      scores: scores,
      complete: Boolean(result)
    };
  }

  function initPractices() {
    if (practiceInitialized) return;
    practiceList = document.querySelector('[data-practice-list]');
    if (!practiceList) return;

    practiceOriginalOrder = Array.prototype.slice.call(
      practiceList.querySelectorAll('[data-practice-key]')
    );
    practiceOriginalVariants = practiceOriginalOrder.map(function (card) {
      return Array.prototype.slice.call(card.querySelectorAll('[data-variant]')).map(function (variant) {
        return {
          element: variant,
          parent: variant.parentNode,
          next: variant.nextSibling
        };
      });
    });
    practiceInitialized = true;
  }

  function resetPractices() {
    if (!practiceInitialized) return;

    practiceOriginalOrder.forEach(function (card) {
      card.open = false;
      practiceList.appendChild(card);
    });

    practiceOriginalVariants.forEach(function (group) {
      group.forEach(function (item) {
        item.element.classList.remove('is-priority');
        item.parent.insertBefore(item.element, item.next);
      });
    });

    var hard = document.getElementById('when-college-gets-hard');
    if (hard && hard.getAttribute('data-auto-opened') === 'true') {
      hard.open = false;
      hard.removeAttribute('data-auto-opened');
    }
  }

  function applyPracticeState(scores, priorities, openHard, openCount) {
    if (!practiceInitialized) return;
    resetPractices();

    var data = root.WCIRF_IN_COLLEGE;
    var scoreByCard = {};
    if (data && data.quiz && Array.isArray(data.quiz.questions)) {
      data.quiz.questions.forEach(function (question, index) {
        scoreByCard[question.card] = typeof scores[index] === 'number' ? scores[index] : 0;
      });
    }

    var originalIndex = {};
    practiceOriginalOrder.forEach(function (card, index) {
      originalIndex[card.getAttribute('data-practice-key')] = index;
    });

    var sorted = practiceOriginalOrder.slice().sort(function (a, b) {
      var aKey = a.getAttribute('data-practice-key');
      var bKey = b.getAttribute('data-practice-key');
      var difference = (scoreByCard[aKey] || 0) - (scoreByCard[bKey] || 0);
      return difference || (originalIndex[aKey] - originalIndex[bKey]);
    });

    sorted.forEach(function (card) {
      card.open = false;
      practiceList.appendChild(card);
    });

    var count = Math.max(0, Math.min(Number(openCount) || 1, sorted.length));
    sorted.slice(0, count).forEach(function (card) {
      card.open = true;
    });

    var priorityKeys = Array.isArray(priorities) ? priorities : [];
    sorted.forEach(function (card) {
      var body = card.querySelector('.practice-card-body');
      var start = body ? body.querySelector('.practice-start') : null;
      if (!body || !start) return;

      var variants = Array.prototype.slice.call(body.querySelectorAll('[data-variant]'));
      variants.forEach(function (variant) { variant.classList.remove('is-priority'); });

      var selected = [];
      priorityKeys.forEach(function (key) {
        var match = variants.find(function (variant) {
          return variant.getAttribute('data-variant') === key;
        });
        if (match && selected.indexOf(match) === -1) selected.push(match);
      });

      if (!selected.length) return;

      var others = variants.filter(function (variant) {
        return selected.indexOf(variant) === -1;
      });
      var marker = document.createComment('');
      body.insertBefore(marker, start.nextSibling);
      selected.concat(others).forEach(function (variant) {
        body.insertBefore(variant, marker);
      });
      body.removeChild(marker);
      selected.forEach(function (variant) {
        variant.classList.add('is-priority');
      });
    });

    if (openHard) {
      var hard = document.getElementById('when-college-gets-hard');
      if (hard) {
        hard.open = true;
        hard.setAttribute('data-auto-opened', 'true');
      }
    }
  }

  function Quiz(app, data) {
    this.app = app;
    this.data = data;
    this.questions = [];
    this.answers = [];
    this.optionalSelections = [];
    this.optionalPriorities = [];
    this.openHard = false;
    this.index = 0;
    this.phase = 'questions';
  }

  Quiz.prototype.start = function () {
    this.questions = this.data.quiz.questions.map(function (question) {
      return {
        id: question.id,
        card: question.card,
        text: question.text,
        options: shuffle(question.options)
      };
    });
    this.answers = [];
    this.optionalSelections = [];
    this.optionalPriorities = [];
    this.openHard = false;
    this.index = 0;
    this.phase = 'questions';
    resetPractices();
    this.renderQuestion(false);
  };

  Quiz.prototype.stepLabel = function () {
    return 'Question ' + (this.index + 1) + ' of ' + this.questions.length;
  };

  Quiz.prototype.focusQuestion = function (shouldScroll) {
    var heading = this.app.querySelector('.quiz-question');
    if (!heading) return;
    heading.focus({ preventScroll: true });
    if (shouldScroll) this.app.scrollIntoView({ behavior: motionBehavior(), block: 'start' });
  };

  Quiz.prototype.renderQuestion = function (shouldFocus) {
    var question = this.questions[this.index];
    var previous = this.answers[this.index];
    var self = this;
    var selectedIndex = -1;

    if (typeof previous === 'number') {
      question.options.some(function (option, index) {
        if (option.score === previous) {
          selectedIndex = index;
          return true;
        }
        return false;
      });
    }

    var choices = question.options.map(function (option, index) {
      return '<label class="quiz-choice">' +
        '<input type="radio" name="check-answer" value="' + index + '"' + (index === selectedIndex ? ' checked' : '') + '>' +
        '<span>' + escapeHtml(option.text) + '</span>' +
        '</label>';
    }).join('');

    this.app.innerHTML =
      '<div class="quiz-step">' + this.stepLabel() + '</div>' +
      '<progress class="quiz-progress" value="' + (this.index + 1) + '" max="' + this.questions.length + '" aria-label="Check progress">' + (this.index + 1) + ' of ' + this.questions.length + '</progress>' +
      '<h3 class="quiz-question" tabindex="-1">' + escapeHtml(question.text) + '</h3>' +
      '<p class="quiz-instruction">Pick the answer that is true for you, even if it is not the one you think you should pick.</p>' +
      '<form class="quiz-form">' +
      '<fieldset><legend class="visually-hidden">' + escapeHtml(question.text) + '</legend>' +
      '<div class="quiz-choice-list">' + choices + '</div>' +
      '</fieldset>' +
      '<div class="quiz-nav">' +
      (this.index > 0 ? '<button class="btn btn-outline" type="button" data-check-back>Back</button>' : '<span></span>') +
      '<button class="btn btn-primary" type="submit" data-check-next' + (selectedIndex === -1 ? ' disabled' : '') + '>' + (this.index === this.questions.length - 1 ? 'Continue' : 'Next question') + '</button>' +
      '</div></form>';

    var form = this.app.querySelector('form');
    var next = this.app.querySelector('[data-check-next]');
    var back = this.app.querySelector('[data-check-back]');

    Array.prototype.forEach.call(this.app.querySelectorAll('input[name="check-answer"]'), function (radio) {
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
      var checked = self.app.querySelector('input[name="check-answer"]:checked');
      if (!checked) return;
      self.answers[self.index] = question.options[Number(checked.value)].score;
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
        '<input type="checkbox" name="check-optional" value="' + index + '"' + (self.optionalSelections.indexOf(index) !== -1 ? ' checked' : '') + '>' +
        '<span>' + escapeHtml(option.text) + '</span>' +
        '</label>';
    }).join('');

    this.phase = 'optional';
    this.app.innerHTML =
      '<div class="quiz-step">One optional question</div>' +
      '<progress class="quiz-progress" value="' + this.questions.length + '" max="' + (this.questions.length + 1) + '" aria-label="Check progress">Optional</progress>' +
      '<h3 class="quiz-question" tabindex="-1">' + escapeHtml(optional.text) + '</h3>' +
      '<p class="quiz-instruction">Pick the answer that is true for you, even if it is not the one you think you should pick.</p>' +
      '<form class="quiz-form">' +
      '<fieldset><legend class="visually-hidden">' + escapeHtml(optional.text) + '</legend>' +
      '<div class="quiz-choice-list">' + choices + '</div>' +
      '</fieldset>' +
      '<div class="quiz-nav">' +
      '<button class="btn btn-outline" type="button" data-check-back>Back</button>' +
      '<button class="btn btn-primary" type="submit">See my result</button>' +
      '</div></form>';

    var boxes = this.app.querySelectorAll('input[name="check-optional"]');
    Array.prototype.forEach.call(boxes, function (box) {
      box.addEventListener('change', function () {
        self.optionalSelections = [];
        Array.prototype.forEach.call(boxes, function (other) {
          if (other.checked) self.optionalSelections.push(Number(other.value));
        });
      });
    });

    this.app.querySelector('[data-check-back]').addEventListener('click', function () {
      self.index = self.questions.length - 1;
      self.renderQuestion();
    });

    this.app.querySelector('form').addEventListener('submit', function (event) {
      event.preventDefault();
      self.optionalSelections = [];
      self.optionalPriorities = [];
      self.openHard = false;
      Array.prototype.forEach.call(boxes, function (box) {
        if (!box.checked) return;
        var index = Number(box.value);
        self.optionalSelections.push(index);
        var option = optional.options[index];
        (option.priorities || []).forEach(function (priority) {
          if (priority === 'hard') {
            self.openHard = true;
          } else if (self.optionalPriorities.indexOf(priority) === -1) {
            self.optionalPriorities.push(priority);
          }
        });
      });
      self.showResult();
    });

    this.focusQuestion(true);
  };

  Quiz.prototype.showResult = function () {
    var self = this;
    var scored = scoreQuiz(this.answers, this.data);
    if (!scored.complete || !scored.result) return;

    var result = scored.result;
    var action = result.action.replace(/^This semester\.\s*/, '');
    this.phase = 'results';

    var copyText = result.heading + '\n\nQuestions worth asking yourself:\n' + result.questions.map(function (question) {
      return '- ' + question;
    }).join('\n');

    this.app.innerHTML =
      '<div class="in-college-result">' +
      '<p class="quiz-step">Your result</p>' +
      '<h3 class="result-profile" tabindex="-1">' + escapeHtml(result.heading) + '</h3>' +
      '<p class="result-description">' + escapeHtml(result.lead) + '</p>' +
      '<h4>Questions worth asking yourself</h4>' +
      '<ul class="quiz-list">' + result.questions.map(function (question) {
        return '<li>' + escapeHtml(question) + '</li>';
      }).join('') + '</ul>' +
      '<div class="result-try"><p><strong>This semester.</strong> ' + escapeHtml(action) + '</p></div>' +
      HONESTY +
      '<div class="result-copy-source" hidden>' + escapeHtml(copyText) + '</div>' +
      '<div class="result-tools">' +
      '<button class="btn btn-outline" type="button" data-result-copy>Copy my questions</button>' +
      '<button class="btn btn-outline" type="button" data-result-email>Email this to me</button>' +
      '<span class="result-tool-status" role="status" aria-live="polite"></span>' +
      '</div>' +
      '<div class="quiz-actions">' +
      '<button class="btn btn-outline" type="button" data-check-retake>Retake the check</button>' +
      '<a class="btn btn-primary" href="#practices">See the five cards</a>' +
      '</div>' +
      '</div>';

    this.app.querySelector('[data-check-retake]').addEventListener('click', function () {
      self.start();
      self.app.scrollIntoView({ behavior: motionBehavior(), block: 'start' });
      window.setTimeout(function () { self.focusQuestion(false); }, 100);
    });

    applyPracticeState(scored.scores, this.optionalPriorities, this.openHard, result.openCards);

    var heading = this.app.querySelector('.result-profile');
    if (heading) {
      heading.focus({ preventScroll: true });
      this.app.scrollIntoView({ behavior: motionBehavior(), block: 'start' });
    }
  };

  function Plan(form) {
    this.form = form;
    this.fields = Array.prototype.slice.call(form.querySelectorAll('[data-plan-field]'));
    this.status = form.querySelector('[data-plan-status]');
    this.state = {};
    this.load();
    this.bind();
    this.apply();
  }

  Plan.prototype.load = function () {
    var raw = readStored(PLAN_STORAGE);
    if (!raw) return;
    try {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') this.state = parsed;
    } catch (error) {
      this.state = {};
    }
  };

  Plan.prototype.collect = function () {
    var self = this;
    this.fields.forEach(function (field) {
      self.state[field.getAttribute('data-plan-field')] = field.value;
    });
    return this.state;
  };

  Plan.prototype.apply = function () {
    var self = this;
    this.fields.forEach(function (field) {
      var value = self.state[field.getAttribute('data-plan-field')];
      if (typeof value !== 'string') return;
      if (field.tagName === 'SELECT') {
        var exists = Array.prototype.some.call(field.options, function (option) {
          return option.value === value;
        });
        if (exists) field.value = value;
      } else {
        field.value = value;
      }
    });

    if (Object.keys(this.state).some(function (key) {
      return typeof self.state[key] === 'string' && self.state[key].trim();
    })) {
      this.setStatus('Your saved plan loaded.');
    }
  };

  Plan.prototype.bind = function () {
    var self = this;
    this.form.addEventListener('submit', function (event) {
      event.preventDefault();
    });
    this.form.addEventListener('input', function () {
      self.save(false);
    });
    this.form.addEventListener('change', function () {
      self.save(true);
    });
    this.form.addEventListener('click', function (event) {
      self.onClick(event);
    });
    window.addEventListener('afterprint', function () {
      document.body.classList.remove('printing-plan');
    });
  };

  Plan.prototype.save = function (showStatus) {
    var saved = writeStored(PLAN_STORAGE, JSON.stringify(this.collect()));
    if (!showStatus) return;
    this.setStatus(saved ? 'Saved on this device.' : 'This browser could not save your plan.');
  };

  Plan.prototype.setStatus = function (message) {
    if (this.status) this.status.textContent = message;
  };

  Plan.prototype.cardLabel = function (index) {
    var field = this.form.querySelector('[data-plan-field="moves.' + index + '.card"]');
    if (!field || !field.value) return 'Not filled in';
    var option = field.options[field.selectedIndex];
    return option ? option.textContent : 'Not filled in';
  };

  Plan.prototype.value = function (key) {
    var field = this.form.querySelector('[data-plan-field="' + key + '"]');
    if (!field || !field.value.trim()) return 'Not filled in';
    return field.value;
  };

  Plan.prototype.buildText = function () {
    var lines = ['My three moves this semester', ''];
    [0, 1, 2].forEach(function (index) {
      var move = index + 1;
      lines.push('Move ' + move);
      lines.push('Card: ' + this.cardLabel(index));
      lines.push('My choice: ' + this.value('moves.' + index + '.choice'));
      lines.push("First step and the words I'll use: " + this.value('moves.' + index + '.step'));
      lines.push('Date: ' + this.value('moves.' + index + '.date'));
      lines.push("Small version if I'm short on time: " + this.value('moves.' + index + '.small'));
      lines.push('');
    }, this);
    lines.push('Midterm check-in', '');
    [0, 1, 2].forEach(function (index) {
      lines.push('Move ' + (index + 1));
      lines.push('Did it happen? ' + this.value('midterm.' + index + '.happened'));
      lines.push('What got in the way: ' + this.value('midterm.' + index + '.obstacle'));
      lines.push("What I'll change: " + this.value('midterm.' + index + '.change'));
      lines.push('');
    }, this);
    lines.push('End-of-semester look back', '');
    lines.push('Which move made the biggest difference, and why? ' + this.value('lookback.difference'));
    lines.push("Who do I know now that I didn't know at the start of the semester? " + this.value('lookback.people'));
    lines.push('What will my three moves be next semester? ' + this.value('lookback.next'));
    return lines.join('\n');
  };

  Plan.prototype.onClick = function (event) {
    var button = event.target.closest('button');
    if (!button || !this.form.contains(button)) return;

    if (button.hasAttribute('data-plan-copy')) {
      this.copyText();
      return;
    }

    if (button.hasAttribute('data-plan-email')) {
      var text = this.buildText();
      window.location.href = 'mailto:?subject=' + encodeURIComponent('My three moves this semester') + '&body=' + encodeURIComponent(text);
      this.setStatus('If your email app does not open, use Copy instead.');
      return;
    }

    if (button.hasAttribute('data-plan-print')) {
      document.body.classList.add('printing-plan');
      window.print();
      window.setTimeout(function () {
        document.body.classList.remove('printing-plan');
      }, 800);
      return;
    }

    if (button.hasAttribute('data-plan-clear')) {
      if (!window.confirm('Clear the plan saved on this device?')) return;
      removeStored(PLAN_STORAGE);
      this.state = {};
      this.fields.forEach(function (field) { field.value = ''; });
      this.setStatus('Plan cleared.');
    }
  };

  Plan.prototype.copyText = function () {
    var self = this;
    var text = this.buildText();
    var copied = function () {
      self.setStatus('Plan copied.');
    };
    var fallback = function () {
      var area = document.createElement('textarea');
      area.className = 'clipboard-fallback';
      area.value = text;
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (error) {
        ok = false;
      }
      document.body.removeChild(area);
      self.setStatus(ok ? 'Plan copied.' : 'Could not copy automatically. Select the plan fields and copy them.');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(copied).catch(fallback);
    } else {
      fallback();
    }
  };

  function init() {
    if (initialized) return;
    var data = root.WCIRF_IN_COLLEGE;
    if (!data) {
      if (root.console) root.console.warn('[WCIRF] In College data was not loaded.');
      return;
    }
    initialized = true;
    initPractices();
    var quizApp = document.querySelector('[data-check-app]');
    if (quizApp) {
      var quiz = new Quiz(quizApp, data);
      quiz.start();
    }
    var planForm = document.querySelector('[data-plan-form]');
    if (planForm) new Plan(planForm);
  }

  return {
    init: init,
    scoreQuiz: scoreQuiz,
    Quiz: Quiz,
    Plan: Plan
  };
});
