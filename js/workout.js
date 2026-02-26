/**
 * WorkIn&Out — Workout Manager
 * window.WorkoutManager
 */
(function () {
  'use strict';

  const KEYS = {
    PLANS:    'workinout_workout_plans',
    SCHEDULE: 'workinout_weekly_schedule',
  };

  /* ══════════════════════════════════════════
     EXERCISE LIBRARY  (30+ exercises)
  ══════════════════════════════════════════ */
  const EXERCISE_LIBRARY = {
    // ── Chest ──────────────────────────────
    bench_press: {
      name: 'Barbell Bench Press', category: 'chest', icon: '🏋️',
      sets: 4, reps: '8-10', rest: 90, difficulty: 'intermediate',
      description: 'Classic compound lift for overall chest development.',
      muscleGroups: ['Pectorals', 'Triceps', 'Anterior Deltoid'],
    },
    push_up: {
      name: 'Push-Up', category: 'chest', icon: '💪',
      sets: 3, reps: '12-20', rest: 60, difficulty: 'easy',
      description: 'Bodyweight compound movement targeting chest and triceps.',
      muscleGroups: ['Pectorals', 'Triceps', 'Core'],
    },
    incline_dumbbell: {
      name: 'Incline Dumbbell Press', category: 'chest', icon: '🏋️',
      sets: 3, reps: '10-12', rest: 75, difficulty: 'intermediate',
      description: 'Targets the upper chest for a full, rounded look.',
      muscleGroups: ['Upper Pectorals', 'Triceps', 'Deltoids'],
    },
    cable_flyes: {
      name: 'Cable Chest Flyes', category: 'chest', icon: '〰️',
      sets: 3, reps: '12-15', rest: 60, difficulty: 'intermediate',
      description: 'Isolation movement for chest stretch and contraction.',
      muscleGroups: ['Pectorals'],
    },

    // ── Back ───────────────────────────────
    deadlift: {
      name: 'Deadlift', category: 'back', icon: '🏋️',
      sets: 4, reps: '5-6', rest: 120, difficulty: 'hard',
      description: 'King of compound lifts — total posterior chain.',
      muscleGroups: ['Erector Spinae', 'Hamstrings', 'Glutes', 'Lats', 'Traps'],
    },
    pull_up: {
      name: 'Pull-Up', category: 'back', icon: '🔝',
      sets: 4, reps: '6-10', rest: 90, difficulty: 'intermediate',
      description: 'Builds lat width and overall back strength.',
      muscleGroups: ['Latissimus Dorsi', 'Biceps', 'Rear Deltoid'],
    },
    bent_over_row: {
      name: 'Bent-Over Barbell Row', category: 'back', icon: '🏋️',
      sets: 4, reps: '8-10', rest: 90, difficulty: 'intermediate',
      description: 'Compound movement for back thickness.',
      muscleGroups: ['Rhomboids', 'Lats', 'Biceps', 'Rear Deltoid'],
    },
    lat_pulldown: {
      name: 'Lat Pulldown', category: 'back', icon: '⬇️',
      sets: 3, reps: '10-12', rest: 75, difficulty: 'easy',
      description: 'Cable machine alternative to pull-ups.',
      muscleGroups: ['Latissimus Dorsi', 'Biceps'],
    },
    seated_cable_row: {
      name: 'Seated Cable Row', category: 'back', icon: '➡️',
      sets: 3, reps: '10-12', rest: 75, difficulty: 'easy',
      description: 'Builds mid-back thickness.',
      muscleGroups: ['Rhomboids', 'Middle Trapezius', 'Biceps'],
    },

    // ── Shoulders ──────────────────────────
    overhead_press: {
      name: 'Overhead Barbell Press', category: 'shoulders', icon: '🏋️',
      sets: 4, reps: '6-8', rest: 90, difficulty: 'hard',
      description: 'Primary compound movement for shoulder mass.',
      muscleGroups: ['Deltoids', 'Triceps', 'Upper Traps'],
    },
    lateral_raise: {
      name: 'Dumbbell Lateral Raise', category: 'shoulders', icon: '↔️',
      sets: 3, reps: '12-15', rest: 60, difficulty: 'easy',
      description: 'Isolation for medial deltoid width.',
      muscleGroups: ['Medial Deltoid'],
    },
    face_pull: {
      name: 'Face Pull', category: 'shoulders', icon: '🎯',
      sets: 3, reps: '15-20', rest: 60, difficulty: 'easy',
      description: 'Rear deltoid and rotator cuff health.',
      muscleGroups: ['Rear Deltoid', 'External Rotators', 'Traps'],
    },

    // ── Arms ───────────────────────────────
    barbell_curl: {
      name: 'Barbell Bicep Curl', category: 'arms', icon: '💪',
      sets: 3, reps: '10-12', rest: 60, difficulty: 'easy',
      description: 'Classic bicep builder.',
      muscleGroups: ['Biceps Brachii', 'Brachialis'],
    },
    hammer_curl: {
      name: 'Hammer Curl', category: 'arms', icon: '🔨',
      sets: 3, reps: '10-12', rest: 60, difficulty: 'easy',
      description: 'Targets brachialis and brachioradialis.',
      muscleGroups: ['Brachialis', 'Brachioradialis', 'Biceps'],
    },
    tricep_dips: {
      name: 'Tricep Dips', category: 'arms', icon: '⬇️',
      sets: 3, reps: '10-15', rest: 75, difficulty: 'intermediate',
      description: 'Compound tricep mass builder.',
      muscleGroups: ['Triceps', 'Chest', 'Anterior Deltoid'],
    },
    skull_crusher: {
      name: 'Skull Crusher (EZ Bar)', category: 'arms', icon: '💀',
      sets: 3, reps: '10-12', rest: 60, difficulty: 'intermediate',
      description: 'Isolation for all three tricep heads.',
      muscleGroups: ['Triceps Long Head', 'Lateral Head', 'Medial Head'],
    },

    // ── Legs ───────────────────────────────
    squat: {
      name: 'Barbell Back Squat', category: 'legs', icon: '🦵',
      sets: 4, reps: '6-8', rest: 120, difficulty: 'hard',
      description: 'The king of lower body exercises.',
      muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
    },
    leg_press: {
      name: 'Leg Press', category: 'legs', icon: '🦵',
      sets: 4, reps: '10-12', rest: 90, difficulty: 'intermediate',
      description: 'Machine-based quad dominant compound movement.',
      muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    },
    romanian_deadlift: {
      name: 'Romanian Deadlift', category: 'legs', icon: '🏋️',
      sets: 3, reps: '10-12', rest: 90, difficulty: 'intermediate',
      description: 'Hip-hinge for hamstring and glute development.',
      muscleGroups: ['Hamstrings', 'Glutes', 'Erector Spinae'],
    },
    lunges: {
      name: 'Walking Lunges', category: 'legs', icon: '🚶',
      sets: 3, reps: '12 each leg', rest: 75, difficulty: 'intermediate',
      description: 'Unilateral leg exercise for balance and strength.',
      muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    },
    calf_raise: {
      name: 'Standing Calf Raise', category: 'legs', icon: '⬆️',
      sets: 4, reps: '15-20', rest: 45, difficulty: 'easy',
      description: 'Targets gastrocnemius and soleus.',
      muscleGroups: ['Gastrocnemius', 'Soleus'],
    },
    leg_curl: {
      name: 'Seated Leg Curl', category: 'legs', icon: '🦵',
      sets: 3, reps: '12-15', rest: 60, difficulty: 'easy',
      description: 'Isolated hamstring work.',
      muscleGroups: ['Hamstrings'],
    },

    // ── Core ───────────────────────────────
    plank: {
      name: 'Plank', category: 'core', icon: '⬛',
      sets: 3, reps: '45-60 sec', rest: 45, difficulty: 'easy',
      description: 'Isometric core stability exercise.',
      muscleGroups: ['Transverse Abdominis', 'Rectus Abdominis', 'Obliques'],
    },
    cable_crunch: {
      name: 'Cable Crunch', category: 'core', icon: '📎',
      sets: 3, reps: '15-20', rest: 45, difficulty: 'easy',
      description: 'Weighted ab exercise for muscle development.',
      muscleGroups: ['Rectus Abdominis'],
    },
    russian_twist: {
      name: 'Russian Twist', category: 'core', icon: '🌀',
      sets: 3, reps: '20 total', rest: 45, difficulty: 'easy',
      description: 'Rotational exercise targeting obliques.',
      muscleGroups: ['Obliques', 'Transverse Abdominis'],
    },
    hanging_leg_raise: {
      name: 'Hanging Leg Raise', category: 'core', icon: '🤸',
      sets: 3, reps: '10-15', rest: 60, difficulty: 'intermediate',
      description: 'Hip flexors and lower ab focus.',
      muscleGroups: ['Lower Rectus Abdominis', 'Hip Flexors'],
    },

    // ── Cardio ─────────────────────────────
    treadmill_run: {
      name: 'Treadmill Run', category: 'cardio', icon: '🏃',
      sets: 1, reps: '20-30 min', rest: 0, difficulty: 'intermediate',
      description: 'Steady-state cardio for fat burning and endurance.',
      muscleGroups: ['Cardiovascular System', 'Legs'],
    },
    hiit_sprints: {
      name: 'HIIT Sprint Intervals', category: 'cardio', icon: '⚡',
      sets: 8, reps: '20 sec on / 40 sec off', rest: 0, difficulty: 'hard',
      description: 'High intensity interval training for fat loss.',
      muscleGroups: ['Cardiovascular System', 'Full Body'],
    },
    jump_rope: {
      name: 'Jump Rope', category: 'cardio', icon: '🪢',
      sets: 5, reps: '2 min rounds', rest: 60, difficulty: 'intermediate',
      description: 'Cardio and coordination workout.',
      muscleGroups: ['Cardiovascular System', 'Calves', 'Shoulders'],
    },
    rowing_machine: {
      name: 'Rowing Machine', category: 'cardio', icon: '🚣',
      sets: 1, reps: '20 min', rest: 0, difficulty: 'intermediate',
      description: 'Full-body low-impact cardio.',
      muscleGroups: ['Back', 'Legs', 'Arms', 'Cardiovascular System'],
    },
  };

  /* ══════════════════════════════════════════
     BODY TYPE RECOMMENDATIONS
  ══════════════════════════════════════════ */
  const BODY_TYPE_RECS = {
    ectomorph: {
      focus: 'Muscle building (lean bulk)',
      exercises: ['bench_press','squat','deadlift','overhead_press','bent_over_row',
                  'incline_dumbbell','pull_up','barbell_curl','skull_crusher','lunges'],
      notes: 'Focus on heavy compound lifts with progressive overload. Keep cardio minimal (1-2x/week). Eat in a caloric surplus.',
    },
    mesomorph: {
      focus: 'Athletic performance & aesthetics',
      exercises: ['squat','deadlift','bench_press','pull_up','overhead_press',
                  'romanian_deadlift','cable_flyes','lateral_raise','hanging_leg_raise','hiit_sprints'],
      notes: 'Balanced approach — mix compound and isolation work. 2-3 cardio sessions. Maintain slight surplus or maintenance calories.',
    },
    endomorph: {
      focus: 'Fat loss & muscle retention',
      exercises: ['hiit_sprints','squat','deadlift','push_up','pull_up',
                  'lunges','plank','treadmill_run','jump_rope','rowing_machine'],
      notes: 'Higher rep ranges with shorter rest. 3-4 cardio sessions per week. Caloric deficit with high protein intake.',
    },
    custom: {
      focus: 'Customizable program',
      exercises: Object.keys(EXERCISE_LIBRARY),
      notes: 'Design your own split based on your goals.',
    },
  };

  /* ── Get workouts for body type ──────────── */
  function getWorkoutsForBodyType(bodyType) {
    const rec = BODY_TYPE_RECS[bodyType] || BODY_TYPE_RECS.mesomorph;
    return {
      ...rec,
      exercises: rec.exercises.map(id => ({ id, ...EXERCISE_LIBRARY[id] })).filter(Boolean),
    };
  }

  /* ── Create workout plan ─────────────────── */
  function createWorkoutPlan(name, exerciseIds, schedule) {
    const plans = getWorkoutPlans();
    const plan = {
      id:          Utils.generateId(),
      name:        name || 'My Workout Plan',
      exercises:   exerciseIds.map(id => ({ id, ...EXERCISE_LIBRARY[id] })).filter(e => e.name),
      schedule:    schedule || [],
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    };
    plans.push(plan);
    Utils.saveToStorage(KEYS.PLANS, plans);
    return plan;
  }

  /* ── Get saved plans ─────────────────────── */
  function getWorkoutPlans() {
    return Utils.getFromStorage(KEYS.PLANS) || [];
  }

  /* ── Delete plan ─────────────────────────── */
  function deleteWorkoutPlan(planId) {
    const plans = getWorkoutPlans().filter(p => p.id !== planId);
    Utils.saveToStorage(KEYS.PLANS, plans);
  }

  /* ── Weekly schedule ─────────────────────── */
  function getWeeklySchedule() {
    return Utils.getFromStorage(KEYS.SCHEDULE) || {
      monday: null, tuesday: null, wednesday: null,
      thursday: null, friday: null, saturday: null, sunday: null,
    };
  }

  function saveWeeklySchedule(schedule) {
    Utils.saveToStorage(KEYS.SCHEDULE, schedule);
  }

  /* ── Render exercise card HTML ───────────── */
  function renderExerciseCard(exercise, selectable = false) {
    const diffClass = `difficulty-${exercise.difficulty || 'easy'}`;
    return `
      <div class="exercise-card${selectable ? ' selectable' : ''}" data-exercise-id="${exercise.id || ''}">
        <div class="exercise-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 6.5h11M6.5 17.5h11M12 2v20M4 9l2.5 2.5L4 14M20 9l-2.5 2.5L20 14"/></svg></div>
        <div class="exercise-info">
          <div class="exercise-name">${exercise.name}</div>
          <div class="exercise-meta">${exercise.sets} sets × ${exercise.reps} reps · ${exercise.rest}s rest</div>
          <div class="exercise-tags">
            <span class="badge badge-primary">${exercise.category}</span>
            <span class="badge ${diffClass}">${exercise.difficulty}</span>
            ${(exercise.muscleGroups || []).slice(0, 2).map(m =>
              `<span class="badge badge-muted">${m}</span>`).join('')}
          </div>
        </div>
        ${selectable ? `<input type="checkbox" class="form-check-input exercise-select" value="${exercise.id || ''}">` : ''}
      </div>`;
  }

  /* ── Render workout plan HTML ────────────── */
  function renderWorkoutPlan(plan) {
    return `
      <div class="card card-hover" data-plan-id="${plan.id}">
        <div class="card-header">
          <div>
            <div class="card-title">${plan.name}</div>
            <div class="card-subtitle">${plan.exercises.length} exercises · Created ${Utils.formatDate(plan.createdAt)}</div>
          </div>
          <div class="d-flex gap-4">
            <button class="btn btn-primary btn-sm" onclick="SessionManager && SessionManager.startSession('${plan.id}')">
              ▶ Start
            </button>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="WorkoutManager.deleteWorkoutPlan('${plan.id}');renderPlans()">
              Delete
            </button>
          </div>
        </div>
        <div class="d-flex flex-wrap gap-4">
          ${plan.exercises.map(ex => `<span class="badge badge-primary">${ex.name}</span>`).join('')}
        </div>
      </div>`;
  }

  /* ── Get exercise by id ──────────────────── */
  function getExercise(id) {
    return EXERCISE_LIBRARY[id] ? { id, ...EXERCISE_LIBRARY[id] } : null;
  }

  /* ── Get all exercises (array) ───────────── */
  function getAllExercises() {
    return Object.entries(EXERCISE_LIBRARY).map(([id, ex]) => ({ id, ...ex }));
  }

  /* ── Get exercises by category ───────────── */
  function getExercisesByCategory(category) {
    return getAllExercises().filter(ex =>
      !category || ex.category === category
    );
  }

  /* ── Init (called by App) ────────────────── */
  function init() {
    // page-specific setup can be added here
  }

  /* ── Export ──────────────────────────────── */
  window.WorkoutManager = {
    EXERCISE_LIBRARY,
    BODY_TYPE_RECS,
    getWorkoutsForBodyType,
    createWorkoutPlan,
    getWorkoutPlans,
    deleteWorkoutPlan,
    getWeeklySchedule,
    saveWeeklySchedule,
    renderExerciseCard,
    renderWorkoutPlan,
    getExercise,
    getAllExercises,
    getExercisesByCategory,
    init,
  };
})();
