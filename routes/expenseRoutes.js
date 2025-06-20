const express = require('express');
const router = express.Router();
const {  addExpense, fetchExpense } = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/addExpense', authMiddleware, addExpense);
router.post('/fetchExpense', authMiddleware, fetchExpense);