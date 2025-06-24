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
      paidBy: expense.paidById 
    });

    await newExpense.save();

    // 3. Loop through each contribution and save
    for (const entry of contributions) {
      const indivContri = new IndiviualContribution({
        expense: newExpense._id,
        paidByUser: expense.paidById ,
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
      title: exp.title,
      amount: exp.amount,
      paidByName: exp.paidBy.name,
    }));

    res.status(200).json({ expenses: formattedExpenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};