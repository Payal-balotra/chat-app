import { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../constants/socketEvents";

import { sendMessageHandler } from "../handlers/sendMessage.handler";
import { readMessagesHandler } from "../handlers/readMessages.handler";
import { typingHandler } from "../handlers/typing.handler";

export const registerMessageEvents = (io: Server, socket: Socket) => {

  socket.on(
    SOCKET_EVENTS.SEND_MESSAGE,
    (data) => sendMessageHandler(io, socket, data)
  );

  socket.on(
    SOCKET_EVENTS.READ_MESSAGES,
    (data) => readMessagesHandler(io, socket, data)
  );

  socket.on(
    SOCKET_EVENTS.TYPING,
    (data) => typingHandler(io, socket, data)
  );

};