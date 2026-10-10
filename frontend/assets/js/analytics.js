/**
 * FitTrack - Progress & Analytics Logic (analytics.js)
 */

let weightTrendChart = null;
let calorieBalanceChart = null;
let workoutBarChart = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadAnalytics();
  setupWeightModal();
});

async function loadAnalytics() {
  try {
    const [summaryRes, metricsRes] = await Promise.all([
      apiRequest('/reports/dashboard-summary'),
      apiRequest('/metrics'),
    ]);

    const weeklyTrend = summaryRes.charts ? summaryRes.charts.weeklyTrend : [];
    const metrics = metricsRes.data || [];

    renderWeightChart(metrics);
    renderCalorieBalanceChart(weeklyTrend);
    renderWorkoutBarChart(weeklyTrend);
  } catch (err) {
    console.error('Error loading analytics:', err);
    showToast('Failed to load analytics charts.', 'error');
  }
}

function renderWeightChart(metrics) {
  const ctx = document.getElementById('weightTrajectoryChart');
  if (!ctx) return;

  const labels = metrics.map((m) => new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const data = metrics.map((m) => m.weightKg);

  if (weightTrendChart) weightTrendChart.destroy();

  weightTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length ? labels : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Body Weight (kg)',
          data: data.length ? data : [74, 73.2, 72.8, 72.4],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          pointBackgroundColor: '#38bdf8',
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8' } } },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
      },
    },
  });
}

function renderCalorieBalanceChart(trend) {
  const ctx = document.getElementById('calorieAnalysisChart');
  if (!ctx) return;

  const labels = trend.map((t) => t.label);
  const intake = trend.map((t) => t.caloriesConsumed);
  const burn = trend.map((t) => t.caloriesBurned);

  if (calorieBalanceChart) calorieBalanceChart.destroy();

  calorieBalanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Calories Ingested',
          data: intake,
          borderColor: '#10b981',
          tension: 0.3,
          borderWidth: 2,
        },
        {
          label: 'Calories Burned',
          data: burn,
          borderColor: '#f59e0b',
          tension: 0.3,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8' } } },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
      },
    },
  });
}

function renderWorkoutBarChart(trend) {
  const ctx = document.getElementById('workoutFrequencyChart');
  if (!ctx) return;

  const labels = trend.map((t) => t.label);
  const durations = trend.map((t) => t.workoutMinutes);

  if (workoutBarChart) workoutBarChart.destroy();

  workoutBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Workout Minutes',
          data: durations,
          backgroundColor: '#8b5cf6',
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8' } } },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
      },
    },
  });
}

function setupWeightModal() {
  const form = document.getElementById('logWeightForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const weightKg = document.getElementById('metricWeight').value;
      const waistCm = document.getElementById('metricWaist').value;
      const chestCm = document.getElementById('metricChest').value;

      try {
        await apiRequest('/metrics', {
          method: 'POST',
          body: JSON.stringify({
            weightKg: Number(weightKg),
            waistCm: waistCm ? Number(waistCm) : null,
            chestCm: chestCm ? Number(chestCm) : null,
          }),
        });

        showToast('Body weight successfully logged!', 'success');
        closeModal('logWeightModal');
        form.reset();
        loadAnalytics();
      } catch (err) {
        showToast(err.message || 'Error logging weight', 'error');
      }
    });
  }
}
