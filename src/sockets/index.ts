import { Server } from "socket.io";
import { verifyJwtToken } from "../lib/jwt";
import { registerChatEvents } from "./chat.io";
import redis from "../config/redis";
import { Conversation } from "../modules/conversation/conversation.model";
import { User } from "../modules/user/user.model";

let io: Server;

export const setUpSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5174",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials : true
    },
    transports: ["websocket", "polling"],
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
    console.log("connection established")
    await redis.set(`online:${userId}`, socket.id);

    const keys = await redis.keys("online:*");

    const users = keys.map((key) => key.split(":")[1]);
    io.emit("getOnlineUsers", users);

    const conversations = await Conversation.find({
      participants: userId,
    });

    conversations.forEach((conversation) => {
      socket.join(conversation._id.toString());
    });

    const pendingMessages = await redis.lrange(`queue:${userId}`, 0, -1);

    for (const msg of pendingMessages) {
      io.to(socket.id).emit("newMessage", JSON.parse(msg));
    }

    if (pendingMessages.length) {
      await redis.del(`queue:${userId}`);
    }

    registerChatEvents(io, socket);

    socket.on("disconnect", async () => {
      console.log("User disconnected:", userId);

      await redis.del(`online:${userId}`);

      const keys = await redis.keys("online:*");
      const users = keys.map((key) => key.split(":")[1]);

      io.emit("getOnlineUsers", users);
      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date(),
      });
    });
  });
};

export const getIO = () => io;
