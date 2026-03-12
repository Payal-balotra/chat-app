import { Server } from "socket.io";
import { registerChatEvents } from "./events/chat.events";
import {
  addUserSocket,
  removeUserSocket,
  getOnlineUsers,
  getSocketCount,
  removeUserKey
} from "./utils/onlineUsers";

import { User } from "../modules/user/user.model";
import { Conversation } from "../modules/conversation/conversation.model";
import { Message, STATUS } from "../modules/message/message.model";
import { registerGroupEvents } from "./events/group.events";
import { registerMessageEvents } from "./events/message.events";

export const registerSocketManager = (io: Server) => {

  io.on("connection", async (socket) => {

    const userId = socket.data.userId;

    if (userId) {
      socket.join(userId.toString());
    }

    console.log("connection established", userId);

    socket.emit("me", socket.data.user);

    await addUserSocket(userId, socket.id);

    const users = await getOnlineUsers();
    io.emit("getOnlineUsers", users);

    const conversations = await Conversation.find({
      participants: userId
    });

    conversations.forEach((conv) => {
      socket.join(conv._id.toString());
    });

    const pendingMessages = await Message.find({
      receiver: userId,
      status: STATUS.SENT
    });

    for (const msg of pendingMessages) {
      socket.emit("newMessage", msg);
    }

    await Message.updateMany(
      { receiver: userId, status: STATUS.SENT },
      { status: STATUS.DELIVERED }
    );

    // register events
    registerChatEvents(io, socket);
    registerGroupEvents(io, socket);
    registerMessageEvents(io, socket);

    socket.on("disconnect", async () => {

      console.log("User disconnected:", userId);

      await removeUserSocket(userId, socket.id);

      const remaining = await getSocketCount(userId);

      if (remaining === 0) {

        await removeUserKey(userId);

        await User.findByIdAndUpdate(userId, {
          lastSeen: new Date()
        });

      }

      const users = await getOnlineUsers();
      io.emit("getOnlineUsers", users);

    });

  });

};