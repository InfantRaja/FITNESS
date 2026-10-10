const express = require('express');
const router = express.Router();
const {
  getMetrics,
  createMetric,
  deleteMetric,
} = require('../controllers/metricController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getMetrics)
  .post(createMetric);

router.delete('/:id', deleteMetric);

module.exports = router;
