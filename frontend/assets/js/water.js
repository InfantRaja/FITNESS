/**
 * FitTrack - Hydration Tracker Logic (water.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  loadWaterData();
  setupWaterActions();
});

async function loadWaterData() {
  try {
    const res = await apiRequest('/water/today');
    const { totalMl, targetMl, progressPercent, logs } = res;

    // Update Visual Wave Level
    const liquidEl = document.getElementById('waterLiquid');
    if (liquidEl) {
      liquidEl.style.height = `${progressPercent}%`;
    }

    // Update Text Indicators
    const valEl = document.getElementById('waterCurrentMl');
    if (valEl) valEl.textContent = `${totalMl.toLocaleString()} ml`;

    const pctEl = document.getElementById('waterPercentText');
    if (pctEl) pctEl.textContent = `${progressPercent}% of ${targetMl.toLocaleString()} ml Goal`;

    // Render Timeline Log List
    renderWaterLogs(logs || []);
  } catch (err) {
    console.error('Error loading water data:', err);
    showToast('Failed to load hydration logs.', 'error');
  }
}

function renderWaterLogs(logs) {
  const container = document.getElementById('waterTimelineList');
  if (!container) return;

  if (!logs.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-title">No Water Logged Today</p>
        <p class="empty-state-desc">Use the quick add buttons above to start your daily hydration.</p>
      </div>
    `;
    return;
  }

  let html = '<div style="display:flex; flex-direction:column; gap:0.5rem;">';
  logs.forEach((log) => {
    const timeStr = new Date(log.date || log.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    html += `
      <div class="card" style="padding:0.75rem 1rem; display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface-elevated);">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span style="font-size:1.25rem;">💧</span>
          <div>
            <span class="font-bold">+${log.amountMl} ml</span>
            <span class="text-dim" style="font-size:0.8rem; margin-left:0.5rem;">at ${timeStr}</span>
          </div>
        </div>
        <button onclick="deleteWaterItem('${log._id}')" class="btn btn-danger btn-sm" style="padding:0.25rem 0.5rem;" title="Delete entry">✕</button>
      </div>
    `;
  });
  html += '</div>';

  container.innerHTML = html;
}

async function addWaterAmount(ml) {
  try {
    await apiRequest('/water', {
      method: 'POST',
      body: JSON.stringify({ amountMl: ml }),
    });
    showToast(`Logged +${ml}ml water!`, 'success');
    loadWaterData();
  } catch (err) {
    showToast(err.message || 'Error logging water', 'error');
  }
}

async function deleteWaterItem(id) {
  try {
    await apiRequest(`/water/${id}`, { method: 'DELETE' });
    showToast('Water entry deleted.', 'success');
    loadWaterData();
  } catch (err) {
    showToast('Failed to remove water entry.', 'error');
  }
}

function setupWaterActions() {
  const customForm = document.getElementById('customWaterForm');
  if (customForm) {
    customForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('customWaterAmount');
      const val = Number(input.value);
      if (val > 0) {
        await addWaterAmount(val);
        input.value = '';
        closeModal('customWaterModal');
      }
    });
  }
}
