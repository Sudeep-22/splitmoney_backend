const express = require('express');
const router = express.Router();
const { createNewGroup, addMember, exitFromGroup,fetchGroup } = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/createGroup',authMiddleware, createNewGroup);
router.post('/addMember', authMiddleware, addMember);
router.post('/exitGroup', authMiddleware, exitFromGroup);
router.post('/fetchGroup', authMiddleware, fetchGroup);

module.exports = router;