/**
 * WorkIn&Out — Session Tracker
 * window.SessionManager
 */
(function () {
  'use strict';

  const KEYS = {
    SESSIONS: 'workinout_sessions',
    ACTIVE:   'workinout_active_session',
  };

  /* ── Internal state ──────────────────────── */
  let _stopwatchInterval = null;
  let _stopwatchSeconds  = 0;
  let _stopwatchRunning  = false;

  let _restInterval = null;
  let _restTotal    = 0;
  let _restRemaining= 0;

  let _activeSession = null;

  /* ══════════════════════════════════════════
     SESSION CRUD
  ══════════════════════════════════════════ */

  function startSession(planIdOrPlan) {
    let plan = null;

    if (typeof planIdOrPlan === 'string') {
      const plans = WorkoutManager.getWorkoutPlans();
      plan = plans.find(p => p.id === planIdOrPlan);
    } else if (planIdOrPlan && typeof planIdOrPlan === 'object') {
      plan = planIdOrPlan;
    }

    _activeSession = {
      id:         Utils.generateId(),
      planId:     plan ? plan.id : null,
      planName:   plan ? plan.name : 'Free Session',
      exercises:  plan ? plan.exercises.map(ex => ({
        ...ex,
        sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
          setNum: i + 1,
          reps:   null,
          weight: null,
          done:   false,
        })),
      })) : [],
      startTime:  new Date().toISOString(),
      endTime:    null,
      pausedTime: 0,
      _pauseStart: null,
      notes:      '',
    };

    Utils.saveToStorage(KEYS.ACTIVE, _activeSession);
    _startStopwatch();
    return _activeSession;
  }

  function pauseSession() {
    if (!_activeSession) return;
    _activeSession._pauseStart = new Date().toISOString();
    Utils.saveToStorage(KEYS.ACTIVE, _activeSession);
    _pauseStopwatch();
  }

  function resumeSession() {
    if (!_activeSession) return;
    if (_activeSession._pauseStart) {
      const pausedMs = Date.now() - new Date(_activeSession._pauseStart).getTime();
      _activeSession.pausedTime += pausedMs;
      _activeSession._pauseStart = null;
    }
    Utils.saveToStorage(KEYS.ACTIVE, _activeSession);
    _resumeStopwatch();
  }

  function completeSet(exerciseId, setNum, reps, weight) {
    if (!_activeSession) return false;
    const exercise = _activeSession.exercises.find(e => e.id === exerciseId);
    if (!exercise) return false;
    const set = exercise.sets.find(s => s.setNum === setNum);
    if (!set) return false;
    set.reps   = Number(reps)   || null;
    set.weight = Number(weight) || null;
    set.done   = true;
    Utils.saveToStorage(KEYS.ACTIVE, _activeSession);
    return true;
  }

  function finishSession() {
    if (!_activeSession) return null;

    _stopStopwatch();
    stopRestTimer();

    _activeSession.endTime = new Date().toISOString();
    const durationMs = Date.now() - new Date(_activeSession.startTime).getTime()
      - (_activeSession.pausedTime || 0);
    _activeSession.durationSeconds = Math.round(durationMs / 1000);

    // Summary stats
    let totalSets = 0, totalReps = 0, totalVolume = 0;
    (_activeSession.exercises || []).forEach(ex => {
      (ex.sets || []).forEach(s => {
        if (s.done) {
          totalSets++;
          totalReps   += s.reps   || 0;
          totalVolume += (s.reps  || 0) * (s.weight || 0);
        }
      });
    });

    _activeSession.summary = { totalSets, totalReps, totalVolume };

    const sessions = getSessions();
    sessions.push(_activeSession);
    Utils.saveToStorage(KEYS.SESSIONS, sessions);
    Utils.removeFromStorage(KEYS.ACTIVE);

    const completed = { ..._activeSession };
    _activeSession = null;
    return completed;
  }

  function cancelSession() {
    _stopStopwatch();
    stopRestTimer();
    _activeSession = null;
    Utils.removeFromStorage(KEYS.ACTIVE);
  }

  function getActiveSession() {
    return _activeSession || Utils.getFromStorage(KEYS.ACTIVE);
  }

  function getSessions() {
    return Utils.getFromStorage(KEYS.SESSIONS) || [];
  }

  function getSession(id) {
    return getSessions().find(s => s.id === id) || null;
  }

  /* ══════════════════════════════════════════
     STOPWATCH
  ══════════════════════════════════════════ */

  function _startStopwatch() {
    _stopwatchSeconds = 0;
    _stopwatchRunning = true;
    clearInterval(_stopwatchInterval);
    _stopwatchInterval = setInterval(_tickStopwatch, 1000);
    _updateStopwatchUI();
  }

  function _pauseStopwatch() {
    _stopwatchRunning = false;
    clearInterval(_stopwatchInterval);
    _updateStopwatchUI();
  }

  function _resumeStopwatch() {
    _stopwatchRunning = true;
    _stopwatchInterval = setInterval(_tickStopwatch, 1000);
    _updateStopwatchUI();
  }

  function _stopStopwatch() {
    _stopwatchRunning = false;
    clearInterval(_stopwatchInterval);
  }

  function _tickStopwatch() {
    _stopwatchSeconds++;
    _updateStopwatchUI();
  }

  function _updateStopwatchUI() {
    const el = document.querySelector('#session-timer');
    if (el) {
      el.textContent = Utils.formatTime(_stopwatchSeconds);
      el.className = 'timer-display ' + (_stopwatchRunning ? 'running' : 'paused');
    }
  }

  function getElapsedSeconds() { return _stopwatchSeconds; }

  /* ── Reset stopwatch ─────────────────────── */
  function resetStopwatch() {
    _stopStopwatch();
    _stopwatchSeconds = 0;
    _updateStopwatchUI();
  }

  /* ══════════════════════════════════════════
     REST TIMER
  ══════════════════════════════════════════ */

  function startRestTimer(seconds, onComplete) {
    stopRestTimer();
    _restTotal     = seconds;
    _restRemaining = seconds;
    _updateRestUI();

    _restInterval = setInterval(() => {
      _restRemaining--;
      _updateRestUI();
      if (_restRemaining <= 0) {
        stopRestTimer();
        if (typeof onComplete === 'function') onComplete();
        _onRestComplete();
      }
    }, 1000);
  }

  function stopRestTimer() {
    clearInterval(_restInterval);
    _restInterval  = null;
    _restRemaining = 0;
  }

  function _updateRestUI() {
    // Countdown number
    const numEl = document.querySelector('#rest-seconds');
    if (numEl) numEl.textContent = _restRemaining;

    // SVG circle progress
    const circle = document.querySelector('#rest-progress-circle');
    if (circle) {
      const r           = parseFloat(circle.getAttribute('r') || 45);
      const circumference = 2 * Math.PI * r;
      const progress    = _restTotal > 0 ? _restRemaining / _restTotal : 0;
      circle.style.strokeDasharray  = circumference;
      circle.style.strokeDashoffset = circumference * (1 - progress);
    }
  }

  function _onRestComplete() {
    Utils.showToast('Rest over — time for your next set! 💪', 'info');
    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }

  /* ══════════════════════════════════════════
     RENDER SESSION SUMMARY
  ══════════════════════════════════════════ */

  function renderSessionSummary(session) {
    const s = session || {};
    const summary = s.summary || {};
    const duration = Utils.formatTime(s.durationSeconds || 0);

    const exerciseRows = (s.exercises || []).map(ex => {
      const doneSets = (ex.sets || []).filter(s => s.done);
      const volume   = doneSets.reduce((a, s) => a + (s.reps || 0) * (s.weight || 0), 0);
      return `
        <tr>
          <td class="text-sm">${ex.name || ex.id}</td>
          <td class="text-sm text-center">${doneSets.length}/${(ex.sets || []).length}</td>
          <td class="text-sm text-center">${doneSets.reduce((a, s) => a + (s.reps || 0), 0)}</td>
          <td class="text-sm text-center">${volume > 0 ? Utils.formatNumber(volume) + ' kg' : '—'}</td>
        </tr>`;
    }).join('');

    return `
      <div class="card text-center mb-12" style="background:var(--gradient-primary)">
        <div style="font-size:3rem">🎉</div>
        <h2 style="color:#fff;margin:8px 0 4px">Workout Complete!</h2>
        <p style="color:rgba(255,255,255,0.85)">${s.planName || 'Session'} finished</p>
      </div>

      <div class="stats-grid mb-12">
        <div class="stat-card">
          <div class="stat-icon teal">⏱</div>
          <div class="stat-info">
            <div class="stat-value">${duration}</div>
            <div class="stat-label">Duration</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">✅</div>
          <div class="stat-info">
            <div class="stat-value">${summary.totalSets || 0}</div>
            <div class="stat-label">Sets Completed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">🔢</div>
          <div class="stat-info">
            <div class="stat-value">${Utils.formatNumber(summary.totalReps || 0)}</div>
            <div class="stat-label">Total Reps</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">🏋️</div>
          <div class="stat-info">
            <div class="stat-value">${Utils.formatNumber(summary.totalVolume || 0)}</div>
            <div class="stat-label">Volume (kg)</div>
          </div>
        </div>
      </div>

      ${exerciseRows ? `
      <div class="card">
        <div class="card-header"><div class="card-title">Exercise Breakdown</div></div>
        <div class="overflow-x-auto">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="border-bottom:1px solid var(--border-color)">
                <th class="text-left text-sm font-semibold p-6">Exercise</th>
                <th class="text-center text-sm font-semibold p-6">Sets</th>
                <th class="text-center text-sm font-semibold p-6">Reps</th>
                <th class="text-center text-sm font-semibold p-6">Volume</th>
              </tr>
            </thead>
            <tbody>${exerciseRows}</tbody>
          </table>
        </div>
      </div>` : ''}`;
  }

  /* ── Render the active session exercise list ─ */
  function renderSessionExercises(containerId) {
    const session = getActiveSession();
    const container = document.getElementById(containerId);
    if (!container || !session) return;

    container.innerHTML = (session.exercises || []).map((ex, ei) => `
      <div class="card mb-8" id="ex-card-${ex.id}">
        <div class="card-header">
          <div>
            <div class="card-title">${ex.icon || '💪'} ${ex.name}</div>
            <div class="card-subtitle">${ex.sets.length} sets × ${ex.reps || '—'} reps · ${ex.rest || 60}s rest</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="SessionManager.startRestTimer(${ex.rest || 60})">
            ⏲ Rest Timer
          </button>
        </div>

        <div class="set-row" style="border-bottom:2px solid var(--border-color);font-size:0.75rem;font-weight:700;color:var(--text-muted)">
          <div>SET</div><div>KG</div><div>REPS</div><div>DONE</div>
        </div>

        ${ex.sets.map((set, si) => `
          <div class="set-row" id="set-${ex.id}-${set.setNum}">
            <div class="set-num${set.done ? ' completed' : ''}">${set.setNum}</div>
            <input class="set-input" type="number" placeholder="kg"
              value="${set.weight || ''}"
              onchange="SessionManager.completeSet('${ex.id}',${set.setNum},
                document.getElementById('reps-${ex.id}-${set.setNum}').value, this.value)">
            <input class="set-input" type="number" placeholder="reps" id="reps-${ex.id}-${set.setNum}"
              value="${set.reps || ''}"
              onchange="SessionManager.completeSet('${ex.id}',${set.setNum},
                this.value, document.querySelector('#set-${ex.id}-${set.setNum} .set-input').value)">
            <button class="btn btn-sm ${set.done ? 'btn-success' : 'btn-ghost'}"
              onclick="SessionManager.toggleSet('${ex.id}',${set.setNum},this)">
              ${set.done ? '✓' : '○'}
            </button>
          </div>`).join('')}
      </div>`).join('');
  }

  function toggleSet(exerciseId, setNum, btn) {
    const session = getActiveSession();
    if (!session) return;
    const exercise = session.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;
    const set = exercise.sets.find(s => s.setNum === setNum);
    if (!set) return;
    set.done = !set.done;
    if (set.done) {
      btn.className = 'btn btn-sm btn-success';
      btn.textContent = '✓';
      const numEl = document.querySelector(`#set-${exerciseId}-${setNum} .set-num`);
      if (numEl) numEl.classList.add('completed');
    } else {
      btn.className = 'btn btn-sm btn-ghost';
      btn.textContent = '○';
      const numEl = document.querySelector(`#set-${exerciseId}-${setNum} .set-num`);
      if (numEl) numEl.classList.remove('completed');
    }
    if (session.id === (_activeSession || {}).id) {
      _activeSession = session;
    }
    Utils.saveToStorage(KEYS.ACTIVE, session);
  }

  /* ── Init ────────────────────────────────── */
  function init() {
    // Restore active session if exists
    const stored = Utils.getFromStorage(KEYS.ACTIVE);
    if (stored) {
      _activeSession = stored;
      _startStopwatch();
    }

    // Wire session control buttons if on session page
    const startBtn  = document.querySelector('#session-start-btn');
    const pauseBtn  = document.querySelector('#session-pause-btn');
    const finishBtn = document.querySelector('#session-finish-btn');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const planSelect = document.querySelector('#plan-select');
        const planId = planSelect ? planSelect.value : null;
        startSession(planId);
        renderSessionExercises('session-exercises');
        document.querySelector('#session-controls')?.classList.remove('d-none');
        startBtn.classList.add('d-none');
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (_stopwatchRunning) {
          pauseSession();
          pauseBtn.textContent = '▶ Resume';
        } else {
          resumeSession();
          pauseBtn.textContent = '⏸ Pause';
        }
      });
    }

    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        const session = finishSession();
        if (!session) return;
        const summaryEl = document.querySelector('#session-summary');
        if (summaryEl) {
          summaryEl.innerHTML = renderSessionSummary(session);
          summaryEl.classList.remove('d-none');
        }
        document.querySelector('#session-exercises')?.remove();
        document.querySelector('#session-controls')?.classList.add('d-none');
        Utils.showToast('Great workout! Session saved 🎉', 'success');
      });
    }

    // Populate plan select
    const planSelect = document.querySelector('#plan-select');
    if (planSelect) {
      const plans = WorkoutManager.getWorkoutPlans();
      planSelect.innerHTML = `<option value="">-- Select a plan --</option>` +
        plans.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
  }

  /* ── Export ──────────────────────────────── */
  window.SessionManager = {
    startSession,
    pauseSession,
    resumeSession,
    completeSet,
    toggleSet,
    finishSession,
    cancelSession,
    getActiveSession,
    getSessions,
    getSession,
    getElapsedSeconds,
    resetStopwatch,
    startRestTimer,
    stopRestTimer,
    renderSessionSummary,
    renderSessionExercises,
    init,
  };
})();
