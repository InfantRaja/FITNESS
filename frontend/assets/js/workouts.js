/**
 * FitTrack - Workout Tracker Logic (workouts.js)
 */

let exerciseCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadWorkouts();
  setupWorkoutModal();
  setupFilterListeners();
});

// Load workouts with optional category filter
async function loadWorkouts(category = 'All') {
  const container = document.getElementById('workoutListContainer');
  if (!container) return;

  try {
    container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Loading workouts...</p></div>';

    let endpoint = '/workouts';
    if (category && category !== 'All') {
      endpoint += `?category=${encodeURIComponent(category)}`;
    }

    const res = await apiRequest(endpoint);
    const workouts = res.data || [];

    if (!workouts.length) {
      container.innerHTML = `
        <div class="empty-state card">
          <div class="empty-state-icon">🏋️</div>
          <h3 class="empty-state-title">No Workouts Recorded</h3>
          <p class="empty-state-desc">You haven't logged any workouts ${category !== 'All' ? `for ${category}` : 'yet'}. Click below to add your first training session!</p>
          <button onclick="openModal('workoutModal')" class="btn btn-primary btn-sm">+ Log New Workout</button>
        </div>
      `;
      return;
    }

    let html = '<div style="display:flex; flex-direction:column; gap:1.25rem;">';

    workouts.forEach((w) => {
      const formattedDate = new Date(w.date || w.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      html += `
        <div class="card" style="padding:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <h3 class="font-bold" style="font-size:1.15rem;">${w.title}</h3>
                <span class="badge badge-green">${w.category}</span>
              </div>
              <p class="text-muted" style="font-size:0.85rem; margin-top:0.25rem;">
                📅 ${formattedDate} &bull; ⏱️ ${w.durationMinutes} mins &bull; 🔥 ${w.caloriesBurned || 0} kcal burned
              </p>
            </div>
            <button onclick="deleteWorkoutItem('${w._id}')" class="btn btn-danger btn-sm" title="Delete Workout">
              Delete
            </button>
          </div>
      `;

      if (w.exercises && w.exercises.length > 0) {
        html += '<div style="margin-top:1rem; border-top:1px solid var(--border-subtle); padding-top:1rem;">';
        w.exercises.forEach((ex) => {
          html += `
            <div style="margin-bottom:0.75rem;">
              <div class="font-semibold" style="font-size:0.95rem; color:var(--text-main); margin-bottom:0.35rem;">
                &bull; ${ex.name}
              </div>
              <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          `;
          ex.sets.forEach((s) => {
            const isCompleted = s.completed ? true : false;
            html += `
              <span class="badge ${isCompleted ? 'badge-green' : ''}" style="background:var(--bg-surface-elevated); border:1px solid ${isCompleted ? 'var(--primary)' : 'var(--border-subtle)'}; font-size:0.8rem;">
                Set ${s.setNumber}: ${s.reps} reps @ ${s.weightKg} kg ${isCompleted ? '✔' : ''}
              </span>
            `;
          });
          html += '</div></div>';
        });
        html += '</div>';
      }

      if (w.notes) {
        html += `
          <div style="margin-top:0.75rem; font-size:0.85rem; color:var(--text-dim); font-style:italic;">
            Note: "${w.notes}"
          </div>
        `;
      }

      html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card text-danger">Error loading workouts: ${err.message}</div>`;
  }
}

// Delete workout item
async function deleteWorkoutItem(id) {
  if (!confirm('Are you sure you want to delete this workout log?')) return;
  try {
    await apiRequest(`/workouts/${id}`, { method: 'DELETE' });
    showToast('Workout successfully deleted.', 'success');
    loadWorkouts();
  } catch (err) {
    showToast('Failed to delete workout.', 'error');
  }
}

const WORKOUT_PRESETS = {
  'Push Day (Chest, Shoulders & Triceps)': {
    category: 'Strength',
    duration: 50,
    calories: 350,
    exercises: [
      { name: 'Barbell Bench Press', sets: [{ reps: 10, weightKg: 60 }, { reps: 8, weightKg: 65 }, { reps: 6, weightKg: 70 }] },
      { name: 'Overhead Dumbbell Press', sets: [{ reps: 12, weightKg: 18 }, { reps: 10, weightKg: 20 }] },
      { name: 'Triceps Cable Pushdown', sets: [{ reps: 15, weightKg: 25 }, { reps: 12, weightKg: 30 }] }
    ]
  },
  'Pull Day (Back & Biceps)': {
    category: 'Strength',
    duration: 50,
    calories: 340,
    exercises: [
      { name: 'Lat Pulldown / Pull-ups', sets: [{ reps: 10, weightKg: 55 }, { reps: 8, weightKg: 60 }] },
      { name: 'Barbell Bent-Over Row', sets: [{ reps: 10, weightKg: 50 }, { reps: 8, weightKg: 55 }] },
      { name: 'Dumbbell Bicep Curls', sets: [{ reps: 12, weightKg: 14 }, { reps: 10, weightKg: 16 }] }
    ]
  },
  'Leg Day (Quads, Hamstrings & Calves)': {
    category: 'Strength',
    duration: 60,
    calories: 420,
    exercises: [
      { name: 'Barbell Back Squat', sets: [{ reps: 10, weightKg: 70 }, { reps: 8, weightKg: 80 }, { reps: 6, weightKg: 85 }] },
      { name: 'Romanian Deadlift (RDL)', sets: [{ reps: 10, weightKg: 60 }, { reps: 8, weightKg: 70 }] },
      { name: 'Leg Press / Lunges', sets: [{ reps: 12, weightKg: 100 }, { reps: 10, weightKg: 120 }] }
    ]
  },
  'Full Body Conditioning': {
    category: 'Strength',
    duration: 45,
    calories: 360,
    exercises: [
      { name: 'Goblet Squats', sets: [{ reps: 12, weightKg: 20 }, { reps: 12, weightKg: 24 }] },
      { name: 'Push-ups', sets: [{ reps: 15, weightKg: 0 }, { reps: 15, weightKg: 0 }] },
      { name: 'Dumbbell Rows', sets: [{ reps: 12, weightKg: 18 }, { reps: 12, weightKg: 20 }] }
    ]
  },
  'Upper Body Power': {
    category: 'Strength',
    duration: 45,
    calories: 320,
    exercises: [
      { name: 'Incline Dumbbell Press', sets: [{ reps: 10, weightKg: 22 }, { reps: 8, weightKg: 26 }] },
      { name: 'Seated Cable Row', sets: [{ reps: 12, weightKg: 50 }, { reps: 10, weightKg: 55 }] }
    ]
  },
  'Lower Body Strength': {
    category: 'Strength',
    duration: 50,
    calories: 380,
    exercises: [
      { name: 'Bulgarian Split Squats', sets: [{ reps: 10, weightKg: 16 }, { reps: 10, weightKg: 18 }] },
      { name: 'Standing Calf Raises', sets: [{ reps: 15, weightKg: 40 }, { reps: 15, weightKg: 45 }] }
    ]
  },
  'Cardio & Core Blast': {
    category: 'Cardio',
    duration: 35,
    calories: 300,
    exercises: [
      { name: 'Treadmill Run / Jog', sets: [{ reps: 20, weightKg: 0 }] },
      { name: 'Hanging Knee Raises / Planks', sets: [{ reps: 15, weightKg: 0 }, { reps: 15, weightKg: 0 }] }
    ]
  },
  'HIIT Fat Burner': {
    category: 'HIIT',
    duration: 30,
    calories: 320,
    exercises: [
      { name: 'Burpees & Mountain Climbers', sets: [{ reps: 15, weightKg: 0 }, { reps: 15, weightKg: 0 }] },
      { name: 'Kettlebell Swings', sets: [{ reps: 20, weightKg: 16 }, { reps: 20, weightKg: 20 }] }
    ]
  },
  'Morning Yoga & Mobility': {
    category: 'Flexibility',
    duration: 30,
    calories: 120,
    exercises: [
      { name: 'Sun Salutations & Hamstring Flow', sets: [{ reps: 1, weightKg: 0 }] },
      { name: 'Hip Openers & Spinal Twist', sets: [{ reps: 1, weightKg: 0 }] }
    ]
  },
  'Arms & Abs Special': {
    category: 'Strength',
    duration: 40,
    calories: 250,
    exercises: [
      { name: 'EZ-Bar Bicep Curls', sets: [{ reps: 12, weightKg: 25 }, { reps: 10, weightKg: 30 }] },
      { name: 'Overhead Tricep Extension', sets: [{ reps: 12, weightKg: 20 }, { reps: 10, weightKg: 24 }] },
      { name: 'Cable Woodchoppers', sets: [{ reps: 15, weightKg: 15 }, { reps: 15, weightKg: 15 }] }
    ]
  }
};

// Comprehensive Exercise Library with Muscle Groups
const EXERCISE_LIBRARY = [
  // Chest
  { name: 'Barbell Bench Press', category: 'Chest', defaultReps: 10, defaultWeight: 60 },
  { name: 'Incline Dumbbell Press', category: 'Chest', defaultReps: 10, defaultWeight: 22 },
  { name: 'Decline Bench Press', category: 'Chest', defaultReps: 10, defaultWeight: 50 },
  { name: 'Dumbbell Chest Flyes', category: 'Chest', defaultReps: 12, defaultWeight: 14 },
  { name: 'Cable Chest Flyes', category: 'Chest', defaultReps: 15, defaultWeight: 15 },
  { name: 'Push-ups', category: 'Chest', defaultReps: 15, defaultWeight: 0 },
  { name: 'Chest Dips', category: 'Chest', defaultReps: 10, defaultWeight: 0 },
  { name: 'Dumbbell Pullover', category: 'Chest', defaultReps: 12, defaultWeight: 20 },

  // Back
  { name: 'Lat Pulldown', category: 'Back', defaultReps: 10, defaultWeight: 55 },
  { name: 'Pull-ups / Chin-ups', category: 'Back', defaultReps: 8, defaultWeight: 0 },
  { name: 'Barbell Bent-Over Row', category: 'Back', defaultReps: 10, defaultWeight: 50 },
  { name: 'Seated Cable Row', category: 'Back', defaultReps: 12, defaultWeight: 50 },
  { name: 'Conventional Deadlift', category: 'Back', defaultReps: 6, defaultWeight: 80 },
  { name: 'Single-Arm Dumbbell Row', category: 'Back', defaultReps: 10, defaultWeight: 22 },
  { name: 'T-Bar Row', category: 'Back', defaultReps: 10, defaultWeight: 45 },
  { name: 'Face Pulls', category: 'Back', defaultReps: 15, defaultWeight: 20 },
  { name: 'Hyperextensions', category: 'Back', defaultReps: 15, defaultWeight: 0 },

  // Legs
  { name: 'Barbell Back Squat', category: 'Legs', defaultReps: 10, defaultWeight: 70 },
  { name: 'Front Squat', category: 'Legs', defaultReps: 8, defaultWeight: 50 },
  { name: 'Leg Press', category: 'Legs', defaultReps: 12, defaultWeight: 120 },
  { name: 'Romanian Deadlift (RDL)', category: 'Legs', defaultReps: 10, defaultWeight: 60 },
  { name: 'Bulgarian Split Squats', category: 'Legs', defaultReps: 10, defaultWeight: 16 },
  { name: 'Leg Extensions', category: 'Legs', defaultReps: 12, defaultWeight: 45 },
  { name: 'Hamstring / Leg Curls', category: 'Legs', defaultReps: 12, defaultWeight: 40 },
  { name: 'Standing Calf Raises', category: 'Legs', defaultReps: 15, defaultWeight: 40 },
  { name: 'Walking Lunges', category: 'Legs', defaultReps: 12, defaultWeight: 16 },
  { name: 'Goblet Squats', category: 'Legs', defaultReps: 12, defaultWeight: 24 },
  { name: 'Hip Thrust / Glute Bridge', category: 'Legs', defaultReps: 10, defaultWeight: 70 },

  // Shoulders
  { name: 'Overhead Barbell Press', category: 'Shoulders', defaultReps: 8, defaultWeight: 40 },
  { name: 'Dumbbell Shoulder Press', category: 'Shoulders', defaultReps: 10, defaultWeight: 18 },
  { name: 'Dumbbell Lateral Raises', category: 'Shoulders', defaultReps: 15, defaultWeight: 10 },
  { name: 'Dumbbell Front Raises', category: 'Shoulders', defaultReps: 12, defaultWeight: 10 },
  { name: 'Rear Delt Reverse Flyes', category: 'Shoulders', defaultReps: 15, defaultWeight: 8 },
  { name: 'Arnold Press', category: 'Shoulders', defaultReps: 10, defaultWeight: 16 },
  { name: 'Dumbbell Shrugs', category: 'Shoulders', defaultReps: 15, defaultWeight: 30 },

  // Arms (Biceps & Triceps)
  { name: 'Barbell Bicep Curl', category: 'Arms', defaultReps: 10, defaultWeight: 25 },
  { name: 'Dumbbell Hammer Curls', category: 'Arms', defaultReps: 12, defaultWeight: 14 },
  { name: 'Incline Dumbbell Curl', category: 'Arms', defaultReps: 10, defaultWeight: 12 },
  { name: 'Preacher Curl', category: 'Arms', defaultReps: 10, defaultWeight: 20 },
  { name: 'Triceps Cable Pushdown', category: 'Arms', defaultReps: 12, defaultWeight: 25 },
  { name: 'Skull Crushers', category: 'Arms', defaultReps: 10, defaultWeight: 25 },
  { name: 'Overhead Tricep Extension', category: 'Arms', defaultReps: 12, defaultWeight: 20 },
  { name: 'Triceps Bench Dips', category: 'Arms', defaultReps: 15, defaultWeight: 0 },

  // Abs & Core
  { name: 'Planks', category: 'Core', defaultReps: 45, defaultWeight: 0 },
  { name: 'Hanging Knee Raises', category: 'Core', defaultReps: 15, defaultWeight: 0 },
  { name: 'Cable Woodchoppers', category: 'Core', defaultReps: 15, defaultWeight: 15 },
  { name: 'Ab Wheel Rollouts', category: 'Core', defaultReps: 12, defaultWeight: 0 },
  { name: 'Russian Twists', category: 'Core', defaultReps: 20, defaultWeight: 10 },
  { name: 'Bicycle Crunches', category: 'Core', defaultReps: 20, defaultWeight: 0 },

  // Cardio & Functional
  { name: 'Treadmill Incline Run / Jog', category: 'Cardio', defaultReps: 20, defaultWeight: 0 },
  { name: 'Stationary Cycling', category: 'Cardio', defaultReps: 20, defaultWeight: 0 },
  { name: 'Rowing Machine', category: 'Cardio', defaultReps: 15, defaultWeight: 0 },
  { name: 'Jump Rope', category: 'Cardio', defaultReps: 50, defaultWeight: 0 },
  { name: 'Burpees', category: 'Cardio', defaultReps: 15, defaultWeight: 0 },
  { name: 'Kettlebell Swings', category: 'Cardio', defaultReps: 20, defaultWeight: 16 },
  { name: 'Mountain Climbers', category: 'Cardio', defaultReps: 25, defaultWeight: 0 }
];

let activeExerciseCategory = 'All';
let targetReplaceExId = null;

// Setup dynamic exercise builder in modal
function setupWorkoutModal() {
  initExerciseDatalist();
  setupExerciseSearchModal();

  // Add Exercise Button -> Opens Search Modal
  const addExBtn = document.getElementById('addExerciseRowBtn');
  if (addExBtn) {
    addExBtn.addEventListener('click', () => {
      targetReplaceExId = null;
      openExerciseSearchModal();
    });
  }

  // Add Blank Custom Row Button
  const addBlankBtn = document.getElementById('addBlankExerciseBtn');
  if (addBlankBtn) {
    addBlankBtn.addEventListener('click', () => {
      addExerciseBlock('', null);
    });
  }

  // Preset Selector Listener
  const templateSelect = document.getElementById('workoutTemplateSelect');
  const customTitleWrap = document.getElementById('customTitleWrap');
  if (templateSelect) {
    templateSelect.addEventListener('change', () => {
      const selected = templateSelect.value;
      if (selected === '__custom__') {
        if (customTitleWrap) customTitleWrap.style.display = 'block';
        document.getElementById('workoutTitle').focus();
      } else {
        if (customTitleWrap) customTitleWrap.style.display = 'none';
        applyWorkoutPreset(selected);
      }
    });
  }

  const form = document.getElementById('createWorkoutForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitWorkoutForm();
    });
  }
}

// Populate Global Datalist
function initExerciseDatalist() {
  const datalist = document.getElementById('exerciseDatalist');
  if (!datalist) return;
  datalist.innerHTML = EXERCISE_LIBRARY.map((ex) => `<option value="${ex.name}">`).join('');
}

// Setup Exercise Search Modal Listeners
function setupExerciseSearchModal() {
  const searchInput = document.getElementById('exerciseSearchInput');
  const customBtn = document.getElementById('addSearchAsCustomBtn');
  const categoryChips = document.querySelectorAll('.ex-category-chip');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderExerciseSearchResults(searchInput.value.trim());
    });
  }

  categoryChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      categoryChips.forEach((c) => {
        c.classList.remove('btn-primary');
        c.classList.add('btn-secondary');
      });
      chip.classList.remove('btn-secondary');
      chip.classList.add('btn-primary');

      activeExerciseCategory = chip.getAttribute('data-category') || 'All';
      const term = searchInput ? searchInput.value.trim() : '';
      renderExerciseSearchResults(term);
    });
  });

  if (customBtn) {
    customBtn.addEventListener('click', () => {
      const query = searchInput ? searchInput.value.trim() : '';
      const customName = query || prompt('Enter custom exercise name:');
      if (customName) {
        if (targetReplaceExId) {
          const exBlock = document.getElementById(targetReplaceExId);
          if (exBlock) {
            const input = exBlock.querySelector('.exercise-name-input');
            if (input) input.value = customName;
          }
        } else {
          addExerciseBlock(customName, null);
        }
        closeModal('exerciseSearchModal');
      }
    });
  }
}

// Open Search Modal and initialize list
function openExerciseSearchModal(targetExId = null) {
  targetReplaceExId = targetExId;
  const searchInput = document.getElementById('exerciseSearchInput');
  if (searchInput) {
    searchInput.value = '';
    setTimeout(() => searchInput.focus(), 150);
  }
  activeExerciseCategory = 'All';
  const categoryChips = document.querySelectorAll('.ex-category-chip');
  categoryChips.forEach((c) => {
    if (c.getAttribute('data-category') === 'All') {
      c.classList.remove('btn-secondary');
      c.classList.add('btn-primary');
    } else {
      c.classList.remove('btn-primary');
      c.classList.add('btn-secondary');
    }
  });

  renderExerciseSearchResults('');
  openModal('exerciseSearchModal');
}

// Render filtered exercise results in search modal
function renderExerciseSearchResults(searchTerm = '') {
  const container = document.getElementById('exerciseSearchResultsList');
  if (!container) return;

  const query = searchTerm.toLowerCase();

  const filtered = EXERCISE_LIBRARY.filter((ex) => {
    const matchesCategory = activeExerciseCategory === 'All' || ex.category === activeExerciseCategory;
    const matchesSearch = !query || ex.name.toLowerCase().includes(query) || ex.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  if (!filtered.length) {
    container.innerHTML = `
      <div style="text-align:center; padding:2rem 1rem; color:var(--text-dim);">
        <p style="font-size:1.1rem; margin-bottom:0.5rem;">No exact exercise found for "${searchTerm}"</p>
        <button type="button" onclick="addCustomExerciseFromSearch('${searchTerm.replace(/'/g, "\\'")}')" class="btn btn-outline btn-sm">
          + Add "${searchTerm}" as Custom Exercise
        </button>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach((ex) => {
    const categoryBadgeClass = ex.category === 'Chest' ? 'badge-green' :
      ex.category === 'Back' ? 'badge-blue' :
      ex.category === 'Legs' ? 'badge-orange' : 'badge';

    html += `
      <div class="card" style="padding:0.75rem 1rem; display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface-elevated); cursor:pointer; transition:transform 0.15s ease;" onclick="selectExerciseFromSearch('${ex.name.replace(/'/g, "\\'")}', ${ex.defaultReps}, ${ex.defaultWeight})">
        <div>
          <div class="font-bold" style="font-size:0.95rem; color:var(--text-main);">${ex.name}</div>
          <div style="display:flex; gap:0.5rem; align-items:center; margin-top:0.25rem;">
            <span class="badge ${categoryBadgeClass}" style="font-size:0.7rem;">${ex.category}</span>
            <span class="text-dim" style="font-size:0.75rem;">Default: ${ex.defaultReps} reps @ ${ex.defaultWeight}kg</span>
          </div>
        </div>
        <button type="button" class="btn btn-primary btn-sm" style="padding:0.3rem 0.75rem;">
          + Select
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
}

// User selects an exercise from search results
window.selectExerciseFromSearch = function(name, reps, weight) {
  if (targetReplaceExId) {
    const exBlock = document.getElementById(targetReplaceExId);
    if (exBlock) {
      const input = exBlock.querySelector('.exercise-name-input');
      if (input) input.value = name;
    }
  } else {
    addExerciseBlock(name, [
      { reps: reps || 10, weightKg: weight || 0 },
      { reps: reps || 10, weightKg: weight || 0 }
    ]);
  }
  closeModal('exerciseSearchModal');
  showToast(`Added ${name} to workout!`, 'success');
};

// Add custom exercise from search term fallback
window.addCustomExerciseFromSearch = function(name) {
  if (!name) return;
  if (targetReplaceExId) {
    const exBlock = document.getElementById(targetReplaceExId);
    if (exBlock) {
      const input = exBlock.querySelector('.exercise-name-input');
      if (input) input.value = name;
    }
  } else {
    addExerciseBlock(name, null);
  }
  closeModal('exerciseSearchModal');
  showToast(`Added ${name} to workout!`, 'success');
};

// Global helper to open search for an existing exercise row
window.openExerciseSearchForTarget = function(exId) {
  openExerciseSearchModal(exId);
};

// Automatically populate fields and exercises when a routine is selected
function applyWorkoutPreset(presetKey) {
  const preset = WORKOUT_PRESETS[presetKey];
  if (!preset) return;

  const categorySelect = document.getElementById('workoutCategory');
  const durationInput = document.getElementById('workoutDuration');
  const caloriesInput = document.getElementById('workoutCalories');
  const container = document.getElementById('exercisesContainer');

  if (categorySelect) categorySelect.value = preset.category;
  if (durationInput) durationInput.value = preset.duration;
  if (caloriesInput) caloriesInput.value = preset.calories;

  if (container && preset.exercises) {
    container.innerHTML = '';
    preset.exercises.forEach((ex) => {
      addExerciseBlock(ex.name, ex.sets);
    });
  }
}

// Add an Exercise Block (with optional default name and sets)
function addExerciseBlock(defaultName = '', defaultSets = null) {
  const container = document.getElementById('exercisesContainer');
  if (!container) return;

  exerciseCount++;
  const exId = `ex_${exerciseCount}`;

  const block = document.createElement('div');
  block.className = 'exercise-card-builder';
  block.id = exId;

  let setsRowsHtml = '';
  if (defaultSets && defaultSets.length) {
    defaultSets.forEach((s, idx) => {
      const isCompleted = s.completed ? true : false;
      setsRowsHtml += `
        <div class="set-table-row ${isCompleted ? 'set-completed' : ''}">
          <span class="set-badge">${isCompleted ? '✓ ' + (idx + 1) : idx + 1}</span>
          <input type="number" class="form-input set-reps" value="${s.reps}" min="1" required>
          <input type="number" class="form-input set-weight" value="${s.weightKg}" min="0" step="0.5" required>
          <button type="button" class="btn-set-done ${isCompleted ? 'is-done' : ''}" onclick="toggleSetDone(this)" title="Mark set as completed">
            ${isCompleted ? '✔ Done' : '✓ Done'}
          </button>
          <button type="button" onclick="removeSetRow(this)" class="btn btn-danger btn-sm" style="padding:0.25rem 0.5rem;" title="Remove set">✕</button>
        </div>
      `;
    });
  } else {
    setsRowsHtml = `
      <div class="set-table-row">
        <span class="set-badge">1</span>
        <input type="number" class="form-input set-reps" placeholder="10" min="1" required>
        <input type="number" class="form-input set-weight" placeholder="60" min="0" step="0.5" required>
        <button type="button" class="btn-set-done" onclick="toggleSetDone(this)" title="Mark set as completed">✓ Done</button>
        <button type="button" onclick="removeSetRow(this)" class="btn btn-danger btn-sm" style="padding:0.25rem 0.5rem;" title="Remove set">✕</button>
      </div>
    `;
  }

  block.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; gap:0.5rem; flex-wrap:wrap;">
      <div style="display:flex; align-items:center; gap:0.5rem; flex:1; min-width:260px; max-width:420px;">
        <input type="text" list="exerciseDatalist" class="form-input exercise-name-input" value="${defaultName}" placeholder="Exercise name (e.g. Barbell Squat)" required>
        <button type="button" onclick="openExerciseSearchForTarget('${exId}')" class="btn btn-secondary btn-sm" title="Search exercise from library" style="padding:0.4rem 0.65rem;">🔍 Pick</button>
      </div>
      <button type="button" onclick="document.getElementById('${exId}').remove()" class="btn btn-danger btn-sm">Remove</button>
    </div>

    <div class="set-table-header">
      <div>Set</div>
      <div>Reps</div>
      <div>Weight (kg)</div>
      <div>Done</div>
      <div></div>
    </div>
    <div class="sets-rows-container">
      ${setsRowsHtml}
    </div>
    <button type="button" onclick="addSetRow('${exId}')" class="btn btn-secondary btn-sm" style="margin-top:0.5rem;">+ Add Set</button>
  `;

  container.appendChild(block);
}

// Add Set Row inside specific exercise
window.addSetRow = function (exId) {
  const exBlock = document.getElementById(exId);
  if (!exBlock) return;

  const setsContainer = exBlock.querySelector('.sets-rows-container');
  const currentSets = setsContainer.querySelectorAll('.set-table-row').length + 1;

  // Inherit reps & weight from previous set for faster gym logging
  const lastRow = setsContainer.lastElementChild;
  const prevReps = lastRow ? lastRow.querySelector('.set-reps')?.value || '10' : '10';
  const prevWeight = lastRow ? lastRow.querySelector('.set-weight')?.value || '60' : '60';

  const row = document.createElement('div');
  row.className = 'set-table-row';
  row.innerHTML = `
    <span class="set-badge">${currentSets}</span>
    <input type="number" class="form-input set-reps" value="${prevReps}" min="1" required>
    <input type="number" class="form-input set-weight" value="${prevWeight}" min="0" step="0.5" required>
    <button type="button" class="btn-set-done" onclick="toggleSetDone(this)" title="Mark set as completed">✓ Done</button>
    <button type="button" onclick="removeSetRow(this)" class="btn btn-danger btn-sm" style="padding:0.25rem 0.5rem;" title="Remove set">✕</button>
  `;
  setsContainer.appendChild(row);
};

// Toggle Set Completed State
window.toggleSetDone = function (btn) {
  const row = btn.closest('.set-table-row');
  if (!row) return;

  const isDone = btn.classList.toggle('is-done');
  row.classList.toggle('set-completed', isDone);

  const badge = row.querySelector('.set-badge');
  const setNumber = Array.from(row.parentElement.children).indexOf(row) + 1;

  if (isDone) {
    btn.innerHTML = '✔ Done';
    if (badge) badge.innerHTML = `✓ ${setNumber}`;
    showToast(`Set ${setNumber} completed! Great work! 💪`, 'success');
    startRestTimer(90); // Start 90s countdown timer
  } else {
    btn.innerHTML = '✓ Done';
    if (badge) badge.innerHTML = `${setNumber}`;
  }
};

// Remove Set Row and renumber remaining sets
window.removeSetRow = function (btn) {
  const row = btn.closest('.set-table-row');
  if (!row) return;
  const container = row.parentElement;
  row.remove();

  if (container) {
    const rows = container.querySelectorAll('.set-table-row');
    rows.forEach((r, idx) => {
      const badge = r.querySelector('.set-badge');
      const isCompleted = r.classList.contains('set-completed');
      if (badge) badge.innerHTML = isCompleted ? `✓ ${idx + 1}` : `${idx + 1}`;
    });
  }
};

// ============================================================================
// ⏱️ WORKOUT REST TIMER
// ============================================================================
let restTimerInterval = null;
let restSecondsRemaining = 0;

function startRestTimer(seconds = 90) {
  const modalContainer = document.querySelector('#workoutModal .modal-container');
  if (!modalContainer) return;

  let timerBar = document.getElementById('workoutRestTimerBar');
  if (!timerBar) {
    timerBar = document.createElement('div');
    timerBar.id = 'workoutRestTimerBar';
    timerBar.className = 'rest-timer-bar';
    modalContainer.appendChild(timerBar);
  }

  clearInterval(restTimerInterval);
  restSecondsRemaining = seconds;

  function renderTimer() {
    const m = Math.floor(restSecondsRemaining / 60);
    const s = restSecondsRemaining % 60;
    const timeStr = `${m}:${s < 10 ? '0' : ''}${s}`;

    timerBar.innerHTML = `
      <div class="rest-timer-display">
        <span>⏱️ Rest Timer:</span>
        <span style="font-size:1.2rem; color:var(--primary); font-weight:800;">${timeStr}</span>
      </div>
      <div style="display:flex; gap:0.4rem; align-items:center;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="adjustRestTimer(30)" style="padding:0.25rem 0.5rem; font-size:0.75rem;" title="Add 30 seconds">+30s</button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="adjustRestTimer(-30)" style="padding:0.25rem 0.5rem; font-size:0.75rem;" title="Subtract 30 seconds">-30s</button>
        <button type="button" class="btn btn-danger btn-sm" onclick="stopRestTimer()" style="padding:0.25rem 0.5rem; font-size:0.75rem;">Skip</button>
      </div>
    `;
  }

  renderTimer();
  timerBar.style.display = 'flex';

  restTimerInterval = setInterval(() => {
    restSecondsRemaining--;
    if (restSecondsRemaining <= 0) {
      clearInterval(restTimerInterval);
      timerBar.innerHTML = `
        <div class="rest-timer-display" style="color:#10b981;">
          <span>🔔 Rest Complete! Time for the next set! 🔥</span>
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="stopRestTimer()" style="padding:0.25rem 0.6rem; font-size:0.75rem;">Dismiss</button>
      `;
      // Soft audio chime
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 587.33;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
        setTimeout(() => osc.stop(), 600);
      } catch (e) {}
    } else {
      renderTimer();
    }
  }, 1000);
}

window.adjustRestTimer = function (seconds) {
  restSecondsRemaining = Math.max(5, restSecondsRemaining + seconds);
  const timerBar = document.getElementById('workoutRestTimerBar');
  if (timerBar && restSecondsRemaining > 0) {
    const m = Math.floor(restSecondsRemaining / 60);
    const s = restSecondsRemaining % 60;
    const timeSpan = timerBar.querySelector('.rest-timer-display span:last-child');
    if (timeSpan) timeSpan.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
  }
};

window.stopRestTimer = function () {
  clearInterval(restTimerInterval);
  const timerBar = document.getElementById('workoutRestTimerBar');
  if (timerBar) timerBar.style.display = 'none';
};

// Submit Workout Form
async function submitWorkoutForm() {
  const templateSelect = document.getElementById('workoutTemplateSelect');
  let title = '';

  if (templateSelect && templateSelect.value && templateSelect.value !== '__custom__') {
    title = templateSelect.value;
  } else {
    title = document.getElementById('workoutTitle').value.trim();
  }

  if (!title) {
    showToast('Please select a workout routine or enter a title.', 'error');
    return;
  }

  const category = document.getElementById('workoutCategory').value;
  const durationMinutes = document.getElementById('workoutDuration').value;
  const caloriesBurned = document.getElementById('workoutCalories').value;
  const notes = document.getElementById('workoutNotes').value.trim();

  // Extract exercises and sets (including completed state)
  const exerciseBlocks = document.querySelectorAll('.exercise-card-builder');
  const exercises = [];

  exerciseBlocks.forEach((block) => {
    const exName = block.querySelector('.exercise-name-input').value.trim();
    if (!exName) return;

    const setRows = block.querySelectorAll('.set-table-row');
    const sets = [];
    setRows.forEach((row, idx) => {
      const reps = Number(row.querySelector('.set-reps').value) || 1;
      const weight = Number(row.querySelector('.set-weight').value) || 0;
      const isCompleted = row.classList.contains('set-completed') || 
                          row.querySelector('.btn-set-done')?.classList.contains('is-done') || 
                          false;
      sets.push({ setNumber: idx + 1, reps, weightKg: weight, completed: !!isCompleted });
    });

    exercises.push({ name: exName, sets });
  });

  const payload = {
    title,
    category,
    durationMinutes: Number(durationMinutes),
    caloriesBurned: Number(caloriesBurned) || 0,
    exercises,
    notes,
  };

  try {
    await apiRequest('/workouts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    stopRestTimer();
    showToast('Workout successfully saved!', 'success');
    closeModal('workoutModal');
    document.getElementById('createWorkoutForm').reset();
    document.getElementById('exercisesContainer').innerHTML = '';
    loadWorkouts();
  } catch (err) {
    showToast(err.message || 'Error saving workout', 'error');
  }
}

// Setup Category Filter Chips
function setupFilterListeners() {
  const filterBtns = document.querySelectorAll('.category-filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('btn-primary'));
      filterBtns.forEach((b) => b.classList.add('btn-secondary'));
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
      const cat = btn.getAttribute('data-category');
      loadWorkouts(cat);
    });
  });
}
