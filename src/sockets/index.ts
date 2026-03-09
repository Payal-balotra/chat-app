import { Server } from "socket.io";
import { verifyJwtToken } from "../lib/jwt";
import { registerChatEvents } from "./chat.io";
import redis from "../config/redis";
import { Conversation } from "../modules/conversation/conversation.model";
import { User } from "../modules/user/user.model";
import { Message, STATUS } from "../modules/message/message.model";
import { findUserById } from "../modules/user/user.services";

let io: Server;

export const setUpSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization;

      if (!authHeader) {
        return next(new Error("Authorization header missing"));
      }

      const token = authHeader.split(" ")[1];

      const decoded = await verifyJwtToken(token);
      socket.data.userId = decoded?.id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    console.log("connection established", userId);
    socket.emit("me", socket.data.user);

    await redis.sadd(`online:${userId}`, socket.id);
    
    const keys = await redis.keys("online:*");

    const users = keys.map((key) => key.split(":")[1]);
    io.emit("getOnlineUsers", users);

    const conversations = await Conversation.find({
      participants: userId,
    });

    conversations.forEach((conversation) => {
      socket.join(conversation._id.toString());
    });

    const pendingMessages = await Message.find({
      receiver: userId,
      status: STATUS.SENT,
    });
    for (const msg of pendingMessages) {
      socket.emit("newMessage", msg);
    }

    await Message.updateMany(
      {
        receiver: userId,
        status: STATUS.SENT,
      },
      {
        status: STATUS.DELIVERED,
      },
    );
     socket.emit("existingConversations", conversations);

    registerChatEvents(io, socket);

     
  });
};

export const getIO = () => io;
