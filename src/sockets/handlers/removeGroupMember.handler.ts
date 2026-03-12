import { Server, Socket } from "socket.io";
import { Conversation } from "../../modules/conversation/conversation.model";
import { getUserSockets } from "../utils/onlineUsers";

export const removeGroupMemberHandler = async (
  io: Server,
  socket: Socket,
  { conversationId, userId } : any
) => {

  try {

    const currentUserId = socket.data.userId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isGroup) {
      return socket.emit("error", { message: "Group not found" });
    }

    if (conversation.admin.toString() !== currentUserId.toString()) {
      return socket.emit("error", { message: "Only admin can remove members" });
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      $pull: { participants: userId }
    });

    const roomId = conversation._id.toString();

    const sockets = await getUserSockets(userId);

    for (const socketId of sockets) {
      io.sockets.sockets.get(socketId)?.leave(roomId);
    }

    io.to(userId.toString()).emit("removedFromGroup", {
      conversationId: roomId,
      groupName: conversation.name
    });

    io.to(roomId).emit("memberRemoved", {
      conversationId: roomId,
      userId,
      removedBy: currentUserId
    });

  } catch (err) {

    console.error("removeGroupMember error:", err);

    socket.emit("error", {
      message: "Failed to remove member"
    });

  }

};