const Goal = require('../models/Goal');

// @desc    Get all fitness goals for user
// @route   GET /api/v1/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new goal
// @route   POST /api/v1/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { title, goalType, targetValue, currentValue, unit, deadline } = req.body;

    if (!title || !goalType || targetValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, goal type, and target value.',
      });
    }

    const goal = await Goal.create({
      userId: req.user.id,
      title,
      goalType,
      targetValue: Number(targetValue),
      currentValue: Number(currentValue || 0),
      unit: unit || '',
      deadline: deadline ? new Date(deadline) : null,
    });

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal progress or status
// @route   PUT /api/v1/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or unauthorized.',
      });
    }

    if (req.body.currentValue !== undefined) {
      goal.currentValue = Number(req.body.currentValue);
      if (goal.targetValue && goal.currentValue >= goal.targetValue) {
        goal.status = 'completed';
      }
    }

    if (req.body.status) goal.status = req.body.status;
    if (req.body.title) goal.title = req.body.title;
    if (req.body.targetValue !== undefined) goal.targetValue = Number(req.body.targetValue);
    if (req.body.deadline !== undefined) goal.deadline = req.body.deadline ? new Date(req.body.deadline) : null;

    const updated = await goal.save();

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/v1/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
