import { Server, Socket } from "socket.io";
import { Conversation } from "../../modules/conversation/conversation.model";

export const changeAdminHandler = async (
  io: Server,
  socket: Socket,
  { conversationId, newAdminId }
) => {

  try {

    const currentUserId = socket.data.userId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isGroup) {
      return socket.emit("error", { message: "Group not found" });
    }

    if (conversation.admin.toString() !== currentUserId.toString()) {
      return socket.emit("error", { message: "Only admin can change admin" });
    }

    conversation.admin = newAdminId;

    await conversation.save();

    const roomId = conversation._id.toString();

    io.to(roomId).emit("adminChanged", {
      conversationId: roomId,
      oldAdmin: currentUserId,
      newAdmin: newAdminId
    });

  } catch (err) {

    console.error("changeAdmin error:", err);
    socket.emit("error", { message: "Failed to change admin" });

  }

};