const mongoose = require('mongoose');

const exerciseSetSchema = new mongoose.Schema(
  {
    setNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    reps: {
      type: Number,
      required: true,
      min: 1,
    },
    weightKg: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const exerciseItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sets: [exerciseSetSchema],
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a workout title'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Strength', 'Cardio', 'HIIT', 'Flexibility', 'Other'],
      default: 'Strength',
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Please provide workout duration in minutes'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    caloriesBurned: {
      type: Number,
      min: 0,
      default: 0,
    },
    exercises: [exerciseItemSchema],
    notes: {
      type: String,
      maxlength: 500,
      default: '',
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

// Compound index for user history queries
workoutSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Workout', workoutSchema);
