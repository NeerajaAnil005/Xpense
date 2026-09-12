const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', transactionController.getTransactions);
router.get('/summary/stats', transactionController.getSummaryStats);
router.get('/export/csv', transactionController.exportCSV);
router.get('/:id', transactionController.getTransactionById);
router.post('/', transactionController.createTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
