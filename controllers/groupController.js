const User = require('../models/User');
const Group = require('../models/Group');
const GroupUser = require('../models/GroupUser');
const Expense = require('../models/Expense');

exports.createNewGroup = async (req, res) => {
  const { title, description } = req.body;

  try {
    let group = await Group.findOne({ title });
    if (group) return res.status(400).json({ message: 'Group already exists' });

    group = new Group({ title, description });
    await group.save();

    let groupUser = new GroupUser({user: req.userId, group: group._id});
    await groupUser.save();

    res.status(201).json({
      message: "Group has been created",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMemberToGroup = async (req, res) => {
  const { name, title} = req.body;

  try {

    let user = await User.findOne({ name });
    let group = await Group.findOne({ title });
    if (!user || !group){
      return res.status(404).json({ message: 'User or group not found' });
    }
    const membership = await GroupUser.findOne({user: user._id, group: group._id});
    if (membership) return res.status(400).json({ message: 'Member already exists' });
    const groupUser = new GroupUser({user: user._id, group: group._id});
    await groupUser.save();

    res.status(201).json({
      message: "Member has been added",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addExpense = async (req, res) => {
  const { groupTitle, title, amount, paidByName} = req.body;

  try {

    let group = await Group.findOne({ title: groupTitle });
    let paidBy = await User.findOne({ name: paidByName });
     if (!group || !paidBy){
       return res.status(404).json({ message: 'Group or payer not found' });
     }

    const toAddExpense = new Expense({group: group._id,title,amount,paidBy: paidBy._id});
    await toAddExpense.save();

    res.status(201).json({
      message: "Expense has been added",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.exitFromGroup = async (req, res) => {
  const { groupTitle } = req.body;

  try {
    let group = await Group.findOne({ title: groupTitle });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    await GroupUser.findOneAndDelete({user: req.userId, group: group._id});
    res.status(201).json({
      message: "Exited successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};