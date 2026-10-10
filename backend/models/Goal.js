const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a goal title'],
      trim: true,
    },
    goalType: {
      type: String,
      enum: ['Weight', 'WorkoutsPerWeek', 'DailyCalories', 'DailyWater', 'Custom'],
      required: [true, 'Please specify a goal type'],
    },
    targetValue: {
      type: Number,
      required: [true, 'Please specify the target value'],
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);
