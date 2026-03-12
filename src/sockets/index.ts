

import { Server } from "socket.io";
import { registerSocketManager } from "./socketManager";
import { config } from "../config/config";
import { socketAuth } from "./utils/socketAuth";

export let io: Server;

export const setUpSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors : {
      origin: [config.corsOrigin, "http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },

    }
);
  io.use(socketAuth);
  registerSocketManager(io);
};

export const getIO = () => io;