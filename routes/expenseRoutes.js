const express = require('express');
const router = express.Router();
const { addExpenseContribution, fetchAllExpense, fetchMemberContri } = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/addExpense', authMiddleware, addExpenseContribution);
router.post('/fetchAllExpense', authMiddleware, fetchAllExpense);
router.post('/fetchMemberContri', authMiddleware, fetchMemberContri);

module.exports = router;