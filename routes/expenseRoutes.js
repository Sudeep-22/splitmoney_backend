const express = require('express');
const router = express.Router();
const { addExpenseContribution, fetchAllExpense } = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/addExpense', authMiddleware, addExpenseContribution);
router.post('/fetchAllExpense', authMiddleware, fetchAllExpense);

module.exports = router;