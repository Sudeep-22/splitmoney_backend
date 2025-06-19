const express = require('express');
const router = express.Router();
const { register, login, refreshAccessToken, logoutUser,deleteUser } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-Token', refreshAccessToken);
router.post('/logOut', logoutUser);
router.delete('/deleteUser',authMiddleware, deleteUser);

module.exports = router;