import { Server } from "socket.io";
import { registerChatEvents } from "./chat.io";
import { verifyJwtToken } from "../lib/jwt";

let io: Server;

export const setUpSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.use((socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization;

      if (!authHeader) {
        return next(new Error("Authorization header missing"));
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return next(new Error("Token missing"));
      }

      const decoded = verifyJwtToken(token);
      socket.data.userId = decoded.id;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    registerChatEvents(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

export const getIO = () => io;
