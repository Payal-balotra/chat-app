import { Server, Socket } from "socket.io";
import { Message, STATUS } from "../../modules/message/message.model";
import { Conversation } from "../../modules/conversation/conversation.model";
import redis from "../../config/redis";
import { getUserSockets } from "../utils/onlineUsers";

export const sendMessageHandler = async (
  io: Server,
  socket: Socket,
  data
) => {

  try {

    const { conversationId, type, content, attachments } = data;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return socket.emit("error", { message: "Conversation not found" });
    }
    // check for receiver 
    const receiverId = conversation.participants.find(
      p => p.toString() !== socket.data.userId
    );

    const receiverSockets = await getUserSockets(receiverId); // get all sockets where receiver is online 

    let status = STATUS.SENT;

    if (receiverSockets.length) { 
        // if receiver is online then check , if receiver is in that room or not 
      const room = io.sockets.adapter.rooms.get(conversationId);

      const isInRoom = receiverSockets.some(socketId =>
        room?.has(socketId)
      );

      status = isInRoom ? STATUS.READ : STATUS.DELIVERED;
    }

    const message = await Message.create({
      conversationId,
      sender: socket.data.userId,
      receiver: receiverId,
      type,
      content,
      attachments,
      status
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id
    });
    // show message to all
    io.to(conversationId).emit("newMessage", {
      conversationId,
      message
    });

  } catch (err) {

    console.error("sendMessage error:", err);

    socket.emit("error", {
      message: "Message failed"
    });

  }

};