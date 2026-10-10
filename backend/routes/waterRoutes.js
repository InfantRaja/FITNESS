const express = require('express');
const router = express.Router();
const {
  getTodayWater,
  addWaterLog,
  deleteWaterLog,
} = require('../controllers/waterController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/today', getTodayWater);
router.post('/', addWaterLog);
router.delete('/:id', deleteWaterLog);

module.exports = router;
