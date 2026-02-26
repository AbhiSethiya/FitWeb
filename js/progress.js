/**
 * WorkIn&Out — Progress Tracker
 * window.ProgressManager
 */
(function () {
  'use strict';

  const KEYS = {
    WEIGHT:       'workinout_weight_history',
    MEASUREMENTS: 'workinout_measurements',
    PRs:          'workinout_personal_records',
  };

  /* ── Accent colour from CSS var ─────────── */
  function _cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#00d4aa';
  }

  /* ══════════════════════════════════════════
     WEIGHT TRACKING
  ══════════════════════════════════════════ */

  function saveWeightEntry(weight, date) {
    const history = getWeightHistory();
    const entry   = {
      id:     Utils.generateId(),
      weight: Number(weight),
      date:   date || new Date().toISOString().slice(0, 10),
    };
    // Overwrite if same date
    const idx = history.findIndex(h => h.date === entry.date);
    if (idx >= 0) history[idx] = entry;
    else history.push(entry);

    history.sort((a, b) => a.date.localeCompare(b.date));
    Utils.saveToStorage(KEYS.WEIGHT, history);
    return entry;
  }

  function getWeightHistory() {
    return Utils.getFromStorage(KEYS.WEIGHT) || [];
  }

  function deleteWeightEntry(id) {
    const history = getWeightHistory().filter(h => h.id !== id);
    Utils.saveToStorage(KEYS.WEIGHT, history);
  }

  /* ══════════════════════════════════════════
     BODY MEASUREMENTS
  ══════════════════════════════════════════ */

  function saveMeasurements(measurements) {
    const history = getMeasurements();
    const entry   = {
      id:   Utils.generateId(),
      date: measurements.date || new Date().toISOString().slice(0, 10),
      ...measurements,
    };
    history.push(entry);
    Utils.saveToStorage(KEYS.MEASUREMENTS, history);
    return entry;
  }

  function getMeasurements() {
    return Utils.getFromStorage(KEYS.MEASUREMENTS) || [];
  }

  function getLatestMeasurements() {
    const history = getMeasurements();
    return history.length ? history[history.length - 1] : null;
  }

  /* ══════════════════════════════════════════
     PERSONAL RECORDS (PRs)
  ══════════════════════════════════════════ */

  function savePersonalRecord(exercise, value, unit = 'kg') {
    const records = getPersonalRecords();
    const existing = records.find(r => r.exercise === exercise);
    const entry = {
      id:       Utils.generateId(),
      exercise,
      value:    Number(value),
      unit,
      date:     new Date().toISOString().slice(0, 10),
      isNew:    true,
    };

    if (existing) {
      if (Number(value) > existing.value) {
        existing.previous = existing.value;
        existing.value    = Number(value);
        existing.date     = entry.date;
        existing.isNew    = true;
      } else {
        return { saved: false, message: 'Not a new PR', current: existing };
      }
    } else {
      records.push(entry);
    }

    Utils.saveToStorage(KEYS.PRs, records);
    return { saved: true, entry: existing || entry };
  }

  function getPersonalRecords() {
    return Utils.getFromStorage(KEYS.PRs) || [];
  }

  function deletePersonalRecord(id) {
    const records = getPersonalRecords().filter(r => r.id !== id);
    Utils.saveToStorage(KEYS.PRs, records);
  }

  /* ══════════════════════════════════════════
     STREAK CALCULATION
  ══════════════════════════════════════════ */

  function getWorkoutStreak() {
    const sessions = (window.SessionManager ? SessionManager.getSessions() : [])
      .map(s => s.startTime ? s.startTime.slice(0, 10) : null)
      .filter(Boolean)
      .sort()
      .reverse();

    if (!sessions.length) return 0;

    const uniqueDays = [...new Set(sessions)];
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    let check   = today;

    for (const day of uniqueDays) {
      if (day === check) {
        streak++;
        // Move check to previous day
        const d = new Date(check);
        d.setDate(d.getDate() - 1);
        check = d.toISOString().slice(0, 10);
      } else {
        break;
      }
    }
    return streak;
  }

  /* ══════════════════════════════════════════
     WEIGHT CHART  (Canvas line chart)
  ══════════════════════════════════════════ */

  function renderWeightChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) return;

    const history = getWeightHistory().slice(-20); // last 20 entries
    if (history.length < 2) {
      _drawEmptyChart(canvas, 'Not enough data yet');
      return;
    }

    const ctx     = canvas.getContext('2d');
    const W       = canvas.offsetWidth  || 600;
    const H       = canvas.offsetHeight || 280;
    canvas.width  = W;
    canvas.height = H;

    const values  = history.map(h => h.weight);
    const labels  = history.map(h => Utils.formatDate(h.date, { month: 'short', day: 'numeric' }));
    const minV    = Math.min(...values) - 2;
    const maxV    = Math.max(...values) + 2;

    const padL = 50, padR = 20, padT = 24, padB = 44;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const xPos = i => padL + (i / (values.length - 1)) * plotW;
    const yPos = v => padT + (1 - (v - minV) / (maxV - minV)) * plotH;

    ctx.clearRect(0, 0, W, H);

    // ── Grid ───────────────────────────────
    const gridColor = _cssVar('--border-color') || 'rgba(0,0,0,0.08)';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth   = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padT + (i / gridLines) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      // Y-axis labels
      const val = maxV - (i / gridLines) * (maxV - minV);
      ctx.fillStyle = _cssVar('--text-muted') || '#718096';
      ctx.font      = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val.toFixed(1), padL - 6, y + 4);
    }

    // ── Gradient fill ──────────────────────
    const grad = ctx.createLinearGradient(0, padT, 0, H - padB);
    grad.addColorStop(0, 'rgba(0,212,170,0.25)');
    grad.addColorStop(1, 'rgba(0,212,170,0.02)');

    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(values[0]));
    values.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
    ctx.lineTo(xPos(values.length - 1), H - padB);
    ctx.lineTo(xPos(0), H - padB);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // ── Line ───────────────────────────────
    ctx.strokeStyle = '#00d4aa';
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(values[0]));
    values.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
    ctx.stroke();

    // ── Dots & X-axis labels ───────────────
    const step = Math.max(1, Math.floor(values.length / 8));
    values.forEach((v, i) => {
      const x = xPos(i), y = yPos(v);

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle   = '#00d4aa';
      ctx.strokeStyle = _cssVar('--bg-card') || '#fff';
      ctx.lineWidth   = 2;
      ctx.fill();
      ctx.stroke();

      // X labels (skip if too many)
      if (i % step === 0 || i === values.length - 1) {
        ctx.fillStyle = _cssVar('--text-muted') || '#718096';
        ctx.font      = '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x, H - 8);
      }
    });

    // ── Y-axis title ───────────────────────
    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = _cssVar('--text-muted') || '#718096';
    ctx.font      = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Weight (kg)', 0, 0);
    ctx.restore();
  }

  /* ══════════════════════════════════════════
     MEASUREMENTS CHART  (Radar-style bar chart)
  ══════════════════════════════════════════ */

  function renderMeasurementsChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) return;

    const data = getMeasurements().slice(-2); // compare latest two
    if (!data.length) {
      _drawEmptyChart(canvas, 'No measurements recorded yet');
      return;
    }

    const latest = data[data.length - 1];
    const prev   = data.length > 1 ? data[data.length - 2] : null;

    const fields = [
      { key: 'chest',    label: 'Chest',    max: 150 },
      { key: 'waist',    label: 'Waist',    max: 130 },
      { key: 'hips',     label: 'Hips',     max: 150 },
      { key: 'bicep',    label: 'Bicep',    max: 60  },
      { key: 'thigh',    label: 'Thigh',    max: 90  },
      { key: 'calf',     label: 'Calf',     max: 60  },
    ].filter(f => latest[f.key]);

    if (!fields.length) {
      _drawEmptyChart(canvas, 'No measurement fields found');
      return;
    }

    const ctx    = canvas.getContext('2d');
    const W      = canvas.offsetWidth  || 500;
    const H      = canvas.offsetHeight || 220;
    canvas.width  = W;
    canvas.height = H;

    const n      = fields.length;
    const barW   = Math.min(40, (W - 60) / (n * (prev ? 2.5 : 1.5)));
    const groupW = barW * (prev ? 2.5 : 1.5);
    const padL   = 40, padT = 20, padB = 40;
    const plotH  = H - padT - padB;

    ctx.clearRect(0, 0, W, H);

    fields.forEach((f, i) => {
      const groupX = padL + i * (groupW + 8);
      const valCur = (latest[f.key] / f.max) * plotH;

      // Previous (grey)
      if (prev && prev[f.key]) {
        const valPrev = (prev[f.key] / f.max) * plotH;
        ctx.fillStyle = 'rgba(108,99,255,0.3)';
        ctx.fillRect(groupX, H - padB - valPrev, barW, valPrev);
      }

      // Current (teal)
      ctx.fillStyle = '#00d4aa';
      const xOff = prev ? barW * 1.2 : 0;
      ctx.fillRect(groupX + xOff, H - padB - valCur, barW, valCur);

      // Label
      ctx.fillStyle = _cssVar('--text-muted') || '#718096';
      ctx.font      = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.label, groupX + (prev ? barW * 1.1 : barW / 2), H - 8);

      // Value
      ctx.fillStyle = '#00d4aa';
      ctx.font      = 'bold 10px Inter, sans-serif';
      ctx.fillText(latest[f.key] + 'cm', groupX + xOff + barW / 2, H - padB - valCur - 4);
    });
  }

  /* ── Empty state chart ───────────────────── */
  function _drawEmptyChart(canvas, text) {
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth  || 400;
    canvas.height = canvas.offsetHeight || 200;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle   = _cssVar('--text-muted') || '#718096';
    ctx.font        = '14px Inter, sans-serif';
    ctx.textAlign   = 'center';
    ctx.textBaseline= 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  /* ── Render weight history list ──────────── */
  function renderWeightHistory() {
    const container = document.querySelector('#weight-history');
    if (!container) return;

    const history = getWeightHistory().slice().reverse();
    if (!history.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg></div>
        <div class="empty-title">No weight entries yet</div>
        <div class="empty-text">Log your weight to start tracking trends.</div>
      </div>`;
      return;
    }

    // Calculate trend
    const recent = history.slice(0, 7);
    const diff = recent.length > 1
      ? (recent[0].weight - recent[recent.length - 1].weight)
      : 0;
    const trend = diff === 0 ? '→ Stable' : diff > 0 ? `▲ +${diff.toFixed(1)} kg this week` : `▼ ${diff.toFixed(1)} kg this week`;
    const trendColor = diff === 0 ? 'var(--text-muted)' : diff > 0 ? 'var(--accent-danger)' : 'var(--accent-success)';

    container.innerHTML = `
      <div class="d-flex items-center justify-between mb-8">
        <div class="text-sm" style="color:${trendColor};font-weight:600">${trend}</div>
      </div>` +
      history.map(h => `
        <div class="d-flex items-center justify-between p-6 border rounded mb-4">
          <div class="d-flex items-center gap-8">
            <span style="font-size:1.4rem;font-weight:800;color:var(--accent-primary)">${h.weight} kg</span>
            <span class="text-sm text-muted">${Utils.formatDate(h.date)}</span>
          </div>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="ProgressManager.deleteWeightEntry('${h.id}');ProgressManager.renderWeightHistory();ProgressManager.renderWeightChart('weight-chart')">Delete</button>
        </div>`).join('');
  }

  /* ── Render PR list ──────────────────────── */
  function renderPersonalRecords() {
    const container = document.querySelector('#pr-list');
    if (!container) return;

    const records = getPersonalRecords();
    if (!records.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div>
        <div class="empty-title">No personal records yet</div>
        <div class="empty-text">Log your lifts to track new PRs.</div>
      </div>`;
      return;
    }

    container.innerHTML = records.map(r => `
      <div class="exercise-card mb-4">
        <div class="exercise-icon">${r.isNew ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 6.5h11M6.5 17.5h11M12 2v20M4 9l2.5 2.5L4 14M20 9l-2.5 2.5L20 14"/></svg>'}</div>
        <div class="exercise-info">
          <div class="exercise-name">${Utils.capitalise(r.exercise.replace(/_/g,' '))}</div>
          <div class="exercise-meta">
            <span style="color:var(--accent-primary);font-weight:700">${r.value} ${r.unit}</span>
            ${r.previous ? `<span class="text-muted"> (prev: ${r.previous} ${r.unit})</span>` : ''}
            · ${Utils.formatDate(r.date)}
          </div>
        </div>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="ProgressManager.deletePersonalRecord('${r.id}');ProgressManager.renderPersonalRecords()">Delete</button>
      </div>`).join('');
  }

  /* ── Init ────────────────────────────────── */
  function init() {
    renderWeightChart('weight-chart');
    renderMeasurementsChart('measurements-chart');
    renderWeightHistory();
    renderPersonalRecords();

    // Streak display
    const streakEl = document.querySelector('#workout-streak');
    if (streakEl) {
      const streak = getWorkoutStreak();
      Utils.animateCounter(streakEl, 0, streak, 800);
    }

    // Weight form
    const weightForm = document.querySelector('#weight-form');
    if (weightForm) {
      weightForm.addEventListener('submit', e => {
        e.preventDefault();
        const weight = parseFloat(document.querySelector('#weight-log-input')?.value);
        const date   = document.querySelector('#weight-date-input')?.value;
        if (!weight || weight <= 0) return Utils.showToast('Enter a valid weight', 'error');
        saveWeightEntry(weight, date);
        Utils.showToast(`${weight} kg logged!`, 'success');
        renderWeightHistory();
        renderWeightChart('weight-chart');
        weightForm.reset();
      });
    }

    // Measurements form
    const measForm = document.querySelector('#measurements-form');
    if (measForm) {
      measForm.addEventListener('submit', e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(measForm));
        saveMeasurements(data);
        Utils.showToast('Measurements saved!', 'success');
        renderMeasurementsChart('measurements-chart');
        measForm.reset();
      });
    }

    // PR form
    const prForm = document.querySelector('#pr-form');
    if (prForm) {
      prForm.addEventListener('submit', e => {
        e.preventDefault();
        const exercise = document.querySelector('#pr-exercise')?.value;
        const value    = parseFloat(document.querySelector('#pr-value')?.value);
        const unit     = document.querySelector('#pr-unit')?.value || 'kg';
        if (!exercise || !value) return Utils.showToast('Fill in all fields', 'error');
        const result = savePersonalRecord(exercise, value, unit);
        if (result.saved) {
          Utils.showToast(`New PR saved! ${value} ${unit} 🏆`, 'success');
          renderPersonalRecords();
          prForm.reset();
        } else {
          Utils.showToast(`Not a new PR. Current best: ${result.current.value} ${unit}`, 'info');
        }
      });
    }
  }

  /* ── Export ──────────────────────────────── */
  window.ProgressManager = {
    saveWeightEntry,
    getWeightHistory,
    deleteWeightEntry,
    saveMeasurements,
    getMeasurements,
    getLatestMeasurements,
    savePersonalRecord,
    getPersonalRecords,
    deletePersonalRecord,
    getWorkoutStreak,
    renderWeightChart,
    renderMeasurementsChart,
    renderWeightHistory,
    renderPersonalRecords,
    init,
  };
})();
