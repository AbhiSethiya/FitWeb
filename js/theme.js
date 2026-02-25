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

    if (theme === DARK) {
      document.documentElement.setAttribute('data-theme', DARK);
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

  /* ── Update toggle button icons ─────────── */
  function _updateIcons(theme) {
    const toggleBtns = document.querySelectorAll('[data-theme-toggle]');
    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-label', theme === DARK ? 'Switch to light mode' : 'Switch to dark mode');
      // Support both emoji content and data-* driven icons
      const iconEl = btn.querySelector('.theme-icon');
      if (iconEl) {
        iconEl.textContent = theme === DARK ? '☀️' : '🌙';
      } else {
        btn.textContent = theme === DARK ? '☀️' : '🌙';
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
