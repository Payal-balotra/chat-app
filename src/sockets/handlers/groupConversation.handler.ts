import { Server, Socket } from "socket.io";
import { Conversation } from "../../modules/conversation/conversation.model";
import { findUserByPhone } from "../../modules/user/user.services";

export const groupConversationHandler = async (
  io: Server,
  socket: Socket,
  phoneNumbers: any[],
  name: any
) => {

  try {

    const currentUserId = socket.data.userId;
    //check users parallel
    const users = await Promise.all(
      phoneNumbers.map(phone => findUserByPhone(phone))
    );
    // it remove if phone do not exist and get ids  
    const targetUsersId = users.filter(Boolean).map(user => user?._id);

    const participants = [currentUserId, ...targetUsersId];

    const conversation = await Conversation.create({
      participants,
      admin: currentUserId,
      isGroup: true,
      name
    });

    const roomId = conversation._id.toString();

    socket.join(roomId);

    participants.forEach((participantId) => {
      io.to(participantId.toString()).emit("addedToGroup", {
        groupName: name,
        conversationId: roomId
      });
    });

    socket.emit("groupConversationStarted", {
      conversationId: roomId,
      participants
    });

  } catch (err) {

    console.error("groupConversation error:", err);
    socket.emit("error", { message: "Failed to create group" });

  }

};