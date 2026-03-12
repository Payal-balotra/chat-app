import { Server, Socket } from "socket.io";

export const typingHandler = async (
  io: Server,
  socket: Socket,
  { conversationId } : any
) => {

  try {
    const userId = socket.data.userId;

    socket.to(conversationId).emit("typing", {
      conversationId,
      userId
    });

  } catch (err) {
    console.error("typing error:", err);
  }

};