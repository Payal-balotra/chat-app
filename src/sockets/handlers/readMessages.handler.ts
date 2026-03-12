import { Server, Socket } from "socket.io";
import { Message } from "../../modules/message/message.model";

export const readMessagesHandler = async (
  io: Server,
  socket: Socket,
  { conversationId }
) => {

  try {

    const userId = socket.data.userId;

    await Message.updateMany(
      { conversationId, receiver: userId },
      { status: "read" }
    );

    socket.to(conversationId).emit("messagesRead", {
      conversationId,
      userId
    });

  } catch (err) {

    console.error("readMessages error:", err);

  }

};