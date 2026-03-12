import { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../constants/socketEvents";

import { groupConversationHandler } from "../handlers/groupConversation.handler";
import { addGroupMemberHandler } from "../handlers/addGroupMember.handler";
import { removeGroupMemberHandler } from "../handlers/removeGroupMember.handler";
import { changeAdminHandler } from "../handlers/changeAdmin.handler";

export const registerGroupEvents = (io: Server, socket: Socket) => {

  socket.on(
    SOCKET_EVENTS.GROUP_CONVERSATION,
    (phones, name) => groupConversationHandler(io, socket, phones, name)
  );

  socket.on(
    SOCKET_EVENTS.ADD_MEMBER,
    (data) => addGroupMemberHandler(io, socket, data)
  );

  socket.on(
    SOCKET_EVENTS.REMOVE_MEMBER,
    (data) => removeGroupMemberHandler(io, socket, data)
  );

  socket.on(
    SOCKET_EVENTS.CHANGE_ADMIN,
    (data) => changeAdminHandler(io, socket, data)
  );

};