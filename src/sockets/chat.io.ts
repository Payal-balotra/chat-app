import { Server, Socket } from "socket.io";

export const registerChatEvents = (io: Server, socket: Socket) => {
  const userId = socket.data;


  socket.on("joinConversation", (conversationId: string) => {
    socket.join(conversationId);
    console.log(`${userId} joined ${conversationId}`);
  });

  socket.on("sendMessage", (data) => {
    const { conversationId, text } = data;

    // save message to DB here

    io.to(conversationId).emit("message:new", {
      conversationId,
      senderId: userId,
      text,
      createdAt: new Date(),
    });
  });

  // typing indicator
  socket.on("typing", (conversationId: string) => {
    socket.to(conversationId).emit("user:typing", {
      userId,
      conversationId,
    });
  });
};