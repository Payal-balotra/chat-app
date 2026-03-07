import { Server, Socket } from "socket.io";
import { Conversation } from "../modules/conversation/conversation.model";
import { Message, STATUS } from "../modules/message/message.model";
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
      const pastMessages = await Message.find({ conversationId: roomId });

      socket.join(roomId);

      const targetSocketId = await redis.get(`online:${targetUserId}`);

      if (targetSocketId) {
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        targetSocket?.join(roomId);
      }

      io.emit("conversationStarted", {
        conversationId: roomId,
        participants: conversation.participants,
        messages: pastMessages,
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
      let conversation = await Conversation.findOne({
        isGroup: true,
        participants: { $all: participants },
        $expr: { $eq: [{ $size: "$participants" }, participants.length] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants,
          admin: currentUserId,
          isGroup: true,
        });
      }

      const roomId = conversation._id.toString();

      const conversations = await Conversation.find({
        participants: currentUserId,
      });

      for (const conv of conversations) {
        socket.join(conv._id.toString());
      }

      socket.to(roomId).emit("groupConversationStarted", {
        conversationId: roomId,
        participants: conversation.participants,
      });
    } catch (error) {
      console.error(error);
    }
  });
  socket.on("sendMessage", async (data) => {
    try {
      const { conversationId, type, content, attachments } = data;

      if (!conversationId) {
        return socket.emit("error", { message: "conversationId required" });
      }

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return socket.emit("error", { message: "Conversation not found" });
      }
      const receiverId = conversation.participants.find(
        (p) => p.toString() !== socket.data.userId,
      );

      const receiverSocket = await redis.get(`online:${receiverId}`);

      let status = STATUS.SENT;

      if (receiverSocket) {
        const room = io.sockets.adapter.rooms.get(conversationId);

        const isInRoom = room?.has(receiverSocket);

        if (isInRoom) {
          status = STATUS.READ;
        } else {
          status = STATUS.DELIVERED;
        }
      }

      const message = await Message.create({
        conversationId,
        sender: currentUserId,
        type,
        content,
        attachments,
        status,
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
      });

      io.to(conversationId).emit("newMessage", {
        conversationId,
        message,
      });
    } catch (err) {
      console.error("sendMessage error:", err);
      socket.emit("error", { message: "Message failed" });
    }
  });
  socket.on("markAsRead", async ({ conversationId }) => {
    await Message.updateMany(
      {
        conversationId,
        receiver: socket.data.userId,
        status: { $ne: STATUS.READ },
      },
      {
        status: STATUS.READ,
      },
    );

    io.to(conversationId).emit("messagesRead", {
      conversationId,
    });
  });

  socket.on("addGroupMember", async ({ conversationId, phoneNumber }) => {
    try {
      if (!conversationId || !phoneNumber) {
        return socket.emit("error", {
          message: "conversationId and phoneNumber required",
        });
      }

      const conversation = await Conversation.findById(conversationId);

      if (!conversation || !conversation.isGroup) {
        return socket.emit("error", { message: "Group not found" });
      }

      if (conversation.admin.toString() !== currentUserId) {
        return socket.emit("error", { message: "Only admin can add members" });
      }

      const user = await findUserByPhone(phoneNumber);

      if (!user) {
        return socket.emit("error", { message: "User not found" });
      }

      const userId = user._id;

      if (conversation.participants.includes(userId)) {
        return socket.emit("error", { message: "User already in group" });
      }

      conversation.participants.push(userId);
      await conversation.save();

      const roomId = conversation._id.toString();

      io.to(roomId).emit("memberAdded", {
        conversationId: roomId,
        userId,
        addedBy: currentUserId,
      });
    } catch (error) {
      console.error("addGroupMember error:", error);
      socket.emit("error", { message: "Failed to add member" });
    }
  });

  socket.on("typing", ({ conversationId }) => {
    socket.to(conversationId).emit("typing", {
      userId: currentUserId,
    });
  });

  socket.on("removeGroupMember", async ({ conversationId, userId }) => {
    try {
      if (!conversationId || !userId) {
        return socket.emit("error", {
          message: "conversationId and userId required",
        });
      }

      const conversation = await Conversation.findById(conversationId);

      if (!conversation || !conversation.isGroup) {
        return socket.emit("error", { message: "Group not found" });
      }

      if (conversation.admin.toString() !== currentUserId) {
        return socket.emit("error", {
          message: "Only admin can remove members",
        });
      }

      if (conversation.admin.toString() === userId) {
        return socket.emit("error", {
          message: "Admin cannot remove themselves",
        });
      }

      await Conversation.findByIdAndUpdate(conversationId, {
        $pull: { participants: userId },
      });

      const roomId = conversation._id.toString();

      io.to(roomId).emit("memberRemoved", {
        conversationId: roomId,
        userId,
        removedBy: currentUserId,
      });

      const userSocket = await redis.get(`online:${userId}`);

      if (userSocket) {
        io.sockets.sockets.get(userSocket)?.leave(roomId);
      }
    } catch (error) {
      console.error("removeGroupMember error:", error);
      socket.emit("error", { message: "Failed to remove member" });
    }
  });

  socket.on("changeAdmin", async ({ conversationId, newAdminId }) => {
    try {
      if (!conversationId || !newAdminId) {
        return socket.emit("error", {
          message: "conversationId and newAdminId required",
        });
      }

      const conversation = await Conversation.findById(conversationId);

      if (!conversation || !conversation.isGroup) {
        return socket.emit("error", { message: "Group not found" });
      }

      if (conversation.admin.toString() !== currentUserId) {
        return socket.emit("error", {
          message: "Only admin can change admin",
        });
      }

      if (!conversation.participants.includes(newAdminId)) {
        return socket.emit("error", {
          message: "New admin must be a group member",
        });
      }

      conversation.admin = newAdminId;
      await conversation.save();

      const roomId = conversation._id.toString();

      io.to(roomId).emit("adminChanged", {
        conversationId: roomId,
        oldAdmin: currentUserId,
        newAdmin: newAdminId,
      });
    } catch (error) {
      console.error("changeAdmin error:", error);
      socket.emit("error", { message: "Failed to change admin" });
    }
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
