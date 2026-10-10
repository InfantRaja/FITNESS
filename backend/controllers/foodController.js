const FoodLog = require('../models/FoodLog');

// @desc    Get food logs for today with aggregated macros
// @route   GET /api/v1/food/today
// @access  Private
const getTodayFood = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await FoodLog.find({
      userId: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: 1 });

    const totals = logs.reduce(
      (acc, item) => {
        acc.calories += item.calories || 0;
        acc.protein += item.protein || 0;
        acc.carbs += item.carbs || 0;
        acc.fat += item.fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.status(200).json({
      success: true,
      data: logs,
      totals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all food logs (with optional date query)
// @route   GET /api/v1/food
// @access  Private
const getAllFood = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    const query = { userId: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const logs = await FoodLog.find(query).sort({ date: -1 }).limit(Number(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log a new food item
// @route   POST /api/v1/food
// @access  Private
const createFoodLog = async (req, res, next) => {
  try {
    const { mealType, foodName, calories, protein, carbs, fat, date } = req.body;

    if (!mealType || !foodName || calories === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide meal type, food name, and calories.',
      });
    }

    const foodItem = await FoodLog.create({
      userId: req.user.id,
      mealType,
      foodName,
      calories: Number(calories),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fat: Number(fat || 0),
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      data: foodItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food item
// @route   DELETE /api/v1/food/:id
// @access  Private
const deleteFoodLog = async (req, res, next) => {
  try {
    const foodItem = await FoodLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food log not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Food entry deleted.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayFood,
  getAllFood,
  createFoodLog,
  deleteFoodLog,
};
