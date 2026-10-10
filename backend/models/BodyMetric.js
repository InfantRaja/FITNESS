const mongoose = require('mongoose');

const bodyMetricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weightKg: {
      type: Number,
      required: [true, 'Please provide weight in kg'],
      min: [20, 'Weight must be at least 20 kg'],
      max: [500, 'Weight cannot exceed 500 kg'],
    },
    chestCm: {
      type: Number,
      min: 0,
      default: null,
    },
    waistCm: {
      type: Number,
      min: 0,
      default: null,
    },
    hipsCm: {
      type: Number,
      min: 0,
      default: null,
    },
    armsCm: {
      type: Number,
      min: 0,
      default: null,
    },
    notes: {
      type: String,
      maxlength: 300,
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

bodyMetricSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('BodyMetric', bodyMetricSchema);
