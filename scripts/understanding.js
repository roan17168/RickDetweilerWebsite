(function () {
  'use strict';

  function init() {
    var history = document.querySelector('[data-understanding-history]');
    if (!history) return;

    var mobile = window.matchMedia('(max-width: 760px)');

    function sync() {
      history.open = !mobile.matches;
    }

    sync();
    if (mobile.addEventListener) mobile.addEventListener('change', sync);
    else if (mobile.addListener) mobile.addListener(sync);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
