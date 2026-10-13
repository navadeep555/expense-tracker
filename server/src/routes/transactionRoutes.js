const express = require('express');
const ctrl = require('../controllers/transactionController');
const {
  validateTransaction,
  validateObjectId,
  validateMonthQuery,
} = require('../middleware/validate');

const router = express.Router();

// NOTE: /summary must be declared before /:id
router.get('/summary', validateMonthQuery, ctrl.getSummary);

router
  .route('/')
  .get(validateMonthQuery, ctrl.getTransactions)
  .post(validateTransaction, ctrl.createTransaction);

router
  .route('/:id')
  .put(validateObjectId, validateTransaction, ctrl.updateTransaction)
  .delete(validateObjectId, ctrl.deleteTransaction);

module.exports = router;
