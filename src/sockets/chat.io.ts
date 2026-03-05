import { Server, Socket } from "socket.io";
import { Conversation } from "../modules/conversation/conversation.model";
import { Message } from "../modules/message/message.model";
import redis from "../config/redis";
import { findUserByPhone } from "../modules/user/user.services";

export const registerChatEvents = (io: Server, socket: Socket) => {
  const currentUserId = socket.data.userId;

  socket.on("startConversation", async ({ phoneNumber }) => {
    try {
      if (!phoneNumber) {
        return socket.emit("error", { message: "phoneNumber required" });
      }

      const user = await findUserByPhone(phoneNumber);
      if (!user) {
        return socket.emit("error", { message: "User not found" });
      }

      const targetUserId = user._id;

      if (targetUserId.toString() === currentUserId) {
        return socket.emit("error", {
          message: "Cannot chat with yourself",
        });
      }

      let conversation = await Conversation.findOne({
        isGroup: false,
        participants: { $all: [currentUserId, targetUserId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [currentUserId, targetUserId],
          isGroup: false,
        });
      }

      const roomId = conversation._id.toString();
      socket.join(roomId);

      socket.emit("conversationStarted", {
        conversationId: roomId,
        participants: conversation.participants,
      });
    } catch (err) {
      console.error("startConversation error:", err);
      socket.emit("error", { message: "Failed to start conversation" });
    }
  });

socket.on("groupConversation", async (phoneNumbers: number[]) => {
  try {

    const targetUsersId: string[] = [];
    for (const phone of phoneNumbers) {
      const user = await findUserByPhone(phone);
      if (user) {
        targetUsersId.push(user.id);
      }
    }

    const participants = [currentUserId, ...targetUsersId];
    console.log("Participants " , participants)
    let conversation = await Conversation.findOne({
      isGroup: true,
      participants: { $all: participants },
      $expr: { $eq: [{ $size: "$participants" }, participants.length] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants,
        isGroup: true
      });
    }

    const roomId = conversation._id.toString();

    socket.join(roomId);

    socket.emit("groupConversationStarted", {
      conversationId: roomId,
      participants: conversation.participants
    });

  } catch (error) {
    console.error(error);
  }
});
  socket.on("sendMessage", async (data) => {
    try {
      const { conversationId, type, content, attachments } = data;

      const message = await Message.create({
        conversationId,
        sender: currentUserId,
        type,
        content,
        attachments,
        status: "sent",
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
      });

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) return;

      const receiverId = conversation.participants.find(
        (id) => id.toString() !== currentUserId,
      );

      const receiverSocket = await redis.get(`online:${receiverId}`);

      if (receiverSocket) {
        io.to(receiverSocket).emit("newMessage", message.content);

        await Message.findByIdAndUpdate(message._id, {
          status: "delivered",
        });
      } else {
        await redis.lpush(`queue:${receiverId}`, JSON.stringify(message));
      }

      // io.to(conversationId).emit("newMessage", message.content);
    } catch (err) {
      console.error("sendMessage error:", err);
      socket.emit("error", { message: "Message failed" });
    }
  });

  socket.on("typing", ({ conversationId }) => {
    socket.to(conversationId).emit("typing", {
      userId: currentUserId,
    });
  });

  socket.on("readMessages", async ({ conversationId }) => {
    try {
      await Message.updateMany(
        { conversationId, status: "delivered" },
        { status: "read" },
      );

      socket.to(conversationId).emit("messagesRead", {
        conversationId,
        userId: currentUserId,
      });
    } catch (err) {
      console.error("readMessages error:", err);
    }
  });
};
