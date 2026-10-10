const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  exportCsv,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard-summary', getDashboardSummary);
router.get('/export-csv', exportCsv);

module.exports = router;
