import mongoose, { Mongoose, Schema } from "mongoose";
import { Types } from "mongoose";

export interface IConversation {
  participants: Types.ObjectId[];
  isGroup: boolean;
  admin: Types.ObjectId;
  lastMessage: Types.ObjectId;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true },
);

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);
