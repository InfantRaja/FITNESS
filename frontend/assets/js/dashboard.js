/**
 * FitTrack - Main Dashboard Logic & Visualizations (dashboard.js)
 */

let weeklyTrendChartInstance = null;
let macroChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardData();
  setupQuickActionListeners();
});

async function loadDashboardData() {
  try {
    const summary = await apiRequest('/reports/dashboard-summary');
    if (!summary || !summary.today) return;

    const { today, charts } = summary;

    // 1. Update Stat Cards
    // Calories
    const calorieVal = document.getElementById('dashCaloriesVal');
    if (calorieVal) calorieVal.textContent = today.caloriesConsumed.toLocaleString();
    const calorieTarget = document.getElementById('dashCalorieTarget');
    if (calorieTarget) calorieTarget.textContent = today.dailyCalorieTarget.toLocaleString();
    const calorieDeficit = document.getElementById('dashCalorieDeficit');
    if (calorieDeficit) {
      const diff = today.dailyCalorieTarget - today.caloriesConsumed;
      calorieDeficit.textContent = diff >= 0 ? `${diff} kcal remaining` : `${Math.abs(diff)} kcal over target`;
    }

    // Hydration
    const waterVal = document.getElementById('dashWaterVal');
    if (waterVal) waterVal.textContent = `${today.waterMl} ml`;
    const waterTarget = document.getElementById('dashWaterTarget');
    if (waterTarget) {
      const pct = Math.min(Math.round((today.waterMl / today.dailyWaterTarget) * 100), 100);
      waterTarget.textContent = `${pct}% of ${today.dailyWaterTarget} ml`;
    }

    // Workout Duration & Count
    const workoutVal = document.getElementById('dashWorkoutVal');
    if (workoutVal) workoutVal.textContent = `${today.workoutMinutes} mins`;
    const workoutSub = document.getElementById('dashWorkoutSub');
    if (workoutSub) workoutSub.textContent = `${today.workoutCount} session(s) &bull; ${today.caloriesBurned} kcal burned`;

    // Body Weight
    const weightVal = document.getElementById('dashWeightVal');
    if (weightVal) weightVal.textContent = today.currentWeight ? `${today.currentWeight} kg` : '-- kg';

    // 2. Render Charts
    renderWeeklyTrendChart(charts ? charts.weeklyTrend : []);
    renderMacroDoughnut(today.macros || { protein: 0, carbs: 0, fat: 0 });

    // 3. Load Today's Meals & Workouts
    await loadTodayFeed();
  } catch (err) {
    console.error('Failed to load dashboard:', err);
    showToast('Failed to load dashboard data.', 'error');
  }
}

function renderWeeklyTrendChart(weeklyData) {
  const ctx = document.getElementById('weeklyTrendChart');
  if (!ctx) return;

  const labels = weeklyData.map((d) => d.label || d.date);
  const intakeData = weeklyData.map((d) => d.caloriesConsumed || 0);
  const burnData = weeklyData.map((d) => d.caloriesBurned || 0);

  if (weeklyTrendChartInstance) {
    weeklyTrendChartInstance.destroy();
  }

  weeklyTrendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Calories Ingested',
          data: intakeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointBackgroundColor: '#10b981',
        },
        {
          label: 'Calories Burned',
          data: burnData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointBackgroundColor: '#f59e0b',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#94a3b8' },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' },
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' },
        },
      },
    },
  });
}

function renderMacroDoughnut(macros) {
  const ctx = document.getElementById('macroDoughnutChart');
  if (!ctx) return;

  const hasData = (macros.protein + macros.carbs + macros.fat) > 0;
  const dataValues = hasData ? [macros.protein, macros.carbs, macros.fat] : [1, 1, 1];
  const bgColors = hasData 
    ? ['#10b981', '#38bdf8', '#f59e0b'] 
    : ['#334155', '#475569', '#64748b'];

  if (macroChartInstance) {
    macroChartInstance.destroy();
  }

  macroChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Protein (g)', 'Carbs (g)', 'Fat (g)'],
      datasets: [
        {
          data: dataValues,
          backgroundColor: bgColors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8' },
        },
      },
      cutout: '70%',
    },
  });
}

async function loadTodayFeed() {
  const feedContainer = document.getElementById('todayFeedList');
  if (!feedContainer) return;

  try {
    const foodRes = await apiRequest('/food/today');
    const workoutRes = await apiRequest('/workouts');

    const foodList = foodRes.data || [];
    const workoutList = workoutRes.data || [];

    if (!foodList.length && !workoutList.length) {
      feedContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p class="empty-state-title">No Activity Recorded Today</p>
          <p class="empty-state-desc">Log your first meal or workout session to start seeing daily activity here.</p>
        </div>
      `;
      return;
    }

    let html = '<div style="display:flex; flex-direction:column; gap:0.75rem;">';

    workoutList.slice(0, 3).forEach((w) => {
      html += `
        <div class="card" style="padding:0.85rem 1rem; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="stat-icon-wrap stat-icon-green" style="width:40px; height:40px; font-size:1.1rem;">🏋️</div>
            <div>
              <div class="font-bold" style="font-size:0.95rem;">${w.title}</div>
              <div class="text-muted" style="font-size:0.8rem;">${w.category} &bull; ${w.durationMinutes} mins</div>
            </div>
          </div>
          <span class="badge badge-green">${w.caloriesBurned || 0} kcal burned</span>
        </div>
      `;
    });

    foodList.slice(0, 4).forEach((f) => {
      html += `
        <div class="card" style="padding:0.85rem 1rem; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="stat-icon-wrap stat-icon-orange" style="width:40px; height:40px; font-size:1.1rem;">🥗</div>
            <div>
              <div class="font-bold" style="font-size:0.95rem;">${f.foodName}</div>
              <div class="text-muted" style="font-size:0.8rem;">${f.mealType} &bull; P: ${f.protein}g | C: ${f.carbs}g | F: ${f.fat}g</div>
            </div>
          </div>
          <span class="badge badge-orange">${f.calories} kcal</span>
        </div>
      `;
    });

    html += '</div>';
    feedContainer.innerHTML = html;
  } catch (e) {
    console.error('Error loading today feed', e);
  }
}

function setupQuickActionListeners() {
  // Quick Water +250ml
  const quickWaterBtn = document.getElementById('dashQuickWaterBtn');
  if (quickWaterBtn) {
    quickWaterBtn.addEventListener('click', async () => {
      try {
        await apiRequest('/water', {
          method: 'POST',
          body: JSON.stringify({ amountMl: 250 }),
        });
        showToast('Added +250ml water!', 'success');
        loadDashboardData();
      } catch (e) {
        showToast('Failed to add water.', 'error');
      }
    });
  }
}
