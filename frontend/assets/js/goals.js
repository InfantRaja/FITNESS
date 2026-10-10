/**
 * FitTrack - Fitness Goals Logic (goals.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  loadGoals();
  setupGoalModal();
});

async function loadGoals() {
  const container = document.getElementById('goalsListContainer');
  if (!container) return;

  try {
    container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Loading goals...</p></div>';

    const res = await apiRequest('/goals');
    const goals = res.data || [];

    if (!goals.length) {
      container.innerHTML = `
        <div class="empty-state card" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🎯</div>
          <h3 class="empty-state-title">No Fitness Goals Set</h3>
          <p class="empty-state-desc">Set targets for target weight, workout frequency, or daily water intake to track your milestones.</p>
          <button onclick="openModal('createGoalModal')" class="btn btn-primary btn-sm">+ Create Your First Goal</button>
        </div>
      `;
      return;
    }

    let html = '';
    goals.forEach((goal) => {
      const progress = Math.min(Math.round(((goal.currentValue || 0) / (goal.targetValue || 1)) * 100), 100);
      const isCompleted = goal.status === 'completed' || progress >= 100;
      const deadlineStr = goal.deadline 
        ? new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Ongoing';

      html += `
        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="flex-between" style="margin-bottom:0.75rem;">
              <span class="badge ${isCompleted ? 'badge-green' : 'badge-blue'}">
                ${isCompleted ? '✓ Completed' : 'In Progress'}
              </span>
              <button onclick="deleteGoalItem('${goal._id}')" class="btn btn-danger btn-sm" style="padding:0.2rem 0.5rem;" title="Delete goal">✕</button>
            </div>

            <h3 class="font-bold" style="font-size:1.15rem; margin-bottom:0.35rem;">${goal.title}</h3>
            <p class="text-muted" style="font-size:0.85rem; margin-bottom:1.25rem;">
              Target: <strong>${goal.targetValue} ${goal.unit}</strong> &bull; Deadline: ${deadlineStr}
            </p>

            <div class="flex-between" style="font-size:0.85rem; margin-bottom:0.25rem;">
              <span>Progress: <strong>${goal.currentValue || 0} / ${goal.targetValue} ${goal.unit}</strong></span>
              <span class="font-bold text-primary">${progress}%</span>
            </div>

            <div class="progress-container">
              <div class="progress-bar ${isCompleted ? '' : 'progress-bar-blue'}" style="width: ${progress}%;"></div>
            </div>
          </div>

          <div style="margin-top:1.25rem; display:flex; justify-content:flex-end;">
            <button onclick="promptUpdateGoal('${goal._id}', ${goal.currentValue || 0})" class="btn btn-secondary btn-sm">
              Update Progress
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card text-danger">Error loading goals: ${err.message}</div>`;
  }
}

async function promptUpdateGoal(id, currentVal) {
  const newVal = prompt('Enter your updated current value:', currentVal);
  if (newVal === null || isNaN(newVal)) return;

  try {
    await apiRequest(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ currentValue: Number(newVal) }),
    });
    showToast('Goal progress updated!', 'success');
    loadGoals();
  } catch (err) {
    showToast('Failed to update goal.', 'error');
  }
}

async function deleteGoalItem(id) {
  if (!confirm('Are you sure you want to delete this fitness goal?')) return;
  try {
    await apiRequest(`/goals/${id}`, { method: 'DELETE' });
    showToast('Goal removed.', 'success');
    loadGoals();
  } catch (err) {
    showToast('Failed to delete goal.', 'error');
  }
}

function setupGoalModal() {
  const form = document.getElementById('createGoalForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('goalTitle').value.trim();
      const goalType = document.getElementById('goalType').value;
      const targetValue = document.getElementById('goalTargetValue').value;
      const currentValue = document.getElementById('goalCurrentValue').value;
      const unit = document.getElementById('goalUnit').value.trim();
      const deadline = document.getElementById('goalDeadline').value;

      try {
        await apiRequest('/goals', {
          method: 'POST',
          body: JSON.stringify({
            title,
            goalType,
            targetValue: Number(targetValue),
            currentValue: Number(currentValue || 0),
            unit,
            deadline: deadline || null,
          }),
        });

        showToast('New fitness goal established!', 'success');
        closeModal('createGoalModal');
        form.reset();
        loadGoals();
      } catch (err) {
        showToast(err.message || 'Error creating goal', 'error');
      }
    });
  }
}
