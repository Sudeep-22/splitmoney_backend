const User = require('../models/User');
const Group = require('../models/Group');
const GroupUser = require('../models/GroupUser');

exports.fetchGroup = async (req, res) => {
  try {
    const userGroups = await GroupUser.find({ user: req.userId })
    .populate('group', '_id title description');

  const groupDetails = userGroups
    .map(entry => entry.group) 
    .filter(group => group !== null);

  res.status(200).json(groupDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.fetchMembers = async (req, res) => {
  try {
    const { groupId } = req.body;
    const usersInGroup = await GroupUser.find({ group: groupId })
    .populate('user', 'name');

  const userDetails = usersInGroup
      .filter(entry => entry.user) // ensure user is populated
      .map(entry => ({
        _id: entry.user._id,
        name: entry.user.name
      }));

  res.status(200).json(userDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

exports.addMember = async (req, res) => {
  const { name, groupId} = req.body;

  try {
    let user = await User.findOne({ name });
    let group = await Group.findById(groupId);
    if (!user || !group){
      return res.status(404).json({ message: 'User or group not found' });
    }
    const membership = await GroupUser.findOne({user: user._id, group: groupId});
    if (membership) return res.status(400).json({ message: 'Member already exists' });
    const groupUser = new GroupUser({user: user._id, group: groupId});
    await groupUser.save();

    res.status(201).json({
      message: "Member has been added",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.exitFromGroup = async (req, res) => {
  const { groupId } = req.body;

  // Defensive check
  if (!groupId) {
    return res.status(400).json({ message: "Group ID is required" });
  }

  try {
    const deleted = await GroupUser.findOneAndDelete({
      user: req.userId,
      group: groupId
    });

    if (!deleted) {
      return res.status(404).json({
        message: "You are not part of this group or group does not exist",
      });
    }

    return res.status(200).json({
      message: "Exited successfully",
    });
  } catch (err) {
    console.error("Error while exiting group:", err.message);
    return res.status(500).json({ message: err.message });
  }
};