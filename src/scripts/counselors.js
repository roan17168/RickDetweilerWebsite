(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(root);
  } else {
    var api = factory(root);
    root.WCIRFCounselors = api;
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

  var RESULT_STORAGE = 'wcirf_counselors_result_v1';
  var VALUES = ['door-opener', 'matchmaker', 'guide', 'finisher'];
  var initialized = false;

  function readStored(key) {
    try {
      return root.localStorage ? root.localStorage.getItem(key) : null;
    } catch (error) {
      return null;
    }
  }

  function writeStored(key, value) {
    try {
      if (root.localStorage) root.localStorage.setItem(key, value);
    } catch (error) {
      // The quiz still works without storage.
    }
  }

  function removeStored(key) {
    try {
      if (root.localStorage) root.localStorage.removeItem(key);
    } catch (error) {
      // Nothing else to do.
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

  function noteMark(note) {
    return note
      ? '<sup><a class="source-note" href="#note-' + note + '" data-note="note-' + note + '" title="See source">' + note + '</a></sup>'
      : '';
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
    var counts = { 'door-opener': 0, matchmaker: 0, guide: 0, finisher: 0 };

    (values || []).forEach(function (value) {
      if (VALUES.indexOf(value) === -1) valid = false;
      else counts[value] += 1;
    });

    var results = [];
    var tied = false;
    var complete = false;

    if (valid && data && data.quiz && Array.isArray(data.quiz.results)) {
      var maximum = Math.max(counts['door-opener'], counts.matchmaker, counts.guide, counts.finisher);
      results = data.quiz.results.filter(function (item) {
        return counts[item.key] === maximum;
      });
      tied = results.length > 1;
      complete = results.length > 0 && !tied;
    }

    return {
      values: (values || []).slice(),
      counts: counts,
      results: results,
      tied: tied,
      complete: complete
    };
  }

  function resolveTie(scored, tieValue, data) {
    var counts = scored.counts;
    counts[tieValue] += 1;
    var maximum = Math.max(counts['door-opener'], counts.matchmaker, counts.guide, counts.finisher);
    var results = data.quiz.results.filter(function (item) {
      return counts[item.key] === maximum;
    });
    return results[0];
  }

  function findResult(data, key) {
    return data.quiz.results.filter(function (item) {
      return item.key === key;
    })[0] || null;
  }

  function list(items, className) {
    return '<ul class="' + (className || 'quiz-list') + '">' + items.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('') + '</ul>';
  }

  function resultHtml(result, advice, data) {
    var copyText = result.heading + '\n\nQuestions to use with students:\n' + result.questions.map(function (question) {
      return '- ' + question;
    }).join('\n');
    var html = '<div class="counselors-result">';
    html += '<p class="quiz-step">Your result</p>';
    html += '<h3 class="result-profile" tabindex="-1">' + result.heading + '</h3>';
    html += '<p class="result-description">' + result.lead + '</p>';
    html += '<h4>What graduates&rsquo; lives tell us</h4>';
    html += '<p>' + result.research + noteMark(result.researchNote) + '</p>';
    if (result.researchAfter) {
      html += '<p>' + result.researchAfter + noteMark(result.researchAfterNote) + '</p>';
    }
    if (result.researchLast) {
      html += '<p>' + result.researchLast + '</p>';
    }
    if (result.seeAll) {
      html += '<p><a href="what-matters.html">See all the findings: What Matters in College</a>' + (result.afterSeeAll ? ' ' + escapeHtml(result.afterSeeAll) : '') + '</p>';
    }
    html += '<h4>Questions to use with students</h4>' + list(result.questions);
    html += '<div class="result-try"><strong>Try this one thing.</strong><p>' + result.tryThis + (result.term ? ' <span class="term-note">[Term: ' + escapeHtml(result.term.definition) + ']</span>' : '') + '</p></div>';
    html += '<p class="counselors-result-kit"><strong>In the counselor kit:</strong> ' + result.kit + '</p>';
    if (result.deepDive) {
      html += '<details class="counselors-deep"><summary>The research behind this</summary><p>' + result.deepDive + noteMark(result.deepDiveNote) + '</p></details>';
    }
    if (advice && advice.length) {
      advice.forEach(function (item) {
        html += '<div class="counselors-advice"><h4>' + item.heading + '</h4><p>' + item.text + noteMark(item.note) + '</p></div>';
      });
    }
    html += HONESTY;
    html += '<div class="result-copy-source" hidden>' + escapeHtml(copyText) + '</div>';
    html += '<div class="result-tools">' +
      '<button class="btn btn-outline" type="button" data-result-copy>Copy my questions</button>' +
      '<button class="btn btn-outline" type="button" data-result-email>Email this to me</button>' +
      '<button class="btn btn-outline" type="button" data-counselors-share>Share my result</button>' +
      '<span class="result-tool-status" role="status" aria-live="polite"></span>' +
      '</div>';
    html += '<div class="quiz-actions">' +
      '<a class="btn btn-primary" href="#study">See the recommendations</a>' +
      '<button class="quiz-retake-link" type="button" data-counselors-retake>Retake the quiz</button>' +
      '</div></div>';
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
        '<input type="radio" name="counselors-answer" value="' + index + '"' + (index === selectedIndex ? ' checked' : '') + '>' +
        '<span>' + escapeHtml(option.text) + '</span>' +
        '</label>';
    }).join('');

    this.app.innerHTML =
      '<div class="quiz-step">' + this.stepLabel() + '</div>' +
      '<progress class="quiz-progress" value="' + (this.index + 1) + '" max="' + this.questions.length + '" aria-label="Quiz progress">' + (this.index + 1) + ' of ' + this.questions.length + '</progress>' +
      '<h3 class="quiz-question" tabindex="-1">' + escapeHtml(question.text) + '</h3>' +
      '<p class="quiz-instruction">' + this.data.quiz.instruction + '</p>' +
      '<form class="quiz-form">' +
      '<fieldset><legend class="visually-hidden">' + escapeHtml(question.text) + '</legend>' +
      '<div class="quiz-choice-list">' + choices + '</div>' +
      '</fieldset>' +
      '<div class="quiz-nav">' +
      (this.index > 0 ? '<button class="btn btn-outline" type="button" data-counselors-back>Back</button>' : '<span></span>') +
      '<button class="btn btn-primary" type="submit" data-counselors-next' + (selectedIndex === -1 ? ' disabled' : '') + '>' + (this.index === this.questions.length - 1 ? 'One more question' : 'Next question') + '</button>' +
      '</div></form>';

    var form = this.app.querySelector('form');
    var next = this.app.querySelector('[data-counselors-next]');
    var back = this.app.querySelector('[data-counselors-back]');
    var radios = this.app.querySelectorAll('input[name="counselors-answer"]');

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
      var checked = self.app.querySelector('input[name="counselors-answer"]:checked');
      if (!checked) return;
      self.answers[self.index] = question.options[Number(checked.value)];
      if (self.index < self.questions.length - 1) {
        self.index += 1;
        self.renderQuestion();
      } else {
        self.phase = 'optional';
        self.renderOptional(false);
      }
    });

    if (shouldFocus !== false) this.focusQuestion(true);
  };

  Quiz.prototype.renderOptional = function (shouldFocus) {
    var self = this;
    var optional = this.data.quiz.optional;
    var options = optional.options.map(function (option, index) {
      return '<label class="quiz-choice">' +
        '<input type="checkbox" name="counselors-optional" value="' + index + '"' + (self.optionalSelections.indexOf(option.advice) !== -1 ? ' checked' : '') + '>' +
        '<span>' + escapeHtml(option.text) + '</span>' +
        '</label>';
    }).join('');

    this.app.innerHTML =
      '<div class="quiz-step">One more, if you like</div>' +
      '<h3 class="quiz-question" tabindex="-1">' + escapeHtml(optional.text) + '</h3>' +
      '<p class="quiz-instruction">' + escapeHtml(optional.note) + '</p>' +
      '<form class="quiz-form">' +
      '<fieldset><legend class="visually-hidden">' + escapeHtml(optional.text) + '</legend>' +
      '<div class="quiz-choice-list">' + options + '</div>' +
      '</fieldset>' +
      '<div class="quiz-nav">' +
      '<button class="btn btn-outline" type="button" data-counselors-back>Back</button>' +
      '<button class="btn btn-primary" type="submit" data-counselors-next>See my result</button>' +
      '</div></form>';

    var form = this.app.querySelector('form');
    this.app.querySelector('[data-counselors-back]').addEventListener('click', function () {
      self.phase = 'questions';
      self.index = self.questions.length - 1;
      self.renderQuestion();
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      self.optionalSelections = [];
      Array.prototype.forEach.call(self.app.querySelectorAll('input[name="counselors-optional"]:checked'), function (input) {
        self.optionalSelections.push(optional.options[Number(input.value)].advice);
      });
      self.finish();
    });

    if (shouldFocus !== false) this.focusQuestion(true);
  };

  Quiz.prototype.finish = function () {
    var values = this.answers.map(function (answer) {
      return answer ? answer.value : null;
    });
    var scored = scoreQuiz(values, this.data);
    if (scored.complete) {
      this.showResults(scored.results[0]);
      return;
    }
    this.phase = 'tie';
    this.renderTieBreak();
  };

  Quiz.prototype.renderTieBreak = function () {
    var self = this;
    var tie = this.data.quiz.tieBreak;
    var options = shuffle(tie.options);
    var choices = options.map(function (option, index) {
      return '<label class="quiz-choice">' +
        '<input type="radio" name="counselors-tie" value="' + index + '">' +
        '<span>' + escapeHtml(option.text) + '</span>' +
        '</label>';
    }).join('');

    this.app.innerHTML =
      '<div class="quiz-step">One tie-breaker</div>' +
      '<h3 class="quiz-question" tabindex="-1">' + escapeHtml(tie.text) + '</h3>' +
      '<p class="quiz-instruction">' + this.data.quiz.instruction + '</p>' +
      '<form class="quiz-form">' +
      '<fieldset><legend class="visually-hidden">' + escapeHtml(tie.text) + '</legend>' +
      '<div class="quiz-choice-list">' + choices + '</div>' +
      '</fieldset>' +
      '<div class="quiz-nav">' +
      '<span></span>' +
      '<button class="btn btn-primary" type="submit" data-counselors-next disabled>See my result</button>' +
      '</div></form>';

    var form = this.app.querySelector('form');
    var next = this.app.querySelector('[data-counselors-next]');
    Array.prototype.forEach.call(this.app.querySelectorAll('input[name="counselors-tie"]'), function (radio) {
      radio.addEventListener('change', function () {
        next.disabled = false;
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var checked = self.app.querySelector('input[name="counselors-tie"]:checked');
      if (!checked) return;
      var values = self.answers.map(function (answer) {
        return answer ? answer.value : null;
      });
      var scored = scoreQuiz(values, self.data);
      var result = resolveTie(scored, options[Number(checked.value)].value, self.data);
      self.showResults(result);
    });

    this.focusQuestion(true);
  };

  Quiz.prototype.adviceFor = function (data) {
    var self = this;
    return (data.quiz.advice || []).filter(function (item) {
      return self.optionalSelections.indexOf(item.key) !== -1;
    });
  };

  Quiz.prototype.showResults = function (result) {
    var self = this;
    var advice = this.adviceFor(this.data);
    this.app.innerHTML = resultHtml(result, advice, this.data);

    this.app.querySelector('[data-counselors-retake]').addEventListener('click', function () {
      removeStored(RESULT_STORAGE);
      self.start();
    });

    var share = this.app.querySelector('[data-counselors-share]');
    if (share) {
      share.addEventListener('click', function () {
        var status = self.app.querySelector('.result-tool-status');
        var url = String(root.location.href).split('#')[0] + '#result=' + result.key;
        var done = function (ok) {
          if (status) status.textContent = ok ? 'Link copied. It reopens this result.' : 'Copy this link: ' + url;
        };
        if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
          root.navigator.clipboard.writeText(url).then(function () { done(true); }).catch(function () { done(false); });
        } else {
          done(false);
        }
        try {
          root.history.replaceState(null, '', '#result=' + result.key);
        } catch (error) {
          // The result still shows for this view.
        }
      });
    }

    writeStored(RESULT_STORAGE, JSON.stringify({
      result: result.key,
      values: this.answers.map(function (answer) { return answer ? answer.value : null; }),
      advice: this.optionalSelections
    }));

    var heading = this.app.querySelector('.result-profile');
    if (heading) {
      heading.focus({ preventScroll: true });
      this.app.scrollIntoView({ behavior: motionBehavior(), block: 'start' });
    }
  };

  function showStoredResult(app, data) {
    var hash = String(root.location.hash || '');
    var match = hash.match(/#result=([a-z-]+)/);
    var stored = null;
    try {
      stored = JSON.parse(readStored(RESULT_STORAGE) || 'null');
    } catch (error) {
      stored = null;
    }
    var key = match ? match[1] : (stored && stored.result);
    var result = key ? findResult(data, key) : null;
    if (!result) return false;

    var advice = (data.quiz.advice || []).filter(function (item) {
      return stored && Array.isArray(stored.advice) && stored.advice.indexOf(item.key) !== -1;
    });
    app.innerHTML = resultHtml(result, advice, data);
    var retake = app.querySelector('[data-counselors-retake]');
    if (retake) {
      retake.addEventListener('click', function () {
        removeStored(RESULT_STORAGE);
        var app2 = document.querySelector('[data-counselors-quiz]');
        if (app2) {
          var quiz = new Quiz(app2, data);
          quiz.start();
        }
      });
    }
    var share = app.querySelector('[data-counselors-share]');
    if (share) {
      share.addEventListener('click', function () {
        var status = app.querySelector('.result-tool-status');
        var url = String(root.location.href).split('#')[0] + '#result=' + result.key;
        if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
          root.navigator.clipboard.writeText(url).then(function () {
            if (status) status.textContent = 'Link copied. It reopens this result.';
          });
        } else if (status) {
          status.textContent = 'Copy this link: ' + url;
        }
      });
    }
    return true;
  }

  function setupPrint() {
    var buttons = document.querySelectorAll('[data-counselors-print]');
    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener('click', function () {
        window.print();
      });
    });
  }

  function init() {
    if (initialized) return;
    var data = root.WCIRF_COUNSELORS;
    if (!data) {
      if (root.console) root.console.warn('[WCIRF] Counselors data was not loaded.');
      return;
    }
    initialized = true;

    setupPrint();

    var app = document.querySelector('[data-counselors-quiz]');
    if (!app) return;
    if (showStoredResult(app, data)) return;
    var quiz = new Quiz(app, data);
    quiz.start();
  }

  return {
    init: init,
    scoreQuiz: scoreQuiz,
    resolveTie: resolveTie,
    shuffle: shuffle
  };
});
