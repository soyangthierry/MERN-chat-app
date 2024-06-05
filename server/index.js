const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const groupRoutes = require("./routes/groups")
const Group = require("./models/GroupModel")
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: "50mb" })); // Adjust the limit as necessary
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Adjust the limit as necessary


mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups",groupRoutes)

const server = app.listen(process.env.PORT,"0.0.0.0", () =>
  console.log(`Server started on ${process.env.PORT}`)
);

const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", async (userId) => {
    onlineUsers.set(userId, socket.id);

    // Fetch the groups the user belongs to
    const userGroups = await Group.find({ members: userId });

    // Join the user to all their groups' rooms
    userGroups.forEach(group => {
      socket.join(group._id.toString());
    });
  });

  socket.on("send-msg", (data) => {
    if (data.groupId) {
      // Broadcast to the group room
      socket.to(data.groupId).emit("msg-receive", {
        message: data.message,
        type: data.type,
        from: data.from,
        senderName:data.senderName,
        groupId: data.groupId,
        fromSelf: false,
      });
    } else {
      // Direct message
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-receive", {
          message: data.message,
          type: data.type,
          from: data.from,
          fromSelf: false,
        });
      }
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
  });
});
