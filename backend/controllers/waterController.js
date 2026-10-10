const WaterLog = require('../models/WaterLog');

// @desc    Get today's total water intake & logs
// @route   GET /api/v1/water/today
// @access  Private
const getTodayWater = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await WaterLog.find({
      userId: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    const totalMl = logs.reduce((sum, item) => sum + (item.amountMl || 0), 0);
    const targetMl = req.user.dailyWaterTarget || 2500;
    const progressPercent = Math.min(Math.round((totalMl / targetMl) * 100), 100);

    res.status(200).json({
      success: true,
      totalMl,
      targetMl,
      progressPercent,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log water intake
// @route   POST /api/v1/water
// @access  Private
const addWaterLog = async (req, res, next) => {
  try {
    const { amountMl, date } = req.body;

    if (!amountMl || Number(amountMl) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid water amount in ml.',
      });
    }

    const log = await WaterLog.create({
      userId: req.user.id,
      amountMl: Number(amountMl),
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete water intake entry
// @route   DELETE /api/v1/water/:id
// @access  Private
const deleteWaterLog = async (req, res, next) => {
  try {
    const log = await WaterLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Water log entry not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Water log entry removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayWater,
  addWaterLog,
  deleteWaterLog,
};
