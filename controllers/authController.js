const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const IndivisualExpenseContribution = require('../models/IndivisualExpenseContribution');
const Expense = require('../models/Expense');
const GroupUser = require('../models/GroupUser');

// Helper functions
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ name, email, passwordHash });
    await user.save();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      accessToken,
      user: { id: user._id, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: { id: user._id, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Refresh access token
exports.refreshAccessToken = async(req, res) => {
  const token = req.cookies.refreshToken;
   if (!token) {
    return res.status(401).json({ message: 'No refresh token found' }); // ✅ Return JSON
  } // Unauthorized
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('name');
    const accessToken = generateAccessToken(decoded.userId);
    res.json({ accessToken,
      user: { id: user._id, name: user.name }, });
  } catch (err) {
    return res.sendStatus(403).json({ message: 'Invalid or expired refresh token' }); // Forbidden
  }
};

// Logout user
exports.logoutUser = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.deleteUser = async (req, res) => {
  const userId = req.userId;

  try {
    // 1. Nullify user references in contributions
    await IndivisualExpenseContribution.updateMany(
      { paidByUser: userId },
      { $set: { paidByUser: null } }
    );

    await IndivisualExpenseContribution.updateMany(
      { paidToUser: userId },
      { $set: { paidToUser: null } }
    );

    // 2. Nullify references in expenses
    await Expense.updateMany(
      { paidBy: userId },
      { $set: { paidBy: null } }
    );

    // 3. Delete the user
    await User.findByIdAndDelete(userId);

    // 4. Clear cookie and respond
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'User deleted successfully and references nullified' });
  } catch (err) {
    console.error('Error in deleteUser:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.fetchAllUsers = async (req, res) => {
  try {
    const { groupId } = req.body;

    if (!groupId) return res.status(400).json({ message: "Group ID is required" });

    // Step 1: Get user IDs already in the group
    const groupUsers = await GroupUser.find({ group: groupId }).select("user");
    const userIdsInGroup = groupUsers.map((gu) => gu.user.toString());

    // Step 2: Get users NOT in the group
    const users = await User.find({ _id: { $nin: userIdsInGroup } }).select("name");

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: err.message });
  }
};
