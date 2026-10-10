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
            html += `
              <span class="badge" style="background:var(--bg-surface-elevated); border:1px solid var(--border-subtle); font-size:0.8rem;">
                Set ${s.setNumber}: ${s.reps} reps @ ${s.weightKg} kg
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

// Setup dynamic exercise builder in modal
function setupWorkoutModal() {
  const addExBtn = document.getElementById('addExerciseRowBtn');
  if (addExBtn) {
    addExBtn.addEventListener('click', () => addExerciseBlock());
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
      setsRowsHtml += `
        <div class="set-table-row">
          <span class="set-badge">${idx + 1}</span>
          <input type="number" class="form-input set-reps" value="${s.reps}" min="1" required>
          <input type="number" class="form-input set-weight" value="${s.weightKg}" min="0" step="0.5" required>
          <button type="button" onclick="this.parentElement.remove()" class="btn btn-danger btn-sm" style="padding:0.25rem 0.5rem;">✕</button>
        </div>
      `;
    });
  } else {
    setsRowsHtml = `
      <div class="set-table-row">
        <span class="set-badge">1</span>
        <input type="number" class="form-input set-reps" placeholder="10" min="1" required>
        <input type="number" class="form-input set-weight" placeholder="60" min="0" step="0.5" required>
        <div></div>
      </div>
    `;
  }

  block.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
      <input type="text" class="form-input exercise-name-input" value="${defaultName}" placeholder="Exercise name (e.g. Barbell Squat)" required style="max-width:320px;">
      <button type="button" onclick="document.getElementById('${exId}').remove()" class="btn btn-danger btn-sm">Remove</button>
    </div>

    <div class="set-table-header">
      <div>Set</div>
      <div>Reps</div>
      <div>Weight (kg)</div>
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

  const row = document.createElement('div');
  row.className = 'set-table-row';
  row.innerHTML = `
    <span class="set-badge">${currentSets}</span>
    <input type="number" class="form-input set-reps" placeholder="10" min="1" required>
    <input type="number" class="form-input set-weight" placeholder="60" min="0" step="0.5" required>
    <button type="button" onclick="this.parentElement.remove()" class="btn btn-danger btn-sm" style="padding:0.25rem 0.5rem;">✕</button>
  `;
  setsContainer.appendChild(row);
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

  // Extract exercises and sets
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
      sets.push({ setNumber: idx + 1, reps, weightKg: weight });
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
