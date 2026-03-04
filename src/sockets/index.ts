import { Server } from "socket.io";
import { verifyJwtToken } from "../lib/jwt";
import { registerChatEvents } from "./chat.io";
import redis from "../config/redis";
import { Conversation } from "../modules/conversation/conversation.model";

let io: Server;

export const setUpSocket = (httpServer: any) => {

  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization;

      if (!authHeader) {
        return next(new Error("Authorization header missing"));
      }

      const token = authHeader.split(" ")[1];

      const decoded = verifyJwtToken(token);

      socket.data.userId = decoded.id;

      next();

    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {

    const userId = socket.data.userId;

    console.log("User connected:", userId);

    // store online user
    await redis.set(`online:${userId}`, socket.id);

    // 🔹 AUTO JOIN ALL USER CONVERSATIONS
    const conversations = await Conversation.find({
      participants: userId,
    });

    conversations.forEach((conversation) => {
      socket.join(conversation._id.toString());
    });

    // 🔹 CHECK OFFLINE MESSAGES
    const pendingMessages = await redis.lrange(`queue:${userId}`, 0, -1);

    for (const msg of pendingMessages) {
      socket.emit("newMessage", JSON.parse(msg));
    }

    if (pendingMessages.length) {
      await redis.del(`queue:${userId}`);
    }

    registerChatEvents(io, socket);

    socket.on("disconnect", async () => {

      console.log("User disconnected:", userId);

      await redis.del(`online:${userId}`);

    });

  });
};

export const getIO = () => io;