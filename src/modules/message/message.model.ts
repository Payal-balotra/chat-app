import mongoose, { Schema, Types } from "mongoose";

export enum Type {
  TEXT = "text",
  FILE = "file",
  IMAGE = "image",
}

export enum STATUS {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
}

export interface IMessage {
  conversationId: Types.ObjectId;
  sender: Types.ObjectId;
  receiver : Types.ObjectId; 
  type: Type;
  content: string;
  attachments: string[];
  status: STATUS;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(Type),
      required: true,
    },

    content: {
      type: String,
    },

    attachments: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.SENT,
    },
  },
  { timestamps: true },
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);
