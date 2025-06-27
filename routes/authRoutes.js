const express = require('express');
const router = express.Router();
const { register, login, refreshAccessToken, logoutUser,deleteUser, fetchAllUsers, fetchUser } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refreshToken', refreshAccessToken);
router.post('/logOut', logoutUser);
router.delete('/deleteUser',authMiddleware, deleteUser);
router.get('/fetchAllUsers',authMiddleware, fetchAllUsers);
router.get('/fetchUser',authMiddleware, fetchUser);

module.exports = router;