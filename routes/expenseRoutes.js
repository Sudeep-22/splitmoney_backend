const express = require('express');
const router = express.Router();
const { addExpenseContribution, fetchAllExpense, fetchMemberContri, fetchExpenseContri, deleteExpense } = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/addExpense', authMiddleware, addExpenseContribution);
router.post('/fetchAllExpense', authMiddleware, fetchAllExpense);
router.post('/fetchMemberContri', authMiddleware, fetchMemberContri);
router.post('/fetchExpenseContri', authMiddleware, fetchExpenseContri);
router.post('/deleteExpense', authMiddleware, deleteExpense);

module.exports = router;