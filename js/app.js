/**
 * WorkIn&Out — App Initialization & Navigation
 * window.App
 */
(function () {
  'use strict';

  /* ── Page map ────────────────────────────── */
  const PAGE_MAP = {
    'index.html':    'home',
    '':              'home',
    'dashboard.html':'dashboard',
    'workout.html':  'workout',
    'diet.html':     'diet',
    'bmi.html':      'bmi',
    'session.html':  'session',
    'progress.html': 'progress',
    'profile.html':  'profile',
  };

  /* ── Resolve current page key ────────────── */
  function _currentPage() {
    const file = window.location.pathname.split('/').pop() || '';
    return PAGE_MAP[file] || file.replace('.html', '');
  }

  /* ── Highlight active nav items ──────────── */
  function _highlightNav() {
    const page = _currentPage();
    document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(item => {
      const href = (item.getAttribute('href') || '').split('/').pop();
      const key  = PAGE_MAP[href] || href.replace('.html', '');
      item.classList.toggle('active', key === page);
    });
  }

  /* ── Mobile sidebar toggle ───────────────── */
  function _initMobileSidebar() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar   = document.querySelector('.sidebar');
    if (!hamburger || !sidebar) return;

    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }

    function openSidebar() {
      sidebar.classList.add('open');
      overlay.classList.add('active');
      hamburger.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    overlay.addEventListener('click', closeSidebar);

    // Close on nav link click (mobile)
    sidebar.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) closeSidebar();
      });
    });
  }

  /* ── Intersection Observer for animations ── */
  function _initScrollAnimations() {
    if (!window.IntersectionObserver) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .card, .stat-card, .exercise-card, .meal-card')
      .forEach(el => {
        if (!el.classList.contains('animate-in')) observer.observe(el);
      });
  }

  /* ── Animated page transitions ───────────── */
  function _initPageTransitions() {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      // Only internal links, not anchors or external
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || link.getAttribute('target') === '_blank') return;

      link.addEventListener('click', e => {
        e.preventDefault();
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.2s ease';
        setTimeout(() => { window.location.href = href; }, 200);
      });
    });
  }

  /* ── Global modal handling ───────────────── */
  function _initModals() {
    // Close modal on overlay click
    document.addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.add('hidden');
      }
      if (e.target.closest('[data-modal-close]')) {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay) overlay.classList.add('hidden');
      }
    });

    // Close modal on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(overlay => {
          overlay.classList.add('hidden');
        });
      }
    });
  }

  /* ── Animate stat counters ───────────────── */
  function _animateStats() {
    document.querySelectorAll('[data-counter]').forEach(el => {
      const end = parseFloat(el.dataset.counter || el.textContent.replace(/[^0-9.]/g, ''));
      if (!isNaN(end)) {
        Utils.animateCounter(el, 0, end, 1200);
      }
    });
  }

  /* ── Update sidebar user info ────────────── */
  function _updateSidebarUser() {
    const user = window.Auth && Auth.getCurrentUser();
    if (!user) return;

    const nameEl   = document.querySelector('.sidebar-user-name');
    const avatarEl = document.querySelector('.sidebar-avatar');

    if (nameEl)   nameEl.textContent   = user.name;
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
  }

  /* ── Topbar page title ───────────────────── */
  function _setPageTitle() {
    const titles = {
      home:      'Welcome Back 👋',
      dashboard: 'Dashboard',
      workout:   'Workout Planner',
      diet:      'Diet & Nutrition',
      bmi:       'BMI Calculator',
      session:   'Active Session',
      progress:  'My Progress',
      profile:   'Profile & Settings',
    };
    const page = _currentPage();
    const titleEl = document.querySelector('.topbar-title');
    if (titleEl && titles[page]) titleEl.textContent = titles[page];
  }

  /* ── Initialize page-specific module ────── */
  function _initPageModule() {
    const page = _currentPage();
    const modules = {
      bmi:      () => window.BMICalculator && BMICalculator.init && BMICalculator.init(),
      workout:  () => window.WorkoutManager && WorkoutManager.init && WorkoutManager.init(),
      diet:     () => window.DietManager    && DietManager.init    && DietManager.init(),
      session:  () => window.SessionManager && SessionManager.init && SessionManager.init(),
      progress: () => window.ProgressManager&& ProgressManager.init&& ProgressManager.init(),
    };
    if (modules[page]) modules[page]();
  }

  /* ── Auth gate for protected pages ──────── */
  const PUBLIC_PAGES = ['home', ''];
  function _authGate() {
    const page = _currentPage();
    if (!PUBLIC_PAGES.includes(page) && window.Auth) {
      Auth.requireAuth('index.html');
    }
  }

  /* ── Main init ───────────────────────────── */
  function init() {
    // Theme first (prevents flash)
    if (window.ThemeManager) ThemeManager.init();

    document.addEventListener('DOMContentLoaded', () => {
      // Page fade-in
      document.body.style.opacity = '1';
      document.body.style.transition = 'opacity 0.25s ease';

      _authGate();
      _highlightNav();
      _initMobileSidebar();
      _initScrollAnimations();
      _initModals();
      _animateStats();
      _updateSidebarUser();
      _setPageTitle();
      _initPageTransitions();
      _initPageModule();

      // Re-observe on dynamic content changes
      const mutObserver = new MutationObserver(() => _initScrollAnimations());
      mutObserver.observe(document.body, { childList: true, subtree: true });
    });
  }

  /* ── Export ──────────────────────────────── */
  window.App = { init };

  // Auto-init
  init();
})();
