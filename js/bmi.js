/**
 * WorkIn&Out — BMI Calculator
 * window.BMICalculator
 */
(function () {
  'use strict';

  const KEY_HISTORY = 'workinout_bmi_history';

  /* ── Calculate BMI ───────────────────────── */
  function calculateBMI(weight, height, unit = 'metric') {
    const w = Number(weight);
    const h = Number(height);
    if (!w || !h || w <= 0 || h <= 0) return null;

    let bmi;
    if (unit === 'imperial') {
      // weight in lbs, height in inches
      bmi = (703 * w) / (h * h);
    } else {
      // weight in kg, height in cm → convert to m
      const hm = h / 100;
      bmi = w / (hm * hm);
    }
    return Math.round(bmi * 10) / 10;
  }

  /* ── Gauge needle angle ──────────────────── */
  // BMI gauge covers 180° arc. BMI range: 10–40.
  function getBMIGaugeAngle(bmi) {
    const MIN_BMI = 10, MAX_BMI = 40;
    const clamped = Math.min(Math.max(Number(bmi), MIN_BMI), MAX_BMI);
    return ((clamped - MIN_BMI) / (MAX_BMI - MIN_BMI)) * 180;
  }

  /* ── Save record ─────────────────────────── */
  function saveBMIRecord(bmi, weight, height, unit = 'metric') {
    const history = getBMIHistory();
    history.push({
      id:     Utils.generateId(),
      bmi,
      weight: Number(weight),
      height: Number(height),
      unit,
      date:   new Date().toISOString(),
    });
    Utils.saveToStorage(KEY_HISTORY, history);
  }

  /* ── Get history ─────────────────────────── */
  function getBMIHistory() {
    return Utils.getFromStorage(KEY_HISTORY) || [];
  }

  /* ── Delete one record ───────────────────── */
  function deleteBMIRecord(id) {
    const history = getBMIHistory().filter(r => r.id !== id);
    Utils.saveToStorage(KEY_HISTORY, history);
  }

  /* ── Render gauge (updates SVG in place) ──── */
  function renderBMIGauge(bmi) {
    const svgEl = document.querySelector('#bmi-gauge-svg');
    if (!svgEl) return;

    const angle  = getBMIGaugeAngle(bmi);
    const needle = svgEl.querySelector('.bmi-needle');
    if (needle) {
      needle.style.transform = `rotate(${angle - 90}deg)`;
    }

    // Update the numeric display
    const numEl = document.querySelector('#bmi-gauge-number');
    if (numEl) numEl.textContent = bmi ? bmi.toFixed(1) : '—';

    const catEl = document.querySelector('#bmi-gauge-category');
    if (catEl && bmi) {
      const info = Utils.getBMICategory(bmi);
      catEl.textContent  = info.category;
      catEl.style.color  = info.color;
    }

    // Description
    const descEl = document.querySelector('#bmi-description');
    if (descEl && bmi) {
      const info = Utils.getBMICategory(bmi);
      descEl.textContent = info.description;
      descEl.style.color = info.color;
    }
  }

  /* ── Build an SVG gauge ──────────────────── */
  function buildGaugeSVG() {
    const zones = [
      { label: 'Under', color: '#74b9ff', start: 0,   end: 0.28 },  // 10-18.5
      { label: 'Normal', color: '#00d4aa', start: 0.28, end: 0.5  },  // 18.5-25
      { label: 'Over',   color: '#ffa502', start: 0.5,  end: 0.665},  // 25-30
      { label: 'Obese',  color: '#ff4757', start: 0.665,end: 1.0  },  // 30-40
    ];

    const cx = 130, cy = 120, r = 100;
    const toRad = deg => deg * Math.PI / 180;

    function arcPath(startPct, endPct) {
      const startDeg = startPct * 180 - 180;
      const endDeg   = endPct   * 180 - 180;
      const x1 = cx + r * Math.cos(toRad(startDeg));
      const y1 = cy + r * Math.sin(toRad(startDeg));
      const x2 = cx + r * Math.cos(toRad(endDeg));
      const y2 = cy + r * Math.sin(toRad(endDeg));
      return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
    }

    const arcs = zones.map(z =>
      `<path d="${arcPath(z.start, z.end)}" stroke="${z.color}" stroke-width="14" fill="none" stroke-linecap="round"/>`
    ).join('');

    return `
      <svg id="bmi-gauge-svg" viewBox="0 0 260 140" xmlns="http://www.w3.org/2000/svg">
        <!-- Background arc -->
        <path d="M 30 120 A 100 100 0 0 1 230 120" stroke="var(--bg-secondary)" stroke-width="14" fill="none" stroke-linecap="round"/>
        ${arcs}
        <!-- Needle -->
        <g class="bmi-needle" style="transform-origin:${cx}px ${cy}px; transform:rotate(-90deg); transition:transform 1s cubic-bezier(0.34,1.56,0.64,1)">
          <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 82}" stroke="var(--text-primary)" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="${cx}" cy="${cy}" r="6" fill="var(--text-primary)"/>
        </g>
      </svg>`;
  }

  /* ── Render history list ─────────────────── */
  function renderBMIHistory() {
    const container = document.querySelector('#bmi-history');
    if (!container) return;

    const history = getBMIHistory().slice().reverse(); // newest first
    if (!history.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <div class="empty-title">No records yet</div>
          <div class="empty-text">Calculate your BMI to start tracking your history.</div>
        </div>`;
      return;
    }

    container.innerHTML = history.map(r => {
      const info = Utils.getBMICategory(r.bmi);
      return `
        <div class="card mb-6" style="border-left:3px solid ${info.color}">
          <div class="d-flex items-center justify-between">
            <div class="d-flex items-center gap-8">
              <span style="font-size:1.6rem;font-weight:800;color:${info.color}">${r.bmi.toFixed(1)}</span>
              <div>
                <div class="font-semibold" style="color:${info.color}">${info.category}</div>
                <div class="text-sm text-muted">${Utils.formatDate(r.date)}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm">${r.weight}${r.unit === 'imperial' ? ' lbs' : ' kg'} · ${r.height}${r.unit === 'imperial' ? ' in' : ' cm'}</div>
              <button class="btn btn-ghost btn-sm mt-4" onclick="BMICalculator.deleteBMIRecord('${r.id}');BMICalculator.renderBMIHistory()">🗑 Delete</button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  /* ── Render history chart (Canvas) ──────── */
  function renderBMIHistoryChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) return;

    const history = getBMIHistory().slice(-10); // last 10 entries
    if (history.length < 2) return;

    const ctx    = canvas.getContext('2d');
    const W      = canvas.offsetWidth  || 400;
    const H      = canvas.offsetHeight || 200;
    canvas.width  = W;
    canvas.height = H;

    const values = history.map(r => r.bmi);
    const dates  = history.map(r => Utils.formatDate(r.date, { month: 'short', day: 'numeric' }));
    const minVal = Math.min(...values) - 2;
    const maxVal = Math.max(...values) + 2;
    const padL = 40, padR = 20, padT = 20, padB = 40;

    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const xPos = (i) => padL + (i / (values.length - 1)) * plotW;
    const yPos = (v) => padT + (1 - (v - minVal) / (maxVal - minVal)) * plotH;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color') || '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (i / 4) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
    }

    // Line gradient fill
    const grad = ctx.createLinearGradient(0, padT, 0, H - padB);
    grad.addColorStop(0, 'rgba(0,212,170,0.3)');
    grad.addColorStop(1, 'rgba(0,212,170,0)');

    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(values[0]));
    values.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
    ctx.lineTo(xPos(values.length - 1), H - padB);
    ctx.lineTo(xPos(0), H - padB);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.strokeStyle = '#00d4aa';
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(values[0]));
    values.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
    ctx.stroke();

    // Dots + labels
    values.forEach((v, i) => {
      const x = xPos(i), y = yPos(v);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle   = '#00d4aa';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 2;
      ctx.fill();
      ctx.stroke();

      // X-axis labels
      ctx.fillStyle  = '#718096';
      ctx.font       = '10px Inter, sans-serif';
      ctx.textAlign  = 'center';
      ctx.fillText(dates[i], x, H - 8);

      // Value labels above dots
      ctx.fillStyle = '#00d4aa';
      ctx.font      = 'bold 10px Inter, sans-serif';
      ctx.fillText(v.toFixed(1), x, y - 10);
    });
  }

  /* ── Real-time calculation setup ─────────── */
  function initRealtimeCalc() {
    const inputs = ['#weight-input', '#height-input', '#unit-select'];
    inputs.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.addEventListener('input', _updateCalc);
    });
    _updateCalc();
  }

  function _updateCalc() {
    const weight = parseFloat(document.querySelector('#weight-input')?.value);
    const height = parseFloat(document.querySelector('#height-input')?.value);
    const unit   = document.querySelector('#unit-select')?.value || 'metric';
    const bmi    = calculateBMI(weight, height, unit);
    renderBMIGauge(bmi);
  }

  /* ── Init ────────────────────────────────── */
  function init() {
    // Insert gauge SVG if placeholder exists
    const gaugeHolder = document.querySelector('#gauge-holder');
    if (gaugeHolder) gaugeHolder.innerHTML = buildGaugeSVG();

    initRealtimeCalc();
    renderBMIHistory();

    // Save button
    const saveBtn = document.querySelector('#save-bmi-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const weight = parseFloat(document.querySelector('#weight-input')?.value);
        const height = parseFloat(document.querySelector('#height-input')?.value);
        const unit   = document.querySelector('#unit-select')?.value || 'metric';
        const bmi    = calculateBMI(weight, height, unit);
        if (!bmi) return Utils.showToast('Please enter valid weight and height.', 'error');
        saveBMIRecord(bmi, weight, height, unit);
        Utils.showToast(`BMI ${bmi} saved!`, 'success');
        renderBMIHistory();
        renderBMIHistoryChart('bmi-chart');
      });
    }

    renderBMIHistoryChart('bmi-chart');
  }

  /* ── Export ──────────────────────────────── */
  window.BMICalculator = {
    calculateBMI,
    getBMIGaugeAngle,
    saveBMIRecord,
    getBMIHistory,
    deleteBMIRecord,
    renderBMIGauge,
    buildGaugeSVG,
    renderBMIHistory,
    renderBMIHistoryChart,
    init,
  };
})();
