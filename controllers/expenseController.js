const Group = require('../models/Group');
const Expense = require('../models/Expense');
const IndivisualContribution = require('../models/IndivisualExpenseContribution');
const GroupUser = require('../models/GroupUser');

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
      const indivContri = new IndivisualContribution({
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
      paidByName: exp.paidBy?.name || "Deleted User",
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

    // 2. Get all members in the group (excluding self)
    const groupUserLinks = await GroupUser.find({ group: groupId }).populate('user', 'name');
    const members = groupUserLinks
      .filter(link => link.user._id.toString() !== userId)
      .map(link => ({
        memberId: link.user._id.toString(),
        memberName: link.user.name,
      }));

    // 3. Fetch all contributions in the group
    const contributions = await IndivisualContribution.find({ group: groupId })
      .populate('paidByUser', 'name')
      .populate('paidToUser', 'name');

    const netBalances = {}; // key = memberId
    let myNetTotal = 0;

    // 4. Loop through contributions
    for (const entry of contributions) {
      const paidById = entry.paidByUser?._id?.toString();
      const paidByName = entry.paidByUser?.name || 'Deleted User';

      const paidToId = entry.paidToUser?._id?.toString();
      const paidToName = entry.paidToUser?.name || 'Deleted User';

      const amount = entry.amount;

      if (!paidById || !paidToId || paidById === paidToId) continue;

      if (paidById === userId && paidToId !== userId) {
  // You paid for them → They owe you money
  netBalances[paidToId] = netBalances[paidToId] || {
    memberId: paidToId,
    memberName: paidToName,
    netAmount: 0,
  };
  netBalances[paidToId].netAmount += amount; // ✅ Should be +
  myNetTotal += amount;
}

if (paidToId === userId && paidById !== userId) {
  // They paid for you → You owe them money
  netBalances[paidById] = netBalances[paidById] || {
    memberId: paidById,
    memberName: paidByName,
    netAmount: 0,
  };
  netBalances[paidById].netAmount -= amount; // ✅ Should be -
  myNetTotal -= amount;
}
    }

    // 5. Ensure all members (excluding self) are shown
    members.forEach(member => {
      if (!netBalances[member.memberId]) {
        netBalances[member.memberId] = {
          ...member,
          netAmount: 0,
        };
      }
    });

    // 6. Convert balances to array
    const memberContributions = Object.values(netBalances);

    // 7. Send response
    res.status(200).json({
      memberContributions,
      myNetAmount: myNetTotal,
    });
  } catch (err) {
    console.error("Error in fetchMemberContri:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.fetchExpenseContri = async (req, res) => {
  const { expenseId } = req.body;

  try {
    const expense = await Expense.findById(expenseId).populate('paidBy', 'name');
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const contributions = await IndivisualContribution.find({ expense: expenseId })
      .populate('paidToUser', 'name')
      .populate('paidByUser', 'name');

    const formatted = contributions.map((entry) => ({
      id: entry._id,
      paidToUser: {
        id: entry.paidToUser?._id || null,
        name: entry.paidToUser?.name || "Deleted User",
      },
      paidByUser: {
        id: entry.paidByUser?._id || null,
        name: entry.paidByUser?.name || "Deleted User",
      },
      amount: entry.amount,
    }));

    res.status(200).json({
      expenseId: expense._id,
      title: expense.title,
      totalAmount: expense.amount,
      paidByUser: {
        id: expense.paidBy?._id || null,
        name: expense.paidBy?.name || "Deleted User",
      },
      contributions: formatted,
    });
  } catch (err) {
    console.error('Error in fetchExpenseContri:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  const { expenseId } = req.body;

  try {
    const individualContriIds = await IndivisualContribution.find({ expense: expenseId });

    await Promise.all(
      individualContriIds.map(entry =>
        IndivisualContribution.findByIdAndDelete(entry._id)
      )
    );

    await Expense.findByIdAndDelete(expenseId);

    res.status(200).json({ message: "Expense has been deleted" });

  } catch (err) {
    console.error('Error in deleteExpense:', err.message);
    res.status(500).json({ message: err.message });
  }
};