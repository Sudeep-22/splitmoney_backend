const express = require('express');
const router = express.Router();
const { register, login, refreshAccessToken, logoutUser } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-Token', refreshAccessToken);
router.post('/logout', logoutUser);

module.exports = router;