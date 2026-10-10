const Workout = require('../models/Workout');

// @desc    Get all workouts for authenticated user
// @route   GET /api/v1/workouts
// @access  Private
const getWorkouts = async (req, res, next) => {
  try {
    const { category, startDate, endDate, limit = 50 } = req.query;

    const query = { userId: req.user.id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: workouts.length,
      data: workouts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout by ID
// @route   GET /api/v1/workouts/:id
// @access  Private
const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or you do not have permission to view it.',
      });
    }

    res.status(200).json({
      success: true,
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new workout
// @route   POST /api/v1/workouts
// @access  Private
const createWorkout = async (req, res, next) => {
  try {
    const { title, category, durationMinutes, caloriesBurned, exercises, notes, date } = req.body;

    if (!title || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a workout title and duration.',
      });
    }

    const workout = await Workout.create({
      userId: req.user.id,
      title,
      category: category || 'Strength',
      durationMinutes: Number(durationMinutes),
      caloriesBurned: caloriesBurned ? Number(caloriesBurned) : 0,
      exercises: Array.isArray(exercises) ? exercises : [],
      notes: notes || '',
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workout
// @route   PUT /api/v1/workouts/:id
// @access  Private
const updateWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or access denied.',
      });
    }

    const updated = await Workout.findByIdAndUpdate(
      req.params.id,
      { ...req.body, userId: req.user.id },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/v1/workouts/:id
// @access  Private
const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or access denied.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workout successfully removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
};
