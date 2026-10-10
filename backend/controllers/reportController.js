const Workout = require('../models/Workout');
const FoodLog = require('../models/FoodLog');
const WaterLog = require('../models/WaterLog');
const BodyMetric = require('../models/BodyMetric');
const Goal = require('../models/Goal');
const { toCsv } = require('../utils/csvExporter');

// @desc    Get aggregated dashboard summary data for charts and cards
// @route   GET /api/v1/reports/dashboard-summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 1. Today's Workouts
    const todayWorkouts = await Workout.find({
      userId,
      date: { $gte: startOfToday, $lte: endOfToday },
    });
    const workoutMinutesToday = todayWorkouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
    const caloriesBurnedToday = todayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    // 2. Today's Food
    const todayFood = await FoodLog.find({
      userId,
      date: { $gte: startOfToday, $lte: endOfToday },
    });
    const caloriesConsumedToday = todayFood.reduce((sum, f) => sum + (f.calories || 0), 0);
    const proteinToday = todayFood.reduce((sum, f) => sum + (f.protein || 0), 0);
    const carbsToday = todayFood.reduce((sum, f) => sum + (f.carbs || 0), 0);
    const fatToday = todayFood.reduce((sum, f) => sum + (f.fat || 0), 0);

    // 3. Today's Water
    const todayWater = await WaterLog.find({
      userId,
      date: { $gte: startOfToday, $lte: endOfToday },
    });
    const waterConsumedToday = todayWater.reduce((sum, w) => sum + (w.amountMl || 0), 0);

    // 4. Latest Body Metric
    const latestMetric = await BodyMetric.findOne({ userId }).sort({ date: -1 });

    // 5. 7-day Historical Trend Data for Chart.js
    const past7Days = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const pastWeekWorkouts = await Workout.find({
      userId,
      date: { $gte: sevenDaysAgo },
    });

    const pastWeekFood = await FoodLog.find({
      userId,
      date: { $gte: sevenDaysAgo },
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayFoodCals = pastWeekFood
        .filter((f) => f.date && f.date.toISOString().startsWith(dateStr))
        .reduce((sum, f) => sum + (f.calories || 0), 0);

      const dayBurnCals = pastWeekWorkouts
        .filter((w) => w.date && w.date.toISOString().startsWith(dateStr))
        .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

      const dayDuration = pastWeekWorkouts
        .filter((w) => w.date && w.date.toISOString().startsWith(dateStr))
        .reduce((sum, w) => sum + (w.durationMinutes || 0), 0);

      past7Days.push({
        date: dateStr,
        label: dayLabel,
        caloriesConsumed: dayFoodCals,
        caloriesBurned: dayBurnCals,
        workoutMinutes: dayDuration,
      });
    }

    res.status(200).json({
      success: true,
      today: {
        workoutMinutes: workoutMinutesToday,
        caloriesBurned: caloriesBurnedToday,
        workoutCount: todayWorkouts.length,
        caloriesConsumed: caloriesConsumedToday,
        dailyCalorieTarget: req.user.dailyCalorieTarget || 2000,
        macros: {
          protein: proteinToday,
          carbs: carbsToday,
          fat: fatToday,
        },
        waterMl: waterConsumedToday,
        dailyWaterTarget: req.user.dailyWaterTarget || 2500,
        currentWeight: latestMetric ? latestMetric.weightKg : req.user.targetWeight || null,
      },
      charts: {
        weeklyTrend: past7Days,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export all user records as CSV
// @route   GET /api/v1/reports/export-csv
// @access  Private
const exportCsv = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [workouts, foods, waters, metrics] = await Promise.all([
      Workout.find({ userId }).sort({ date: -1 }),
      FoodLog.find({ userId }).sort({ date: -1 }),
      WaterLog.find({ userId }).sort({ date: -1 }),
      BodyMetric.find({ userId }).sort({ date: -1 }),
    ]);

    const rows = [];

    // Map Workouts
    workouts.forEach((w) => {
      rows.push({
        Date: w.date ? w.date.toISOString().split('T')[0] : '',
        Type: 'Workout',
        Title: w.title,
        Category: w.category,
        DurationMinutes: w.durationMinutes,
        CaloriesBurned: w.caloriesBurned || 0,
        CaloriesConsumed: '',
        Protein_g: '',
        Carbs_g: '',
        Fat_g: '',
        Water_ml: '',
        Weight_kg: '',
        Notes: w.notes || '',
      });
    });

    // Map Food
    foods.forEach((f) => {
      rows.push({
        Date: f.date ? f.date.toISOString().split('T')[0] : '',
        Type: 'Nutrition',
        Title: f.foodName,
        Category: f.mealType,
        DurationMinutes: '',
        CaloriesBurned: '',
        CaloriesConsumed: f.calories,
        Protein_g: f.protein || 0,
        Carbs_g: f.carbs || 0,
        Fat_g: f.fat || 0,
        Water_ml: '',
        Weight_kg: '',
        Notes: '',
      });
    });

    // Map Water
    waters.forEach((wt) => {
      rows.push({
        Date: wt.date ? wt.date.toISOString().split('T')[0] : '',
        Type: 'Water',
        Title: 'Hydration Entry',
        Category: 'Water',
        DurationMinutes: '',
        CaloriesBurned: '',
        CaloriesConsumed: '',
        Protein_g: '',
        Carbs_g: '',
        Fat_g: '',
        Water_ml: wt.amountMl,
        Weight_kg: '',
        Notes: '',
      });
    });

    // Map Metrics
    metrics.forEach((m) => {
      rows.push({
        Date: m.date ? m.date.toISOString().split('T')[0] : '',
        Type: 'BodyMetric',
        Title: 'Body Weight Entry',
        Category: 'Weight',
        DurationMinutes: '',
        CaloriesBurned: '',
        CaloriesConsumed: '',
        Protein_g: '',
        Carbs_g: '',
        Fat_g: '',
        Water_ml: '',
        Weight_kg: m.weightKg,
        Notes: m.notes || '',
      });
    });

    // Sort by Date descending
    rows.sort((a, b) => new Date(b.Date) - new Date(a.Date));

    const headers = [
      'Date',
      'Type',
      'Title',
      'Category',
      'DurationMinutes',
      'CaloriesBurned',
      'CaloriesConsumed',
      'Protein_g',
      'Carbs_g',
      'Fat_g',
      'Water_ml',
      'Weight_kg',
      'Notes',
    ];

    const csvData = toCsv(rows, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="FitTrack_Export_${new Date().toISOString().split('T')[0]}.csv"`
    );

    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  exportCsv,
};
