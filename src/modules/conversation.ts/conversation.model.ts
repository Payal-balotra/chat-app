import mongoose, { Mongoose, Schema } from "mongoose";
import { Types } from "mongoose";

export interface IConversation {
  paricipants: Types.ObjectId;
  isGroup: boolean;
  lastMessage: Types.ObjectId;
}

const conversationSchema = new Schema<IConversation>(
  {
    paricipants: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isGroup: {
      type: Boolean,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true },
);

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);
