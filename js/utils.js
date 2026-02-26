/**
 * WorkIn&Out — Utility Functions
 * window.Utils
 */
(function () {
  'use strict';

  /* ── Date formatting ─────────────────────── */
  function formatDate(date, options) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d)) return '';
    const defaults = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options || defaults);
  }

  function formatDateRelative(date) {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000); // seconds

    if (diff < 60)        return 'just now';
    if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800)    return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(d);
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  /* ── Number formatting ───────────────────── */
  function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    const n = Number(num);
    if (isNaN(n)) return String(num);
    return n.toLocaleString('en-US');
  }

  function formatDecimal(num, decimals = 1) {
    return Number(num).toFixed(decimals);
  }

  /* ── ID generation ───────────────────────── */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ── localStorage helpers ────────────────── */
  function getFromStorage(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[Utils] getFromStorage failed for key "${key}":`, e);
      return null;
    }
  }

  function saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`[Utils] saveToStorage failed for key "${key}":`, e);
      return false;
    }
  }

  function removeFromStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ── Debounce ────────────────────────────── */
  function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ── Throttle ────────────────────────────── */
  function throttle(fn, limit = 100) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= limit) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  /* ── Animate number counter ──────────────── */
  function animateCounter(element, start, end, duration = 1000) {
    if (!element) return;
    const startTime = performance.now();
    const range = end - start;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + range * eased);
      element.textContent = formatNumber(current);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ── Toast notifications ─────────────────── */
  function showToast(message, type = 'info', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const titles = { success: 'Success', error: 'Error', info: 'Info', warning: 'Warning' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-body">
        <div class="toast-title">${titles[type] || 'Notice'}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">✕</button>
    `;

    container.appendChild(toast);

    const close = () => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };

    toast.querySelector('.toast-close').addEventListener('click', close);
    if (duration > 0) setTimeout(close, duration);
    return close;
  }

  /* ── Age calculation ─────────────────────── */
  function calculateAge(birthdate) {
    if (!birthdate) return 0;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return Math.max(0, age);
  }

  /* ── BMI helpers ─────────────────────────── */
  function getBMICategory(bmi) {
    if (bmi < 18.5) return {
      category: 'Underweight',
      color: '#74b9ff',
      description: 'Your BMI suggests you may be underweight. Consider consulting a nutritionist.'
    };
    if (bmi < 25) return {
      category: 'Normal weight',
      color: '#00d4aa',
      description: 'Your BMI is in the healthy range. Keep up the great work!'
    };
    if (bmi < 30) return {
      category: 'Overweight',
      color: '#ffa502',
      description: 'Your BMI is slightly above the healthy range. Regular exercise and a balanced diet can help.'
    };
    if (bmi < 35) return {
      category: 'Obese (Class I)',
      color: '#ff6348',
      description: 'Your BMI indicates Class I obesity. A structured fitness and diet plan is recommended.'
    };
    if (bmi < 40) return {
      category: 'Obese (Class II)',
      color: '#ff4757',
      description: 'Your BMI indicates Class II obesity. Please consult a healthcare professional.'
    };
    return {
      category: 'Obese (Class III)',
      color: '#c0392b',
      description: 'Your BMI indicates Class III (severe) obesity. Medical guidance is strongly recommended.'
    };
  }

  /* ── BMR (Harris-Benedict) ───────────────── */
  function calculateBMR(weight, height, age, gender) {
    // weight in kg, height in cm, age in years
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);

    if (gender === 'female') {
      return 655.1 + (9.563 * w) + (1.850 * h) - (4.676 * a);
    }
    // male (default)
    return 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
  }

  /* ── TDEE ────────────────────────────────── */
  function calculateTDEE(bmr, activityLevel) {
    const multipliers = {
      sedentary:    1.2,
      light:        1.375,
      moderate:     1.55,
      active:       1.725,
      very_active:  1.9,
    };
    const mult = multipliers[activityLevel] || multipliers.moderate;
    return Math.round(bmr * mult);
  }

  /* ── Deep clone ──────────────────────────── */
  function deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj;
    }
  }

  /* ── Clamp ───────────────────────────────── */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /* ── Capitalise first letter ─────────────── */
  function capitalise(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ── Parse query string ──────────────────── */
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /* ── DOM helpers ─────────────────────────── */
  function qs(selector, parent = document)  { return parent.querySelector(selector);    }
  function qsa(selector, parent = document) { return [...parent.querySelectorAll(selector)]; }

  function createElement(tag, className, innerHTML) {
    const el = document.createElement(tag);
    if (className)  el.className = className;
    if (innerHTML)  el.innerHTML = innerHTML;
    return el;
  }

  /* ── Export ──────────────────────────────── */
  window.Utils = {
    formatDate,
    formatDateRelative,
    formatTime,
    formatNumber,
    formatDecimal,
    generateId,
    getFromStorage,
    saveToStorage,
    removeFromStorage,
    debounce,
    throttle,
    animateCounter,
    showToast,
    calculateAge,
    getBMICategory,
    calculateBMR,
    calculateTDEE,
    deepClone,
    clamp,
    capitalise,
    getQueryParam,
    qs,
    qsa,
    createElement,
  };
})();
