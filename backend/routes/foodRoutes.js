const express = require('express');
const router = express.Router();
const {
  getTodayFood,
  getAllFood,
  createFoodLog,
  deleteFoodLog,
} = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/today', getTodayFood);
router.route('/')
  .get(getAllFood)
  .post(createFoodLog);

router.delete('/:id', deleteFoodLog);

module.exports = router;
