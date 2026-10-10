const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not return password by default
    },
    age: {
      type: Number,
      min: [10, 'Age must be at least 10'],
      max: [120, 'Age cannot exceed 120'],
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say',
    },
    height: {
      type: Number, // in centimeters
      min: [50, 'Height must be at least 50 cm'],
      max: [280, 'Height cannot exceed 280 cm'],
      default: null,
    },
    targetWeight: {
      type: Number, // in kg
      min: [20, 'Target weight must be at least 20 kg'],
      max: [500, 'Target weight cannot exceed 500 kg'],
      default: null,
    },
    dailyCalorieTarget: {
      type: Number,
      default: 2000,
      min: [500, 'Daily calorie target must be at least 500'],
      max: [10000, 'Daily calorie target cannot exceed 10000'],
    },
    dailyWaterTarget: {
      type: Number, // in ml
      default: 2500,
      min: [500, 'Daily water target must be at least 500 ml'],
      max: [10000, 'Daily water target cannot exceed 10000 ml'],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
