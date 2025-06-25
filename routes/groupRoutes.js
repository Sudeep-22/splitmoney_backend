const express = require('express');
const router = express.Router();
const { createNewGroup, addMember, exitFromGroup,fetchGroup, fetchMembers } = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/createGroup',authMiddleware, createNewGroup);
router.post('/addMember', authMiddleware, addMember);
router.post('/exitGroup', authMiddleware, exitFromGroup);
router.post('/fetchGroup', authMiddleware, fetchGroup); 
router.post('/fetchMembers', authMiddleware, fetchMembers);

module.exports = router;