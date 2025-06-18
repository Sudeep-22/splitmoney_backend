const express = require('express');
const router = express.Router();
const { createNewGroup, addMemberToGroup, addExpense, exitFromGroup } = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create-group',authMiddleware, createNewGroup);
router.post('/add-member', authMiddleware, addMemberToGroup);
router.post('/add-expense', authMiddleware, addExpense);
router.post('/exit-group', authMiddleware, exitFromGroup);

module.exports = router;