import mongoose, { model, Model, mongo, Mongoose, Schema } from "mongoose";

export interface IUser {
  phone: number;
  name: string;
  bio: string;
  isVerified: boolean;
  isOnline: boolean;
}
const userSchema = new Schema<IUser>(
  {
    phone: {
      type: Number,
      unique: true,
      required: true,
    },
    name: {
      type: String,
    },
    bio: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
