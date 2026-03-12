import { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../constants/socketEvents";

import { getConversationsHandler } from "../handlers/getConversations.handler";
import { startConversationHandler } from "../handlers/startConversation.handler";

export const registerChatEvents = (io: Server, socket: Socket) => {
  // Get conversations list
  socket.on(SOCKET_EVENTS.GET_CONVERSATIONS, () =>
    getConversationsHandler(io, socket),
  );
  socket.on(SOCKET_EVENTS.CONVERSATION_STARTED, (phone) =>
    startConversationHandler(io, socket, phone),
  );
};
