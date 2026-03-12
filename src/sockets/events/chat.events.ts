import { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../constants/socketEvents";

import { getConversationsHandler } from "../handlers/getConversations.handler";
import { sendMessageHandler } from "../handlers/sendMessage.handler";
import { readMessagesHandler } from "../handlers/readMessages.handler";

export const registerChatEvents = (io: Server, socket: Socket) => {

  // Get conversations list
  socket.on(
    SOCKET_EVENTS.GET_CONVERSATIONS,
    () => getConversationsHandler(io, socket)
  );

};