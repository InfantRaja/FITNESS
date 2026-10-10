const BodyMetric = require('../models/BodyMetric');

// @desc    Get user body metrics and weight history
// @route   GET /api/v1/metrics
// @access  Private
const getMetrics = async (req, res, next) => {
  try {
    const metrics = await BodyMetric.find({ userId: req.user.id })
      .sort({ date: 1 }) // Chronological for charts
      .limit(60);

    res.status(200).json({
      success: true,
      count: metrics.length,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log a new body metric / weight
// @route   POST /api/v1/metrics
// @access  Private
const createMetric = async (req, res, next) => {
  try {
    const { weightKg, chestCm, waistCm, hipsCm, armsCm, notes, date } = req.body;

    if (!weightKg) {
      return res.status(400).json({
        success: false,
        message: 'Please provide weight in kilograms.',
      });
    }

    const metric = await BodyMetric.create({
      userId: req.user.id,
      weightKg: Number(weightKg),
      chestCm: chestCm ? Number(chestCm) : null,
      waistCm: waistCm ? Number(waistCm) : null,
      hipsCm: hipsCm ? Number(hipsCm) : null,
      armsCm: armsCm ? Number(armsCm) : null,
      notes: notes || '',
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      data: metric,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a metric entry
// @route   DELETE /api/v1/metrics/:id
// @access  Private
const deleteMetric = async (req, res, next) => {
  try {
    const metric = await BodyMetric.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!metric) {
      return res.status(404).json({
        success: false,
        message: 'Metric entry not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Metric entry removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMetrics,
  createMetric,
  deleteMetric,
};
