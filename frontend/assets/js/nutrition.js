/**
 * FitTrack - Nutrition & Macros Tracker Logic (nutrition.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  loadTodayNutrition();
  setupNutritionModal();
});

async function loadTodayNutrition() {
  try {
    const res = await apiRequest('/food/today');
    const { totals, data } = res;

    // Update Macro Top Bar
    const calEl = document.getElementById('totalCaloriesVal');
    if (calEl) calEl.textContent = (totals.calories || 0).toLocaleString();

    const protEl = document.getElementById('totalProteinVal');
    if (protEl) protEl.textContent = `${totals.protein || 0}g`;

    const carbEl = document.getElementById('totalCarbsVal');
    if (carbEl) carbEl.textContent = `${totals.carbs || 0}g`;

    const fatEl = document.getElementById('totalFatVal');
    if (fatEl) fatEl.textContent = `${totals.fat || 0}g`;

    // Render Meals by Group
    renderMealSection('Breakfast', data.filter((item) => item.mealType === 'Breakfast'));
    renderMealSection('Lunch', data.filter((item) => item.mealType === 'Lunch'));
    renderMealSection('Dinner', data.filter((item) => item.mealType === 'Dinner'));
    renderMealSection('Snack', data.filter((item) => item.mealType === 'Snack'));
  } catch (err) {
    console.error('Error loading nutrition:', err);
    showToast('Failed to load today nutrition.', 'error');
  }
}

function renderMealSection(mealType, items) {
  const containerId = `mealList_${mealType.toLowerCase()}`;
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || !items.length) {
    container.innerHTML = `
      <div style="padding:1rem; text-align:center; color:var(--text-dim); font-size:0.875rem;">
        No items logged for ${mealType}.
      </div>
    `;
    return;
  }

  let html = '<div style="display:flex; flex-direction:column; gap:0.5rem;">';
  items.forEach((item) => {
    html += `
      <div class="card" style="padding:0.75rem 1rem; display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface-elevated);">
        <div>
          <span class="font-bold" style="font-size:0.95rem;">${item.foodName}</span>
          <div class="text-muted" style="font-size:0.8rem; margin-top:0.15rem;">
            P: ${item.protein}g &bull; C: ${item.carbs}g &bull; F: ${item.fat}g
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span class="badge badge-orange">${item.calories} kcal</span>
          <button onclick="deleteFoodItem('${item._id}')" class="btn btn-danger btn-sm" style="padding:0.25rem 0.5rem;" title="Delete item">✕</button>
        </div>
      </div>
    `;
  });
  html += '</div>';

  container.innerHTML = html;
}

async function deleteFoodItem(id) {
  try {
    await apiRequest(`/food/${id}`, { method: 'DELETE' });
    showToast('Food item removed.', 'success');
    loadTodayNutrition();
  } catch (err) {
    showToast('Failed to delete food item.', 'error');
  }
}

function setupNutritionModal() {
  const form = document.getElementById('addFoodForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const mealType = document.getElementById('foodMealType').value;
      const foodName = document.getElementById('foodName').value.trim();
      const calories = document.getElementById('foodCalories').value;
      const protein = document.getElementById('foodProtein').value;
      const carbs = document.getElementById('foodCarbs').value;
      const fat = document.getElementById('foodFat').value;

      try {
        await apiRequest('/food', {
          method: 'POST',
          body: JSON.stringify({
            mealType,
            foodName,
            calories: Number(calories),
            protein: Number(protein || 0),
            carbs: Number(carbs || 0),
            fat: Number(fat || 0),
          }),
        });

        showToast(`Added ${foodName} to ${mealType}!`, 'success');
        closeModal('addFoodModal');
        form.reset();
        loadTodayNutrition();
      } catch (err) {
        showToast(err.message || 'Error saving food item', 'error');
      }
    });
  }
}

// Preset meal type when clicking "+ Add" on a specific section
window.openAddFoodWithMeal = function (type) {
  const select = document.getElementById('foodMealType');
  if (select) select.value = type;
  openModal('addFoodModal');
};
