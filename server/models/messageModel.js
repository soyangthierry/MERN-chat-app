const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "image"],
      required: true,
    },
    message: {
      text: {
        type: String,
        required: function() {
          return this.type === "text";
        },
      },
      image: {
        type: String,
        required: function() {
          return this.type === "image";
        },
      },
    },
    users: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: function() {
        return !this.group;
      },
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: function() {
        return !this.users || this.users.length === 0;
      },
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessageSchema);
