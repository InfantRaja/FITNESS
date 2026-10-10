const ChatMessage = require('../models/ChatMessage');
const FoodLog = require('../models/FoodLog');
const Workout = require('../models/Workout');

/**
 * Handle AI Chat with Google Gemini API and Intelligent Local Knowledge Fallback
 */
const sendChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message.',
      });
    }

    // 1. Gather User Context (Profile + Today's logs)
    const user = req.user;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayFood, todayWorkouts] = await Promise.all([
      FoodLog.find({ userId, date: { $gte: startOfToday } }),
      Workout.find({ userId, date: { $gte: startOfToday } }),
    ]);

    const todayCalories = todayFood.reduce((sum, f) => sum + (f.calories || 0), 0);
    const todayProtein = todayFood.reduce((sum, f) => sum + (f.protein || 0), 0);
    const workoutMinutes = todayWorkouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);

    const userContextStr = `
USER CONTEXT:
- Name: ${user.name || 'Friend'}
- Age: ${user.age || 'Not specified'}
- Gender: ${user.gender || 'Not specified'}
- Height: ${user.height ? `${user.height} cm` : 'Not specified'}
- Target Weight: ${user.targetWeight ? `${user.targetWeight} kg` : 'Not specified'}
- Daily Calorie Target: ${user.dailyCalorieTarget || 2000} kcal
- Daily Water Target: ${user.dailyWaterTarget || 2500} ml
- Today's Consumed: ${todayCalories} kcal (Protein: ${todayProtein}g)
- Today's Workouts: ${todayWorkouts.length} session(s), ${workoutMinutes} mins trained
`;

    // 2. Build System Prompt with Nutrition, Tamil Nadu Foods, and Safety Rules
    const systemPrompt = `
You are FitTrack AI Assistant, an elite, friendly fitness coach and nutrition expert.
You help users with workout planning, macronutrients, calorie tracking, weight loss, muscle gain, recovery, and meal planning.

KEY INSTRUCTIONS & SPECIALIZATIONS:
1. Deeply familiar with both international diets and Indian / Tamil Nadu traditional foods (such as Idli, Dosa, Sambar, Dal, Chana Sundal, Upma, Pongal, Rasam, Curd rice, Eggs, Paneer, Fish Curry, Chicken, Millets like Ragi/Kambu, etc.).
2. When suggesting meals, provide realistic portions and estimate macros (Calories, Protein, Carbs, Fat, and Fiber) with reasonable approximation.
3. Offer budget-friendly, vegetarian, and non-vegetarian alternatives.
4. Explain WHY a food fits or does not fit a goal. Never label everyday foods as universally "bad" or "forbidden"; emphasize portion control and energy balance.
5. If essential details (such as current weight or primary goal) are missing to give an accurate calculation, kindly ask the user.
6. SAFETY FIRST: Clearly state that your advice is for fitness and educational purposes, not clinical medical advice. Never recommend dangerous crash diets, extreme deficits (<1200 kcal), or unverified supplements. Respect allergies.

${userContextStr}
`;

    // 3. Attempt Gemini API Call if GEMINI_API_KEY / AI_API_KEY is configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    let aiResponseText = null;

    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        aiResponseText = await callGeminiApi(apiKey, systemPrompt, message);
      } catch (geminiError) {
        console.warn('[Gemini API Notice] Cloud call failed or rate-limited. Falling back to built-in knowledge engine:', geminiError.message);
      }
    }

    // 4. Fallback Knowledge Engine (ensures zero downtime for students/testers)
    if (!aiResponseText) {
      aiResponseText = generateFallbackResponse(message, user, todayCalories, todayProtein);
    }

    // 5. Store in chat history
    try {
      await Promise.all([
        ChatMessage.create({ userId, role: 'user', content: message.trim() }),
        ChatMessage.create({ userId, role: 'assistant', content: aiResponseText }),
      ]);
    } catch (saveErr) {
      console.warn('[Chat History Notice] Could not save message to database:', saveErr.message);
    }

    res.status(200).json({
      success: true,
      reply: aiResponseText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Direct call to Google Gemini REST API (gemini-1.5-flash)
 */
async function callGeminiApi(apiKey, systemInstruction, userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemInstruction}\n\nUser Question: ${userMessage}` },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API responded with status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!candidate) {
    throw new Error('No candidate content returned by Gemini API');
  }

  return candidate;
}

/**
 * Intelligent Local Knowledge Engine (Tamil Nadu Foods, Macros, Workouts, Recovery)
 */
function generateFallbackResponse(query, user, todayCalories, todayProtein) {
  const q = query.toLowerCase();

  // 1. Post-workout nutrition
  if (q.includes('after a workout') || q.includes('post workout') || q.includes('post-workout')) {
    return `### 🏋️ Optimal Post-Workout Nutrition

After training, your priority is **muscle protein synthesis** and **glycogen replenishment**. Aim to consume a meal within 45–90 minutes containing:

1. **High-Quality Protein (20–35g):**
   - **Non-Veg:** 3–4 whole boiled eggs / egg whites, 150g grilled chicken breast, or fish curry.
   - **Vegetarian:** 1 scoop Whey protein with milk, 150g low-fat Paneer, or a bowl of boiled **Sundal** (chickpeas) with curd.
2. **Easily Digestible Carbohydrates (30–50g):**
   - 2–3 soft **Idlis** with sambar, a banana, boiled sweet potato, or 1 cup of steamed white rice.
3. **Hydration & Electrolytes:**
   - Drink at least 500ml of water or fresh tender coconut water (*Elaneer*) to replenish potassium and sodium.

*Tip:* Avoid very fatty, deep-fried foods right after training as they slow down digestion.`;
  }

  // 2. Idli, Dosa, South Indian / Tamil Foods
  if (q.includes('idli') || q.includes('dosa') || q.includes('sambar') || q.includes('rice') || q.includes('tamil') || q.includes('indian')) {
    return `### 🥗 South Indian & Tamil Nadu Nutrition Guide

Traditional South Indian meals are naturally wholesome, but balancing macronutrients (especially protein) is key:

- **Idli:** Steamed and fermented, very gentle on gut health! 
  - *Macro Estimate (2 medium idlis):* ~130 kcal, 4g protein, 26g carbs, 0.5g fat.
  - *Pro Tip:* Pair with a thick **dal/sambar** packed with vegetables, and add 2 boiled eggs or sprouted green gram (*paasi payaru*) to boost protein to 18–20g!
- **Dosa:** A great source of energy. Opt for less oil/ghee during weight loss. 
  - *Upgrade:* Try **Pesarattu** (green moong dosa) or **Ragi Dosa** for significantly higher protein and fiber.
- **Lunch Plate (Rice & Sambar):**
  - Keep rice to 1 bounded katori (~150g cooked).
  - Fill half the plate with **Poriyal** (cabbage, beans, spinach/keerai) and a generous bowl of Dal or Fish/Chicken curry.
- **Evening Snack:**
  - **Sundal** (boiled white or black chana tempered with mustard and curry leaves): High fiber and ~8g protein per cup!

*Verdict:* You do not need to quit traditional foods. Simply adjust portion sizes and ensure you add dedicated protein sources!`;
  }

  // 3. Protein increase
  if (q.includes('increase my protein') || q.includes('more protein') || q.includes('protein source') || q.includes('high protein')) {
    return `### 🥩 How to Boost Your Daily Protein Intake

Your target is approximately **1.4g to 2.0g per kg of body weight** for muscle recovery. Here are high-yield, affordable options:

**Vegetarian Sources:**
- **Paneer:** 100g = ~18g protein (rich in casein).
- **Curd / Greek Yogurt:** 1 cup = ~10g protein.
- **Soya Chunks / Mealmaker:** Extremely budget-friendly! 50g = ~26g protein.
- **Chana / Rajma / Sundal:** 1 cooked cup = ~12–15g protein + fiber.
- **Sprouted Moong (Paasi Payaru):** 1 cup = ~14g protein.

**Non-Vegetarian Sources:**
- **Whole Eggs:** 2 whole eggs + 2 egg whites = ~20g protein.
- **Chicken Breast:** 100g cooked = ~31g protein.
- **Fish (Sardines / Ayilai / Vanjaram):** 100g = ~22g protein + Omega-3 fatty acids.

*Action Step:* Include at least one protein anchor in every meal rather than trying to eat it all at dinner.`;
  }

  // 4. Weight loss / Calorie Deficit
  if (q.includes('weight loss') || q.includes('lose weight') || q.includes('fat loss') || q.includes('calorie deficit')) {
    const target = user.dailyCalorieTarget || 2000;
    return `### 🔥 Sustainable Fat Loss Strategy

Fat loss is driven by a steady **moderate caloric deficit** (300–500 kcal below maintenance), NOT starving:

1. **Your Daily Calorie Target:** Currently set to **${target} kcal**. (Today you have logged **${todayCalories} kcal**).
2. **Prioritize Protein (25–30% of calories):** Keeps you full for hours and prevents muscle loss.
3. **Eat Voluminous Fiber:**
   - Add cucumber, tomato, greens (*keerai*), and raw salads before heavy meals.
4. **Hydration Rule:**
   - Drink 2.5–3 liters of water. Often mild dehydration is mistaken for hunger pangs.
5. **Activity:**
   - Combine 3–4 days of resistance training with a daily target of 7,000–10,000 steps.

*Consistency beats perfection:* Aim for a gradual loss of 0.4kg to 0.7kg per week for sustainable results.`;
  }

  // 5. Beginner Workout Routine
  if (q.includes('workout') || q.includes('routine') || q.includes('exercise') || q.includes('gym')) {
    return `### 🏋️ 3-Day Beginner Full-Body Routine

If you are starting out or returning to training, a 3-day Full-Body split provides the best stimulus with ample recovery:

**Day 1 (Monday) - Full Body Focus A:**
1. Goblet Squats: 3 sets x 10–12 reps
2. Dumbbell Flat Bench Press or Push-ups: 3 sets x 8–10 reps
3. Lat Pulldown / Bent-over Row: 3 sets x 10 reps
4. Plank: 3 sets x 30–45 seconds

**Day 2 (Wednesday) - Full Body Focus B:**
1. Romanian Deadlift (Dumbbells): 3 sets x 10 reps
2. Overhead Dumbbell Shoulder Press: 3 sets x 10 reps
3. Seated Cable Row or Dumbbell Rows: 3 sets x 10 reps
4. Bodyweight Walking Lunges: 3 sets x 12 steps

**Day 3 (Friday) - Full Body Focus C:**
1. Leg Press: 3 sets x 12 reps
2. Incline Dumbbell Press: 3 sets x 10 reps
3. Bicep Curls superset with Tricep Pushdowns: 3 sets x 12 reps
4. Hanging Knee Raises: 3 sets x 12 reps

*Rest days (Tue, Thu, Sat, Sun):* 30-minute brisk walk and mobility stretches.`;
  }

  // 6. General / Default response
  return `### 💡 FitTrack Assistant Insights

Thank you for your question! Here is personalized guidance based on your profile:

- **Daily Calorie Target:** ${user.dailyCalorieTarget || 2000} kcal (Today logged: ${todayCalories} kcal)
- **Daily Protein Target:** Aim for ~1.6g per kg of target weight. Today logged: ${todayProtein}g.
- **Hydration:** Ensure you are sipping water consistently across the day.

**Practical Action Tips:**
1. Focus on unprocessed, nutrient-dense whole foods (dal, vegetables, lean meats, eggs, millets, fruits).
2. Balance carbohydrate intake around your active workout times.
3. Prioritize 7–8 hours of quality sleep—that is when muscle tissue repairs itself.

*Feel free to ask specific follow-ups like "What can I eat for a 500-calorie dinner?" or "Can I eat white rice at night?"*`;
}

/**
 * Get user chat history
 */
const getChatHistory = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user.id })
      .sort({ createdAt: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear user chat history
 */
const clearChatHistory = async (req, res, next) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user.id });
    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
};
