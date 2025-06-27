const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const GroupUser = require('../models/GroupUser');
const Expense = require('../models/Expense');
const ExpenseIndiviualMap = require('../models/ExpenseIndivisualMap');
const IndiviualContribution = require('../models/IndivisualExpenseContribution');

exports.addExpenseContribution = async (req, res) => {
  const { groupId, expense, contributions } = req.body;

  try {
    // 1. Check group exists
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // 2. Create the Expense
    const newExpense = new Expense({
      group: groupId,
      title: expense.title,
      amount: expense.amount,
      paidBy: expense.paidById,
    });

    await newExpense.save();

    // 3. Loop through each contribution and save
    for (const entry of contributions) {
      const indivContri = new IndiviualContribution({
        group: groupId,
        expense: newExpense._id,
        paidByUser: expense.paidById,
        paidToUser: entry.paidToUserId,
        amount: entry.amount
      });

      await indivContri.save();
    }

    res.status(201).json({ message: "Expense and contributions added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.fetchAllExpense = async (req, res) => {
  const { groupId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Fetch expenses with paidBy populated to get user name
    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name') // only fetch the name field of paidBy user
      .sort({ date: -1 });

    // Format the result to send only required fields
    const formattedExpenses = expenses.map(exp => ({
      id: exp._id, 
      title: exp.title,
      amount: exp.amount,
      paidByName: exp.paidBy.name,
    }));

    res.status(200).json({ expenses: formattedExpenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.fetchMemberContri = async (req, res) => {
  const { groupId } = req.body;
  const userId = req.userId;

  try {
    // 1. Verify group exists
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // 2. Get all users in group
    const groupUsers = await GroupUser.find({ group: groupId }).populate('user', 'name');
    const otherMembers = groupUsers
      .map(entry => entry.user)
      .filter(user => user && user._id.toString() !== userId);

    // 3. Initialize net balance map with all members (default 0)
    const netBalances = {};
    otherMembers.forEach(member => {
      netBalances[member._id.toString()] = 0;
    });

    // 4. Fetch all contributions in this group
    const contributions = await IndiviualContribution.find({ group: groupId });

    // 5. Calculate net balances
    contributions.forEach(entry => {
      const paidBy = entry.paidByUser.toString();
      const paidTo = entry.paidToUser.toString();
      const amount = entry.amount;

      if (paidBy === userId && paidTo !== userId) {
        // User paid for another member
        netBalances[paidTo] = (netBalances[paidTo] || 0) + amount;
      } else if (paidTo === userId && paidBy !== userId) {
        // Member paid for the user
        netBalances[paidBy] = (netBalances[paidBy] || 0) - amount;
      }
    });

    // 6. Build response: array of { memberId, memberName, netAmount }
    const result = otherMembers.map(member => ({
      memberId: member._id,
      memberName: member.name,
      netAmount: netBalances[member._id.toString()] || 0
    }));

    res.status(200).json({ memberContributions: result });
  } catch (err) {
    console.error('❌ Error in fetchMemberContri:', err.message);
    res.status(500).json({ message: err.message });
  }
};

