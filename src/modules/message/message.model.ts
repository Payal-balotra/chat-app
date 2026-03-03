import mongoose, { Mongoose, Schema } from "mongoose";
import { Types } from "mongoose";

export enum Type {
  TEXT = "text",
  FILE = "file",
  IMAGE =  "image"
}
export enum STATUS { 
    SENT =  "sent",
    DELIVERED =  "delivered",
    READ =  "read"
}

export interface IMessage {
  convsersationId: Types.ObjectId;
  sender: Types.ObjectId;
  type: Type;
  content : string,
  attachments : string[],
  status : STATUS

}
const messageSchema = new Schema<IMessage>(
  {
    convsersationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required : true
    },
    type: {
      type: String,
      enum: Object.values(Type),
      required : true
    },
    content : {
        type : String
    },
    attachments : {
        type : [String],

    },
    status : {
        type : String,
         enum: Object.values(STATUS),
    }
  },
  { timestamps: true },
);

export const Message = mongoose.model<IMessage>("User", messageSchema);
