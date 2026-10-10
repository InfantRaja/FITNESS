const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amountMl: {
      type: Number,
      required: [true, 'Please provide water amount in ml'],
      min: [1, 'Water amount must be at least 1 ml'],
      max: [5000, 'Single water intake cannot exceed 5000 ml'],
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

waterLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WaterLog', waterLogSchema);
