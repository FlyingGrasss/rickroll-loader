(function () {
  'use strict';

  var FIRST_LOAD_MS = 2500;
  var SWITCH_LOAD_MS = 1200;
  var MEDIA_FALLBACK_MS = 1500;

  var overlay = document.getElementById('overlay');
  var page = document.getElementById('page');
  var main = document.getElementById('main');
  var skipButton = document.getElementById('skipButton');
  var media = document.getElementById('media');
  var frame = document.getElementById('rickroll');
  var progressBar = document.getElementById('progressBar');
  var navButtons = document.querySelectorAll('[data-section]');
  var panels = document.querySelectorAll('[data-panel]');

  var canShowOverlay = Boolean(overlay && page && skipButton && progressBar);

  var isOpen = false;
  var closeTimer = 0;
  var fallbackTimer = 0;
  var mediaLoaded = false;
  var pendingSection = null;
  var returnFocusTo = null;

  function setSection(name) {
    panels.forEach(function (panel) {
      panel.hidden = panel.dataset.panel !== name;
    });

    navButtons.forEach(function (button) {
      var isActive = button.dataset.section === name;
      button.classList.toggle('is-active', isActive);

      if (isActive) {
        button.setAttribute('aria-current', 'page');
      } else {
        button.removeAttribute('aria-current');
      }
    });
  }

  function setPageLocked(locked) {
    if (!page || !document.body) {
      return;
    }

    if ('inert' in page) {
      page.inert = locked;
    }

    if (locked) {
      page.setAttribute('aria-hidden', 'true');
    } else {
      page.removeAttribute('aria-hidden');
    }

    document.body.classList.toggle('is-loading', locked);
  }

  function startProgress(duration) {
    if (!progressBar) {
      return;
    }

    var reduceMotion = typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    void progressBar.offsetWidth;
    progressBar.style.transition = reduceMotion ? 'none' : 'width ' + duration + 'ms linear';
    progressBar.style.width = '100%';
  }

  function armMediaFallback() {
    if (!media || mediaLoaded) {
      return;
    }

    if (navigator.onLine === false) {
      media.classList.add('is-fallback');
      return;
    }

    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(function () {
      if (!mediaLoaded) {
        media.classList.add('is-fallback');
      }
    }, MEDIA_FALLBACK_MS);
  }

  function rememberFocus() {
    var active = document.activeElement;

    if (active instanceof HTMLElement && active !== document.body) {
      returnFocusTo = active;
    }
  }

  function restoreFocus() {
    if (returnFocusTo && document.contains(returnFocusTo)) {
      returnFocusTo.focus({ preventScroll: true });
    } else if (main) {
      main.focus({ preventScroll: true });
    }

    returnFocusTo = null;
  }

  function closeOverlay(instant) {
    if (!isOpen || !canShowOverlay) {
      return;
    }

    isOpen = false;
    window.clearTimeout(closeTimer);
    closeTimer = 0;

    if (pendingSection) {
      setSection(pendingSection);
      pendingSection = null;
    }

    setPageLocked(false);
    restoreFocus();

    if (overlay.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    overlay.classList.toggle('is-instant', Boolean(instant));
    overlay.classList.add('is-hiding');
    overlay.setAttribute('aria-hidden', 'true');

    if ('inert' in overlay) {
      overlay.inert = true;
    }
  }

  function openOverlay(duration, section) {
    if (!canShowOverlay) {
      if (section) {
        setSection(section);
      }
      return;
    }

    window.clearTimeout(closeTimer);
    pendingSection = section || null;

    if (!isOpen) {
      rememberFocus();
      isOpen = true;

      overlay.classList.remove('is-hiding');
      overlay.classList.remove('is-instant');
      overlay.removeAttribute('aria-hidden');

      if ('inert' in overlay) {
        overlay.inert = false;
      }

      skipButton.focus({ preventScroll: true });
      setPageLocked(true);
    }

    startProgress(duration);
    armMediaFallback();

    closeTimer = window.setTimeout(closeOverlay, duration);
  }

  if (frame) {
    frame.addEventListener('load', function () {
      if (navigator.onLine === false) {
        if (media) {
          media.classList.add('is-fallback');
        }
        return;
      }

      mediaLoaded = true;
      window.clearTimeout(fallbackTimer);

      if (media) {
        media.classList.remove('is-fallback');
      }
    });
  }

  navButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var section = button.dataset.section;

      if (!section || button.classList.contains('is-active')) {
        return;
      }

      openOverlay(SWITCH_LOAD_MS, section);
    });
  });

  if (skipButton) {
    skipButton.addEventListener('click', function () {
      closeOverlay(true);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen) {
      closeOverlay(true);
    }
  });

  if (canShowOverlay) {
    openOverlay(FIRST_LOAD_MS);
  }
})();
