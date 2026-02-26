/**
 * WorkIn&Out — Theme Manager
 * window.ThemeManager
 */
(function () {
  'use strict';

  const STORAGE_KEY  = 'workinout_theme';
  const DARK         = 'dark';
  const LIGHT        = 'light';
  const TRANSITION_CLASS = 'theme-transitioning';
  const TRANSITION_MS    = 350;

  /* ── Internal state ──────────────────────── */
  let currentTheme = LIGHT;

  /* ── Apply theme to DOM ──────────────────── */
  function _applyTheme(theme, animate = false) {
    if (animate) {
      document.documentElement.classList.add(TRANSITION_CLASS);
    }

    if (theme === LIGHT) {
      document.documentElement.setAttribute('data-theme', LIGHT);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    currentTheme = theme;
    _updateIcons(theme);
    _updateMetaTheme(theme);

    if (animate) {
      setTimeout(() => {
        document.documentElement.classList.remove(TRANSITION_CLASS);
      }, TRANSITION_MS);
    }
  }

  /* ── SVG icons for theme toggle ─────────── */
  const SUN_SVG  = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  const MOON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  /* ── Update toggle button icons ─────────── */
  function _updateIcons(theme) {
    const toggleBtns = document.querySelectorAll('[data-theme-toggle]');
    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-label', theme === DARK ? 'Switch to light mode' : 'Switch to dark mode');
      const iconEl = btn.querySelector('.theme-icon');
      if (iconEl) {
        iconEl.innerHTML = theme === DARK ? SUN_SVG : MOON_SVG;
      } else {
        btn.innerHTML = theme === DARK ? SUN_SVG : MOON_SVG;
      }
    });
  }

  /* ── Update browser meta theme-color ────── */
  function _updateMetaTheme(theme) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = theme === DARK ? '#0f1117' : '#f0f4f8';
  }

  /* ── Public: init ────────────────────────── */
  function init() {
    // 1. Check stored preference
    const stored = localStorage.getItem(STORAGE_KEY);
    // 2. Fall back to OS preference
    const prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const resolved = stored || (prefersDark ? DARK : LIGHT);
    _applyTheme(resolved, false);

    // 3. Listen for OS preference changes (if no manual override)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        _applyTheme(e.matches ? DARK : LIGHT, true);
      }
    });

    // 4. Wire any [data-theme-toggle] buttons in the DOM now or later
    document.addEventListener('click', e => {
      if (e.target.closest('[data-theme-toggle]')) {
        toggle();
      }
    });
  }

  /* ── Public: toggle ──────────────────────── */
  function toggle() {
    const next = currentTheme === DARK ? LIGHT : DARK;
    localStorage.setItem(STORAGE_KEY, next);
    _applyTheme(next, true);
  }

  /* ── Public: setTheme ────────────────────── */
  function setTheme(theme) {
    if (theme !== DARK && theme !== LIGHT) return;
    localStorage.setItem(STORAGE_KEY, theme);
    _applyTheme(theme, true);
  }

  /* ── Public: getTheme ────────────────────── */
  function getTheme() {
    return currentTheme;
  }

  function isDark() {
    return currentTheme === DARK;
  }

  /* ── Export ──────────────────────────────── */
  window.ThemeManager = { init, toggle, setTheme, getTheme, isDark };
})();
