const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_fittrack_dev_2026', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = { generateToken };
