import { Server, Socket } from "socket.io";
import { Conversation } from "../../modules/conversation/conversation.model";
import { findUserByPhone } from "../../modules/user/user.services";

export const addGroupMemberHandler = async (
  io: Server,
  socket: Socket,
  { conversationId, phoneNumber } : any
) => {
  try {
    const currentUserId = socket.data.userId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isGroup) {
      return socket.emit("error", { message: "Group not found" });
    }

    if (conversation.admin.toString() !== currentUserId.toString()) {
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
    });
  } catch (err) {
    console.error("addGroupMember error:", err);
    socket.emit("error", { message: "Failed to add member" });
  }
};
