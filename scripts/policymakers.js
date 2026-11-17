(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(root);
  } else {
    var api = factory(root);
    root.WCIRFPolicymakers = api;
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
  var fieldLabels = {
    collected: 'Collected in our state?',
    collector: 'Who could collect it',
    priority: 'Priority'
  };


  var RESULT_STORAGE = 'wcirf_policymakers_result_v1';

  function persistResults(results) {
    try {
      if (!root.localStorage) return;
      root.localStorage.setItem(RESULT_STORAGE, JSON.stringify({
        results: (results || []).map(function (item) { return item.key; })
      }));
    } catch (error) {
      // The quiz still works without storage.
    }
  }

  /* A shared link carries the result name or names: #result=mission. It wins over storage. */
  function reopenResults(data) {
    var wanted = [];
    try {
      var hash = String(root.location ? root.location.hash : '').replace(/^#/, '');
      hash.split('&').forEach(function (part) {
        var pieces = part.split('=');
        if (pieces[0] === 'result') {
          wanted = decodeURIComponent(pieces[1] || '').split('|').filter(Boolean);
        }
      });
    } catch (error) {
      wanted = [];
    }
    if (!wanted.length) {
      try {
        var raw = root.localStorage ? root.localStorage.getItem(RESULT_STORAGE) : null;
        var saved = raw ? JSON.parse(raw) : null;
        wanted = saved && Array.isArray(saved.results) ? saved.results : [];
      } catch (error) {
        wanted = [];
      }
    }
    if (!wanted.length || !data || !data.quiz) return [];
    return wanted.map(function (key) {
      return (data.quiz.results || []).filter(function (item) { return item.key === key; })[0];
    }).filter(Boolean);
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

  function scoreQuiz(values, data) {
    var valid = Array.isArray(values) && values.length === 5;
    var allowed = ['workforce', 'civic', 'resilience'];
    var counts = { workforce: 0, civic: 0, resilience: 0 };

    (values || []).forEach(function (value) {
      if (allowed.indexOf(value) === -1) valid = false;
      else counts[value] += 1;
    });

    var results = [];
    var complete = false;

    if (valid && data && data.quiz && Array.isArray(data.quiz.results)) {
      var maximum = Math.max(counts.workforce, counts.civic, counts.resilience);
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

  function resultHtml(results, all) {
    var copyText = results.map(function (result) {
      return result.heading + '\n\nQuestions to ask:\n' + result.questions.map(function (question) {
        return '- ' + question;
      }).join('\n');
    }).join('\n\n');
    var html = '<div class="policymakers-results">';
    html += '<p class="quiz-step">' + (all ? 'All three sets of questions' : 'Your result') + '</p>';
    if (!all && results.length > 1) {
      html += '<p class="policymakers-tie-note">Two priorities are tied, so both results are shown.</p>';
    }
    results.forEach(function (result, index) {
      var research = Array.isArray(result.research) ? result.research : [result.research];
      html += '<div class="policymakers-result">';
      html += '<h3 class="result-profile"' + (index === 0 ? ' tabindex="-1"' : '') + '>' + escapeHtml(result.heading) + '</h3>';
      html += '<p class="result-description">' + escapeHtml(result.lead) + '</p>';
      html += '<div class="result-research"><strong>What the research says to you.</strong>' +
        research.map(function (paragraph) {
          return '<p>' + escapeHtml(paragraph) + '</p>';
        }).join('') + '</div>';
      html += '<h4>Questions to ask</h4>' + list(result.questions);
      html += '<div class="result-try"><strong>Try this one thing.</strong><p>' + escapeHtml(result.action) + '</p></div>';
      html += '</div>';
    });
    html += HONESTY;
    html += '<div class="result-copy-source" hidden>' + escapeHtml(copyText) + '</div>';
    html += '<div class="result-tools">' +
      '<button class="btn btn-outline" type="button" data-result-copy>Copy my questions</button>' +
      '<button class="btn btn-outline" type="button" data-result-email>Email this to me</button>' +
      '<button class="btn btn-outline" type="button" data-result-share data-result-share-key="wcirf_policymakers_result_v1">Share my result</button>' +
      '<span class="result-tool-status" role="status" aria-live="polite"></span>' +
      '</div>';
    html += '<div class="quiz-actions">';
    html += '<button class="btn btn-outline" type="button" data-policymakers-retake>' + (all ? 'Take the quiz' : 'Take the quiz again') + '</button>';
    if (!all) {
      html += '<button class="btn btn-outline" type="button" data-policymakers-all-inline>See all three sets of questions</button>';
    }
    html += '</div></div>';
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
        '<input type="radio" name="policymakers-answer" value="' + index + '"' + (index === selectedIndex ? ' checked' : '') + '>' +
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
      (this.index > 0 ? '<button class="btn btn-outline" type="button" data-policymakers-back>Back</button>' : '<span></span>') +
      '<button class="btn btn-primary" type="submit" data-policymakers-next' + (selectedIndex === -1 ? ' disabled' : '') + '>' + (this.index === this.questions.length - 1 ? 'See my result' : 'Next question') + '</button>' +
      '</div></form>';

    var form = this.app.querySelector('form');
    var next = this.app.querySelector('[data-policymakers-next]');
    var back = this.app.querySelector('[data-policymakers-back]');
    var radios = this.app.querySelectorAll('input[name="policymakers-answer"]');

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
      var checked = self.app.querySelector('input[name="policymakers-answer"]:checked');
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

  Quiz.prototype.bindResultActions = function () {
    var self = this;
    var retake = this.app.querySelector('[data-policymakers-retake]');
    var all = this.app.querySelector('[data-policymakers-all-inline]');
    if (retake) {
      retake.addEventListener('click', function () {
        self.start();
      });
    }
    if (all) {
      all.addEventListener('click', function () {
        self.showAll();
      });
    }
  };

  Quiz.prototype.focusResult = function () {
    var heading = this.app.querySelector('.result-profile');
    if (heading) {
      heading.focus({ preventScroll: true });
      this.app.scrollIntoView({ behavior: motionBehavior(), block: 'start' });
    }
  };

  Quiz.prototype.showResults = function (scored) {
    persistResults(scored.results);
    this.app.innerHTML = resultHtml(scored.results, false);
    this.bindResultActions();
    this.focusResult();
  };

  Quiz.prototype.showAll = function () {
    if (!this.data || !this.data.quiz || !Array.isArray(this.data.quiz.results)) return;
    this.app.innerHTML = resultHtml(this.data.quiz.results, true);
    this.bindResultActions();
    this.focusResult();
  };

  function fieldValue(field) {
    return (field.value || '').trim() || 'Not filled in';
  }

  function requestValue(form, key) {
    var field = form.querySelector('[data-brief-request="' + key + '"]');
    var fallback = {
      agency: '[agency or system]',
      measure: '[measure]',
      institutions: '[institutions or sector]',
      date: '[date]'
    };
    return field && field.value.trim() ? field.value.trim() : fallback[key];
  }

  function buildBriefText(form) {
    var lines = ['Five measures to add to early-earnings data', ''];

    Array.prototype.forEach.call(form.querySelectorAll('[data-brief-row]'), function (row) {
      var measure = row.querySelector('th');
      var why = row.querySelector('[data-brief-why]');
      lines.push(measure ? measure.textContent.trim().replace(/\s+/g, ' ') : 'Measure');
      if (why) lines.push('Why it matters: ' + why.textContent.trim().replace(/\s+/g, ' '));
      Array.prototype.forEach.call(row.querySelectorAll('[data-brief-field]'), function (field) {
        lines.push(fieldLabels[field.getAttribute('data-brief-field')] + ': ' + fieldValue(field));
      });
      lines.push('');
    });

    lines.push('Our request');
    lines.push('We ask ' + requestValue(form, 'agency') + ' to report ' + requestValue(form, 'measure') +
      ' for ' + requestValue(form, 'institutions') + ' by ' + requestValue(form, 'date') +
      ', alongside the completion and early-earnings data already reported, so that the state can see the long-term return on its investment.');
    lines.push('');
    lines.push('Language for a report request (adapt to your state)');
    var report = form.querySelector('[data-brief-report-language]');
    if (report) lines.push(report.textContent.trim().replace(/\s+/g, ' '));
    lines.push('');
    lines.push('For a hearing or floor statement');
    var hearing = form.querySelector('[data-brief-hearing-language]');
    if (hearing) lines.push(hearing.textContent.trim().replace(/\s+/g, ' '));

    return lines.join('\n').trim();
  }

  function setStatus(form, message) {
    var status = form.querySelector('[data-brief-status]');
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

  function setupBrief() {
    var form = document.querySelector('[data-policymakers-brief]');
    if (!form) return;

    var copy = form.querySelector('[data-brief-copy]');
    var email = form.querySelector('[data-brief-email]');
    var print = form.querySelector('[data-brief-print]');

    if (copy) {
      copy.addEventListener('click', function () {
        copyText(
          buildBriefText(form),
          function () { setStatus(form, 'Brief copied.'); },
          function () { setStatus(form, 'Could not copy automatically. Select the brief and copy it.'); }
        );
      });
    }

    if (email) {
      email.addEventListener('click', function () {
        window.location.href = 'mailto:?subject=' + encodeURIComponent('Five measures to add to early-earnings data') +
          '&body=' + encodeURIComponent(buildBriefText(form));
        setStatus(form, 'If your email app does not open, use Copy instead.');
      });
    }

    if (print) {
      print.addEventListener('click', function () {
        setStatus(form, 'Opening the print dialog.');
        printing('printing-policymakers-brief');
      });
    }

    window.addEventListener('afterprint', function () {
      document.body.classList.remove('printing-policymakers-brief');
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;

    setupBrief();

    var data = root.WCIRF_POLICYMAKERS;
    if (!data) {
      if (root.console) root.console.warn('[WCIRF] Policymakers data was not loaded.');
      return;
    }

    var app = document.querySelector('[data-policymakers-quiz]');
    if (!app) return;

    var quiz = new Quiz(app, data);
    var reopen = reopenResults(data);
    if (reopen.length) quiz.showResults({ results: reopen });
    else quiz.start();

    Array.prototype.forEach.call(document.querySelectorAll('[data-policymakers-all], [data-policymakers-skip]'), function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        quiz.showAll();
      });
    });
  }

  return {
    init: init,
    scoreQuiz: scoreQuiz,
    shuffle: shuffle,
    buildBriefText: buildBriefText
  };
});
