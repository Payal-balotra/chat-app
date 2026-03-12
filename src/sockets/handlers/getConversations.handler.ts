    import { Server, Socket } from "socket.io";
import { Conversation } from "../../modules/conversation/conversation.model";

export const getConversationsHandler = async (
  io: Server,
  socket: Socket
) => {

  try {

    const currentUserId = socket.data.userId;

    const conversations = await Conversation.find({
      participants: currentUserId
    })
    .populate("participants", "name phone lastSeen");

    socket.emit("existingConversations", {
      conversations
    });

  } catch (err) {

    console.error("getConversations error:", err);

    socket.emit("error", {
      message: "Failed to fetch conversations"
    });

  }

};