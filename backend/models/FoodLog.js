const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      required: [true, 'Please select a meal type'],
    },
    foodName: {
      type: String,
      required: [true, 'Please provide the food name'],
      trim: true,
    },
    calories: {
      type: Number,
      required: [true, 'Please provide calorie count'],
      min: [0, 'Calories cannot be negative'],
    },
    protein: {
      type: Number,
      default: 0,
      min: [0, 'Protein cannot be negative'],
    },
    carbs: {
      type: Number,
      default: 0,
      min: [0, 'Carbs cannot be negative'],
    },
    fat: {
      type: Number,
      default: 0,
      min: [0, 'Fat cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user food queries
foodLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('FoodLog', foodLogSchema);
