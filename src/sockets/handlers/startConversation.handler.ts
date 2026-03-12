import { Server, Socket } from "socket.io";
import { Conversation } from "../../modules/conversation/conversation.model";
import { Message } from "../../modules/message/message.model";
import { findUserByPhone } from "../../modules/user/user.services";
import redis from "../../config/redis";
import { getUserSockets } from "../utils/onlineUsers";

export const startConversationHandler = async (
  io: Server,
  socket: Socket,
  { phoneNumber },
) => {
  try {
    if (!phoneNumber) {
      return socket.emit("error", { message: "phoneNumber required" });
    }

    const user = await findUserByPhone(phoneNumber);

    if (!user) {
      return socket.emit("error", { message: "User not found" });
    }

    const currentUserId = socket.data.userId; // fetching user id through socket
    const targetUserId = user._id; // user you wnat to talk with

    let conversation = await Conversation.findOne({
      // check already already conversation exist or not
      isGroup: false,
      participants: { $all: [currentUserId, targetUserId] },
    });

    // if no conersation then create one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, targetUserId],
        isGroup: false,
      });
    }
    // set roomid to conersation id
    const roomId = conversation._id.toString();

    const pastMessages = await Message.find({
      conversationId: roomId,
    });
    socket.join(roomId); // join sender to room 
    const sockets = await getUserSockets(targetUserId);

    for (const socketId of sockets) {
      // join room to all socket id of targetuser . on differen devices
      io.sockets.sockets.get(socketId)?.join(roomId);
    }
    // show messaegs to all sockets in room 
    io.to(roomId).emit("conversationStarted", {
      conversationId: roomId,
      participants: conversation.participants,
      messages: pastMessages,
    });
  } catch (err) {
    console.error(err);
    socket.emit("error", { message: "Failed to start conversation" });
  }
};
