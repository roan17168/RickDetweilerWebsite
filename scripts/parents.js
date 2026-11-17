(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(root);
  } else {
    var api = factory(root);
    root.WCIRFParents = api;
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

  var OUTCOMES = ['Security', 'Growth', 'Purpose'];
  var HONESTY = '<p class="quiz-honesty">This study looked at graduates&rsquo; adult lives and the college experiences linked to life outcomes. The results held for graduates of all types of colleges, big and small, private and public, prestigious and not, and they are supported by many other research studies. <a href="the-research.html">The Research page</a> explains what the study can and cannot show.</p>';
  var initialized = false;


  var RESULT_STORAGE = 'wcirf_parents_result_v1';

  function readStored() {
    try {
      var raw = root.localStorage ? root.localStorage.getItem(RESULT_STORAGE) : null;
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeStored(outcome) {
    try {
      if (root.localStorage) root.localStorage.setItem(RESULT_STORAGE, JSON.stringify({ outcome: outcome }));
    } catch (error) {
      return false;
    }
    return true;
  }

  function removeStored() {
    try {
      if (root.localStorage) root.localStorage.removeItem(RESULT_STORAGE);
    } catch (error) {
      // Nothing else to do.
    }
  }

  /* A shared link carries only the result name: #result=Growth. */
  function sharedOutcome() {
    try {
      var hash = String(root.location ? root.location.hash : '').replace(/^#/, '');
      var found = null;
      hash.split('&').forEach(function (part) {
        var pieces = part.split('=');
        if (pieces[0] === 'result') found = decodeURIComponent(pieces[1] || '');
      });
      return found && OUTCOMES.indexOf(found) !== -1 ? found : null;
    } catch (error) {
      return null;
    }
  }

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

  function scoreQuiz(answers) {
    var counts = {};
    var valid = Array.isArray(answers) && answers.length === 5;

    OUTCOMES.forEach(function (outcome) {
      counts[outcome] = 0;
    });

    (answers || []).forEach(function (answer, index) {
      if (answer === null) {
        if (index !== 3) valid = false;
        return;
      }
      if (Object.prototype.hasOwnProperty.call(counts, answer)) {
        counts[answer] += 1;
      } else {
        valid = false;
      }
    });

    var max = 0;
    OUTCOMES.forEach(function (outcome) {
      if (counts[outcome] > max) max = counts[outcome];
    });

    var top = max === 0 || !valid ? [] : OUTCOMES.filter(function (outcome) {
      return counts[outcome] === max;
    });

    return {
      counts: counts,
      top: top,
      result: valid ? top : [],
      tie: top.length > 1,
      complete: valid && top.length > 0
    };
  }

  function findResult(data, key) {
    return data.quiz.results.filter(function (result) {
      return result.key === key;
    })[0];
  }

  function list(items, className) {
    return '<ul class="' + (className || 'quiz-list') + '">' + items.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('') + '</ul>';
  }

  function panelHtml(data, panelKey) {
    var panel = data.quiz.panels[panelKey];
    if (!panel) return '';
    return '<div class="result-panel">' +
      '<h4>' + escapeHtml(panel.title) + '</h4>' +
      '<p>' + escapeHtml(panel.body) + '</p>' +
      '</div>';
  }

  function resultHtml(result) {
    var html = '<article class="choosing-result parents-result">';
    html += '<h3 class="result-profile" tabindex="-1">' + escapeHtml(result.heading) + '</h3>';
    html += '<p class="result-description">' + escapeHtml(result.lead) + '</p>';
    html += '<div class="result-research"><h4>What the research says to you.</h4><p>' + escapeHtml(result.research) + '</p>';
    if (result.researchNote) html += '<p>' + escapeHtml(result.researchNote) + '</p>';
    html += '</div>';
    html += '<p class="result-measured"><strong>How this was measured:</strong> ' + escapeHtml(result.measured) + '</p>';
    html += '<h4>Ask the college</h4>' + list(result.ask);
    html += '<h4>Questions to leave with your child</h4>' + list(result.child);
    html += '<details class="pullout result-reference"><summary>Other research agrees.</summary><div class="pullout-body"><p>' + escapeHtml(result.other) + '</p></div></details>';
    html += '<div class="result-try"><strong>Try this one thing.</strong><p>' + escapeHtml(result.try) + '</p></div>';
    html += '</article>';
    return html;
  }

  function Quiz(app, data) {
    this.app = app;
    this.data = data;
    this.questions = [];
    this.answers = [];
    this.optionalSelections = [];
    this.index = 0;
    this.phase = 'questions';
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
    this.optionalSelections = [];
    this.index = 0;
    this.phase = 'questions';
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
        '<input type="radio" name="parents-answer" value="' + index + '"' + (index === selectedIndex ? ' checked' : '') + '>' +
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
      (this.index > 0 ? '<button class="btn btn-outline" type="button" data-parents-back>Back</button>' : '<span></span>') +
      '<button class="btn btn-primary" type="submit" data-parents-next' + (selectedIndex === -1 ? ' disabled' : '') + '>' + (this.index === this.questions.length - 1 ? 'Continue' : 'Next question') + '</button>' +
      '</div></form>';

    var form = this.app.querySelector('form');
    var next = this.app.querySelector('[data-parents-next]');
    var back = this.app.querySelector('[data-parents-back]');
    var radios = this.app.querySelectorAll('input[name="parents-answer"]');

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
      var checked = self.app.querySelector('input[name="parents-answer"]:checked');
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
        '<input type="checkbox" name="parents-optional" value="' + index + '"' + (self.optionalSelections.indexOf(index) !== -1 ? ' checked' : '') + '>' +
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
      '<button class="btn btn-outline" type="button" data-parents-back>Back</button>' +
      '<button class="btn btn-primary" type="submit">See my result</button>' +
      '</div></form>';

    var boxes = this.app.querySelectorAll('input[name="parents-optional"]');

    Array.prototype.forEach.call(boxes, function (box) {
      box.addEventListener('change', function () {
        self.optionalSelections = [];
        Array.prototype.forEach.call(boxes, function (other) {
          if (other.checked) self.optionalSelections.push(Number(other.value));
        });
      });
    });

    this.app.querySelector('[data-parents-back]').addEventListener('click', function () {
      self.index = self.questions.length - 1;
      self.renderQuestion();
    });

    this.app.querySelector('form').addEventListener('submit', function (event) {
      event.preventDefault();
      var outcomeAnswers = self.answers.map(function (answer, index) {
        if (index === 3) return null;
        return answer ? answer.outcome : null;
      });
      var scored = scoreQuiz(outcomeAnswers);
      if (!scored.complete) return;
      self.showResults(scored);
    });

    this.focusQuestion(true);
  };

  Quiz.prototype.panelsHtml = function () {
    var self = this;
    var keys = [];

    this.answers.forEach(function (answer) {
      if (answer && answer.panel && keys.indexOf(answer.panel) === -1) keys.push(answer.panel);
    });

    this.optionalSelections.forEach(function (selection) {
      var option = self.data.quiz.optional.options[selection];
      if (option && option.panel && keys.indexOf(option.panel) === -1) keys.push(option.panel);
    });

    return keys.map(function (key) {
      return panelHtml(self.data, key);
    }).join('');
  };

  Quiz.prototype.showResults = function (scored) {
    var self = this;
    var wanted = String(scored.result || '').split('|');
    var results = wanted.map(function (key) {
      return findResult(self.data, key);
    }).filter(Boolean);

    if (!results.length) return;
    this.phase = 'results';
    writeStored(scored.result.join('|'));

    var panels = this.panelsHtml();
    var tieNote = results.length > 1 ?
      '<p class="quiz-tie-note">Your answers split evenly. Both results are below.</p>' : '';

    var copyText = results.map(function (result) {
      return result.heading + '\n\nAsk the college:\n' + result.ask.map(function (question) {
        return '- ' + question;
      }).join('\n') + '\n\nQuestions to leave with your child:\n' + result.child.map(function (question) {
        return '- ' + question;
      }).join('\n');
    }).join('\n\n');

    this.app.innerHTML =
      '<div class="quiz-results">' +
      '<p class="quiz-step">Your result</p>' +
      tieNote +
      (panels ? '<div class="result-panels">' + panels + '</div>' : '') +
      '<div class="result-stack">' + results.map(resultHtml).join('') + '</div>' +
      HONESTY +
      '<div class="result-copy-source" hidden>' + escapeHtml(copyText) + '</div>' +
      '<div class="result-tools">' +
      '<button class="btn btn-outline" type="button" data-result-copy>Copy my questions</button>' +
      '<button class="btn btn-outline" type="button" data-result-email>Email this to me</button>' +
      '<button class="btn btn-outline" type="button" data-result-share data-result-share-key="wcirf_parents_result_v1">Share my result</button>' +
      '<span class="result-tool-status" role="status" aria-live="polite"></span>' +
      '</div>' +
      '<div class="quiz-actions">' +
      '<button class="btn btn-outline" type="button" data-parents-retake>Take the quiz again</button>' +
      '<a class="btn btn-primary" href="tools/college-scorecard.html">Open the scorecard</a>' +
      '</div></div>';

    this.app.querySelector('[data-parents-retake]').addEventListener('click', function () {
      removeStored();
      try {
        window.history.replaceState(null, '', String(window.location.href).split('#')[0] + '#quiz');
      } catch (error) {
        // The quiz still restarts for this page view.
      }
      self.start();
    });

    var firstResult = this.app.querySelector('.result-profile');
    if (firstResult) {
      firstResult.focus({ preventScroll: true });
      this.app.scrollIntoView({ behavior: motionBehavior(), block: 'start' });
    }
  };

  function init() {
    if (initialized) return;
    var data = root.WCIRF_PARENTS;
    if (!data) {
      if (root.console) root.console.warn('[WCIRF] Parents data was not loaded.');
      return;
    }
    initialized = true;

    var quizApp = document.querySelector('[data-parents-quiz]');
    if (quizApp) {
      var quiz = new Quiz(quizApp, data);
      var shared = sharedOutcome();
      var stored = readStored();
      /* A shared link wins over a stored result; either reopens the result without answers. */
      var reopen = shared || (stored && stored.outcome ? stored.outcome : null);
      if (reopen && findResult(data, String(reopen).split('|')[0])) {
        quiz.showResults({ result: String(reopen).split('|') });
      } else {
        quiz.start();
      }
    }

    if (root.matchMedia) {
      var parentMobile = root.matchMedia('(max-width: 760px)');
      var syncParentDisclosures = function () {
        Array.prototype.forEach.call(document.querySelectorAll('[data-parent-more]'), function (details) {
          details.open = !parentMobile.matches;
        });
      };
      syncParentDisclosures();
      if (parentMobile.addEventListener) parentMobile.addEventListener('change', syncParentDisclosures);
      else if (parentMobile.addListener) parentMobile.addListener(syncParentDisclosures);
    }
  }

  return {
    init: init,
    scoreQuiz: scoreQuiz,
    shuffle: shuffle,
    OUTCOMES: OUTCOMES
  };
});
