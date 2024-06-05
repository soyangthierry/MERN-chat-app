const Messages = require("../models/messageModel");
const Group = require("../models/GroupModel"); // Make sure to require the Group model

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to, groupId } = req.body;

    let messages;
    if (groupId) {
      // Fetch messages for the group
      messages = await Messages.find({
        group: groupId,
      }).sort({ updatedAt: 1 });
    } else {
      // Fetch messages between two users
      messages = await Messages.find({
        users: {
          $all: [from, to],
        },
      }).sort({ updatedAt: 1 });
    }

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text || msg.message.image,
        sender: msg.sender,
        type: msg.type,
        group: msg.group || null,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, groupId, message, type } = req.body;

    const newMessage = {
      message: type === "text" ? { text: message } : { image: message },
      type,
      sender: from,
    };

    if (groupId) {
      // Message for a group
      newMessage.group = groupId;
    } else {
      // Direct message between users
      newMessage.users = [from, to];
    }

    const data = await Messages.create(newMessage);

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};
