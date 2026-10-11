/**
 * FitTrack - Central API Service & Client
 * Handles HTTP requests, JWT token attachment, and fallback simulation
 */

// Dynamically determine the backend REST API base URL
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.protocol === 'file:';

const API_BASE_URL = isLocalhost
  ? 'http://localhost:5000/api/v1'
  : 'https://fittrack-api.onrender.com/api/v1'; // Production Render API URL

/**
 * Universal fetch wrapper with authorization and error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('fittrack_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    // If unauthorized or expired token, clear session
    if (response.status === 401) {
      if (!window.location.pathname.includes('login.html') && 
          !window.location.pathname.includes('register.html') &&
          !window.location.pathname.endsWith('index.html') &&
          window.location.pathname !== '/') {
        localStorage.removeItem('fittrack_token');
        localStorage.removeItem('fittrack_user');
        window.location.href = 'login.html';
      }
      throw new Error(data.message || 'Session expired. Please log in again.');
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    // If backend server is unreachable (offline or running standalone client), provide demo fallback
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn(`[FitTrack API Notice] Backend at ${API_BASE_URL} is currently unreachable. Providing simulated response for demonstration.`);
      return handleSimulatedResponse(endpoint, options);
    }
    throw error;
  }
}

/**
 * Simulated Demo responses for offline or preview mode
 */
function handleSimulatedResponse(endpoint, options) {
  const method = (options.method || 'GET').toUpperCase();

  // Simulated Health
  if (endpoint === '/health') {
    return { status: 'healthy', demo: true };
  }

  // Simulated Dashboard Summary
  if (endpoint === '/reports/dashboard-summary') {
    return {
      success: true,
      today: {
        workoutMinutes: 45,
        caloriesBurned: 320,
        workoutCount: 1,
        caloriesConsumed: 1850,
        dailyCalorieTarget: 2200,
        macros: { protein: 125, carbs: 195, fat: 58 },
        waterMl: 2000,
        dailyWaterTarget: 2500,
        currentWeight: 72.5,
      },
      charts: {
        weeklyTrend: [
          { date: '2026-10-05', label: 'Mon', caloriesConsumed: 2100, caloriesBurned: 400, workoutMinutes: 50 },
          { date: '2026-10-06', label: 'Tue', caloriesConsumed: 1950, caloriesBurned: 350, workoutMinutes: 40 },
          { date: '2026-10-07', label: 'Wed', caloriesConsumed: 2250, caloriesBurned: 0, workoutMinutes: 0 },
          { date: '2026-10-08', label: 'Thu', caloriesConsumed: 1800, caloriesBurned: 450, workoutMinutes: 60 },
          { date: '2026-10-09', label: 'Fri', caloriesConsumed: 2050, caloriesBurned: 300, workoutMinutes: 45 },
          { date: '2026-10-10', label: 'Sat', caloriesConsumed: 2400, caloriesBurned: 500, workoutMinutes: 70 },
          { date: '2026-10-11', label: 'Sun', caloriesConsumed: 1850, caloriesBurned: 320, workoutMinutes: 45 },
        ],
      },
    };
  }

  // Simulated Today Food
  if (endpoint === '/food/today') {
    return {
      success: true,
      totals: { calories: 1850, protein: 125, carbs: 195, fat: 58 },
      data: [
        { _id: '1', mealType: 'Breakfast', foodName: 'Oats with Almond Milk & Berries', calories: 420, protein: 15, carbs: 70, fat: 8 },
        { _id: '2', mealType: 'Lunch', foodName: 'Grilled Chicken Breast with Brown Rice', calories: 650, protein: 55, carbs: 60, fat: 12 },
        { _id: '3', mealType: 'Dinner', foodName: 'Salmon with Steamed Broccoli', calories: 540, protein: 42, carbs: 20, fat: 28 },
        { _id: '4', mealType: 'Snack', foodName: 'Greek Yogurt & Walnuts', calories: 240, protein: 13, carbs: 15, fat: 10 },
      ],
    };
  }

  // Simulated Today Water
  if (endpoint === '/water/today') {
    return {
      success: true,
      totalMl: 2000,
      targetMl: 2500,
      progressPercent: 80,
      logs: [
        { _id: '1', amountMl: 500, date: new Date().toISOString() },
        { _id: '2', amountMl: 750, date: new Date().toISOString() },
        { _id: '3', amountMl: 750, date: new Date().toISOString() },
      ],
    };
  }

  // Simulated Workouts
  if (endpoint.startsWith('/workouts')) {
    return {
      success: true,
      count: 2,
      data: [
        {
          _id: 'w1',
          title: 'Upper Body Strength (Push)',
          category: 'Strength',
          durationMinutes: 45,
          caloriesBurned: 320,
          date: new Date().toISOString(),
          exercises: [
            { name: 'Barbell Bench Press', sets: [{ setNumber: 1, reps: 10, weightKg: 60 }, { setNumber: 2, reps: 8, weightKg: 70 }] },
            { name: 'Incline Dumbbell Press', sets: [{ setNumber: 1, reps: 12, weightKg: 22 }, { setNumber: 2, reps: 10, weightKg: 24 }] }
          ],
          notes: 'Felt strong on bench press.',
        },
      ],
    };
  }

  // Simulated Goals
  if (endpoint === '/goals') {
    return {
      success: true,
      data: [
        { _id: 'g1', title: 'Target Body Weight', goalType: 'Weight', targetValue: 70, currentValue: 72.5, unit: 'kg', status: 'in_progress' },
        { _id: 'g2', title: 'Weekly Workouts', goalType: 'WorkoutsPerWeek', targetValue: 5, currentValue: 4, unit: 'sessions', status: 'in_progress' },
      ],
    };
  }

  // Simulated AI Chat (Problem & Doubt Aware)
  if (endpoint === '/ai/chat') {
    let userMsg = '';
    try {
      if (options.body) {
        const parsed = JSON.parse(options.body);
        userMsg = (parsed.message || '').toLowerCase();
      }
    } catch (e) {}

    let simulatedReply = '';

    if (userMsg.includes('knee') || (userMsg.includes('squat') && (userMsg.includes('pain') || userMsg.includes('hurt')))) {
      simulatedReply = `### 🩹 Knee Pain in Squats Fix
1. **Push knees outward:** Avoid knees caving inward (valgus). Keep knees tracking directly over toes.
2. **Hip hinge first:** Push hips slightly back before bending knees.
3. **Box squats:** Try box squats to keep shins vertical until irritation subsides.`;
    } else if (userMsg.includes('back') || userMsg.includes('deadlift')) {
      simulatedReply = `### 🩹 Lower Back Pain Fix
1. **Avoid spinal rounding:** Keep lats engaged ("squeeze oranges in armpits").
2. **Keep barbell close:** Drag the bar up your shins; never let it drift forward.
3. **Brace with deep belly breath:** Perform the Valsalva maneuver before lifting.`;
    } else if (userMsg.includes('skinny fat') || userMsg.includes('cut or bulk')) {
      simulatedReply = `### ⚖️ Skinny Fat Protocol: Body Recomposition
1. **Maintenance calories or -200 deficit:** Do not starve or dirty bulk.
2. **High protein:** 1.6–2.0g per kg of body weight.
3. **Progressive resistance training:** 3–4 days/week of heavy compound lifts.
4. **8,000–10,000 daily steps** instead of exhausting endurance cardio.`;
    } else if (userMsg.includes('belly') || userMsg.includes('love handle')) {
      simulatedReply = `### 🔥 Stubborn Belly Fat Guide
1. **Spot reduction is impossible:** 1,000 crunches will not burn belly fat.
2. **Sustained moderate deficit:** 300–400 kcal deficit over 8–12 weeks.
3. **NEAT steps:** 8,000–10,000 daily steps.
4. **Sleep:** 7–8 hours to keep belly-fat storing cortisol low.`;
    } else if (userMsg.includes('creatine')) {
      simulatedReply = `### 💊 Creatine Monohydrate Facts
- **Hair loss:** Myth! No clinical studies prove creatine causes hair loss.
- **Kidneys:** Safe for healthy individuals.
- **Timing:** 3–5g daily anytime with water. No loading phase required.
- **Drink 3.5–4L of water** daily.`;
    } else if (userMsg.includes('rice') && (userMsg.includes('night') || userMsg.includes('dinner'))) {
      simulatedReply = `### 🍚 White Rice at Night
- **YES, you can eat rice at night!** Total daily calorie balance determines fat loss, not the clock.
- Rice digests easily and improves tryptophan/melatonin for deeper sleep.
- Keep to 1 medium katori and pair with dal and lean protein.`;
    } else if (userMsg.includes('sore') || userMsg.includes('doms')) {
      simulatedReply = `### 🩹 Sore Muscles (DOMS)
- **You can exercise:** Train a different muscle group today (e.g. upper body if legs are sore).
- **Active recovery:** Light 20-min walking increases blood flow and recovery.
- Ensure 1.6g/kg protein and 8 hours sleep tonight.`;
    } else {
      simulatedReply = `### 🤖 FitTrack AI Coach
Great question! For muscle recovery and steady energy:
- **Pre-Workout:** Try 2 Idlis with light sambar or a banana 45 mins before training.
- **Post-Workout:** Aim for 20–30g of protein (3 boiled eggs, 150g paneer, or chicken/fish with steamed rice).
- **Hydration:** Sip water consistently to reach your 2,500ml daily target.`;
    }

    return {
      success: true,
      reply: simulatedReply,
      timestamp: new Date().toISOString(),
    };
  }

  if (endpoint === '/ai/history') {
    return {
      success: true,
      data: [],
    };
  }

  // Default fallback
  return { success: true, message: 'Simulated preview response', data: [] };
}
