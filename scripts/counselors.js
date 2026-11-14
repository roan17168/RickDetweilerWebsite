(function () {
  'use strict';

  var buttons = document.querySelectorAll('[data-counselors-print]');
  if (!buttons.length) return;

  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener('click', function () {
      window.print();
    });
  });
})();
