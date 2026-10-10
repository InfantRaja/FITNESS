/**
 * FitTrack - Activity History & CSV Exporter (history.js)
 */

let allActivities = [];

document.addEventListener('DOMContentLoaded', () => {
  loadFullHistory();
  setupFilters();
  setupCsvExport();
});

async function loadFullHistory() {
  const container = document.getElementById('historyTableBody');
  if (!container) return;

  try {
    container.innerHTML = '<tr><td colspan="5" class="text-center" style="padding:2rem;"><div class="spinner"></div> Loading records...</td></tr>';

    const [workoutRes, foodRes] = await Promise.all([
      apiRequest('/workouts'),
      apiRequest('/food'),
    ]);

    const workouts = (workoutRes.data || []).map((w) => ({
      type: 'Workout',
      date: new Date(w.date || w.createdAt),
      title: w.title,
      category: w.category,
      details: `${w.durationMinutes} mins &bull; ${w.caloriesBurned || 0} kcal burned`,
      badgeClass: 'badge-green',
    }));

    const foods = (foodRes.data || []).map((f) => ({
      type: 'Nutrition',
      date: new Date(f.date || f.createdAt),
      title: f.foodName,
      category: f.mealType,
      details: `${f.calories} kcal (P: ${f.protein}g | C: ${f.carbs}g | F: ${f.fat}g)`,
      badgeClass: 'badge-orange',
    }));

    // Combine and sort descending by date
    allActivities = [...workouts, ...foods].sort((a, b) => b.date - a.date);

    renderHistoryRows(allActivities);
  } catch (err) {
    container.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Failed to load history: ${err.message}</td></tr>`;
  }
}

function renderHistoryRows(items) {
  const container = document.getElementById('historyTableBody');
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted" style="padding:3rem 1rem;">
          No matching logs found.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  items.forEach((item) => {
    const dateFormatted = item.date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const timeFormatted = item.date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    html += `
      <tr>
        <td>
          <div class="font-bold">${dateFormatted}</div>
          <div class="text-dim" style="font-size:0.75rem;">${timeFormatted}</div>
        </td>
        <td>
          <span class="badge ${item.badgeClass}">${item.type}</span>
        </td>
        <td>
          <span class="font-semibold">${item.title}</span>
        </td>
        <td>
          <span class="badge" style="background:var(--bg-surface-elevated); border:1px solid var(--border-subtle);">${item.category}</span>
        </td>
        <td class="text-muted" style="font-size:0.875rem;">
          ${item.details}
        </td>
      </tr>
    `;
  });

  container.innerHTML = html;
}

function setupFilters() {
  const searchInput = document.getElementById('historySearch');
  const typeFilter = document.getElementById('historyTypeFilter');

  function applyFilters() {
    const term = (searchInput ? searchInput.value : '').toLowerCase();
    const selectedType = typeFilter ? typeFilter.value : 'All';

    const filtered = allActivities.filter((item) => {
      const matchesTerm = item.title.toLowerCase().includes(term) || item.category.toLowerCase().includes(term);
      const matchesType = selectedType === 'All' || item.type === selectedType;
      return matchesTerm && matchesType;
    });

    renderHistoryRows(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (typeFilter) typeFilter.addEventListener('change', applyFilters);
}

function setupCsvExport() {
  const exportBtn = document.getElementById('exportCsvBtn');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', async () => {
    try {
      exportBtn.disabled = true;
      exportBtn.innerHTML = '<span class="spinner"></span> Exporting...';

      const token = localStorage.getItem('fittrack_token');
      const url = `${API_BASE_URL}/reports/export-csv`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed on server.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `FitTrack_Export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showToast('CSV export downloaded successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error downloading CSV', 'error');
    } finally {
      exportBtn.disabled = false;
      exportBtn.innerHTML = '📥 Download CSV Report';
    }
  });
}
