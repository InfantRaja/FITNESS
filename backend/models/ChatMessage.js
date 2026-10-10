const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'nutrition', 'workout', 'recovery'],
      default: 'general',
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ userId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
