import { Server, Socket } from "socket.io";
import { Conversation } from "../modules/conversation/conversation.model";
import { User } from "../modules/user/user.model";
import {  findUserByPhone } from "../modules/user/user.services";

export const registerChatEvents = (io: Server, socket: Socket) => {
  socket.on("startConversation", async (data) => {
    try {
     const { targetUserId } = data;
        console.log(targetUserId)
      const currentUserId = socket.data.userId;
 
      if (!targetUserId) {
        return socket.emit("error", {
          message: "targetUserId is required",
        });
      }

      if (targetUserId === currentUserId) {
        return socket.emit("error", {
          message: "Cannot start conversation with yourself",
        });
      }

      let conversation = await Conversation.findOne({
        isGroup: false,
        participants: {
          $all: [currentUserId, targetUserId],
        },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [currentUserId, targetUserId],
          isGroup: false,
        });
      }

      socket.join(conversation._id.toString());

      socket.emit("conversationStarted", {
        conversationId: conversation._id,
        participants: conversation.participants,
      });
    } catch (err) {
      console.error("startConversation error:", err);
      socket.emit("error", {
        message: "Failed to start conversation",
      });
    }
  });
};
