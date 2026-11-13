(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(root);
  } else {
    var api = factory(root);
    root.WCIRFChoosing = api;
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

  var RESULT_ORDER = [
    'Leadership',
    'Civic Involvement',
    'Continued Learning',
    'Cultural Involvement',
    'Fulfillment',
    'Personal Success'
  ];

  var RESULT_TO_ROW = {
    'Leadership': 'leadership',
    'Civic Involvement': 'civic',
    'Continued Learning': 'continued',
    'Cultural Involvement': 'cultural',
    'Fulfillment': 'fulfillment',
    'Personal Success': 'personal'
  };

  var SCORECARD_ROWS = ['leadership', 'civic', 'continued', 'cultural', 'fulfillment', 'personal'];
  var RATINGS = ['Strong', 'Mixed', 'Weak', "Don't know yet"];
  var DEALBREAKER_VALUES = ['Pass', 'Fail', "Don't know yet"];
  var RESULT_STORAGE = 'wcirf_choosing_result_v2';
  var SCORECARD_STORAGE = 'wcirf_choosing_scorecard_v1';
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
      // Storage may be unavailable; the form still works for this session.
    }
  }

  function outcomeSlug(outcome, data) {
    return data.quiz.results[outcome] ? data.quiz.results[outcome].slug : '';
  }

  function outcomeFromSlug(slug, data) {
    var found = null;
    RESULT_ORDER.forEach(function (outcome) {
      if (data.quiz.results[outcome] && data.quiz.results[outcome].slug === slug) found = outcome;
    });
    return found;
  }

  function validPanels(panels, data) {
    return (panels || []).filter(function (panel) {
      return Object.prototype.hasOwnProperty.call(data.quiz.panels, panel);
    });
  }

  function readStoredResult(data) {
    try {
      var parsed = JSON.parse(readStored(RESULT_STORAGE) || 'null');
      if (!parsed || !parsed.outcome) return null;
      if (!data.quiz.results[parsed.outcome]) return null;
      return {
        outcome: parsed.outcome,
        panels: validPanels(parsed.panels, data)
      };
    } catch (error) {
      return null;
    }
  }

  function sharedResult(data) {
    try {
      var hash = String(window.location.hash || '').replace(/^#/, '');
      var outcome = null;
      var panels = [];
      hash.split('&').forEach(function (part) {
        var pieces = part.split('=');
        if (pieces[0] === 'result') outcome = outcomeFromSlug(decodeURIComponent(pieces[1] || ''), data);
        if (pieces[0] === 'advice') {
          panels = decodeURIComponent(pieces[1] || '').split(',').filter(function (item) { return item; });
        }
      });
      if (!outcome) return null;
      return { outcome: outcome, panels: validPanels(panels, data) };
    } catch (error) {
      return null;
    }
  }

  function resultLink(outcome, panels, data) {
    var base = String(window.location.href).split('#')[0];
    var link = base + '#result=' + encodeURIComponent(outcomeSlug(outcome, data));
    if (panels && panels.length) link += '&advice=' + encodeURIComponent(panels.join(','));
    return link;
  }

  function updateSidebarResult(outcome, data) {
    var card = document.querySelector('[data-sidebar-result]');
    if (!card) return;
    var result = data.quiz.results[outcome];
    if (!result) return;
    card.innerHTML = '<h3>Your result</h3><p><a href="#result">' + escapeHtml(result.profile) + '</a></p>';
  }

  function scoreQuiz(answers, data, tieOutcome) {
    var counts = {};
    RESULT_ORDER.forEach(function (outcome) {
      counts[outcome] = 0;
    });

    (answers || []).forEach(function (answer) {
      if (Object.prototype.hasOwnProperty.call(counts, answer)) counts[answer] += 1;
    });

    var max = 0;
    RESULT_ORDER.forEach(function (outcome) {
      if (counts[outcome] > max) max = counts[outcome];
    });

    var top = max === 0 ? [] : RESULT_ORDER.filter(function (outcome) {
      return counts[outcome] === max;
    });

    var needsTieBreak = top.length >= 2;
    var result = top.slice();

    if (needsTieBreak && tieOutcome && top.indexOf(tieOutcome) !== -1) {
      result = [tieOutcome];
      needsTieBreak = false;
    } else if (needsTieBreak) {
      result = [];
    }

    return {
      counts: counts,
      top: top,
      result: result,
      needsTieBreak: needsTieBreak
    };
  }

  function trusted(value) {
    return String(value || '');
  }

  function list(items, className) {
    return '<ul class="' + (className || 'quiz-list') + '">' + items.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('') + '</ul>';
  }

  function paragraphs(items) {
    return (items || []).map(function (item) {
      return '<p>' + trusted(item) + '</p>';
    }).join('');
  }

  function scopedList(items) {
    return '<ul class="quiz-list">' + items.map(function (item) {
      var scope = item.scope ? '<strong>' + escapeHtml(item.scope + ':') + '</strong> ' : '';
      return '<li>' + scope + escapeHtml(item.text) + '</li>';
    }).join('') + '</ul>';
  }

  function panelHtml(data, panelKey) {
    var panel = data.quiz.panels[panelKey];
    if (!panel) return '';
    return '<div class="result-panel">' +
      '<h4>' + escapeHtml(panel.title) + '</h4>' +
      paragraphs(panel.body) +
      '</div>';
  }

  function numbersHtml(result) {
    return '<details class="pullout result-reference">' +
      '<summary>The numbers</summary>' +
      '<div class="pullout-body">' + paragraphs(result.numbers) + '</div>' +
      '</details>';
  }

  function supportHtml(result) {
    return '<details class="pullout result-reference">' +
      '<summary>Other research agrees</summary>' +
      '<div class="pullout-body"><p>' + trusted(result.support) + '</p></div>' +
      '</details>';
  }

  function readingHtml() {
    return '<details class="pullout result-reference">' +
      '<summary>How to read these numbers</summary>' +
      '<div class="pullout-body">' +
      '<p>A figure such as “24% more likely” compares two groups. If 57% of one group reports a higher income against 46% of another, the first group’s rate is 24% higher than the second (57% divided by 46%). Statisticians call this the incident risk ratio, and the increase expressed as a percentage is the percent relative effect. The purpose of this statistic is not to predict how often an outcome will happen (if you do X, then Y will happen Z percent of the time) but to identify the experiences that make an outcome more likely. The bigger the number, the more substantial the effect. Think of it like a bet: if you were told that doing something in particular made you 24% more likely to win, would you do it? All reported effects are statistically significant. The study interviewed people once and asked them to look back, so it shows an association between experiences and outcomes, not proof of cause. However, extensive research by others supports the importance of these experiences, from neuroscience (as reported in the book) to the other studies cited on this site. <a href="the-research.html">Read how the study was done.</a></p>' +
      '<p>This study compared graduates who had more or less of each college experience, at every kind of college; it did not compare kinds of colleges. The results held for graduates of all types of colleges, big and small, private and public, prestigious and not, liberal arts and not. The result shows a few findings; <a href="what-matters.html">What Matters in College</a> shows them all, and <a href="the-research.html">The Research</a> page explains more.</p>' +
      '</div></details>';
  }

  function resultHtml(key, data, panels) {
    var result = data.quiz.results[key];
    var html = '<article class="choosing-result">';

    html += '<p class="section-label">Your result</p>';
    html += '<h3 class="result-profile" tabindex="-1">' + escapeHtml(result.profile) + '</h3>';
    html += '<p class="result-description">' + escapeHtml(result.lead) + '</p>';
    html += '<h4>What graduates told us</h4>' + paragraphs(result.finding);
    html += numbersHtml(result);
    html += '<h4>Questions to ask</h4>' + list(result.ask);
    html += '<h4>Find out on your own</h4>' + list(result.find);
    html += '<h4>If you can\u2019t visit</h4>' + list(result.cant);
    html += '<div class="result-try"><strong>Try this one thing.</strong><p>' + escapeHtml(result.try) + '</p></div>';
    html += '<h4>On your list</h4>' + scopedList(result.list);
    html += (panels || []).map(function (panelKey) {
      return panelHtml(data, panelKey);
    }).join('');
    html += supportHtml(result);
    html += '<p class="result-closing">' + escapeHtml(result.closing) + '</p>';
    html += readingHtml();
    html += '</article>';
    return { html: html };
  }

  function Quiz(app, data) {
    this.app = app;
    this.data = data;
    this.questions = [];
    this.answers = [];
    this.optionalSelections = [];
    this.optionalPanels = [];
    this.index = 0;
    this.phase = 'questions';
    this.tieTop = [];
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
    this.optionalPanels = [];
    this.index = 0;
    this.phase = 'questions';
    this.tieTop = [];
    var restored = sharedResult(this.data) || readStoredResult(this.data);
    if (restored) {
      this.showResult(restored.outcome, restored.panels, false);
      return;
    }
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
        if (option.outcome === previous) {
          selectedIndex = index;
          return true;
        }
        return false;
      });
    }

    var choices = question.options.map(function (option, index) {
      return '<label class="quiz-choice">' +
        '<input type="radio" name="quiz-answer" value="' + index + '"' + (index === selectedIndex ? ' checked' : '') + '>' +
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
      (this.index > 0 ? '<button class="btn btn-outline" type="button" data-quiz-back>Back</button>' : '<span></span>') +
      '<button class="btn btn-primary" type="submit" data-quiz-next' + (selectedIndex === -1 ? ' disabled' : '') + '>' + (this.index === this.questions.length - 1 ? 'Continue' : 'Next question') + '</button>' +
      '</div></form>';

    var form = this.app.querySelector('form');
    var next = this.app.querySelector('[data-quiz-next]');
    var back = this.app.querySelector('[data-quiz-back]');
    var radios = this.app.querySelectorAll('input[name="quiz-answer"]');

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
      var checked = self.app.querySelector('input[name="quiz-answer"]:checked');
      if (!checked) return;
      self.answers[self.index] = question.options[Number(checked.value)].outcome;
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
        '<input type="checkbox" name="quiz-optional" value="' + index + '"' + (self.optionalSelections.indexOf(index) !== -1 ? ' checked' : '') + '>' +
        '<span>' + escapeHtml(option.text) + '</span>' +
        '</label>';
    }).join('');

    this.phase = 'optional';
    this.app.innerHTML =
      '<div class="quiz-step">One optional question</div>' +
      '<progress class="quiz-progress" value="' + this.questions.length + '" max="' + (this.questions.length + 1) + '" aria-label="Quiz progress">Optional</progress>' +
      '<h3 class="quiz-question" tabindex="-1">' + escapeHtml(optional.text) + '</h3>' +
      '<p class="quiz-instruction">Pick the answer that is true for you, even if it is not the one you think you should pick.</p>' +
      '<p class="quiz-note">' + escapeHtml(optional.note) + '</p>' +
      '<form class="quiz-form">' +
      '<fieldset><legend class="visually-hidden">' + escapeHtml(optional.text) + '</legend>' +
      '<div class="quiz-choice-list">' + choices + '</div>' +
      '</fieldset>' +
      '<div class="quiz-nav">' +
      '<button class="btn btn-outline" type="button" data-quiz-back>Back</button>' +
      '<button class="btn btn-primary" type="submit">See my result</button>' +
      '</div></form>';

    var boxes = this.app.querySelectorAll('input[name="quiz-optional"]');
    var noneIndex = optional.options.length - 1;

    Array.prototype.forEach.call(boxes, function (box) {
      box.addEventListener('change', function () {
        var index = Number(box.value);
        if (box.checked && index === noneIndex) {
          Array.prototype.forEach.call(boxes, function (other) {
            if (other !== box) other.checked = false;
          });
        } else if (box.checked) {
          boxes[noneIndex].checked = false;
        }
        self.optionalSelections = [];
        Array.prototype.forEach.call(boxes, function (other) {
          if (other.checked) self.optionalSelections.push(Number(other.value));
        });
      });
    });

    this.app.querySelector('[data-quiz-back]').addEventListener('click', function () {
      self.index = self.questions.length - 1;
      self.renderQuestion();
    });

    this.app.querySelector('form').addEventListener('submit', function (event) {
      event.preventDefault();
      self.optionalPanels = [];
      Array.prototype.forEach.call(boxes, function (box) {
        if (!box.checked) return;
        var panel = optional.options[Number(box.value)].panel;
        if (panel && self.optionalPanels.indexOf(panel) === -1) self.optionalPanels.push(panel);
      });
      var scored = scoreQuiz(self.answers, self.data);
      if (scored.needsTieBreak) {
        self.renderTie(scored, self.optionalPanels);
      } else if (scored.result.length) {
        self.showResult(scored.result[0], self.optionalPanels, true);
      }
    });

    this.focusQuestion(true);
  };

  Quiz.prototype.renderTie = function (scored, selectedPanels) {
    var self = this;
    var tied = this.data.quiz.tieBreaker.options.filter(function (option) {
      return scored.top.indexOf(option.outcome) !== -1;
    });
    tied = shuffle(tied);
    this.phase = 'tie';
    this.tieTop = scored.top;
    this.optionalPanels = selectedPanels || this.optionalPanels;

    var choices = tied.map(function (option, index) {
      return '<label class="quiz-choice">' +
        '<input type="radio" name="quiz-tie" value="' + index + '">' +
        '<span>' + escapeHtml(option.text) + '</span>' +
        '</label>';
    }).join('');

    this.app.innerHTML =
      '<div class="quiz-step">One more question</div>' +
      '<progress class="quiz-progress" value="' + (this.questions.length + 1) + '" max="' + (this.questions.length + 1) + '" aria-label="Quiz progress">Final question</progress>' +
      '<h3 class="quiz-question" tabindex="-1">' + escapeHtml(this.data.quiz.tieBreaker.text) + '</h3>' +
      '<p class="quiz-instruction">Pick the answer that is true for you, even if it is not the one you think you should pick.</p>' +
      '<form class="quiz-form">' +
      '<fieldset><legend class="visually-hidden">' + escapeHtml(this.data.quiz.tieBreaker.text) + '</legend>' +
      '<div class="quiz-choice-list">' + choices + '</div>' +
      '</fieldset>' +
      '<div class="quiz-nav">' +
      '<button class="btn btn-outline" type="button" data-quiz-back>Back</button>' +
      '<button class="btn btn-primary" type="submit" data-quiz-tie-next disabled>See my result</button>' +
      '</div></form>';

    var next = this.app.querySelector('[data-quiz-tie-next]');
    Array.prototype.forEach.call(this.app.querySelectorAll('input[name="quiz-tie"]'), function (radio) {
      radio.addEventListener('change', function () {
        next.disabled = false;
      });
    });

    this.app.querySelector('[data-quiz-back]').addEventListener('click', function () {
      self.renderOptional();
    });

    this.app.querySelector('form').addEventListener('submit', function (event) {
      event.preventDefault();
      var checked = self.app.querySelector('input[name="quiz-tie"]:checked');
      if (!checked) return;
      var chosen = tied[Number(checked.value)].outcome;
      self.showResult(chosen, self.optionalPanels, true);
    });

    this.focusQuestion(true);
  };

  Quiz.prototype.copyText = function (key) {
    var item = this.data.quiz.results[key];
    var lines = [item.profile, '', item.lead, '', 'Questions to ask:'];
    item.ask.forEach(function (question) { lines.push('- ' + question); });
    lines.push('', 'Find out on your own:');
    item.find.forEach(function (question) { lines.push('- ' + question); });
    return lines.join('\n');
  };

  Quiz.prototype.showResult = function (key, panels, shouldFocus) {
    var self = this;
    var result = this.data.quiz.results[key];
    if (!result) return;
    var selectedPanels = validPanels(panels || this.optionalPanels, this.data);

    this.phase = 'results';
    this.optionalPanels = selectedPanels;
    this.app.innerHTML =
      '<div class="quiz-results" id="result">' +
      resultHtml(key, this.data, selectedPanels).html +
      '<div class="result-copy-source" hidden>' + escapeHtml(this.copyText(key)) + '</div>' +
      '<div class="result-actions">' +
      '<a class="btn btn-primary" href="#recommendations">See the recommendations</a>' +
      '<button class="btn btn-outline" type="button" data-result-copy>Copy my questions</button>' +
      '<button class="btn btn-outline" type="button" data-result-email>Email this to me</button>' +
      '<button class="btn btn-outline" type="button" data-result-share>Share my result</button>' +
      '<button class="quiz-retake-link" type="button" data-quiz-retake>Retake the quiz</button>' +
      '<span class="result-tool-status" role="status" aria-live="polite"></span>' +
      '</div></div>';

    writeStored(RESULT_STORAGE, JSON.stringify({ outcome: key, panels: selectedPanels }));
    updateSidebarResult(key, this.data);
    try {
      document.dispatchEvent(new CustomEvent('wcirf:choosing-result', {
        detail: { outcomes: [key] }
      }));
    } catch (error) {
      // The result is still stored; the scorecard can read it on the next load.
    }

    this.app.querySelector('[data-quiz-retake]').addEventListener('click', function () {
      removeStored(RESULT_STORAGE);
      try {
        var clean = String(window.location.href).split('#')[0];
        window.history.replaceState(null, '', clean + '#quiz');
      } catch (error) {
        // The quiz still restarts for this page view.
      }
      self.start();
    });

    this.app.querySelector('[data-result-share]').addEventListener('click', function () {
      var button = this;
      var status = self.app.querySelector('.result-tool-status');
      var link = resultLink(key, selectedPanels, self.data);
      try {
        window.history.replaceState(null, '', link);
      } catch (error) {
        // The link is still copied for this page view.
      }
      var done = function (copied) {
        if (status) status.textContent = copied ? 'Link copied. It reopens this result without your answers.' : 'Copy this link: ' + link;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(function () { done(true); }, function () { done(false); });
      } else {
        var area = document.createElement('textarea');
        area.value = link;
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (copyError) { ok = false; }
        document.body.removeChild(area);
        done(ok);
      }
      button.focus();
    });

    var firstResult = this.app.querySelector('.result-profile');
    if (firstResult && shouldFocus !== false) {
      firstResult.focus({ preventScroll: true });
      this.app.scrollIntoView({ behavior: motionBehavior(), block: 'start' });
    }
  };

  function defaultScorecardState() {
    var index;
    var state = {
      names: ['', '', '', ''],
      active: 1,
      dealbreakers: [],
      ratings: [],
      stars: {},
      notes: [],
      leading: ''
    };
    for (index = 0; index < 4; index += 1) {
      state.dealbreakers.push(['', '', '', '']);
      state.ratings.push(['', '', '', '', '', '', '']);
      state.notes.push({ example: '', worry: '' });
    }
    ['professors', 'leadership', 'civic', 'continued', 'cultural', 'fulfillment', 'personal'].forEach(function (key) {
      state.stars[key] = false;
    });
    return state;
  }

  function hasValue(list, value) {
    return list.indexOf(value) !== -1;
  }

  function Scorecard(rootElement, data) {
    this.root = rootElement;
    this.data = data.scorecard;
    this.state = defaultScorecardState();
    this.hasSaved = false;
    this.compare = false;
    this.load();
    this.bind();
    this.render();
  }

  Scorecard.prototype.load = function () {
    var raw = readStored(SCORECARD_STORAGE);
    if (!raw) {
      this.applyQuizStars(this.readQuizResult());
      return;
    }

    try {
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      this.hasSaved = true;
      if (Array.isArray(parsed.names)) {
        this.state.names = [0, 1, 2, 3].map(function (index) {
          return typeof parsed.names[index] === 'string' ? parsed.names[index] : '';
        });
      }
      if (Number(parsed.active) >= 1 && Number(parsed.active) <= 4) {
        this.state.active = Number(parsed.active);
      }
      if (Array.isArray(parsed.dealbreakers)) {
        this.state.dealbreakers = [0, 1, 2, 3].map(function (college) {
          return [0, 1, 2, 3].map(function (row) {
            var value = parsed.dealbreakers[college] && parsed.dealbreakers[college][row];
            return hasValue(DEALBREAKER_VALUES, value) ? value : '';
          });
        });
      }
      if (Array.isArray(parsed.ratings)) {
        this.state.ratings = [0, 1, 2, 3].map(function (college) {
          return [0, 1, 2, 3, 4, 5, 6].map(function (row) {
            var value = parsed.ratings[college] && parsed.ratings[college][row];
            return hasValue(RATINGS, value) ? value : '';
          });
        });
      }
      if (parsed.stars && typeof parsed.stars === 'object') {
        Object.keys(this.state.stars).forEach(function (key) {
          this.state.stars[key] = parsed.stars[key] === true;
        }, this);
      }
      if (Array.isArray(parsed.notes)) {
        this.state.notes = [0, 1, 2, 3].map(function (college) {
          var note = parsed.notes[college] || {};
          return {
            example: typeof note.example === 'string' ? note.example : '',
            worry: typeof note.worry === 'string' ? note.worry : ''
          };
        });
      }
      if (typeof parsed.leading === 'string') this.state.leading = parsed.leading;
    } catch (error) {
      this.hasSaved = false;
      this.applyQuizStars(this.readQuizResult());
    }
  };

  Scorecard.prototype.readQuizResult = function () {
    try {
      var parsed = JSON.parse(readStored(RESULT_STORAGE) || '[]');
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') {
        if (parsed.outcome) return [parsed.outcome];
        if (Array.isArray(parsed.outcomes)) return parsed.outcomes;
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  Scorecard.prototype.applyQuizStars = function (outcomes) {
    var self = this;
    SCORECARD_ROWS.forEach(function (key) {
      self.state.stars[key] = false;
    });
    (outcomes || []).forEach(function (outcome) {
      var key = RESULT_TO_ROW[outcome];
      if (key) self.state.stars[key] = true;
    });
  };

  Scorecard.prototype.bind = function () {
    var self = this;
    this.root.addEventListener('click', function (event) {
      self.onClick(event);
    });
    this.root.addEventListener('change', function (event) {
      self.onChange(event);
    });
    this.root.addEventListener('input', function (event) {
      self.onInput(event);
    });
    document.addEventListener('wcirf:choosing-result', function (event) {
      if (!event.detail || !event.detail.outcomes) return;
      self.applyQuizStars(event.detail.outcomes);
      self.save();
      self.render();
      self.setStatus('Your quiz result is starred in the scorecard.');
    });
    window.addEventListener('afterprint', function () {
      document.body.classList.remove('printing-scorecard');
    });
  };

  Scorecard.prototype.collegeName = function (index) {
    return this.state.names[index] || 'College ' + (index + 1);
  };

  Scorecard.prototype.ratingGroup = function (college, row, label) {
    var self = this;
    var value = this.state.ratings[college - 1][row];
    return '<div class="scorecard-rating" role="group" aria-label="' + escapeHtml(this.collegeName(college - 1)) + ': ' + escapeHtml(label) + '">' +
      RATINGS.map(function (rating) {
        return '<button type="button" data-scorecard-rating="' + escapeHtml(rating) + '" data-row="' + row + '" data-col="' + college + '" aria-pressed="' + (value === rating ? 'true' : 'false') + '">' + escapeHtml(rating) + '</button>';
      }).join('') +
      '</div>';
  };

  Scorecard.prototype.strongCount = function (college) {
    var ratings = this.state.ratings[college - 1];
    var starred = 0;
    var all = 0;
    this.data.experiences.forEach(function (experience, index) {
      if (ratings[index] !== 'Strong') return;
      all += 1;
      if (this.state.stars[experience.key]) starred += 1;
    }, this);
    return { starred: starred, all: all };
  };

  Scorecard.prototype.render = function () {
    var self = this;
    var state = this.state;
    var data = this.data;
    var names = state.names;

    var tabHtml = [0, 1, 2, 3].map(function (index) {
      return '<button type="button" data-scorecard-tab="' + (index + 1) + '" aria-pressed="' + (state.active === index + 1 ? 'true' : 'false') + '">' + escapeHtml(self.collegeName(index)) + '</button>';
    }).join('');

    var nameHtml = [0, 1, 2, 3].map(function (index) {
      return '<th scope="col" data-scorecard-col="' + (index + 1) + '">' +
        '<label class="scorecard-college-label" for="scorecard-college-' + (index + 1) + '">#' + (index + 1) + '</label>' +
        '<input id="scorecard-college-' + (index + 1) + '" type="text" data-scorecard-name="' + (index + 1) + '" value="' + escapeHtml(names[index]) + '" placeholder="College #' + (index + 1) + '" autocomplete="organization">' +
        '</th>';
    }).join('');

    var dealRows = data.dealbreakers.map(function (row, rowIndex) {
      return '<tr data-scorecard-row="deal-' + rowIndex + '">' +
        '<th scope="row"><span class="scorecard-rowtitle">' + escapeHtml(row.question) + '</span><span class="scorecard-where-inline">' + escapeHtml(row.where) + '</span></th>' +
        '<td class="scorecard-where">' + escapeHtml(row.where) + '</td>' +
        [1, 2, 3, 4].map(function (college) {
          var value = state.dealbreakers[college - 1][rowIndex];
          return '<td data-scorecard-col="' + college + '">' +
            '<label class="visually-hidden" for="deal-' + college + '-' + rowIndex + '">' + escapeHtml(self.collegeName(college - 1)) + ': ' + escapeHtml(row.question) + '</label>' +
            '<select id="deal-' + college + '-' + rowIndex + '" data-scorecard-dealbreaker="' + rowIndex + '" data-col="' + college + '">' +
            '<option value="">Choose</option>' +
            DEALBREAKER_VALUES.map(function (option) {
              return '<option value="' + escapeHtml(option) + '"' + (value === option ? ' selected' : '') + '>' + escapeHtml(option) + '</option>';
            }).join('') +
            '</select></td>';
        }).join('') +
        '</tr>';
    }).join('');

    var experienceRows = data.experiences.map(function (experience, rowIndex) {
      return '<tr data-scorecard-row="' + experience.key + '">' +
        '<th scope="row" class="scorecard-experience">' +
        '<div class="scorecard-rowtitle">' +
        '<button type="button" class="scorecard-star" data-scorecard-star="' + experience.key + '" data-scorecard-label="' + escapeHtml(experience.label) + '" aria-pressed="' + (state.stars[experience.key] ? 'true' : 'false') + '" aria-label="' + (state.stars[experience.key] ? 'Unstar ' : 'Star ') + escapeHtml(experience.label) + ' row">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3.1-5.8 3.1 1.1-6.4L2.6 9.4l6.5-.9z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>' +
        '</button><span>' + escapeHtml(experience.label) + '</span></div>' +
        '<p class="scorecard-question">' + escapeHtml(experience.question) + '</p>' +
        '<span class="scorecard-where-inline">' + escapeHtml(experience.where) + '</span>' +
        '</th>' +
        '<td class="scorecard-where">' + escapeHtml(experience.where) + '</td>' +
        [1, 2, 3, 4].map(function (college) {
          return '<td data-scorecard-col="' + college + '">' + self.ratingGroup(college, rowIndex, experience.label) + '</td>';
        }).join('') +
        '</tr>';
    }).join('');

    var summaryRows = [
      '<tr data-scorecard-row="strongs"><th scope="row">' + escapeHtml(data.summary[0]) + '</th><td class="scorecard-where"></td>' +
        [1, 2, 3, 4].map(function (college) {
          var counts = self.strongCount(college);
          return '<td data-scorecard-col="' + college + '"><span class="scorecard-strong-count">Starred: ' + counts.starred + ' Strong · All: ' + counts.all + ' Strong</span></td>';
        }).join('') + '</tr>',
      '<tr data-scorecard-row="example"><th scope="row">' + escapeHtml(data.summary[1]) + '</th><td class="scorecard-where"></td>' +
        [1, 2, 3, 4].map(function (college) {
          return '<td data-scorecard-col="' + college + '"><input type="text" data-scorecard-note="example" data-col="' + college + '" value="' + escapeHtml(state.notes[college - 1].example) + '" aria-label="' + escapeHtml(self.collegeName(college - 1)) + ': best example"></td>';
        }).join('') + '</tr>',
      '<tr data-scorecard-row="worry"><th scope="row">' + escapeHtml(data.summary[2]) + '</th><td class="scorecard-where"></td>' +
        [1, 2, 3, 4].map(function (college) {
          return '<td data-scorecard-col="' + college + '"><input type="text" data-scorecard-note="worry" data-col="' + college + '" value="' + escapeHtml(state.notes[college - 1].worry) + '" aria-label="' + escapeHtml(self.collegeName(college - 1)) + ': what worries me"></td>';
        }).join('') + '</tr>'
    ].join('');

    this.root.innerHTML =
      '<div class="scorecard-tabs" role="group" aria-label="Choose a college to view">' + tabHtml + '</div>' +
      '<div class="scorecard-toolbar">' +
      '<p class="scorecard-toolbar-note">One college at a time on a phone. All four columns in print.</p>' +
      '<button type="button" class="btn btn-outline btn-small scorecard-compare" data-scorecard-compare aria-expanded="false">See all four side by side (for printing)</button>' +
      '</div>' +
      '<div class="scorecard-table-wrap" data-active-col="' + state.active + '">' +
      '<table class="scorecard-table">' +
      '<caption class="visually-hidden">College scorecard for up to four colleges</caption>' +
      '<thead><tr><th scope="col">What to find out</th><th scope="col">Where to find out</th>' + nameHtml + '</tr></thead>' +
      '<tbody>' +
      '<tr class="scorecard-band"><th colspan="6">Part 1: Dealbreakers (pass or fail)</th></tr>' + dealRows +
      '<tr class="scorecard-band"><th colspan="6">Part 2: What students really experience (rate each)</th></tr>' + experienceRows +
      '<tr class="scorecard-band"><th colspan="6">Part 3: What I\'ll remember</th></tr>' + summaryRows +
      '</tbody></table></div>' +
      '<div class="scorecard-leading">' +
      '<label for="scorecard-leading">My leading choice right now, and why:</label>' +
      '<textarea id="scorecard-leading" rows="3" data-scorecard-leading>' + escapeHtml(state.leading) + '</textarea>' +
      '</div>' +
      '<div class="scorecard-actions">' +
      '<button class="btn btn-primary" type="button" data-scorecard-print>Print</button>' +
      '<button class="btn btn-outline" type="button" data-scorecard-copy>Copy text</button>' +
      '<button class="btn btn-outline" type="button" data-scorecard-email>Email it to me</button>' +
      '<button class="btn btn-outline scorecard-clear" type="button" data-scorecard-clear>Clear scorecard</button>' +
      '<p class="scorecard-status" data-scorecard-status aria-live="polite"></p>' +
      '</div>';

    this.updateCompare();
    this.updateTabs();
  };

  Scorecard.prototype.updateTabs = function () {
    var self = this;
    Array.prototype.forEach.call(this.root.querySelectorAll('[data-scorecard-tab]'), function (button) {
      var index = Number(button.getAttribute('data-scorecard-tab')) - 1;
      button.textContent = self.collegeName(index);
      button.setAttribute('aria-pressed', self.state.active === index + 1 ? 'true' : 'false');
    });
  };

  Scorecard.prototype.updateCompare = function () {
    var wrap = this.root.querySelector('.scorecard-table-wrap');
    var button = this.root.querySelector('[data-scorecard-compare]');
    if (!wrap || !button) return;
    wrap.classList.toggle('is-compare', this.compare);
    button.setAttribute('aria-expanded', this.compare ? 'true' : 'false');
    button.textContent = this.compare ? 'Back to one college at a time' : 'See all four side by side (for printing)';
  };

  Scorecard.prototype.updateStrongs = function () {
    var self = this;
    [1, 2, 3, 4].forEach(function (college) {
      var el = self.root.querySelector('[data-scorecard-row="strongs"] [data-scorecard-col="' + college + '"] .scorecard-strong-count');
      if (!el) return;
      var counts = self.strongCount(college);
      el.textContent = 'Starred: ' + counts.starred + ' Strong · All: ' + counts.all + ' Strong';
    });
  };

  Scorecard.prototype.setStatus = function (message) {
    var status = this.root.querySelector('[data-scorecard-status]');
    if (status) status.textContent = message;
  };

  Scorecard.prototype.save = function () {
    var saved = writeStored(SCORECARD_STORAGE, JSON.stringify(this.state));
    this.setStatus(saved ? 'Saved on this device.' : 'This browser could not save your scorecard.');
  };

  Scorecard.prototype.onClick = function (event) {
    var button = event.target.closest('button');
    if (!button || !this.root.contains(button)) return;

    if (button.hasAttribute('data-scorecard-tab')) {
      this.state.active = Number(button.getAttribute('data-scorecard-tab'));
      var wrap = this.root.querySelector('.scorecard-table-wrap');
      if (wrap) wrap.setAttribute('data-active-col', this.state.active);
      this.updateTabs();
      this.save();
      return;
    }

    if (button.hasAttribute('data-scorecard-compare')) {
      this.compare = !this.compare;
      this.updateCompare();
      return;
    }

    if (button.hasAttribute('data-scorecard-star')) {
      var key = button.getAttribute('data-scorecard-star');
      var starLabel = button.getAttribute('data-scorecard-label') || key;
      this.state.stars[key] = !this.state.stars[key];
      button.setAttribute('aria-pressed', this.state.stars[key] ? 'true' : 'false');
      button.setAttribute('aria-label', (this.state.stars[key] ? 'Unstar ' : 'Star ') + starLabel + ' row');
      this.updateStrongs();
      this.save();
      return;
    }

    if (button.hasAttribute('data-scorecard-rating')) {
      var college = Number(button.getAttribute('data-col'));
      var row = Number(button.getAttribute('data-row'));
      var value = button.getAttribute('data-scorecard-rating');
      var current = this.state.ratings[college - 1][row];
      this.state.ratings[college - 1][row] = current === value ? '' : value;
      Array.prototype.forEach.call(this.root.querySelectorAll('[data-scorecard-rating][data-col="' + college + '"][data-row="' + row + '"]'), function (item) {
        item.setAttribute('aria-pressed', item.getAttribute('data-scorecard-rating') === (current === value ? '' : value) ? 'true' : 'false');
      });
      this.updateStrongs();
      this.save();
      return;
    }

    if (button.hasAttribute('data-scorecard-print')) {
      document.body.classList.add('printing-scorecard');
      window.print();
      window.setTimeout(function () {
        document.body.classList.remove('printing-scorecard');
      }, 800);
      return;
    }

    if (button.hasAttribute('data-scorecard-copy')) {
      this.copyText();
      return;
    }

    if (button.hasAttribute('data-scorecard-email')) {
      var text = this.buildText();
      window.location.href = 'mailto:?subject=' + encodeURIComponent('My college scorecard') + '&body=' + encodeURIComponent(text);
      this.setStatus('If your email app does not open, use Copy text instead.');
      return;
    }

    if (button.hasAttribute('data-scorecard-clear')) {
      if (!window.confirm('Clear the scorecard saved on this device?')) return;
      removeStored(SCORECARD_STORAGE);
      this.state = defaultScorecardState();
      this.compare = false;
      this.render();
      this.setStatus('Scorecard cleared.');
    }
  };

  Scorecard.prototype.onChange = function (event) {
    var target = event.target;
    if (target.matches('[data-scorecard-dealbreaker]')) {
      var college = Number(target.getAttribute('data-col'));
      var row = Number(target.getAttribute('data-scorecard-dealbreaker'));
      this.state.dealbreakers[college - 1][row] = target.value;
      this.save();
    }
  };

  Scorecard.prototype.onInput = function (event) {
    var target = event.target;
    if (target.matches('[data-scorecard-name]')) {
      var nameIndex = Number(target.getAttribute('data-scorecard-name')) - 1;
      this.state.names[nameIndex] = target.value;
      this.updateTabs();
      this.save();
      return;
    }
    if (target.matches('[data-scorecard-note]')) {
      var college = Number(target.getAttribute('data-col'));
      var note = target.getAttribute('data-scorecard-note');
      this.state.notes[college - 1][note] = target.value;
      this.save();
      return;
    }
    if (target.matches('[data-scorecard-leading]')) {
      this.state.leading = target.value;
      this.save();
    }
  };

  Scorecard.prototype.buildText = function () {
    var self = this;
    var lines = ['My college scorecard', ''];
    [0, 1, 2, 3].forEach(function (index) {
      var counts = self.strongCount(index + 1);
      lines.push((index + 1) + '. ' + self.collegeName(index));
      lines.push('Dealbreakers:');
      self.data.dealbreakers.forEach(function (row, rowIndex) {
        lines.push(' - ' + row.question + ' ' + (self.state.dealbreakers[index][rowIndex] || 'Not filled in'));
      });
      lines.push('Experiences:');
      self.data.experiences.forEach(function (experience, rowIndex) {
        lines.push(' - ' + experience.label + ': ' + (self.state.ratings[index][rowIndex] || 'Not rated') + (self.state.stars[experience.key] ? ' (starred)' : ''));
      });
      lines.push('Strongs: ' + counts.starred + ' starred, ' + counts.all + ' total');
      lines.push('Best example: ' + (self.state.notes[index].example || 'Not filled in'));
      lines.push('What worries me: ' + (self.state.notes[index].worry || 'Not filled in'));
      lines.push('');
    });
    lines.push('My leading choice right now, and why: ' + (self.state.leading || 'Not filled in'));
    return lines.join('\n');
  };

  Scorecard.prototype.copyText = function () {
    var self = this;
    var text = this.buildText();
    var copied = function () {
      self.setStatus('Scorecard copied.');
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
      self.setStatus(ok ? 'Scorecard copied.' : 'Could not copy automatically. Select the table and copy it.');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(copied).catch(fallback);
    } else {
      fallback();
    }
  };

  function init() {
    if (initialized) return;
    var data = root.WCIRF_CHOOSING;
    if (!data) {
      if (root.console) root.console.warn('[WCIRF] Choosing data was not loaded.');
      return;
    }
    initialized = true;
    var quizApp = document.querySelector('[data-quiz-app]');
    var scorecardApp = document.querySelector('[data-scorecard-app]');
    if (quizApp) {
      var quiz = new Quiz(quizApp, data);
      quiz.start();
    }
    if (scorecardApp) {
      new Scorecard(scorecardApp, data);
    }
  }

  return {
    init: init,
    scoreQuiz: scoreQuiz,
    shuffle: shuffle,
    scorecard: Scorecard,
    RESULT_ORDER: RESULT_ORDER,
    RESULT_TO_ROW: RESULT_TO_ROW
  };
});
