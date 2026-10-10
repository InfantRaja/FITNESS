const express = require('express');
const router = express.Router();
const {
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/chat', sendChatMessage);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

module.exports = router;
