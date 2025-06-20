const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const GroupUser = require('../models/GroupUser');
const Expense = require('../models/Expense');

exports.addExpense = async (req, res) => {
  const { groupId, title, amount, paidByName} = req.body;

  try {
    let paidBy = await User.findOne({ name: paidByName });
     if (!paidBy){
       return res.status(404).json({ message: 'Payer not found' });
     }

    const toAddExpense = new Expense({group: groupId ,title,amount,paidBy: paidBy._id});
    await toAddExpense.save();

    res.status(201).json({
      message: "Expense has been added",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.fetchExpenses = async (req, res) => {
  const { groupId } = req.body;

  try {
    // Check if group exists
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