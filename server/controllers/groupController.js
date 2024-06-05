
const Group = require("../models/GroupModel"); // Adjust the path as necessary
const User = require("../models/userModel"); // Adjust the path as necessary


// Controller function to create a group and add users
module.exports.createGroupAndAddUsers = async (req, res) => {
  try {
    const { groupName, creatorId, userIds } = req.body;

    // Validate the creator
    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    // Validate users
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(404).json({ message: "One or more users not found" });
    }

    // Check for duplicate group name
    const existingGroup = await Group.findOne({ name: groupName });
    if (existingGroup) {
      return res.status(400).json({ message: "Group name already exists" });
    }

    // Create the group
    const group = new Group({
      name: groupName,
      members: [...new Set([creatorId, ...userIds])], // Add the creator to the members list and remove duplicates
      createdBy: creatorId,
    });

    // Save the group
    await group.save();

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports.getGroupsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate the user ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all groups containing the user
    const groups = await Group.find({ members: userId }).populate("members", "username email");

    res.status(200).json({ groups });
  } catch (error) {
    console.error("Error getting groups for user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAllGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Validate the group ID and find the group
    const group = await Group.findById(groupId).populate("members", "username email");
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Get the members from the group
    const members = group.members;

    // Respond with the list of members
    res.status(200).json({ members });
  } catch (error) {
    console.error("Error fetching group members:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};