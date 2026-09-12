const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/summary', reportController.getReportSummary);
router.get('/monthly', reportController.getMonthlyComparison);
router.get('/categories', reportController.getCategoryBreakdown);
router.get('/trends', reportController.getSpendingTrends);
router.get('/budget-vs-actual', reportController.getBudgetVsActual);

module.exports = router;
